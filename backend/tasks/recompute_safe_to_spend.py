from celery_app import celery
from db.client import get_supabase
from engines.safe_to_spend import compute_safe_to_spend

_DEFAULT_BUFFER = 100.0


@celery.task
def recompute_safe_to_spend_for_user(user_id: str) -> None:
    supabase = get_supabase()

    accounts = (
        supabase.table("accounts")
        .select("id, balance")
        .eq("user_id", user_id)
        .execute()
    ).data or []
    balance = sum(a.get("balance") or 0 for a in accounts)

    bills = (
        supabase.table("bills")
        .select("avg_amount, next_due_date")
        .eq("user_id", user_id)
        .execute()
    ).data or []

    onboarding = (
        supabase.table("onboarding_responses")
        .select("pay_schedule")
        .eq("user_id", user_id)
        .execute()
    ).data or []
    pay_schedule = (onboarding[0].get("pay_schedule") or "monthly") if onboarding else "monthly"

    result = compute_safe_to_spend(balance, bills, pay_schedule, _DEFAULT_BUFFER)

    supabase.table("safe_to_spend_cache").upsert(
        {
            "user_id": user_id,
            "safe_amount": result["safe_amount"],
            "breakdown": result["breakdown"],
        },
        on_conflict="user_id",
    ).execute()
