from unittest.mock import MagicMock, patch


def test_safe_to_spend_tool_registered():
    from agents.tools import get_registered_tools
    tools = get_registered_tools()
    assert "get_safe_to_spend" in tools


def test_safe_to_spend_tool_returns_amount():
    mock_supabase = MagicMock()
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"safe_amount": 300.0, "breakdown": {}}
    ]
    with patch("agents.tools.get_supabase", return_value=mock_supabase):
        from agents.tools import call_tool
        result = call_tool("get_safe_to_spend", "user-1")
    assert result["safe_amount"] == 300.0
