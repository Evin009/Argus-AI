import uuid
from datetime import UTC, datetime

from plaid.model.transactions_sync_request import TransactionsSyncRequest

from celery_app import celery
from db.client import get_supabase
from services.encryption import decrypt_token
from services.plaid_client import get_plaid_client


def _normalize_transaction(plaid_txn: dict, account_id: str) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "account_id": account_id,
        "plaid_transaction_id": plaid_txn.get("transaction_id", ""),
        "merchant": (
            plaid_txn.get("merchant_name")
            or plaid_txn.get("name")
            or "Unknown"
        ),
        "amount": float(plaid_txn.get("amount", 0)),
        "category": _extract_category(plaid_txn),
        "subcategory": _extract_subcategory(plaid_txn),
        "timestamp": str(plaid_txn.get("date", datetime.now(UTC).date())),
        "is_recurring": False,
    }


def _extract_category(plaid_txn: dict) -> str:
    personal_finance = plaid_txn.get("personal_finance_category")
    if personal_finance:
        return personal_finance.get("primary", "OTHER")
    categories = plaid_txn.get("category") or []
    return categories[0] if categories else "OTHER"


def _extract_subcategory(plaid_txn: dict) -> str:
    personal_finance = plaid_txn.get("personal_finance_category")
    if personal_finance:
        return personal_finance.get("detailed", "")
    categories = plaid_txn.get("category") or []
    return categories[1] if len(categories) > 1 else ""


@celery.task(name="tasks.sync_transactions.sync_transactions_for_user")
def sync_transactions_for_user(user_id: str) -> dict:
    supabase = get_supabase()
    plaid_client = get_plaid_client()

    items = (
        supabase.table("plaid_items")
        .select("id, access_token_encrypted, cursor")
        .eq("user_id", user_id)
        .execute()
    )

    total_added = 0

    for item in items.data:
        access_token = decrypt_token(item["access_token_encrypted"])
        cursor = item.get("cursor") or ""
        has_more = True

        while has_more:
            request = TransactionsSyncRequest(
                access_token=access_token,
                cursor=cursor,
            )
            response = plaid_client.transactions_sync(request)

            added = response["added"]
            modified = response["modified"]
            removed = response["removed"]
            has_more = response["has_more"]
            cursor = response["next_cursor"]

            for plaid_txn in added + modified:
                account_row = (
                    supabase.table("accounts")
                    .select("id")
                    .eq("plaid_account_id", plaid_txn.get("account_id", ""))
                    .maybe_single()
                    .execute()
                )
                if not account_row.data:
                    continue

                normalized = _normalize_transaction(plaid_txn, account_row.data["id"])
                supabase.table("transactions").upsert(
                    normalized, on_conflict="plaid_transaction_id"
                ).execute()

                from tasks.generate_embeddings import generate_embedding_for_transaction
                generate_embedding_for_transaction.delay(normalized["id"])
                total_added += 1

            for removed_txn in removed:
                supabase.table("transactions").delete().eq(
                    "plaid_transaction_id", removed_txn.get("transaction_id", "")
                ).execute()

        supabase.table("plaid_items").update({"cursor": cursor}).eq(
            "id", item["id"]
        ).execute()

    return {"user_id": user_id, "transactions_synced": total_added}
