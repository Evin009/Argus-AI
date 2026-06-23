from datetime import date, timedelta

from engines.pay_timing import bills_in_window, compute_pay_timing, infer_closing_date


def test_infer_closing_date_from_transactions():
    txns = [
        {"timestamp": "2026-05-05T00:00:00Z"},
        {"timestamp": "2026-04-05T00:00:00Z"},
        {"timestamp": "2026-03-05T00:00:00Z"},
    ]
    day = infer_closing_date(txns)
    assert day == 5


def test_infer_closing_date_fallback():
    assert infer_closing_date([]) == 1


def test_bills_in_window_filters_correctly():
    today = date.today()
    bills = [
        {
            "next_due_date": (today + timedelta(days=1)).isoformat(),
            "avg_amount": 50.0,
            "merchant": "A",
        },
        {
            "next_due_date": (today + timedelta(days=10)).isoformat(),
            "avg_amount": 200.0,
            "merchant": "B",
        },
        {
            "next_due_date": (today + timedelta(days=40)).isoformat(),
            "avg_amount": 100.0,
            "merchant": "C",
        },
    ]
    result = bills_in_window(bills, window_days=7)
    assert len(result) == 1
    assert result[0]["merchant"] == "A"


def test_compute_pay_timing_card_recommendation():
    accounts = [
        {
            "id": "card-1",
            "account_type": "credit",
            "balance": 800.0,
            "credit_limit": 1000.0,
            "closing_date": None,
        }
    ]
    result = compute_pay_timing(accounts=accounts, bills=[], balance=2000.0)
    recs = result["card_recommendations"]
    assert len(recs) == 1
    assert recs[0]["pay_amount"] == round(800.0 - 1000.0 * 0.08, 2)


def test_compute_pay_timing_skips_non_credit():
    accounts = [
        {
            "id": "chk-1",
            "account_type": "checking",
            "balance": 2000.0,
            "credit_limit": None,
            "closing_date": None,
        }
    ]
    result = compute_pay_timing(accounts=accounts, bills=[], balance=2000.0)
    assert result["card_recommendations"] == []


def test_compute_pay_timing_stacked_window_detection():
    today = date.today()
    bills = [
        {
            "next_due_date": (today + timedelta(days=1)).isoformat(),
            "avg_amount": 300.0,
            "merchant": "Rent",
        },
        {
            "next_due_date": (today + timedelta(days=2)).isoformat(),
            "avg_amount": 200.0,
            "merchant": "Car",
        },
        {
            "next_due_date": (today + timedelta(days=3)).isoformat(),
            "avg_amount": 150.0,
            "merchant": "Electric",
        },
    ]
    result = compute_pay_timing(accounts=[], bills=bills, balance=400.0)
    assert len(result["stacked_windows"]) > 0


def test_no_stack_when_balance_covers_bills():
    today = date.today()
    bills = [
        {
            "next_due_date": (today + timedelta(days=1)).isoformat(),
            "avg_amount": 100.0,
            "merchant": "Netflix",
        },
    ]
    result = compute_pay_timing(accounts=[], bills=bills, balance=5000.0)
    assert result["stacked_windows"] == []
