import os

from fastapi.testclient import TestClient

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-role-key")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("PLAID_CLIENT_ID", "placeholder-client-id")
os.environ.setdefault("PLAID_SECRET", "placeholder-secret")
os.environ.setdefault("PLAID_ENV", "sandbox")
os.environ.setdefault("PLAID_TOKEN_ENCRYPTION_KEY", "a" * 64)

from main import app  # noqa: E402

client = TestClient(app)


def test_link_token_requires_auth():
    response = client.post("/plaid/link-token")
    assert response.status_code == 401


def test_exchange_token_requires_auth():
    response = client.post(
        "/plaid/exchange-token",
        json={
            "public_token": "public-sandbox-fake",
            "institution_id": "ins_1",
            "institution_name": "Chase",
        },
    )
    assert response.status_code == 401


def test_get_accounts_requires_auth():
    response = client.get("/plaid/accounts")
    assert response.status_code == 401
