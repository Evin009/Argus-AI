from collections import Counter
from datetime import date, timedelta

_TARGET_UTILIZATION = 0.08
_STACK_WINDOW_DAYS = 3


def infer_closing_date(transactions: list[dict]) -> int:
    days = [int(t["timestamp"][8:10]) for t in transactions if t.get("timestamp")]
    if not days:
        return 1
    return Counter(days).most_common(1)[0][0]


def bills_in_window(bills: list[dict], window_days: int) -> list[dict]:
    cutoff = date.today() + timedelta(days=window_days)
    return [
        b for b in bills
        if b.get("next_due_date") and date.fromisoformat(b["next_due_date"]) <= cutoff
    ]


def compute_pay_timing(
    accounts: list[dict],
    bills: list[dict],
    balance: float,
) -> dict:
    card_recommendations = []
    for acct in accounts:
        if acct.get("account_type") != "credit":
            continue
        current_balance = acct.get("balance") or 0.0
        limit = acct.get("credit_limit") or 0.0
        if limit == 0:
            continue
        target_balance = round(limit * _TARGET_UTILIZATION, 2)
        pay_amount = max(0.0, round(current_balance - target_balance, 2))

        card_recommendations.append({
            "account_id": acct["id"],
            "pay_amount": pay_amount,
            "target_utilization": _TARGET_UTILIZATION,
            "closing_day": acct.get("closing_date"),
        })

    stacked_windows = []
    today = date.today()
    window_bills = bills_in_window(bills, _STACK_WINDOW_DAYS)
    total_due = sum(b.get("avg_amount") or 0 for b in window_bills)
    if window_bills and total_due > balance:
        sorted_bills = sorted(window_bills, key=lambda b: b.get("avg_amount") or 0, reverse=True)
        stacked_windows.append({
            "window_start": today.isoformat(),
            "window_end": (today + timedelta(days=_STACK_WINDOW_DAYS)).isoformat(),
            "total_due": round(total_due, 2),
            "priority_order": sorted_bills,
        })

    return {
        "card_recommendations": card_recommendations,
        "stacked_windows": stacked_windows,
    }
