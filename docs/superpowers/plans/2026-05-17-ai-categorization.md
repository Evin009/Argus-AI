# AI Categorization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recategorize transactions tagged as `OTHER` by Plaid using Claude claude-sonnet-4-6 few-shot classification, storing improved `category` and `subcategory` back in the `transactions` table.

**Architecture:** Three pure functions handle prompt construction, response parsing, and filtering — all unit-testable without hitting the API. A Celery task (`recategorize_transactions_for_user`) fetches `OTHER` transactions in batches of 50, calls Claude, and updates the DB. A `POST /transactions/recategorize` endpoint dispatches the task on demand. The `anthropic` SDK is added to `pyproject.toml`.

**Tech Stack:** Python 3.12, FastAPI, Celery + Redis, Supabase (postgrest-py), `anthropic>=0.25.0`, pytest + `unittest.mock`

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/tasks/categorize_transactions.py` | Create | Pure functions + Celery task |
| `backend/routers/transactions.py` | Modify | Add `POST /transactions/recategorize` endpoint |
| `backend/celery_app.py` | Modify | Add `tasks.categorize_transactions` to include list |
| `backend/tests/test_categorization.py` | Create | Unit tests for all three pure functions |
| `backend/pyproject.toml` | Modify | Add `anthropic>=0.25.0` dependency |

---

## Valid Categories

The following 11 categories are the only valid values for `category`:

```
FOOD_AND_DRINK
SHOPPING
TRANSPORTATION
ENTERTAINMENT
UTILITIES
HEALTHCARE
INCOME
TRANSFER
HOUSING
SUBSCRIPTION
OTHER
```

---

## Task 1: Write failing tests for the categorization engine

**Files:**
- Create: `backend/tests/test_categorization.py`

Three pure functions to test:

- `_filter_uncategorized(transactions: list[dict]) -> list[dict]` — returns only transactions where `category == "OTHER"`
- `_build_categorization_prompt(transactions: list[dict]) -> str` — builds a Claude prompt string containing each transaction's `id`, `merchant`, and `amount`
- `_parse_categorization_response(response_text: str) -> list[dict]` — parses a JSON string into a list of `{id, category, subcategory}` dicts; returns `[]` on any parse failure

- [ ] **Step 1: Create the test file**

```python
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
    response = '[{"id": "1", "category": "TRANSPORTATION", "subcategory": "rideshare"}, {"id": "2", "category": "FOOD_AND_DRINK", "subcategory": "coffee"}]'
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
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -m pytest tests/test_categorization.py -v
```

Expected: `ImportError` — `tasks.categorize_transactions` does not exist yet.

- [ ] **Step 3: Commit**

```bash
git add backend/tests/test_categorization.py
git commit -m "test: add failing tests for AI categorization engine (TDD red)"
```

---

## Task 2: Add `anthropic` dependency

**Files:**
- Modify: `backend/pyproject.toml`

- [ ] **Step 1: Add anthropic to dependencies**

In `backend/pyproject.toml`, add `"anthropic>=0.25.0",` to the `dependencies` list so it reads:

```toml
dependencies = [
    "fastapi>=0.115",
    "uvicorn[standard]>=0.32",
    "pydantic>=2.9",
    "supabase>=2.10",
    "python-jose[cryptography]>=3.3",
    "httpx>=0.27",
    "python-dotenv>=1.0",
    "plaid-python>=28.0.0",
    "cryptography>=42.0.0",
    "celery[redis]>=5.3.0",
    "openai>=1.0.0",
    "anthropic>=0.25.0",
]
```

- [ ] **Step 2: Install**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && pip install anthropic
```

Expected: `Successfully installed anthropic-...`

- [ ] **Step 3: Commit**

```bash
git add backend/pyproject.toml
git commit -m "chore: add anthropic SDK dependency"
```

---

## Task 3: Implement the categorization engine

**Files:**
- Create: `backend/tasks/categorize_transactions.py`

- [ ] **Step 1: Create `categorize_transactions.py`**

