import json
import os
import uuid
from collections import defaultdict
from datetime import date, datetime, timedelta, timezone

import anthropic

from celery_app import celery
from db.client import get_supabase

_ANALYST_SYSTEM_PROMPT = """You are ArgusAI's financial intelligence analyst. You have access to a user's complete financial picture.

Reason like a senior financial analyst: identify what matters, simulate forward implications, and produce structured actionable decisions.

Rules:
- Never describe data — interpret it
- Never state the obvious — surface what the user would not notice themselves
- Reference prior patterns from the user profile where relevant
- Be direct and specific in recommendations
- Simulate consequences: "At current trajectory, X will cost Y by Z"

Respond ONLY with valid JSON in the exact shape requested. No explanation, no markdown."""


def _aggregate_transactions(transactions: list[dict]) -> dict:
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    ninety_days_ago = today - timedelta(days=90)

    by_category: dict[str, dict] = defaultdict(lambda: {"last_30": [], "last_90": []})

    for txn in transactions:
        try:
            txn_date = date.fromisoformat(str(txn["timestamp"])[:10])
        except (ValueError, KeyError):
            continue
        category = txn.get("category", "OTHER")
        amount = float(txn.get("amount", 0))
        if txn_date >= ninety_days_ago:
            by_category[category]["last_90"].append(amount)
        if txn_date >= thirty_days_ago:
            by_category[category]["last_30"].append(amount)

    result = {}
    for category, data in by_category.items():
        last_90_total = sum(data["last_90"])
        last_30_total = sum(data["last_30"])
        monthly_baseline = last_90_total / 3 if data["last_90"] else 0
        change_pct = (
            round(((last_30_total - monthly_baseline) / monthly_baseline) * 100, 1)
            if monthly_baseline
            else 0
        )
        result[category] = {
            "monthly_baseline": round(monthly_baseline, 2),
            "last_30_total": round(last_30_total, 2),
            "change_pct": change_pct,
        }
    return result


def _build_analyst_brief(
    accounts: list[dict],
    bills: list[dict],
    subscriptions: list[dict],
    tx_summary: dict,
    past_insights: list[dict],
    profile: dict,
) -> str:
    today = date.today().isoformat()
    recent_memory = json.dumps(
        [{"title": i.get("summary"), "created_at": i.get("created_at")} for i in past_insights],
        indent=2,
    )
    return (
        f"Today: {today}\n\n"
        f"USER FINANCIAL PROFILE (long-term memory):\n{json.dumps(profile, indent=2)}\n\n"
        f"RECENT ANALYST DECISIONS (episodic memory — last 5):\n{recent_memory}\n\n"
        f"CURRENT ACCOUNTS:\n{json.dumps([{'type': a.get('account_type'), 'balance': a.get('balance'), 'credit_limit': a.get('credit_limit')} for a in accounts], indent=2)}\n\n"
        f"UPCOMING BILLS:\n{json.dumps([{'merchant': b.get('merchant'), 'amount': b.get('avg_amount'), 'due': b.get('next_due_date'), 'enrichment': b.get('ai_enrichment')} for b in bills], indent=2)}\n\n"
        f"ACTIVE SUBSCRIPTIONS:\n{json.dumps([{'merchant': s.get('merchant'), 'amount': s.get('avg_amount'), 'price_change_pct': s.get('price_change_pct'), 'enrichment': s.get('ai_enrichment')} for s in subscriptions], indent=2)}\n\n"
        f"SPENDING SUMMARY (last 90 days by category):\n{json.dumps(tx_summary, indent=2)}\n\n"
        f"Generate 3-5 analyst decisions AND an updated user profile.\n\n"
        f"Return this exact JSON shape:\n"
        f'{{\n'
        f'  "decisions": [\n'
        f'    {{\n'
        f'      "signal_type": "<behavioral|risk|opportunity|anomaly|subscription>",\n'
        f'      "severity": "<info|warning|critical>",\n'
        f'      "title": "<specific, concrete title>",\n'
        f'      "reasoning": "<interpret, reference history, explain pattern>",\n'
        f'      "recommendation": "<specific action>",\n'
        f'      "simulation": "<forward projection>",\n'
        f'      "confidence": <float 0-1>,\n'
        f'      "sources": ["<data sources>"]\n'
        f'    }}\n'
        f'  ],\n'
        f'  "updated_profile": {{\n'
        f'    "income_pattern": {{}},\n'
        f'    "spending_baselines": {{}},\n'
        f'    "behavioral_patterns": [],\n'
        f'    "known_risks": [],\n'
        f'    "analyst_notes": "<running notes about this user>",\n'
        f'    "resolved_patterns": []\n'
        f'  }}\n'
        f'}}'
    )


