import json
from datetime import date, timedelta

import pytest

from agents.analyst_agent import (
    _aggregate_transactions,
    _build_analyst_brief,
    _parse_synthesis_response,
)


def _make_txn(category: str, amount: float, days_ago: int) -> dict:
    d = (date.today() - timedelta(days=days_ago)).isoformat()
    return {"category": category, "amount": amount, "timestamp": f"{d}T12:00:00"}


def test_aggregate_transactions_last_30():
    txns = [
        _make_txn("FOOD_AND_DRINK", 50.0, 5),
        _make_txn("FOOD_AND_DRINK", 30.0, 10),
        _make_txn("FOOD_AND_DRINK", 20.0, 80),  # outside 90-day window
    ]
    result = _aggregate_transactions(txns)
    assert "FOOD_AND_DRINK" in result
    assert result["FOOD_AND_DRINK"]["last_30_total"] == 80.0


def test_aggregate_transactions_baseline_uses_90_days():
    txns = [_make_txn("SHOPPING", 100.0, i * 10) for i in range(9)]  # 9 charges in 90 days
    result = _aggregate_transactions(txns)
    assert result["SHOPPING"]["monthly_baseline"] == pytest.approx(300.0, rel=0.05)


def test_aggregate_transactions_empty():
    result = _aggregate_transactions([])
    assert result == {}


def test_aggregate_skips_bad_timestamps():
    txns = [
        {"category": "FOOD_AND_DRINK", "amount": 10.0, "timestamp": "bad-date"},
        _make_txn("FOOD_AND_DRINK", 20.0, 5),
    ]
    result = _aggregate_transactions(txns)
    assert result["FOOD_AND_DRINK"]["last_30_total"] == 20.0


def test_build_analyst_brief_includes_all_sections():
    accounts = [{"account_type": "checking", "balance": 1000.0, "credit_limit": None}]
    bills = [
        {
            "merchant": "Rent",
            "avg_amount": 1200.0,
            "next_due_date": "2026-06-01",
            "ai_enrichment": None,
        }
    ]
    subs = [
        {"merchant": "Netflix", "avg_amount": 15.99, "price_change_pct": 0.0, "ai_enrichment": None}
    ]
    tx_summary = {
        "FOOD_AND_DRINK": {"monthly_baseline": 200.0, "last_30_total": 280.0, "change_pct": 40.0}
    }
    brief = _build_analyst_brief(accounts, bills, subs, tx_summary, [], {})
    assert "Rent" in brief
    assert "Netflix" in brief
    assert "FOOD_AND_DRINK" in brief
    assert "decisions" in brief
    assert "updated_profile" in brief


def test_parse_synthesis_response_valid():
    response = json.dumps(
        {
            "decisions": [
                {
                    "signal_type": "behavioral",
                    "severity": "warning",
                    "title": "Dining up 40%",
                    "reasoning": "Three week trend",
                    "recommendation": "Set a limit",
                    "simulation": "Will reach $400 by August",
                    "confidence": 0.85,
                    "sources": ["transactions:FOOD_AND_DRINK"],
                }
            ],
            "updated_profile": {
                "income_pattern": {},
                "spending_baselines": {},
                "behavioral_patterns": [],
                "known_risks": [],
                "analyst_notes": "First session",
                "resolved_patterns": [],
            },
        }
    )
    result = _parse_synthesis_response(response)
    assert len(result["decisions"]) == 1
    assert result["decisions"][0]["title"] == "Dining up 40%"
    assert result["updated_profile"]["analyst_notes"] == "First session"


def test_parse_synthesis_response_invalid_json():
    result = _parse_synthesis_response("garbage")
    assert result == {"decisions": [], "updated_profile": {}}


def test_parse_synthesis_response_strips_markdown():
    inner = json.dumps({"decisions": [], "updated_profile": {}})
    result = _parse_synthesis_response(f"```json\n{inner}\n```")
    assert result["decisions"] == []
