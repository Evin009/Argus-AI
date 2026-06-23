from datetime import date, timedelta

from engines.safe_to_spend import compute_safe_to_spend, days_until_next_payday


def test_days_until_next_payday_biweekly():
    days = days_until_next_payday("biweekly")
    assert 0 <= days <= 14


def test_safe_amount_subtracts_bills_due_outside_window():
    bills = [{"avg_amount": 100.0, "next_due_date": "2099-01-01"}]
    result = compute_safe_to_spend(
        balance=1000.0,
        bills=bills,
        pay_schedule="monthly",
        buffer_reserve=50.0,
    )
    assert result["safe_amount"] == 1000.0 - 50.0


def test_safe_amount_subtracts_bills_due_within_window():
    due_soon = (date.today() + timedelta(days=3)).isoformat()
    bills = [{"avg_amount": 200.0, "next_due_date": due_soon}]
    result = compute_safe_to_spend(
        balance=1000.0,
        bills=bills,
        pay_schedule="monthly",
        buffer_reserve=50.0,
    )
    assert result["safe_amount"] == 1000.0 - 200.0 - 50.0


def test_safe_amount_never_negative():
    bills = [{"avg_amount": 9999.0, "next_due_date": "2025-01-02"}]
    result = compute_safe_to_spend(
        balance=100.0,
        bills=bills,
        pay_schedule="weekly",
        buffer_reserve=50.0,
    )
    assert result["safe_amount"] == 0.0


def test_breakdown_keys_present():
    result = compute_safe_to_spend(1000.0, [], "biweekly", 100.0)
    assert "balance" in result["breakdown"]
    assert "bills_due" in result["breakdown"]
    assert "buffer_reserve" in result["breakdown"]
