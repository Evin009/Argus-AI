from fastapi import APIRouter, Depends

from db.client import get_supabase
from engines.profile import (
    compute_merchant_detail,
    compute_merchant_rankings,
    compute_spending_by_category,
    compute_utilization_summary,
)
from middleware.auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

TRANSACTION_LIMIT = 1000


def _get_transactions(supabase, user_id: str) -> list:
    accounts = (supabase.table("accounts").select("id").eq("user_id", user_id).execute()).data or []
    account_ids = [a["id"] for a in accounts]
    if not account_ids:
        return []
    return (
        supabase.table("transactions")
        .select("merchant, amount, category, timestamp")
        .in_("account_ids", account_ids)
        .order("timestamp", desc=True)
        .limit(TRANSACTION_LIMIT)
        .execute()
    ).data or []


def _get_transactions_for_user(supabase, user_id: str) -> tuple[list, list]:
    accounts = (
        supabase.table("accounts")
        .select("id, balance, credit_limit, account_type")
        .eq("user_id", user_id)
        .execute()
    ).data or []
    account_ids = [a["id"] for a in accounts]
    transactions = []
    if account_ids:
        transactions = (
            supabase.table("transactions")
            .select("merchant, amount, category, timestamp")
            .in_("account_id", account_ids)
            .order("timestamp", desc=True)
            .limit(TRANSACTION_LIMIT)
            .execute()
        ).data or []
    return accounts, transactions


def call_argus_insight(merchant: str, detail: dict, user_id: str) -> str:
    import anthropic

    client = anthropic.Anthropic()
    monthly = detail.get("monthly_trend", [])
    total = detail.get("total_spend", 0)
    count = detail.get("transaction_count", 0)
    trend_summary = (
        f"Last {len(monthly)} months: " + ", ".join(f"{m['month']}=${m['amount']}" for m in monthly)
        if monthly
        else "No monthly data."
    )
    prompt = (
        f"User has spent ${total} at {merchant} across {count} transactions. "
        f"{trend_summary}. "
        "Give one specific, actionable insight about this spending pattern. "
        "One sentence, no hedging, mention the merchant and a dollar amount."
    )
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=120,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text.strip()


@router.get("/overview")
async def get_profile_overview(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    accounts, transactions = _get_transactions_for_user(supabase, user_id)

    subs = (
        supabase.table("subscriptions")
        .select("merchant, avg_amount")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    ).data or []

    spending_by_category = compute_spending_by_category(transactions)
    utilization_summary = compute_utilization_summary(accounts)

    monthly_total_subs = sum(float(s.get("avg_amount") or 0) for s in subs)
    subscription_summary = {
        "count": len(subs),
        "monthly_total": round(monthly_total_subs, 2),
    }

    return {
        "spending_by_category": spending_by_category,
        "subscription_summary": subscription_summary,
        "utilization_summary": utilization_summary,
    }


@router.get("/merchants")
async def get_merchants(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    _, transactions = _get_transactions_for_user(supabase, user_id)
    merchants = compute_merchant_rankings(transactions)
    return {"merchants": merchants}


@router.get("/merchants/{merchant_id}")
async def get_merchant_detail(merchant_id: str, user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    _, transactions = _get_transactions_for_user(supabase, user_id)
    detail = compute_merchant_detail(transactions, merchant_id)
    insight = call_argus_insight(merchant_id, detail, user_id)
    return {**detail, "insight": insight}
