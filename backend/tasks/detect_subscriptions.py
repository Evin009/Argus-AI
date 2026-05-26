import statistics
import uuid
from datetime import date

from celery_app import celery
from db.client import get_supabase


def _compute_price_change_pct(
    recent_amounts: list[float], old_amounts: list[float]
) -> float | None:
    if not recent_amounts or not old_amounts:
        return None
    old_avg = statistics.mean(old_amounts)
    if old_avg == 0:
        return None
    recent_avg = statistics.mean(recent_amounts)
    return round(((recent_avg - old_avg) / abs(old_avg)) * 100, 2)


def _split_amounts_by_period(
    transactions: list[dict], merchant: str, reference_date: date
) -> tuple[list[float], list[float]]:
    recent: list[float] = []
    old: list[float] = []
    for txn in transactions:
        if (txn.get("merchant") or "").strip() != merchant:
            continue
        try:
            txn_date = date.fromisoformat(str(txn["timestamp"])[:10])
        except (ValueError, KeyError):
            continue
        days_ago = (reference_date - txn_date).days
        if 0 <= days_ago < 60:
            recent.append(float(txn.get("amount", 0)))
        elif 60 <= days_ago < 120:
            old.append(float(txn.get("amount", 0)))
    return recent, old


def _build_subscriptions(
    bills: list[dict], transactions: list[dict], user_id: str
) -> list[dict]:
    today = date.today()
    subscriptions = []
    for bill in bills:
        if bill.get("recurrence_pattern") != "monthly":
            continue
        merchant = bill["merchant"]
        recent, old = _split_amounts_by_period(transactions, merchant, today)
        price_change_pct = _compute_price_change_pct(recent, old)
        subscriptions.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "merchant": merchant,
            "avg_amount": bill["avg_amount"],
            "billing_cycle": "monthly",
            "price_change_pct": price_change_pct,
            "is_active": True,
        })
    return subscriptions


@celery.task(name="tasks.detect_subscriptions.detect_subscriptions_for_user")
def detect_subscriptions_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    bills_result = (
        supabase.table("bills")
        .select("merchant, recurrence_pattern, avg_amount, next_due_date, last_seen")
        .eq("user_id", user_id)
        .execute()
    )

    if not bills_result.data:
        return {"user_id": user_id, "subscriptions_detected": 0}

    accts = supabase.table("accounts").select("id").eq("user_id", user_id).execute()
    account_ids = [a["id"] for a in accts.data]

    txn_result = (
        supabase.table("transactions")
        .select("merchant, amount, timestamp")
        .in_("account_id", account_ids)
        .order("timestamp", desc=False)
        .execute()
    )

    subs = _build_subscriptions(bills_result.data, txn_result.data, user_id)

    for sub in subs:
        supabase.table("subscriptions").upsert(
            sub, on_conflict="user_id,merchant"
        ).execute()

    from tasks.run_intelligence_pipeline import run_intelligence_pipeline_for_user
    run_intelligence_pipeline_for_user.delay(user_id)

    return {"user_id": user_id, "subscriptions_detected": len(subs)}
