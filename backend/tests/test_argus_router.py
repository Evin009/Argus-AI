from contextlib import contextmanager
from unittest.mock import MagicMock, patch

from fastapi.testclient import TestClient

from main import app
from middleware.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "test-user-id"
client = TestClient(app)


@contextmanager
def _fake_stream(chunks: list[str]):
    mock_stream = MagicMock()
    mock_stream.text_stream = iter(chunks)
    yield mock_stream


def test_chat_streams_sse_response():
    mock_anthropic_client = MagicMock()
    mock_anthropic_client.messages.stream.side_effect = lambda **_: _fake_stream(
        ["You'll ", "overdraft on the 27th."]
    )

    with patch("routers.argus._retrieve_chat_context", return_value={
        "tool_results": {}, "profile": {}, "past_predictions": [], "distilled_insights": [],
    }), patch("routers.argus._build_chat_brief", return_value="brief"), \
         patch("routers.argus.anthropic.Anthropic", return_value=mock_anthropic_client), \
         patch("routers.argus._extract_prediction_block", return_value=None):
        resp = client.post("/argus/chat", json={"query": "when will I overdraft"})

    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/event-stream")
    assert "You'll " in resp.text
    assert "overdraft on the 27th." in resp.text


def test_chat_returns_cards_in_done_payload():
    mock_anthropic_client = MagicMock()
    mock_anthropic_client.messages.stream.side_effect = lambda **_: _fake_stream(["text"])
    cards = [{"type": "verdict", "data": {"label": "Safe to spend", "value": "$214"}}]

    with patch("routers.argus._retrieve_chat_context", return_value={
        "tool_results": {}, "profile": {}, "past_predictions": [], "distilled_insights": [],
    }), patch("routers.argus._build_chat_brief", return_value="brief"), \
         patch("routers.argus.anthropic.Anthropic", return_value=mock_anthropic_client), \
         patch("routers.argus._extract_prediction_block", return_value=None), \
         patch("routers.argus._extract_card_blocks", return_value=cards):
        resp = client.post("/argus/chat", json={"query": "can I afford this"})

    assert resp.status_code == 200
    assert '"cards": [{"type": "verdict"' in resp.text


def test_chat_logs_prediction_when_present():
    mock_anthropic_client = MagicMock()
    mock_anthropic_client.messages.stream.side_effect = lambda **_: _fake_stream(["answer"])
    prediction = {
        "prediction_type": "balance_below_threshold",
        "payload": {"account_id": "acct-1", "threshold": 0},
        "resolves_at": "2026-06-27T00:00:00Z",
    }

    with patch("routers.argus._retrieve_chat_context", return_value={
        "tool_results": {}, "profile": {}, "past_predictions": [], "distilled_insights": [],
    }), patch("routers.argus._build_chat_brief", return_value="brief"), \
         patch("routers.argus.anthropic.Anthropic", return_value=mock_anthropic_client), \
         patch("routers.argus._extract_prediction_block", return_value=prediction), \
         patch("routers.argus._log_prediction") as mock_log:
        resp = client.post("/argus/chat", json={"query": "when will I overdraft"})

    assert resp.status_code == 200
    mock_log.assert_called_once_with("test-user-id", prediction)


def test_chat_passes_page_to_brief():
    mock_anthropic_client = MagicMock()
    mock_anthropic_client.messages.stream.side_effect = lambda **_: _fake_stream(["text"])

    with patch("routers.argus._retrieve_chat_context", return_value={
        "tool_results": {}, "profile": {}, "past_predictions": [], "distilled_insights": [],
    }), patch("routers.argus._build_chat_brief", return_value="brief") as mock_brief, \
         patch("routers.argus.anthropic.Anthropic", return_value=mock_anthropic_client), \
         patch("routers.argus._extract_prediction_block", return_value=None):
        resp = client.post(
            "/argus/chat", json={"query": "what bills do I have", "page": "/bills"}
        )

    assert resp.status_code == 200
    _, kwargs = mock_brief.call_args
    assert kwargs["page"] == "/bills"


def test_chat_requires_auth():
    app.dependency_overrides.pop(get_current_user, None)
    resp = client.post("/argus/chat", json={"query": "hi"})
    assert resp.status_code == 401
    app.dependency_overrides[get_current_user] = lambda: "test-user-id"
