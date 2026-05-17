# backend/tests/test_categorization.py
import os

os.environ.setdefault("JWT_SECRET", "test-secret-key-for-unit-tests-only")
os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-role-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("OPENAI_API_KEY", "sk-placeholder")
os.environ.setdefault("PLAID_CLIENT_ID", "placeholder")
os.environ.setdefault("PLAID_SECRET", "placeholder")
os.environ.setdefault("PLAID_ENV", "sandbox")
os.environ.setdefault("PLAID_TOKEN_ENCRYPTION_KEY", "a" * 64)
os.environ.setdefault("ANTHROPIC_API_KEY", "sk-ant-placeholder")

from tasks.categorize_transactions import (  # noqa: E402
    _build_categorization_prompt,
    _filter_uncategorized,
    _parse_categorization_response,
)


def test_filter_uncategorized_returns_only_other():
    transactions = [
        {"id": "1", "merchant": "Netflix", "category": "SUBSCRIPTION"},
        {"id": "2", "merchant": "Unknown Shop", "category": "OTHER"},
        {"id": "3", "merchant": "Gas Station", "category": "OTHER"},
    ]
    result = _filter_uncategorized(transactions)
    assert len(result) == 2
    assert all(t["category"] == "OTHER" for t in result)


def test_filter_uncategorized_returns_empty_when_none():
    transactions = [
        {"id": "1", "merchant": "Netflix", "category": "SUBSCRIPTION"},
    ]
    result = _filter_uncategorized(transactions)
    assert result == []


def test_filter_uncategorized_empty_list():
    assert _filter_uncategorized([]) == []


def test_build_categorization_prompt_contains_merchant():
    transactions = [
        {"id": "abc-123", "merchant": "McDonald's", "amount": 8.50},
    ]
    prompt = _build_categorization_prompt(transactions)
    assert "McDonald's" in prompt
    assert "abc-123" in prompt


def test_build_categorization_prompt_contains_amount():
    transactions = [
        {"id": "abc-123", "merchant": "Starbucks", "amount": 5.75},
    ]
    prompt = _build_categorization_prompt(transactions)
    assert "5.75" in prompt


def test_build_categorization_prompt_contains_all_transactions():
    transactions = [
        {"id": "id-1", "merchant": "Uber", "amount": 12.00},
        {"id": "id-2", "merchant": "Whole Foods", "amount": 87.50},
    ]
    prompt = _build_categorization_prompt(transactions)
    assert "id-1" in prompt
    assert "id-2" in prompt
    assert "Uber" in prompt
    assert "Whole Foods" in prompt


def test_parse_categorization_response_valid_json():
    response = '[{"id": "abc-123", "category": "FOOD_AND_DRINK", "subcategory": "restaurants"}]'
    result = _parse_categorization_response(response)
    assert len(result) == 1
    assert result[0]["id"] == "abc-123"
    assert result[0]["category"] == "FOOD_AND_DRINK"
    assert result[0]["subcategory"] == "restaurants"


def test_parse_categorization_response_multiple_items():
    response = (
        '[{"id": "1", "category": "TRANSPORTATION", "subcategory": "rideshare"}, '
        '{"id": "2", "category": "FOOD_AND_DRINK", "subcategory": "coffee"}]'
    )
    result = _parse_categorization_response(response)
    assert len(result) == 2


def test_parse_categorization_response_malformed_json_returns_empty():
    assert _parse_categorization_response("not json at all") == []
    assert _parse_categorization_response("") == []
    assert _parse_categorization_response("{bad}") == []


def test_parse_categorization_response_non_list_returns_empty():
    assert _parse_categorization_response('{"id": "1", "category": "OTHER"}') == []


def test_parse_categorization_response_strips_markdown_fences():
    response = '```json\n[{"id": "1", "category": "SHOPPING", "subcategory": "retail"}]\n```'
    result = _parse_categorization_response(response)
    assert len(result) == 1
    assert result[0]["category"] == "SHOPPING"
