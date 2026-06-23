import os
from unittest.mock import patch

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-role-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("OPENAI_API_KEY", "sk-placeholder")
os.environ.setdefault("PLAID_CLIENT_ID", "placeholder")
os.environ.setdefault("PLAID_SECRET", "placeholder")
os.environ.setdefault("PLAID_ENV", "sandbox")
os.environ.setdefault("PLAID_TOKEN_ENCRYPTION_KEY", "a" * 64)

from agents.supervisor import _select_tools_for_query, route_and_execute_node  # noqa: E402

_FAKE_TOOLS = {
    "get_bills": {"keywords": ["bill", "bills"]},
    "get_subscriptions": {"keywords": ["subscription", "sub"]},
    "get_spending_by_category": {"keywords": ["spend", "category"]},
}


def test_select_tools_matches_bills_keyword():
    assert _select_tools_for_query("when is my next bill due", _FAKE_TOOLS) == ["get_bills"]


def test_select_tools_matches_subscriptions_keyword():
    result = _select_tools_for_query("cancel this subscription", _FAKE_TOOLS)
    assert result == ["get_subscriptions"]


def test_select_tools_matches_multiple_tools():
    result = _select_tools_for_query("how much did I spend on subscriptions", _FAKE_TOOLS)
    assert set(result) == {"get_subscriptions", "get_spending_by_category"}


def test_select_tools_falls_back_to_all_when_no_match():
    result = _select_tools_for_query("what should I do today", _FAKE_TOOLS)
    assert set(result) == set(_FAKE_TOOLS.keys())


def test_route_and_execute_node_calls_selected_tools():
    state = {"user_id": "user-123", "query": "what bills do I have"}

    with (
        patch("agents.supervisor.get_registered_tools", return_value=_FAKE_TOOLS),
        patch("agents.supervisor.call_tool", return_value={"bills": []}) as mock_call,
    ):
        result = route_and_execute_node(state)

    mock_call.assert_called_once_with("get_bills", "user-123")
    assert result["selected_tools"] == ["get_bills"]
    assert result["tool_results"] == {"bills": []}
