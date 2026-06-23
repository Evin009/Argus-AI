import json
import os

import anthropic

from celery_app import celery
from db.client import get_supabase

VALID_CATEGORIES = {
    "FOOD_AND_DRINK",
    "SHOPPING",
    "TRANSPORTATION",
    "ENTERTAINMENT",
    "UTILITIES",
    "HEALTHCARE",
    "INCOME",
    "TRANSFER",
    "HOUSING",
    "SUBSCRIPTION",
    "OTHER",
}

_BATCH_SIZE = 50


def _filter_uncategorized(transactions: list[dict]) -> list[dict]:
    return [t for t in transactions if t.get("category") == "OTHER"]


def _build_categorization_prompt(transactions: list[dict]) -> str:
    txn_lines = "\n".join(
        f"- id: {t['id']}, merchant: {t['merchant']}, amount: {t['amount']}" for t in transactions
    )
    categories = (
        "FOOD_AND_DRINK, SHOPPING, TRANSPORTATION, ENTERTAINMENT, UTILITIES, "
        "HEALTHCARE, INCOME, TRANSFER, HOUSING, SUBSCRIPTION, OTHER"
    )
    subcategory_examples = (
        '"restaurants", "groceries", "rideshare", "streaming", "rent", "paycheck"'
    )
    return (
        f"You are a financial transaction categorizer.\n\n"
        f"Classify each transaction into one of these categories:\n{categories}\n\n"
        f"Also provide a short subcategory (e.g. {subcategory_examples}).\n\n"
        f"Transactions:\n{txn_lines}\n\n"
        f"Return ONLY a valid JSON array with no explanation. "
        f'Each item must have: "id", "category", "subcategory".\n'
        f'Example: [{{"id": "abc", "category": "FOOD_AND_DRINK", '
        f'"subcategory": "restaurants"}}]'
    )


def _parse_categorization_response(response_text: str) -> list[dict]:
    text = response_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return []
    if not isinstance(parsed, list):
        return []
    return parsed


def _categorize_batch(transactions: list[dict]) -> list[dict]:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    prompt = _build_categorization_prompt(transactions)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    response_text = message.content[0].text
    return _parse_categorization_response(response_text)


@celery.task(name="tasks.categorize_transactions.recategorize_transactions_for_user")
def recategorize_transactions_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    accts = supabase.table("accounts").select("id").eq("user_id", user_id).execute()
    account_ids = [a["id"] for a in accts.data]

    if not account_ids:
        return {"user_id": user_id, "transactions_updated": 0}

    txn_result = (
        supabase.table("transactions")
        .select("id, merchant, amount, category")
        .in_("account_id", account_ids)
        .eq("category", "OTHER")
        .execute()
    )

    uncategorized = _filter_uncategorized(txn_result.data)
    if not uncategorized:
        return {"user_id": user_id, "transactions_updated": 0}

    updated = 0
    for i in range(0, len(uncategorized), _BATCH_SIZE):
        batch = uncategorized[i : i + _BATCH_SIZE]
        categorized = _categorize_batch(batch)
        for item in categorized:
            txn_id = item.get("id")
            category = item.get("category", "OTHER")
            subcategory = item.get("subcategory", "")
            if not txn_id:
                continue
            if category not in VALID_CATEGORIES:
                category = "OTHER"
            supabase.table("transactions").update(
                {"category": category, "subcategory": subcategory}
            ).eq("id", txn_id).execute()
            updated += 1

    return {"user_id": user_id, "transactions_updated": updated}
