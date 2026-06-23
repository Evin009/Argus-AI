from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from main import app
from middleware.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "user-1"
client = TestClient(app)


def test_pay_timing_returns_recommendations():
    mock_supabase = MagicMock()

    def table_side(name):
        m = MagicMock()
        if name == "accounts":
            m.select.return_value.eq.return_value.execute.return_value.data = [
                {"id": "card-1", "account_type": "credit", "balance": 500.0, "credit_limit": 1000.0, "closing_date": None}
            ]
        elif name == "bills":
            m.select.return_value.eq.return_value.execute.return_value.data = []
        return m

    mock_supabase.table.side_effect = table_side

    with patch("routers.pay_timing.get_supabase", return_value=mock_supabase):
        resp = client.get("/insights/pay-timing")

    assert resp.status_code == 200
    data = resp.json()
    assert "card_recommendations" in data
    assert "stacked_windows" in data
    assert data["card_recommendations"][0]["pay_amount"] == round(500.0 - 1000.0 * 0.08, 2)


def test_pay_timing_empty_when_no_accounts():
    mock_supabase = MagicMock()

    def table_side(name):
        m = MagicMock()
        m.select.return_value.eq.return_value.execute.return_value.data = []
        return m

    mock_supabase.table.side_effect = table_side

    with patch("routers.pay_timing.get_supabase", return_value=mock_supabase):
        resp = client.get("/insights/pay-timing")

    assert resp.status_code == 200
    assert resp.json()["card_recommendations"] == []
