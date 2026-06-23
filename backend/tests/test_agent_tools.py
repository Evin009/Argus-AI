import os
from unittest.mock import MagicMock, patch

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-role-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("OPENAI_API_KEY", "sk-placeholder")
os.environ.setdefault("PLAID_CLIENT_ID", "placeholder")
os.environ.setdefault("PLAID_SECRET", "placeholder")
os.environ.setdefault("PLAID_ENV", "sandbox")
os.environ.setdefault("PLAID_TOKEN_ENCRYPTION_KEY", "a" * 64)

from agents.tools import call_tool, get_registered_tools  # noqa: E402


def test_phase_3_5_tools_are_registered():
    tools = get_registered_tools()
    assert {"get_bills", "get_subscriptions", "get_spending_by_category"} <= tools.keys()


def test_registered_tool_has_description_and_keywords():
    tools = get_registered_tools()
    bills_tool = tools["get_bills"]
    assert bills_tool["description"]
    assert "bill" in bills_tool["keywords"]


def test_call_tool_unknown_name_raises():
    try:
        call_tool("not_a_real_tool", "user-123")
        assert False, "expected KeyError"
    except KeyError:
        pass


def test_call_tool_get_bills_queries_supabase():
    mock_supabase = MagicMock()
    mock_query = mock_supabase.table.return_value.select.return_value.eq.return_value
    mock_query.execute.return_value.data = [{"merchant": "Netflix", "avg_amount": 15.99}]

    with patch("agents.tools.get_supabase", return_value=mock_supabase):
        result = call_tool("get_bills", "user-123")

    assert result == {"bills": [{"merchant": "Netflix", "avg_amount": 15.99}]}
