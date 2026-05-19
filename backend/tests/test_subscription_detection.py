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

from tasks.detect_subscriptions import (  # noqa: E402
    _build_subscriptions,
    _compute_price_change_pct,
    _split_amounts_by_period,
)


def test_compute_price_change_pct_increase():
    assert _compute_price_change_pct([12.99], [9.99]) == pytest.approx(30.03, abs=0.1)


def test_compute_price_change_pct_decrease():
    result = _compute_price_change_pct([8.99], [9.99])
    assert result < 0


def test_compute_price_change_pct_no_change():
    assert _compute_price_change_pct([9.99, 9.99], [9.99, 9.99]) == pytest.approx(0.0, abs=0.01)


def test_compute_price_change_pct_empty_recent_returns_none():
    assert _compute_price_change_pct([], [9.99]) is None


def test_compute_price_change_pct_empty_old_returns_none():
    assert _compute_price_change_pct([9.99], []) is None


def test_compute_price_change_pct_zero_old_returns_none():
    assert _compute_price_change_pct([9.99], [0.0]) is None


def test_split_amounts_by_period_recent():
    reference = date(2026, 5, 1)
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-04-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-03-15"},
        {"merchant": "Netflix", "amount": 12.99, "timestamp": "2026-02-01"},
    ]
    recent, old = _split_amounts_by_period(transactions, "Netflix", reference)
    assert len(recent) == 2
    assert len(old) == 1
    assert 15.99 in recent
    assert 12.99 in old


def test_split_amounts_by_period_ignores_other_merchants():
    reference = date(2026, 5, 1)
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-04-15"},
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2026-04-15"},
    ]
    recent, old = _split_amounts_by_period(transactions, "Netflix", reference)
    assert len(recent) == 1
    assert 9.99 not in recent


def test_split_amounts_by_period_outside_window_excluded():
    reference = date(2026, 5, 1)
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2025-01-01"},
    ]
    recent, old = _split_amounts_by_period(transactions, "Netflix", reference)
    assert recent == []
    assert old == []


def test_build_subscriptions_detects_monthly_bill():
    bills = [
        {
            "merchant": "Netflix",
            "recurrence_pattern": "monthly",
            "avg_amount": 15.99,
            "next_due_date": "2026-06-01",
            "last_seen": "2026-05-01",
        }
    ]
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-04-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-03-15"},
        {"merchant": "Netflix", "amount": 12.99, "timestamp": "2026-02-10"},
    ]
    subs = _build_subscriptions(bills, transactions, "user-123")
    assert len(subs) == 1
    assert subs[0]["merchant"] == "Netflix"
    assert subs[0]["user_id"] == "user-123"
    assert subs[0]["billing_cycle"] == "monthly"
    assert subs[0]["is_active"] is True


def test_build_subscriptions_skips_non_monthly():
    bills = [
        {
            "merchant": "Weekly Cleaner",
            "recurrence_pattern": "weekly",
            "avg_amount": 25.0,
            "next_due_date": "2026-05-08",
            "last_seen": "2026-05-01",
        }
    ]
    transactions = [
        {"merchant": "Weekly Cleaner", "amount": 25.0, "timestamp": "2026-04-24"},
    ]
    subs = _build_subscriptions(bills, transactions, "user-123")
    assert len(subs) == 0


def test_build_subscriptions_price_creep_detected():
    bills = [
        {
            "merchant": "Spotify",
            "recurrence_pattern": "monthly",
            "avg_amount": 11.99,
            "next_due_date": "2026-06-01",
            "last_seen": "2026-05-01",
        }
    ]
    transactions = [
        {"merchant": "Spotify", "amount": 11.99, "timestamp": "2026-04-15"},
        {"merchant": "Spotify", "amount": 11.99, "timestamp": "2026-03-15"},
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2026-02-10"},
    ]
    subs = _build_subscriptions(bills, transactions, "user-123")
    assert len(subs) == 1
    assert subs[0]["price_change_pct"] > 5.0


def test_build_subscriptions_no_price_creep():
    bills = [
        {
            "merchant": "Netflix",
            "recurrence_pattern": "monthly",
            "avg_amount": 15.99,
            "next_due_date": "2026-06-01",
            "last_seen": "2026-05-01",
        }
    ]
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-04-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-03-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-02-10"},
    ]
    subs = _build_subscriptions(bills, transactions, "user-123")
    assert len(subs) == 1
    assert subs[0]["price_change_pct"] == pytest.approx(0.0, abs=0.01)
