import os

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-role-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("OPENAI_API_KEY", "sk-placeholder")
os.environ.setdefault("PLAID_CLIENT_ID", "placeholder")
os.environ.setdefault("PLAID_SECRET", "placeholder")
os.environ.setdefault("PLAID_ENV", "sandbox")
os.environ.setdefault("PLAID_TOKEN_ENCRYPTION_KEY", "a" * 64)

from tasks.resolve_predictions import _evaluate_prediction  # noqa: E402


def test_balance_below_threshold_accurate_when_actual_is_lower():
    payload = {"account_id": "acct-1", "threshold": 0}
    result = _evaluate_prediction("balance_below_threshold", payload, actual_balance=-12.50)
    assert result is True


def test_balance_below_threshold_inaccurate_when_actual_is_higher():
    payload = {"account_id": "acct-1", "threshold": 0}
    result = _evaluate_prediction("balance_below_threshold", payload, actual_balance=45.00)
    assert result is False


def test_balance_below_threshold_boundary_is_not_below():
    payload = {"account_id": "acct-1", "threshold": 100}
    result = _evaluate_prediction("balance_below_threshold", payload, actual_balance=100)
    assert result is False


def test_unknown_prediction_type_returns_none():
    result = _evaluate_prediction("unknown_type", {}, actual_balance=10)
    assert result is None


def test_missing_actual_balance_returns_none():
    payload = {"account_id": "acct-1", "threshold": 0}
    result = _evaluate_prediction("balance_below_threshold", payload, actual_balance=None)
    assert result is None
