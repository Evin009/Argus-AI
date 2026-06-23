from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from main import app
from middleware.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "user-1"
client = TestClient(app)


def test_get_safe_to_spend_returns_cached_value():
    mock_supabase = MagicMock()

    def table_side(name):
        m = MagicMock()
        if name == "safe_to_spend_cache":
            m.select.return_value.eq.return_value.execute.return_value.data = [
                {
                    "safe_amount": 450.0,
                    "breakdown": {"balance": 600.0, "bills_due": 100.0, "buffer_reserve": 50.0, "window_days": 14},
                    "computed_at": "2026-06-01T02:00:00Z",
                }
            ]
        return m

    mock_supabase.table.side_effect = table_side

    with patch("routers.insights.get_supabase", return_value=mock_supabase):
        resp = client.get("/insights/safe-to-spend")

    assert resp.status_code == 200
    assert resp.json()["safe_amount"] == 450.0


def test_get_safe_to_spend_live_compute_when_no_cache():
    mock_supabase = MagicMock()

    def table_side(name):
        m = MagicMock()
        if name == "safe_to_spend_cache":
            m.select.return_value.eq.return_value.execute.return_value.data = []
        elif name == "accounts":
            m.select.return_value.eq.return_value.execute.return_value.data = [{"balance": 800.0}]
        elif name == "bills":
            m.select.return_value.eq.return_value.execute.return_value.data = []
        elif name == "onboarding_responses":
            m.select.return_value.eq.return_value.execute.return_value.data = [{"pay_schedule": "biweekly"}]
        return m

    mock_supabase.table.side_effect = table_side

    with patch("routers.insights.get_supabase", return_value=mock_supabase):
        resp = client.get("/insights/safe-to-spend")

    assert resp.status_code == 200
    assert "safe_amount" in resp.json()
