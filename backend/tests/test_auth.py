import os

from fastapi.testclient import TestClient

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-role-key")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")

from main import app  # noqa: E402

client = TestClient(app)


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_get_me_unauthenticated():
    response = client.get("/api/me")
    assert response.status_code == 401


def test_get_me_invalid_token():
    response = client.get("/api/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert response.status_code == 401


def test_sync_user_unauthenticated():
    response = client.post("/api/users/sync")
    assert response.status_code == 401


def test_sync_user_invalid_token():
    response = client.post("/api/users/sync", headers={"Authorization": "Bearer not-a-real-token"})
    assert response.status_code == 401
