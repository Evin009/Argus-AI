import json

from agents.enrichment_agent import (
    _build_enrichment_prompt,
    _parse_enrichment_response,
)


def test_build_prompt_includes_bill_merchant():
    bills = [
        {
            "id": "b1",
            "merchant": "Netflix",
            "avg_amount": 15.99,
            "recurrence_pattern": "monthly",
            "next_due_date": "2026-06-01",
        }
    ]
    prompt = _build_enrichment_prompt(bills, [])
    assert "Netflix" in prompt
    assert "b1" in prompt


def test_build_prompt_includes_subscription_merchant():
    subs = [
        {
            "id": "s1",
            "merchant": "Spotify",
            "avg_amount": 9.99,
            "price_change_pct": 5.0,
            "billing_cycle": "monthly",
        }
    ]
    prompt = _build_enrichment_prompt([], subs)
    assert "Spotify" in prompt
    assert "s1" in prompt


def test_build_prompt_handles_empty_lists():
    prompt = _build_enrichment_prompt([], [])
    assert "bills" in prompt.lower()
    assert "subscriptions" in prompt.lower()


def test_parse_valid_response():
    response = json.dumps(
        {
            "bills": [
                {
                    "id": "b1",
                    "enrichment": {
                        "ai_confidence": 0.9,
                        "merchant_context": "video streaming",
                        "classification_note": "monthly charges stable within $0.01",
                        "is_subscription_candidate": True,
                    },
                }
            ],
            "subscriptions": [
                {
                    "id": "s1",
                    "enrichment": {
                        "service_category": "streaming",
                        "duplicate_flag": False,
                        "duplicate_note": None,
                        "price_trend_interpretation": "stable",
                        "cancel_recommendation": False,
                        "cancel_reasoning": None,
                    },
                }
            ],
        }
    )
    result = _parse_enrichment_response(response)
    assert len(result["bills"]) == 1
    assert result["bills"][0]["id"] == "b1"
    assert result["bills"][0]["enrichment"]["ai_confidence"] == 0.9
    assert len(result["subscriptions"]) == 1
    assert result["subscriptions"][0]["id"] == "s1"


def test_parse_invalid_json_returns_empty():
    result = _parse_enrichment_response("not valid json at all")
    assert result == {"bills": [], "subscriptions": []}


def test_parse_non_dict_returns_empty():
    result = _parse_enrichment_response(json.dumps([1, 2, 3]))
    assert result == {"bills": [], "subscriptions": []}


def test_parse_missing_keys_defaults_to_empty_lists():
    result = _parse_enrichment_response(json.dumps({"bills": []}))
    assert result["subscriptions"] == []
    assert result["bills"] == []


def test_parse_strips_markdown_fences():
    response = '```json\n{"bills": [], "subscriptions": []}\n```'
    result = _parse_enrichment_response(response)
    assert result == {"bills": [], "subscriptions": []}