```python
# backend/tasks/categorize_transactions.py
import json
import os

import anthropic

from celery_app import celery
from db.client import get_supabase

VALID_CATEGORIES = {
    "FOOD_AND_DRINK",
    "SHOPPING",
    "TRANSPORTATION",
    "ENTERTAINMENT",
    "UTILITIES",
    "HEALTHCARE",
    "INCOME",
    "TRANSFER",
    "HOUSING",
    "SUBSCRIPTION",
    "OTHER",
}

_BATCH_SIZE = 50


def _filter_uncategorized(transactions: list[dict]) -> list[dict]:
    return [t for t in transactions if t.get("category") == "OTHER"]


def _build_categorization_prompt(transactions: list[dict]) -> str:
    txn_lines = "\n".join(
        f'- id: {t["id"]}, merchant: {t["merchant"]}, amount: {t["amount"]}'
        for t in transactions
    )
    return f"""You are a financial transaction categorizer.

Classify each transaction into one of these categories:
FOOD_AND_DRINK, SHOPPING, TRANSPORTATION, ENTERTAINMENT, UTILITIES, HEALTHCARE, INCOME, TRANSFER, HOUSING, SUBSCRIPTION, OTHER

Also provide a short subcategory (e.g. "restaurants", "groceries", "rideshare", "streaming", "rent", "paycheck").

Transactions:
{txn_lines}

Return ONLY a valid JSON array with no explanation. Each item must have: "id", "category", "subcategory".
Example: [{{"id": "abc", "category": "FOOD_AND_DRINK", "subcategory": "restaurants"}}]"""


def _parse_categorization_response(response_text: str) -> list[dict]:
    text = response_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return []
    if not isinstance(parsed, list):
        return []
    return parsed


def _categorize_batch(transactions: list[dict]) -> list[dict]:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    prompt = _build_categorization_prompt(transactions)
    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    response_text = message.content[0].text
    return _parse_categorization_response(response_text)


@celery.task(name="tasks.categorize_transactions.recategorize_transactions_for_user")
def recategorize_transactions_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    accts = supabase.table("accounts").select("id").eq("user_id", user_id).execute()
    account_ids = [a["id"] for a in accts.data]

    if not account_ids:
        return {"user_id": user_id, "transactions_updated": 0}

    txn_result = (
        supabase.table("transactions")
        .select("id, merchant, amount, category")
        .in_("account_id", account_ids)
        .eq("category", "OTHER")
        .execute()
    )

    uncategorized = _filter_uncategorized(txn_result.data)
    if not uncategorized:
        return {"user_id": user_id, "transactions_updated": 0}

    updated = 0
    for i in range(0, len(uncategorized), _BATCH_SIZE):
        batch = uncategorized[i : i + _BATCH_SIZE]
        categorized = _categorize_batch(batch)
        for item in categorized:
            txn_id = item.get("id")
            category = item.get("category", "OTHER")
            subcategory = item.get("subcategory", "")
            if not txn_id:
                continue
            if category not in VALID_CATEGORIES:
                category = "OTHER"
            supabase.table("transactions").update(
                {"category": category, "subcategory": subcategory}
            ).eq("id", txn_id).execute()
            updated += 1

    return {"user_id": user_id, "transactions_updated": updated}
```

- [ ] **Step 2: Run tests to confirm all pass**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -m pytest tests/test_categorization.py -v
```

Expected: All 11 tests PASS.

- [ ] **Step 3: Run full suite to confirm no regressions**

```bash
python -m pytest -v
```

Expected: All 50 tests PASS (39 existing + 11 new).

- [ ] **Step 4: Commit**

```bash
git add backend/tasks/categorize_transactions.py
git commit -m "feat: implement AI categorization engine with Claude few-shot classification"
```

---

## Task 4: Register Celery task + add recategorize endpoint

**Files:**
- Modify: `backend/celery_app.py`
- Modify: `backend/routers/transactions.py`

- [ ] **Step 1: Add `tasks.categorize_transactions` to Celery include list**

In `backend/celery_app.py`, change:

```python
    include=["tasks.sync_transactions", "tasks.generate_embeddings", "tasks.detect_bills", "tasks.detect_subscriptions"],
