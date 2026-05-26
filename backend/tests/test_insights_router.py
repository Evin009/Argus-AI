from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from main import app
from middleware.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "test-user-id"
client = TestClient(app)

_DECISION = {
    "id": "abc123",
    "insight_type": "analyst_decision",
    "summary": "Dining up 40%",
    "structured_output_json": {
        "signal_type": "behavioral",
        "severity": "warning",
        "title": "Dining up 40%",
        "reasoning": "Three week trend",
        "recommendation": "Set a limit",
        "simulation": "Will reach $400 by August",
        "confidence": 0.85,
        "sources": ["transactions:FOOD_AND_DRINK"],
    },
    "created_at": "2026-05-26T10:00:00+00:00",
}


def _mock_supabase(rows: list[dict]):
    mock = MagicMock()
    chain = mock.table.return_value.select.return_value.eq.return_value.eq.return_value
    chain.order.return_value.limit.return_value.execute.return_value.data = rows
    return mock


def test_get_insights_returns_decisions():
    with patch("routers.insights.get_supabase", return_value=_mock_supabase([_DECISION])):
        resp = client.get("/insights")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["summary"] == "Dining up 40%"


def test_get_insights_default_limit_20():
    rows = [_DECISION] * 25
    with patch("routers.insights.get_supabase", return_value=_mock_supabase(rows)):
        resp = client.get("/insights")
    assert resp.status_code == 200


def test_get_insights_limit_capped_at_50():
    resp = client.get("/insights?limit=100")
    assert resp.status_code == 422


def test_get_insights_signal_type_filter():
    risk_decision = {
        **_DECISION,
        "structured_output_json": {
            **_DECISION["structured_output_json"],
            "signal_type": "risk",
        },
    }
    rows = [_DECISION, risk_decision]
    with patch("routers.insights.get_supabase", return_value=_mock_supabase(rows)):
        resp = client.get("/insights?signal_type=behavioral")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["structured_output_json"]["signal_type"] == "behavioral"


def test_get_insights_empty():
    with patch("routers.insights.get_supabase", return_value=_mock_supabase([])):
        resp = client.get("/insights")
    assert resp.status_code == 200
    assert resp.json() == []


def test_get_insights_no_signal_type_returns_all():
    risk_decision = {
        **_DECISION,
        "structured_output_json": {
            **_DECISION["structured_output_json"],
            "signal_type": "risk",
        },
    }
    rows = [_DECISION, risk_decision]
    with patch("routers.insights.get_supabase", return_value=_mock_supabase(rows)):
        resp = client.get("/insights")
    assert resp.status_code == 200
    assert len(resp.json()) == 2
