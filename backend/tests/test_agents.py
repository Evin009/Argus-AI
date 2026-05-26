import json
from datetime import date, timedelta
from unittest.mock import MagicMock, patch

import pytest

from agents.analyst_agent import analyst_node, _build_analyst_brief
from agents.enrichment_agent import enrichment_node
from agents.memory_agent import memory_node
from agents.state import IntelligenceState


def _base_state(**overrides) -> IntelligenceState:
    state: IntelligenceState = {
        "user_id": "test-user",
        "accounts": [],
        "bills": [],
        "subscriptions": [],
        "tx_summary": {},
        "relevant_past_insights": [],
        "profile": {},
        "enrichment_result": {},
        "decisions": [],
        "updated_profile": {},
    }
    state.update(overrides)
    return state


# ── enrichment_node ──────────────────────────────────────────────────────────

def test_enrichment_node_empty_input():
    result = enrichment_node(_base_state())
    assert result["enrichment_result"] == {"bills": [], "subscriptions": []}


def test_enrichment_node_merges_enrichment():
    bills = [{"id": "b1", "merchant": "Netflix", "avg_amount": 15.99,
               "recurrence_pattern": "monthly", "next_due_date": "2026-06-01"}]
    subs = [{"id": "s1", "merchant": "Spotify", "avg_amount": 9.99,
              "price_change_pct": 0.0, "billing_cycle": "monthly"}]

    fake_response = json.dumps({
        "bills": [{"id": "b1", "enrichment": {"ai_confidence": 0.9, "merchant_context": "streaming",
                   "classification_note": "monthly", "is_subscription_candidate": True}}],
        "subscriptions": [{"id": "s1", "enrichment": {"service_category": "streaming",
                            "duplicate_flag": False, "duplicate_note": None,
                            "price_trend_interpretation": "stable",
                            "cancel_recommendation": False, "cancel_reasoning": None}}],
    })

    mock_msg = MagicMock()
    mock_msg.content = [MagicMock(text=fake_response)]
    mock_client = MagicMock()
    mock_client.messages.create.return_value = mock_msg

    mock_supabase = MagicMock()
    mock_supabase.table.return_value.update.return_value.eq.return_value.execute.return_value = None

    with patch("agents.enrichment_agent.anthropic.Anthropic", return_value=mock_client), \
         patch("agents.enrichment_agent.get_supabase", return_value=mock_supabase):
        result = enrichment_node(_base_state(bills=bills, subscriptions=subs))

    assert result["bills"][0]["ai_enrichment"]["ai_confidence"] == 0.9
    assert result["subscriptions"][0]["ai_enrichment"]["service_category"] == "streaming"
    assert len(result["enrichment_result"]["bills"]) == 1


def test_enrichment_node_handles_claude_error():
    bills = [{"id": "b1", "merchant": "Netflix", "avg_amount": 15.99,
               "recurrence_pattern": "monthly", "next_due_date": "2026-06-01"}]

    mock_client = MagicMock()
    mock_client.messages.create.side_effect = Exception("API error")

    with patch("agents.enrichment_agent.anthropic.Anthropic", return_value=mock_client):
        result = enrichment_node(_base_state(bills=bills))

    assert result["enrichment_result"] == {"bills": [], "subscriptions": []}


# ── analyst_node ─────────────────────────────────────────────────────────────

def test_analyst_node_returns_decisions():
    fake_response = json.dumps({
        "decisions": [{
            "signal_type": "behavioral",
            "severity": "warning",
            "title": "Dining up 40%",
            "reasoning": "Three week trend",
            "recommendation": "Set a limit",
            "simulation": "Will reach $400 by August",
            "confidence": 0.85,
            "sources": ["transactions:FOOD_AND_DRINK"],
        }],
        "updated_profile": {
            "income_pattern": {},
            "spending_baselines": {},
            "behavioral_patterns": [],
            "known_risks": [],
            "analyst_notes": "First session",
            "resolved_patterns": [],
        },
    })

    mock_msg = MagicMock()
    mock_msg.content = [MagicMock(text=fake_response)]
    mock_client = MagicMock()
    mock_client.messages.create.return_value = mock_msg

    with patch("agents.analyst_agent.anthropic.Anthropic", return_value=mock_client):
        result = analyst_node(_base_state(
            accounts=[{"account_type": "checking", "balance": 1000.0, "credit_limit": None}],
            tx_summary={"FOOD_AND_DRINK": {"monthly_baseline": 200.0, "last_30_total": 280.0, "change_pct": 40.0}},
        ))

    assert len(result["decisions"]) == 1
    assert result["decisions"][0]["title"] == "Dining up 40%"
    assert result["updated_profile"]["analyst_notes"] == "First session"


