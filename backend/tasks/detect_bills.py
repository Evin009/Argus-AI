import statistics
import uuid
from collections import defaultdict
from datetime import date, timedelta

from celery_app import celery
from db.client import get_supabase


def _compute_intervals(dates: list[date]) -> list[int]:
    sorted_dates = sorted(dates)
    return [(sorted_dates[i + 1] - sorted_dates[i]).days for i in range(len(sorted_dates) - 1)]


def _classify_pattern(median_interval: float) -> str | None:
    if 5 <= median_interval <= 9:
        return "weekly"
    if 25 <= median_interval <= 35:
        return "monthly"
    if 350 <= median_interval <= 380:
        return "annual"
    return None


def _detect_bills_for_transactions(transactions: list[dict], user_id: str) -> list[dict]:
    merchant_groups: dict[str, list] = defaultdict(list)
    for txn in transactions:
        merchant = (txn.get("merchant") or "").strip()
        if not merchant or merchant == "Unknown":
            continue
        try:
            txn_date = date.fromisoformat(str(txn["timestamp"])[:10])
        except (ValueError, KeyError):
            continue
        merchant_groups[merchant].append((txn_date, float(txn.get("amount", 0))))

    bills = []
    for merchant, entries in merchant_groups.items():
        if len(entries) < 2:
            continue

        dates = [e[0] for e in entries]
        amounts = [e[1] for e in entries]
        intervals = _compute_intervals(dates)

        if not intervals:
            continue

        median_interval = statistics.median(intervals)
        pattern = _classify_pattern(median_interval)
        if pattern is None:
            continue

        last_seen = max(dates)
        next_due = last_seen + timedelta(days=int(median_interval))
        avg_amount = round(statistics.mean(amounts), 2)

        bills.append(
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "merchant": merchant,
                "recurrence_pattern": pattern,
                "avg_amount": avg_amount,
                "next_due_date": next_due.isoformat(),
                "last_seen": last_seen.isoformat(),
            }
        )

    return bills


@celery.task(name="tasks.detect_bills.detect_recurring_bills_for_user")
def detect_recurring_bills_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    accts = supabase.table("accounts").select("id").eq("user_id", user_id).execute()
    account_ids = [a["id"] for a in accts.data]

    if not account_ids:
        return {"user_id": user_id, "bills_detected": 0}

    result = (
        supabase.table("transactions")
        .select("merchant, amount, timestamp")
        .in_("account_id", account_ids)
        .order("timestamp", desc=False)
        .execute()
    )

    bills = _detect_bills_for_transactions(result.data, user_id)

    for bill in bills:
        supabase.table("bills").upsert(bill, on_conflict="user_id,merchant").execute()

    from tasks.detect_subscriptions import detect_subscriptions_for_user

    detect_subscriptions_for_user.delay(user_id)

    return {"user_id": user_id, "bills_detected": len(bills)}
