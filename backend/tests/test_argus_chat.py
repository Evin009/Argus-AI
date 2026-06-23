import os
from unittest.mock import MagicMock, patch

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-role-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("OPENAI_API_KEY", "sk-placeholder")
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-ant-placeholder")
os.environ.setdefault("PLAID_CLIENT_ID", "placeholder")
os.environ.setdefault("PLAID_SECRET", "placeholder")
os.environ.setdefault("PLAID_ENV", "sandbox")
os.environ.setdefault("PLAID_TOKEN_ENCRYPTION_KEY", "a" * 64)

from agents.chat import (  # noqa: E402
    _extract_card_blocks,
    _extract_prediction_block,
    _log_prediction,
    _retrieve_chat_context,
    _strip_card_blocks,
    _strip_prediction_block,
)

_VALID_BLOCK = (
    "You'll overdraft on the 27th.\n\n"
    "```prediction\n"
    '{"prediction_type": "balance_below_threshold", '
    '"payload": {"account_id": "acct-1", "threshold": 0}, '
    '"resolves_at": "2026-06-27T00:00:00Z"}\n'
    "```"
)


def test_extract_prediction_block_parses_valid_block():
    result = _extract_prediction_block(_VALID_BLOCK)
    assert result["prediction_type"] == "balance_below_threshold"
    assert result["payload"]["threshold"] == 0
    assert result["resolves_at"] == "2026-06-27T00:00:00Z"


def test_extract_prediction_block_returns_none_when_absent():
    assert _extract_prediction_block("Just a plain answer, no prediction here.") is None


def test_extract_prediction_block_returns_none_when_malformed_json():
    text = "```prediction\nnot json\n```"
    assert _extract_prediction_block(text) is None


def test_extract_prediction_block_returns_none_when_missing_fields():
    text = '```prediction\n{"prediction_type": "x"}\n```'
    assert _extract_prediction_block(text) is None


def test_strip_prediction_block_removes_block_keeps_answer():
    result = _strip_prediction_block(_VALID_BLOCK)
    assert "```prediction" not in result
    assert result.startswith("You'll overdraft on the 27th.")


def test_strip_prediction_block_no_op_when_no_block():
    text = "Plain answer."
    assert _strip_prediction_block(text) == text


def test_log_prediction_inserts_row():
    mock_supabase = MagicMock()
    prediction = {
        "prediction_type": "balance_below_threshold",
        "payload": {"account_id": "acct-1", "threshold": 0},
        "resolves_at": "2026-06-27T00:00:00Z",
    }

    with patch("agents.chat.get_supabase", return_value=mock_supabase):
        _log_prediction("user-123", prediction)

    inserted = mock_supabase.table.return_value.insert.call_args[0][0]
    assert inserted["user_id"] == "user-123"
    assert inserted["prediction_type"] == "balance_below_threshold"
    assert inserted["prediction_payload"] == prediction["payload"]
    assert inserted["resolves_at"] == "2026-06-27T00:00:00Z"


def test_retrieve_chat_context_combines_sources():
    mock_supervisor_result = {"tool_results": {"bills": []}}
    mock_supabase = MagicMock()
    profile_chain = mock_supabase.table.return_value.select.return_value.eq.return_value
    profile_chain.execute.return_value.data = [{"profile": {"income": 5000}}]

    predictions_chain = (
        mock_supabase.table.return_value.select.return_value.eq.return_value
        .order.return_value.limit.return_value
    )
    predictions_chain.execute.return_value.data = [
        {"prediction_type": "balance_below_threshold", "was_accurate": True},
        {"prediction_type": "balance_below_threshold", "was_accurate": None},
    ]

    with patch("agents.chat.supervisor_graph") as mock_graph, \
         patch("agents.chat.get_supabase", return_value=mock_supabase), \
         patch("agents.chat._retrieve_relevant_insights", return_value=[{"summary": "x"}]):
        mock_graph.invoke.return_value = mock_supervisor_result
        result = _retrieve_chat_context("user-123", "what bills do I have")

    assert result["tool_results"] == {"bills": []}
    assert result["distilled_insights"] == [{"summary": "x"}]
    assert len(result["past_predictions"]) == 1
    assert result["past_predictions"][0]["was_accurate"] is True


_VERDICT_CARD = (
    "```argus-card\n"
    '{"type": "verdict", "data": {"label": "Safe to spend", "value": "$214",'
    ' "detail": "After Netflix $15.99 due Jul 1"}}\n'
    "```"
)
_TABLE_CARD = (
    "```argus-card\n"
    '{"type": "table", "data": {"title": "Bills", "columns": ["Merchant", "Amount"],'
    ' "rows": [["Netflix", "$15.99"]]}}\n'
    "```"
)


def test_extract_card_blocks_parses_single_card():
    result = _extract_card_blocks(_VERDICT_CARD)
    assert len(result) == 1
    assert result[0]["type"] == "verdict"
    assert result[0]["data"]["value"] == "$214"


def test_extract_card_blocks_parses_multiple_cards():
    text = f"{_VERDICT_CARD}\n\n{_TABLE_CARD}"
    result = _extract_card_blocks(text)
    assert [c["type"] for c in result] == ["verdict", "table"]


def test_extract_card_blocks_skips_unknown_type():
    text = '```argus-card\n{"type": "paragraph", "data": {}}\n```'
    assert _extract_card_blocks(text) == []


def test_extract_card_blocks_skips_malformed_json():
    text = "```argus-card\nnot json\n```"
    assert _extract_card_blocks(text) == []


def test_extract_card_blocks_skips_missing_data():
    text = '```argus-card\n{"type": "verdict"}\n```'
    assert _extract_card_blocks(text) == []


def test_extract_card_blocks_returns_empty_when_no_blocks():
    assert _extract_card_blocks("plain text") == []


def test_strip_card_blocks_removes_cards():
    result = _strip_card_blocks(_VERDICT_CARD)
    assert "argus-card" not in result
    assert result == ""


def test_strip_card_blocks_no_op_when_no_cards():
    assert _strip_card_blocks("plain text") == "plain text"
