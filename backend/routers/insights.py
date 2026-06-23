from fastapi import APIRouter, Depends, Query

from db.client import get_supabase
from engines.safe_to_spend import compute_safe_to_spend
from middleware.auth import get_current_user

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("")
async def get_insights(
    limit: int = Query(default=20, le=50),
    signal_type: str | None = Query(default=None),
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase()
    result = (
        supabase.table("ai_insights")
        .select("id, insight_type, summary, structured_output_json, created_at")
        .eq("user_id", user_id)
        .eq("insight_type", "analyst_decision")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    data = result.data or []
    if signal_type:
        data = [
            r
            for r in data
            if (r.get("structured_output_json") or {}).get("signal_type") == signal_type
        ]
    return data


@router.get("/safe-to-spend")
async def get_safe_to_spend(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    cached = (
        supabase.table("safe_to_spend_cache")
        .select("safe_amount, breakdown, computed_at")
        .eq("user_id", user_id)
        .execute()
    ).data or []

    if cached:
        return cached[0]

    accounts = (
        supabase.table("accounts").select("balance").eq("user_id", user_id).execute()
    ).data or []
    balance = sum(a.get("balance") or 0 for a in accounts)

    bills = (
        supabase.table("bills").select("avg_amount, next_due_date").eq("user_id", user_id).execute()
    ).data or []

    onboarding = (
        supabase.table("onboarding_responses")
        .select("pay_schedule")
        .eq("user_id", user_id)
        .execute()
    ).data or []
    pay_schedule = (onboarding[0].get("pay_schedule") or "monthly") if onboarding else "monthly"

    result = compute_safe_to_spend(balance, bills, pay_schedule, 100.0)
    return {**result, "computed_at": None}