def test_analyst_node_uses_state_insights_not_db():
    """analyst_node must NOT query DB for past insights — it reads from state."""
    fake_response = json.dumps({"decisions": [], "updated_profile": {}})
    mock_msg = MagicMock()
    mock_msg.content = [MagicMock(text=fake_response)]
    mock_client = MagicMock()
    mock_client.messages.create.return_value = mock_msg

    past = [{"summary": "Old insight", "created_at": "2026-01-01", "similarity": 0.91}]

    with patch("agents.analyst_agent.anthropic.Anthropic", return_value=mock_client):
        analyst_node(_base_state(relevant_past_insights=past))

    call_args = mock_client.messages.create.call_args
    brief = call_args[1]["messages"][0]["content"]
    assert "Old insight" in brief
    assert "0.91" in brief


def test_analyst_node_handles_claude_error():
    mock_client = MagicMock()
    mock_client.messages.create.side_effect = Exception("API error")

    with patch("agents.analyst_agent.anthropic.Anthropic", return_value=mock_client):
        result = analyst_node(_base_state())

    assert result == {"decisions": [], "updated_profile": {}}


# ── memory_node ──────────────────────────────────────────────────────────────

def test_memory_node_inserts_with_embedding():
    decisions = [{"title": "Dining up 40%", "signal_type": "behavioral", "severity": "warning",
                  "reasoning": "r", "recommendation": "rec", "simulation": "sim",
                  "confidence": 0.85, "sources": []}]

    mock_supabase = MagicMock()
    mock_embed = MagicMock()
    mock_embed.data = [MagicMock(embedding=[0.1] * 1536)]
    mock_openai = MagicMock()
    mock_openai.embeddings.create.return_value = mock_embed

    with patch("agents.memory_agent.get_supabase", return_value=mock_supabase), \
         patch("agents.memory_agent.OpenAI", return_value=mock_openai):
        memory_node(_base_state(decisions=decisions))

    insert_call = mock_supabase.table.return_value.insert.call_args
    row = insert_call[0][0]
    assert row["insight_type"] == "analyst_decision"
    assert row["summary"] == "Dining up 40%"
    assert "embedding" in row
    assert len(row["embedding"]) == 1536


def test_memory_node_skips_profile_upsert_when_empty():
    mock_supabase = MagicMock()
    mock_openai = MagicMock()
    mock_openai.embeddings.create.return_value = MagicMock(data=[MagicMock(embedding=[0.1] * 1536)])

    with patch("agents.memory_agent.get_supabase", return_value=mock_supabase), \
         patch("agents.memory_agent.OpenAI", return_value=mock_openai):
        memory_node(_base_state(decisions=[], updated_profile={}))

    mock_supabase.table.return_value.upsert.assert_not_called()


def test_memory_node_handles_embed_failure():
    decisions = [{"title": "Test", "signal_type": "risk", "severity": "info",
                  "reasoning": "r", "recommendation": "rec", "simulation": "sim",
                  "confidence": 0.5, "sources": []}]

    mock_supabase = MagicMock()
    mock_openai = MagicMock()
    mock_openai.embeddings.create.side_effect = Exception("OpenAI down")

    with patch("agents.memory_agent.get_supabase", return_value=mock_supabase), \
         patch("agents.memory_agent.OpenAI", return_value=mock_openai):
        memory_node(_base_state(decisions=decisions))

    insert_call = mock_supabase.table.return_value.insert.call_args
    row = insert_call[0][0]
    assert "embedding" not in row
    assert row["insight_type"] == "analyst_decision"


# ── graph smoke test ─────────────────────────────────────────────────────────

def test_graph_runs_all_three_nodes():
    fake_analyst = json.dumps({
        "decisions": [{"title": "Test decision", "signal_type": "behavioral",
                       "severity": "info", "reasoning": "r", "recommendation": "rec",
                       "simulation": "sim", "confidence": 0.7, "sources": []}],
        "updated_profile": {"income_pattern": {}, "spending_baselines": {},
                             "behavioral_patterns": [], "known_risks": [],
                             "analyst_notes": "test", "resolved_patterns": []},
    })

    mock_msg_analyst = MagicMock()
    mock_msg_analyst.content = [MagicMock(text=fake_analyst)]

    # Use separate clients so enrichment skipping (empty bills/subs) doesn't shift the call counter
    mock_enrich_client = MagicMock()
    mock_analyst_client = MagicMock()
    mock_analyst_client.messages.create.return_value = mock_msg_analyst

    mock_supabase = MagicMock()
    mock_supabase.table.return_value.insert.return_value.execute.return_value = None
    mock_supabase.table.return_value.upsert.return_value.execute.return_value = None

    mock_openai = MagicMock()
    mock_openai.embeddings.create.return_value = MagicMock(data=[MagicMock(embedding=[0.1] * 1536)])

    from agents.graph import intelligence_graph

    with patch("agents.enrichment_agent.anthropic.Anthropic", return_value=mock_enrich_client), \
         patch("agents.analyst_agent.anthropic.Anthropic", return_value=mock_analyst_client), \
         patch("agents.enrichment_agent.get_supabase", return_value=mock_supabase), \
         patch("agents.memory_agent.get_supabase", return_value=mock_supabase), \
         patch("agents.memory_agent.OpenAI", return_value=mock_openai):
        final_state = intelligence_graph.invoke(_base_state())

    assert len(final_state["decisions"]) == 1
    assert final_state["decisions"][0]["title"] == "Test decision"
