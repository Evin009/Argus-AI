from unittest.mock import MagicMock, patch


def test_get_profile_overview_tool_registered():
    from agents.tools import get_registered_tools

    tools = get_registered_tools()
    assert "get_profile_overview" in tools


def test_get_merchant_history_tool_registered():
    from agents.tools import get_registered_tools

    tools = get_registered_tools()
    assert "get_merchant_history" in tools


def test_get_profile_overview_tool_returns_categories():
    mock_supabase = MagicMock()

    def table_side(name):
        m = MagicMock()
        if name == "accounts":
            m.select.return_value.eq.return_value.execute.return_value.data = [
                {"id": "acc-1", "balance": 500.0, "credit_limit": None, "account_type": "checking"}
            ]
        elif name == "transactions":
            chain = m.select.return_value.in_.return_value.order.return_value.limit.return_value
            chain.execute.return_value.data = [
                {
                    "merchant": "Starbucks",
                    "amount": 10.0,
                    "category": "food",
                    "timestamp": "2026-06-01T00:00:00Z",
                }
            ]
        elif name == "subscriptions":
            m.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
        return m

    mock_supabase.table.side_effect = table_side

    with patch("agents.tools.get_supabase", return_value=mock_supabase):
        from agents.tools import call_tool

        result = call_tool("get_profile_overview", "test-user-id")

    assert "spending_by_category" in result


def test_get_merchant_history_tool_returns_detail():
    mock_supabase = MagicMock()

    def table_side(name):
        m = MagicMock()
        if name == "accounts":
            m.select.return_value.eq.return_value.execute.return_value.data = [{"id": "acc-1"}]
        elif name == "transactions":
            chain = m.select.return_value.in_.return_value.order.return_value.limit.return_value
            chain.execute.return_value.data = [
                {
                    "merchant": "Amazon",
                    "amount": 50.0,
                    "category": "shopping",
                    "timestamp": "2026-06-01T00:00:00Z",
                }
            ]
        return m

    mock_supabase.table.side_effect = table_side

    with patch("agents.tools.get_supabase", return_value=mock_supabase):
        from agents.tools import call_tool

        result = call_tool("get_merchant_history", "test-user-id", merchant="Amazon")

    assert result["merchant"] == "Amazon"
    assert result["total_spend"] == 50.0