def _parse_synthesis_response(response_text: str) -> dict:
    text = response_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return {"decisions": [], "updated_profile": {}}
    if not isinstance(parsed, dict):
        return {"decisions": [], "updated_profile": {}}
    return {
        "decisions": parsed.get("decisions", []),
        "updated_profile": parsed.get("updated_profile", {}),
    }


@celery.task(name="tasks.synthesize_insights.synthesize_insights_for_user")
def synthesize_insights_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    accts = (
        supabase.table("accounts")
        .select("account_type, balance, credit_limit")
        .eq("user_id", user_id)
        .execute()
    )
    account_ids_result = (
        supabase.table("accounts")
        .select("id")
        .eq("user_id", user_id)
        .execute()
    )
    account_ids = [a["id"] for a in account_ids_result.data or []]

    bills_result = (
        supabase.table("bills")
        .select("merchant, avg_amount, next_due_date, ai_enrichment")
        .eq("user_id", user_id)
        .execute()
    )
    subs_result = (
        supabase.table("subscriptions")
        .select("merchant, avg_amount, price_change_pct, ai_enrichment")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    )

    txn_result = (
        supabase.table("transactions")
        .select("category, amount, timestamp")
        .in_("account_id", account_ids)
        .order("timestamp", desc=True)
        .limit(500)
        .execute()
    ) if account_ids else type("R", (), {"data": []})()

    past_insights = (
        supabase.table("ai_insights")
        .select("summary, created_at")
        .eq("user_id", user_id)
        .eq("insight_type", "analyst_decision")
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    ).data or []

    profile_result = (
        supabase.table("user_financial_profiles")
        .select("profile")
        .eq("user_id", user_id)
        .execute()
    )
    profile = profile_result.data[0]["profile"] if profile_result.data else {}

    tx_summary = _aggregate_transactions(txn_result.data or [])
    brief = _build_analyst_brief(
        accounts=accts.data or [],
        bills=bills_result.data or [],
        subscriptions=subs_result.data or [],
        tx_summary=tx_summary,
        past_insights=past_insights,
        profile=profile,
    )

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8096,
            system=[{
                "type": "text",
                "text": _ANALYST_SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }],
            messages=[{"role": "user", "content": brief}],
        )
        response_text = message.content[0].text
    except Exception:
        return {"user_id": user_id, "decisions_written": 0}

    result = _parse_synthesis_response(response_text)

    now = datetime.now(timezone.utc).isoformat()
    decisions_written = 0
    for decision in result.get("decisions", []):
        supabase.table("ai_insights").insert({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "insight_type": "analyst_decision",
            "summary": decision.get("title", ""),
            "structured_output_json": decision,
            "created_at": now,
        }).execute()
        decisions_written += 1

    updated_profile = result.get("updated_profile")
    if updated_profile:
        supabase.table("user_financial_profiles").upsert(
            {"user_id": user_id, "profile": updated_profile, "last_updated": now},
            on_conflict="user_id",
        ).execute()

    return {"user_id": user_id, "decisions_written": decisions_written}
