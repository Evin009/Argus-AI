from datetime import date, timedelta

_SCHEDULE_DAYS = {
    "weekly": 7,
    "biweekly": 14,
    "semimonthly": 15,
    "monthly": 30,
}


def days_until_next_payday(pay_schedule: str) -> int:
    return _SCHEDULE_DAYS.get(pay_schedule, 30)


def compute_safe_to_spend(
    balance: float,
    bills: list[dict],
    pay_schedule: str,
    buffer_reserve: float,
) -> dict:
    window = days_until_next_payday(pay_schedule)
    cutoff = date.today() + timedelta(days=window)

    bills_due = sum(
        b["avg_amount"]
        for b in bills
        if b.get("next_due_date") and date.fromisoformat(b["next_due_date"]) <= cutoff
    )

    safe = max(0.0, balance - bills_due - buffer_reserve)

    return {
        "safe_amount": round(safe, 2),
        "breakdown": {
            "balance": balance,
            "bills_due": round(bills_due, 2),
            "buffer_reserve": buffer_reserve,
            "window_days": window,
        },
    }
