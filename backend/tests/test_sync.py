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

from tasks.sync_transactions import _extract_category, _extract_subcategory, _normalize_transaction  # noqa: E402


def test_normalize_uses_merchant_name():
    plaid_txn = {
        "transaction_id": "txn_123",
        "merchant_name": "Starbucks",
        "name": "STARBUCKS #1234",
        "amount": 5.75,
        "date": "2024-03-15",
        "category": ["Food and Drink", "Coffee Shop"],
    }
    result = _normalize_transaction(plaid_txn, "acct_abc")
    assert result["merchant"] == "Starbucks"
    assert result["amount"] == 5.75
    assert result["account_id"] == "acct_abc"
    assert result["plaid_transaction_id"] == "txn_123"
    assert result["is_recurring"] is False


def test_normalize_falls_back_to_name_when_no_merchant():
    plaid_txn = {
        "transaction_id": "txn_456",
        "merchant_name": None,
        "name": "AMAZON.COM",
        "amount": 29.99,
        "date": "2024-03-16",
        "category": ["Shops"],
    }
    result = _normalize_transaction(plaid_txn, "acct_abc")
    assert result["merchant"] == "AMAZON.COM"


def test_normalize_falls_back_to_unknown_when_no_name():
    plaid_txn = {
        "transaction_id": "txn_789",
        "merchant_name": None,
        "name": None,
        "amount": 10.00,
        "date": "2024-03-17",
        "category": [],
    }
    result = _normalize_transaction(plaid_txn, "acct_abc")
    assert result["merchant"] == "Unknown"


def test_extract_category_prefers_personal_finance():
    plaid_txn = {
        "personal_finance_category": {"primary": "FOOD_AND_DRINK", "detailed": "COFFEE_SHOP"},
        "category": ["Food and Drink", "Coffee Shop"],
    }
    assert _extract_category(plaid_txn) == "FOOD_AND_DRINK"


def test_extract_category_falls_back_to_legacy():
    plaid_txn = {
        "personal_finance_category": None,
        "category": ["Food and Drink", "Coffee Shop"],
    }
    assert _extract_category(plaid_txn) == "Food and Drink"


def test_extract_category_returns_other_when_empty():
    plaid_txn = {"personal_finance_category": None, "category": []}
    assert _extract_category(plaid_txn) == "OTHER"


def test_extract_subcategory():
    plaid_txn = {
        "personal_finance_category": {"primary": "FOOD_AND_DRINK", "detailed": "COFFEE_SHOP"},
        "category": [],
    }
    assert _extract_subcategory(plaid_txn) == "COFFEE_SHOP"
