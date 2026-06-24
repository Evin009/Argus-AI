from datetime import date, timedelta
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from main import app
from middleware.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "test-user-id"
client = TestClient(app)


def make_supabase(accounts_data, transactions_data):
    mock_supabase = MagicMock()

    def table_side(name):
        m = MagicMock()
        if name == "accounts":
            m.select.return_value.eq.return_value.execute.return_value.data = accounts_data
        elif name == "transactions":
            chain = m.select.return_value.in_.return_value.order.return_value.limit.return_value
            chain.execute.return_value.data = transactions_data
        return m

    mock_supabase.table.side_effect = table_side
    return mock_supabase


def test_merchants_ranked_by_total_spend():
    accounts = [{"id": "acc-1"}]
    today = date.today().isoformat()
    transactions = [
        {"merchant": "Amazon", "amount": 100.0, "timestamp": today, "category": "shopping"},
        {"merchant": "Amazon", "amount": 50.0, "timestamp": today, "category": "shopping"},
        {"merchant": "Starbucks", "amount": 10.0, "timestamp": today, "category": "food"},
    ]
    mock_supabase = make_supabase(accounts, transactions)

    with patch("routers.profile.get_supabase", return_value=mock_supabase):
        resp = client.get("/profile/merchants")

    assert resp.status_code == 200
    merchants = resp.json()["merchants"]
    assert merchants[0]["merchant"] == "Amazon"
    assert merchants[0]["total_spend"] == 150.0
    assert merchants[0]["transaction_count"] == 2
    assert merchants[1]["merchant"] == "Starbucks"


def test_merchants_returns_trend():
    accounts = [{"id": "acc-1"}]
    today = date.today()
    old = (today - timedelta(days=45)).isoformat()
    recent = today.isoformat()
    transactions = [
        {"merchant": "Amazon", "amount": 20.0, "timestamp": old, "category": "shopping"},
        {"merchant": "Amazon", "amount": 80.0, "timestamp": recent, "category": "shopping"},
    ]
    mock_supabase = make_supabase(accounts, transactions)

    with patch("routers.profile.get_supabase", return_value=mock_supabase):
        resp = client.get("/profile/merchants")

    merchants = resp.json()["merchants"]
    assert merchants[0]["trend"] in ("up", "down", "flat")


def test_merchant_detail_returns_heatmap_and_trend():
    accounts = [{"id": "acc-1"}]
    today = date.today().isoformat()
    transactions = [
        {"merchant": "Amazon", "amount": 50.0, "timestamp": today, "category": "shopping"},
        {"merchant": "Amazon", "amount": 30.0, "timestamp": today, "category": "shopping"},
    ]
    mock_supabase = make_supabase(accounts, transactions)

    with patch("routers.profile.get_supabase", return_value=mock_supabase):
        with patch("routers.profile.call_argus_insight", return_value="You spend a lot at Amazon."):
            resp = client.get("/profile/merchants/Amazon")

    assert resp.status_code == 200
    data = resp.json()
    assert "heatmap" in data
    assert "monthly_trend" in data
    assert "insight" in data
    assert data["total_spend"] == 80.0
