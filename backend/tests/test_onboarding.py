from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from main import app
from middleware.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "test-user-id"
client = TestClient(app)


def _mock_supabase(upsert_row: dict):
    mock = MagicMock()
    mock.table.return_value.upsert.return_value.execute.return_value.data = [upsert_row]
    return mock


def test_post_onboarding_upserts_chapter_answers():
    row = {
        "user_id": "test-user-id",
        "income": 5000,
        "pay_schedule": "biweekly",
    }
    with patch("routers.onboarding.get_supabase", return_value=_mock_supabase(row)):
        resp = client.post(
            "/onboarding",
            json={"income": 5000, "pay_schedule": "biweekly"},
        )
    assert resp.status_code == 200
    assert resp.json()["income"] == 5000


def test_post_onboarding_scopes_upsert_to_current_user():
    mock = _mock_supabase({"user_id": "test-user-id"})
    with patch("routers.onboarding.get_supabase", return_value=mock):
        client.post("/onboarding", json={"income": 5000})

    upsert_call_args = mock.table.return_value.upsert.call_args[0][0]
    assert upsert_call_args["user_id"] == "test-user-id"


def _mock_supabase_select(row: dict | None):
    mock = MagicMock()
    chain = mock.table.return_value.select.return_value.eq.return_value
    chain.maybe_single.return_value.execute.return_value.data = row
    return mock


def test_onboarding_status_completed_true():
    row = {"user_id": "test-user-id", "completed_at": "2026-06-21T00:00:00+00:00"}
    with patch("routers.onboarding.get_supabase", return_value=_mock_supabase_select(row)):
        resp = client.get("/onboarding/status")
    assert resp.status_code == 200
    assert resp.json() == {"completed": True}


def test_onboarding_status_not_started():
    with patch("routers.onboarding.get_supabase", return_value=_mock_supabase_select(None)):
        resp = client.get("/onboarding/status")
    assert resp.status_code == 200
    assert resp.json() == {"completed": False}


def test_onboarding_status_started_but_not_completed():
    row = {"user_id": "test-user-id", "completed_at": None}
    with patch("routers.onboarding.get_supabase", return_value=_mock_supabase_select(row)):
        resp = client.get("/onboarding/status")
    assert resp.status_code == 200
    assert resp.json() == {"completed": False}
