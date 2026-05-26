from unittest.mock import MagicMock, patch

from tasks.run_intelligence_pipeline import (
    _build_rag_query_text,
    _retrieve_relevant_insights,
)


def test_build_rag_query_text_includes_merchants():
    accounts = [{"account_type": "checking", "balance": 1200}]
    bills = [{"merchant": "Rent"}, {"merchant": "Electric"}]
    subs = [{"merchant": "Netflix"}, {"merchant": "Spotify"}]
    text = _build_rag_query_text(accounts, bills, subs)
    assert "Rent" in text
    assert "Netflix" in text
    assert "checking" in text


def test_build_rag_query_text_handles_empty():
    text = _build_rag_query_text([], [], [])
    assert isinstance(text, str)


def test_retrieve_relevant_insights_returns_results():
    mock_openai = MagicMock()
    mock_openai.embeddings.create.return_value = MagicMock(
        data=[MagicMock(embedding=[0.1] * 1536)]
    )
    mock_supabase = MagicMock()
    mock_supabase.rpc.return_value.execute.return_value.data = [
        {"id": "ins1", "summary": "Past insight", "similarity": 0.85}
    ]

    with patch("tasks.run_intelligence_pipeline.OpenAI", return_value=mock_openai), \
         patch("tasks.run_intelligence_pipeline.get_supabase", return_value=mock_supabase):
        result = _retrieve_relevant_insights("user-1", "test query")

    assert len(result) == 1
    assert result[0]["summary"] == "Past insight"


def test_retrieve_relevant_insights_returns_empty_on_error():
    mock_openai = MagicMock()
    mock_openai.embeddings.create.side_effect = Exception("OpenAI down")

    with patch("tasks.run_intelligence_pipeline.OpenAI", return_value=mock_openai):
        result = _retrieve_relevant_insights("user-1", "test query")

    assert result == []


def test_pipeline_task_returns_decisions_written():
    mock_supabase = MagicMock()
    mock_supabase.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.execute.return_value.data = []
    mock_supabase.table.return_value.select.return_value.eq.return_value.in_.return_value.order.return_value.limit.return_value.execute.return_value.data = []

    mock_graph = MagicMock()
    mock_graph.invoke.return_value = {
        "user_id": "user-1",
        "accounts": [],
        "bills": [],
        "subscriptions": [],
        "tx_summary": {},
        "relevant_past_insights": [],
        "profile": {},
        "enrichment_result": {},
        "decisions": [{"title": "d1"}, {"title": "d2"}],
        "updated_profile": {},
    }

    mock_openai = MagicMock()
    mock_openai.embeddings.create.side_effect = Exception("skip RAG")

    with patch("tasks.run_intelligence_pipeline.get_supabase", return_value=mock_supabase), \
         patch("tasks.run_intelligence_pipeline.intelligence_graph", mock_graph), \
         patch("tasks.run_intelligence_pipeline.OpenAI", return_value=mock_openai):
        from tasks.run_intelligence_pipeline import run_intelligence_pipeline_for_user
        result = run_intelligence_pipeline_for_user("user-1")

    assert result["decisions_written"] == 2
    assert result["user_id"] == "user-1"
