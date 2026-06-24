from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from main import app
from middleware.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "test-user-id"
client = TestClient(app)


def make_supabase(accounts_data, transactions_data, subscriptions_data):
    mock_supabase = MagicMock()

    def table_side(name):
        m = MagicMock()
        if name == "accounts":
            m.select.return_value.eq.return_value.execute.return_value.data = accounts_data
        elif name == "transactions":
            chain = m.select.return_value.in_.return_value.order.return_value.limit.return_value
            chain.execute.return_value.data = transactions_data
        elif name == "subscriptions":
            m.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = (
                subscriptions_data
            )
        return m

    mock_supabase.table.side_effect = table_side
    return mock_supabase


def test_overview_returns_spending_by_category():
    accounts = [
        {"id": "acc-1", "balance": 1000.0, "credit_limit": None, "account_type": "checking"}
    ]
    transactions = [
        {"category": "food", "amount": 50.0, "timestamp": "2026-06-01T12:00:00Z"},
        {"category": "food", "amount": 30.0, "timestamp": "2026-06-08T12:00:00Z"},
        {"category": "transport", "amount": 20.0, "timestamp": "2026-06-01T12:00:00Z"},
    ]
    subs = []
    mock_supabase = make_supabase(accounts, transactions, subs)

    with patch("routers.profile.get_supabase", return_value=mock_supabase):
        resp = client.get("/profile/overview")

    assert resp.status_code == 200
    data = resp.json()
    assert "spending_by_category" in data
    assert data["spending_by_category"]["food"] == 80.0
    assert data["spending_by_category"]["transport"] == 20.0


def test_overview_returns_subscription_summary():
    accounts = [{"id": "acc-1", "balance": 500.0, "credit_limit": None, "account_type": "checking"}]
    transactions = []
    subs = [
        {"merchant": "Netflix", "avg_amount": 15.0},
        {"merchant": "Spotify", "avg_amount": 10.0},
    ]
    mock_supabase = make_supabase(accounts, transactions, subs)

    with patch("routers.profile.get_supabase", return_value=mock_supabase):
        resp = client.get("/profile/overview")

    assert resp.status_code == 200
    data = resp.json()
    assert data["subscription_summary"]["count"] == 2
    assert data["subscription_summary"]["monthly_total"] == 25.0


def test_overview_returns_utilization_summary():
    accounts = [
        {"id": "acc-1", "balance": 400.0, "credit_limit": 1000.0, "account_type": "credit"},
        {"id": "acc-2", "balance": 200.0, "credit_limit": 500.0, "account_type": "credit"},
    ]
    transactions = []
    subs = []
    mock_supabase = make_supabase(accounts, transactions, subs)

    with patch("routers.profile.get_supabase", return_value=mock_supabase):
        resp = client.get("/profile/overview")

    assert resp.status_code == 200
    data = resp.json()
    util = data["utilization_summary"]
    assert util["total_credit_limit"] == 1500.0
    assert util["total_balance"] == 600.0
    assert round(util["utilization_pct"], 2) == 40.0
