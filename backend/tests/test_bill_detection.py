import os
from datetime import date

import pytest

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-role-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("OPENAI_API_KEY", "sk-placeholder")
os.environ.setdefault("PLAID_CLIENT_ID", "placeholder")
os.environ.setdefault("PLAID_SECRET", "placeholder")
os.environ.setdefault("PLAID_ENV", "sandbox")
os.environ.setdefault("PLAID_TOKEN_ENCRYPTION_KEY", "a" * 64)

from tasks.detect_bills import (  # noqa: E402
    _classify_pattern,
    _compute_intervals,
    _detect_bills_for_transactions,
)


def test_compute_intervals_returns_day_gaps():
    dates = [date(2024, 1, 1), date(2024, 2, 1), date(2024, 3, 2)]
    result = _compute_intervals(dates)
    assert result == [31, 30]


def test_compute_intervals_sorts_dates():
    dates = [date(2024, 3, 1), date(2024, 1, 1), date(2024, 2, 1)]
    result = _compute_intervals(dates)
    assert result == [31, 29]


def test_compute_intervals_single_date_returns_empty():
    assert _compute_intervals([date(2024, 1, 1)]) == []


def test_classify_pattern_monthly():
    assert _classify_pattern(30) == "monthly"
    assert _classify_pattern(28) == "monthly"
    assert _classify_pattern(31) == "monthly"


def test_classify_pattern_weekly():
    assert _classify_pattern(7) == "weekly"
    assert _classify_pattern(6) == "weekly"
    assert _classify_pattern(8) == "weekly"


def test_classify_pattern_annual():
    assert _classify_pattern(365) == "annual"
    assert _classify_pattern(355) == "annual"
    assert _classify_pattern(375) == "annual"


def test_classify_pattern_irregular_returns_none():
    assert _classify_pattern(45) is None
    assert _classify_pattern(15) is None


def test_detect_bills_identifies_monthly_merchant():
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2024-01-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2024-02-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2024-03-15"},
    ]
    bills = _detect_bills_for_transactions(transactions, "user-123")
    assert len(bills) == 1
    assert bills[0]["merchant"] == "Netflix"
    assert bills[0]["recurrence_pattern"] == "monthly"
    assert bills[0]["avg_amount"] == pytest.approx(15.99, abs=0.01)
    assert bills[0]["user_id"] == "user-123"


def test_detect_bills_skips_single_transaction_merchant():
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2024-01-15"},
        {"merchant": "OneTime Store", "amount": 99.00, "timestamp": "2024-01-20"},
    ]
    bills = _detect_bills_for_transactions(transactions, "user-123")
    merchants = [b["merchant"] for b in bills]
    assert "OneTime Store" not in merchants


def test_detect_bills_skips_irregular_merchant():
    transactions = [
        {"merchant": "Random Shop", "amount": 20.00, "timestamp": "2024-01-01"},
        {"merchant": "Random Shop", "amount": 20.00, "timestamp": "2024-01-20"},
        {"merchant": "Random Shop", "amount": 20.00, "timestamp": "2024-02-14"},
    ]
    bills = _detect_bills_for_transactions(transactions, "user-123")
    merchants = [b["merchant"] for b in bills]
    assert "Random Shop" not in merchants


def test_detect_bills_next_due_date_is_after_last_seen():
    transactions = [
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2024-01-10"},
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2024-02-10"},
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2024-03-10"},
    ]
    bills = _detect_bills_for_transactions(transactions, "user-123")
    assert len(bills) == 1
    last_seen = date.fromisoformat(bills[0]["last_seen"])
    next_due = date.fromisoformat(bills[0]["next_due_date"])
    assert next_due > last_seen