```

To:

```python
    include=[
        "tasks.sync_transactions",
        "tasks.generate_embeddings",
        "tasks.detect_bills",
        "tasks.detect_subscriptions",
        "tasks.categorize_transactions",
    ],
```

- [ ] **Step 2: Add `POST /transactions/recategorize` to the transactions router**

In `backend/routers/transactions.py`, add this endpoint after the existing `get_transactions` function:

```python
@router.post("/recategorize")
async def recategorize_transactions(user_id: str = Depends(get_current_user)):
    from tasks.categorize_transactions import recategorize_transactions_for_user
    task = recategorize_transactions_for_user.delay(user_id)
    return {"status": "categorizing", "task_id": task.id}
```

- [ ] **Step 3: Run full suite to confirm no regressions**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -m pytest -v
```

Expected: All 50 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add backend/celery_app.py backend/routers/transactions.py
git commit -m "feat: register categorize_transactions task and add POST /transactions/recategorize"
```

---

## Task 5: End-to-end verification

- [ ] **Step 1: Check how many OTHER transactions exist**

Query via Supabase MCP:
```sql
SELECT COUNT(*) FROM public.transactions WHERE category = 'OTHER';
```

Expected: some number > 0 (Plaid sandbox data typically has several).

- [ ] **Step 2: Run the task directly**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -c "
from dotenv import load_dotenv
load_dotenv()
from tasks.categorize_transactions import recategorize_transactions_for_user
from db.client import get_supabase

supabase = get_supabase()
user_id = supabase.table('users').select('id').execute().data[0]['id']
result = recategorize_transactions_for_user(user_id)
print(result)
"
```

Expected: `{'user_id': '...', 'transactions_updated': N}` where N > 0.

- [ ] **Step 3: Verify categories improved in Supabase**

Query via Supabase MCP:
```sql
SELECT category, COUNT(*) as count
FROM public.transactions
GROUP BY category
ORDER BY count DESC;
```

Expected: `OTHER` count has decreased, new specific categories have counts > 0.

- [ ] **Step 4: Verify endpoint requires auth**

```bash
curl -X POST http://localhost:8000/transactions/recategorize
```

Expected: `{"detail":"Not authenticated"}`

---

## Task 6: Merge feature branch

- [ ] **Step 1: Run full test suite one final time**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -m pytest -v
```

Expected: All 50 tests PASS.

- [ ] **Step 2: Merge to phase branch**

```bash
git checkout phase/3-intelligence-layer
git merge feature/ai-categorization --no-ff -m "feat: AI categorization — Claude few-shot classification for transactions"
git push origin phase/3-intelligence-layer
```

---

## Self-Review

**Spec coverage:**
- ✅ `recategorize_transactions_for_user` Celery task — Task 3
- ✅ Pull `OTHER` transactions — Task 3 (`_filter_uncategorized` + Supabase query)
- ✅ Few-shot prompt with merchant + amount — Task 3 (`_build_categorization_prompt`)
- ✅ Call Claude claude-sonnet-4-6 with structured output — Task 3 (`_categorize_batch`)
- ✅ Pydantic-style validation — Task 3 (`VALID_CATEGORIES` guard before update)
- ✅ Update `transactions.category` and `transactions.subcategory` — Task 3 (Celery task body)
- ✅ `POST /transactions/recategorize` endpoint — Task 4
- ✅ Register in Celery include list — Task 4
- ✅ Unit tests for pure functions — Task 1
- ✅ `anthropic` dependency — Task 2

**Placeholder scan:** None found. All steps contain complete code.

**Type consistency:**
- `_filter_uncategorized` takes `list[dict]` → returns `list[dict]` — consistent across tests and task body
- `_build_categorization_prompt` takes `list[dict]` (with `id`, `merchant`, `amount`) → returns `str` — consistent
- `_parse_categorization_response` takes `str` → returns `list[dict]` — consistent
- `_categorize_batch` takes `list[dict]` → returns `list[dict]` — used correctly in task body
- `VALID_CATEGORIES` is a `set[str]` — used with `in` operator correctly
