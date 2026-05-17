# Subscription Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detect active subscriptions from the existing bills data, compute price creep vs 3 months ago, and expose them via `GET /subscriptions`.

**Architecture:** Subscriptions are a subset of monthly bills. A pure-function pipeline (`detect_subscriptions.py`) reads the `bills` table, fetches transaction history per merchant, splits amounts into recent vs old periods, computes price change %, and upserts into `subscriptions`. The task is chained after `detect_recurring_bills_for_user` so subscriptions stay current after every sync.

**Tech Stack:** Python 3.12, FastAPI, Celery + Redis, Supabase (postgrest-py), pytest, `statistics` stdlib

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/tasks/detect_subscriptions.py` | Create | Detection pipeline + Celery task |
| `backend/routers/subscriptions.py` | Create | `GET /subscriptions` endpoint |
| `backend/main.py` | Modify | Register subscriptions router |
| `backend/celery_app.py` | Modify | Add `tasks.detect_subscriptions` to include list |
| `backend/tasks/detect_bills.py` | Modify | Chain subscription detection after bill detection |
| `backend/tests/test_subscription_detection.py` | Create | Unit tests for pure functions |

---

## Task 1: Write failing tests for the subscription detection engine

**Files:**
- Create: `backend/tests/test_subscription_detection.py`

Three pure functions to test:

- `_compute_price_change_pct(recent_amounts: list[float], old_amounts: list[float]) -> float | None` — returns % change, `None` if either list empty or old avg is 0
- `_split_amounts_by_period(transactions: list[dict], merchant: str, reference_date: date) -> tuple[list[float], list[float]]` — splits transaction amounts into recent (0–60 days before reference) and old (60–120 days before reference)
- `_build_subscriptions(bills: list[dict], transactions: list[dict], user_id: str) -> list[dict]` — full pipeline, returns subscription dicts

- [ ] **Step 1: Create the test file**

```python
# backend/tests/test_subscription_detection.py
import os
from datetime import date

os.environ.setdefault("SUPABASE_URL", "https://placeholder.supabase.co")
os.environ.setdefault("SUPABASE_SERVICE_ROLE_KEY", "placeholder-service-role-key")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("OPENAI_API_KEY", "sk-placeholder")
os.environ.setdefault("PLAID_CLIENT_ID", "placeholder")
os.environ.setdefault("PLAID_SECRET", "placeholder")
os.environ.setdefault("PLAID_ENV", "sandbox")
os.environ.setdefault("PLAID_TOKEN_ENCRYPTION_KEY", "a" * 64)

import pytest  # noqa: E402

from tasks.detect_subscriptions import (  # noqa: E402
    _build_subscriptions,
    _compute_price_change_pct,
    _split_amounts_by_period,
)


def test_compute_price_change_pct_increase():
    assert _compute_price_change_pct([12.99], [9.99]) == pytest.approx(30.03, abs=0.1)


def test_compute_price_change_pct_decrease():
    result = _compute_price_change_pct([8.99], [9.99])
    assert result < 0


def test_compute_price_change_pct_no_change():
    assert _compute_price_change_pct([9.99, 9.99], [9.99, 9.99]) == pytest.approx(0.0, abs=0.01)


def test_compute_price_change_pct_empty_recent_returns_none():
    assert _compute_price_change_pct([], [9.99]) is None


def test_compute_price_change_pct_empty_old_returns_none():
    assert _compute_price_change_pct([9.99], []) is None


def test_compute_price_change_pct_zero_old_returns_none():
    assert _compute_price_change_pct([9.99], [0.0]) is None


def test_split_amounts_by_period_recent():
    reference = date(2026, 5, 1)
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-04-15"},  # 16 days ago — recent
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-03-15"},  # 47 days ago — recent
        {"merchant": "Netflix", "amount": 12.99, "timestamp": "2026-02-01"},  # 89 days ago — old
    ]
    recent, old = _split_amounts_by_period(transactions, "Netflix", reference)
    assert len(recent) == 2
    assert len(old) == 1
    assert 15.99 in recent
    assert 12.99 in old


def test_split_amounts_by_period_ignores_other_merchants():
    reference = date(2026, 5, 1)
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-04-15"},
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2026-04-15"},
    ]
    recent, old = _split_amounts_by_period(transactions, "Netflix", reference)
    assert len(recent) == 1
    assert 9.99 not in recent


def test_split_amounts_by_period_outside_window_excluded():
    reference = date(2026, 5, 1)
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2025-01-01"},  # > 120 days ago
    ]
    recent, old = _split_amounts_by_period(transactions, "Netflix", reference)
    assert recent == []
    assert old == []


def test_build_subscriptions_detects_monthly_bill():
    bills = [
        {
            "merchant": "Netflix",
            "recurrence_pattern": "monthly",
            "avg_amount": 15.99,
            "next_due_date": "2026-06-01",
            "last_seen": "2026-05-01",
        }
    ]
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-04-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-03-15"},
        {"merchant": "Netflix", "amount": 12.99, "timestamp": "2026-02-10"},
    ]
    subs = _build_subscriptions(bills, transactions, "user-123")
    assert len(subs) == 1
    assert subs[0]["merchant"] == "Netflix"
    assert subs[0]["user_id"] == "user-123"
    assert subs[0]["billing_cycle"] == "monthly"
    assert subs[0]["is_active"] is True


def test_build_subscriptions_skips_non_monthly():
    bills = [
        {
            "merchant": "Weekly Cleaner",
            "recurrence_pattern": "weekly",
            "avg_amount": 25.0,
            "next_due_date": "2026-05-08",
            "last_seen": "2026-05-01",
        }
    ]
    transactions = [
        {"merchant": "Weekly Cleaner", "amount": 25.0, "timestamp": "2026-04-24"},
    ]
    subs = _build_subscriptions(bills, transactions, "user-123")
    assert len(subs) == 0


def test_build_subscriptions_price_creep_detected():
    bills = [
        {
            "merchant": "Spotify",
            "recurrence_pattern": "monthly",
            "avg_amount": 11.99,
            "next_due_date": "2026-06-01",
            "last_seen": "2026-05-01",
        }
    ]
    transactions = [
        {"merchant": "Spotify", "amount": 11.99, "timestamp": "2026-04-15"},
        {"merchant": "Spotify", "amount": 11.99, "timestamp": "2026-03-15"},
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2026-02-10"},
    ]
    subs = _build_subscriptions(bills, transactions, "user-123")
    assert len(subs) == 1
    assert subs[0]["price_change_pct"] > 5.0


def test_build_subscriptions_no_price_creep():
    bills = [
        {
            "merchant": "Netflix",
            "recurrence_pattern": "monthly",
            "avg_amount": 15.99,
            "next_due_date": "2026-06-01",
            "last_seen": "2026-05-01",
        }
    ]
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-04-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-03-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2026-02-10"},
    ]
    subs = _build_subscriptions(bills, transactions, "user-123")
    assert len(subs) == 1
    assert subs[0]["price_change_pct"] == pytest.approx(0.0, abs=0.01)
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -m pytest tests/test_subscription_detection.py -v
```

Expected: `ImportError` — `tasks.detect_subscriptions` does not exist yet.

---

## Task 2: Implement the subscription detection engine

**Files:**
- Create: `backend/tasks/detect_subscriptions.py`

- [ ] **Step 1: Create `detect_subscriptions.py`**

```python
# backend/tasks/detect_subscriptions.py
import statistics
import uuid
from datetime import date, timedelta

from celery_app import celery
from db.client import get_supabase


def _compute_price_change_pct(
    recent_amounts: list[float], old_amounts: list[float]
) -> float | None:
    if not recent_amounts or not old_amounts:
        return None
    old_avg = statistics.mean(old_amounts)
    if old_avg == 0:
        return None
    recent_avg = statistics.mean(recent_amounts)
    return round(((recent_avg - old_avg) / abs(old_avg)) * 100, 2)


def _split_amounts_by_period(
    transactions: list[dict], merchant: str, reference_date: date
) -> tuple[list[float], list[float]]:
    recent: list[float] = []
    old: list[float] = []
    for txn in transactions:
        if (txn.get("merchant") or "").strip() != merchant:
            continue
        try:
            txn_date = date.fromisoformat(str(txn["timestamp"])[:10])
        except (ValueError, KeyError):
            continue
        days_ago = (reference_date - txn_date).days
        if 0 <= days_ago < 60:
            recent.append(float(txn.get("amount", 0)))
        elif 60 <= days_ago < 120:
            old.append(float(txn.get("amount", 0)))
    return recent, old


def _build_subscriptions(
    bills: list[dict], transactions: list[dict], user_id: str
) -> list[dict]:
    today = date.today()
    subscriptions = []
    for bill in bills:
        if bill.get("recurrence_pattern") != "monthly":
            continue
        merchant = bill["merchant"]
        recent, old = _split_amounts_by_period(transactions, merchant, today)
        price_change_pct = _compute_price_change_pct(recent, old)
        subscriptions.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "merchant": merchant,
            "avg_amount": bill["avg_amount"],
            "billing_cycle": "monthly",
            "price_change_pct": price_change_pct,
            "is_active": True,
        })
    return subscriptions


@celery.task(name="tasks.detect_subscriptions.detect_subscriptions_for_user")
def detect_subscriptions_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    bills_result = (
        supabase.table("bills")
        .select("merchant, recurrence_pattern, avg_amount, next_due_date, last_seen")
        .eq("user_id", user_id)
        .execute()
    )

    if not bills_result.data:
        return {"user_id": user_id, "subscriptions_detected": 0}

    accts = supabase.table("accounts").select("id").eq("user_id", user_id).execute()
    account_ids = [a["id"] for a in accts.data]

    txn_result = (
        supabase.table("transactions")
        .select("merchant, amount, timestamp")
        .in_("account_id", account_ids)
        .order("timestamp", desc=False)
        .execute()
    )

    subs = _build_subscriptions(bills_result.data, txn_result.data, user_id)

    for sub in subs:
        supabase.table("subscriptions").upsert(
            sub, on_conflict="user_id,merchant"
        ).execute()

    return {"user_id": user_id, "subscriptions_detected": len(subs)}
```

- [ ] **Step 2: Run tests to confirm all pass**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -m pytest tests/test_subscription_detection.py -v
```

Expected: All 13 tests PASS.

- [ ] **Step 3: Run full suite to confirm no regressions**

```bash
python -m pytest -v
```

Expected: All 39 tests PASS (26 existing + 13 new).

- [ ] **Step 4: Commit**

```bash
git add backend/tasks/detect_subscriptions.py backend/tests/test_subscription_detection.py
git commit -m "feat: implement subscription detection engine with price creep detection"
```

---

## Task 3: Add unique constraint migration for subscriptions

The upsert uses `on_conflict="user_id,merchant"` — needs a `UNIQUE(user_id, merchant)` constraint on the `subscriptions` table.

**Files:**
- Create: `backend/migrations/009_subscriptions_unique_constraint.sql`

- [ ] **Step 1: Create migration file**

```sql
-- backend/migrations/009_subscriptions_unique_constraint.sql
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_merchant_unique UNIQUE (user_id, merchant);
```

- [ ] **Step 2: Apply via Supabase MCP**

The Supabase MCP is already authenticated. Run in the MCP `execute_sql` tool:
```sql
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_merchant_unique UNIQUE (user_id, merchant);
```

Verify:
```sql
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'subscriptions' AND constraint_type = 'UNIQUE';
```

Expected: `subscriptions_user_merchant_unique` in results.

- [ ] **Step 3: Commit**

```bash
git add backend/migrations/009_subscriptions_unique_constraint.sql
git commit -m "feat: add unique constraint on subscriptions(user_id, merchant)"
```

---

## Task 4: Build GET /subscriptions router

**Files:**
- Create: `backend/routers/subscriptions.py`
- Modify: `backend/main.py`

- [ ] **Step 1: Create `subscriptions.py`**

```python
# backend/routers/subscriptions.py
from fastapi import APIRouter, Depends

from db.client import get_supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("")
async def get_subscriptions(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("subscriptions")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .order("avg_amount", desc=True)
        .execute()
    )
    return {"subscriptions": result.data}
```

- [ ] **Step 2: Register in `main.py`**

Change:
```python
from routers import auth, bills, plaid, transactions
```
To:
```python
from routers import auth, bills, plaid, subscriptions, transactions
```

Add after `app.include_router(bills.router)`:
```python
app.include_router(subscriptions.router)
```

- [ ] **Step 3: Verify app starts**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -c "from main import app; print('OK')"
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add backend/routers/subscriptions.py backend/main.py
git commit -m "feat: add GET /subscriptions endpoint and register router"
```

---

## Task 5: Wire Celery — register task + chain after bill detection

**Files:**
- Modify: `backend/celery_app.py`
- Modify: `backend/tasks/detect_bills.py`

- [ ] **Step 1: Add `tasks.detect_subscriptions` to Celery include list in `celery_app.py`**

Change:
```python
include=["tasks.sync_transactions", "tasks.generate_embeddings", "tasks.detect_bills"],
```
To:
```python
include=[
    "tasks.sync_transactions",
    "tasks.generate_embeddings",
    "tasks.detect_bills",
    "tasks.detect_subscriptions",
],
```

- [ ] **Step 2: Chain subscription detection after bill detection in `detect_bills.py`**

At the bottom of `detect_recurring_bills_for_user`, just before the `return` statement, add:

```python
    from tasks.detect_subscriptions import detect_subscriptions_for_user
    detect_subscriptions_for_user.delay(user_id)

    return {"user_id": user_id, "bills_detected": len(bills)}
```

- [ ] **Step 3: Run full test suite**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -m pytest -v
```

Expected: All 39 tests PASS.

- [ ] **Step 4: Commit**

```bash
git add backend/celery_app.py backend/tasks/detect_bills.py
git commit -m "feat: register detect_subscriptions task and chain after bill detection"
```

---

## Task 6: End-to-end verification via Supabase MCP

- [ ] **Step 1: Run the task directly**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -c "
from dotenv import load_dotenv
load_dotenv()
from tasks.detect_subscriptions import detect_subscriptions_for_user
from db.client import get_supabase

supabase = get_supabase()
user_id = supabase.table('users').select('id').execute().data[0]['id']
result = detect_subscriptions_for_user(user_id)
print(result)
"
```

Expected: `{'user_id': '...', 'subscriptions_detected': N}` where N > 0.

- [ ] **Step 2: Verify via Supabase MCP**

Query via MCP `execute_sql`:
```sql
SELECT merchant, avg_amount, billing_cycle, price_change_pct, is_active
FROM public.subscriptions
ORDER BY avg_amount DESC;
```

Expected: Rows present with merchants matching the `bills` table.

- [ ] **Step 3: Verify GET /subscriptions returns 401 without JWT**

```bash
curl http://localhost:8000/subscriptions
```

Expected: `{"detail":"Not authenticated"}`

---

## Task 7: Merge feature branch

- [ ] **Step 1: Run full test suite one final time**

```bash
cd "/Users/evinbento/Library/CloudStorage/OneDrive-UniversityofSouthFlorida/Personal Projects/ArgusAI/backend" && python -m pytest -v
```

Expected: All 39 tests PASS.

- [ ] **Step 2: Merge to phase branch**

```bash
git checkout phase/3-intelligence-layer
git merge feature/subscription-tracker
git push origin phase/3-intelligence-layer
```

---

## Self-Review

**Spec coverage:**
- ✅ `detect_subscriptions_for_user` Celery task — Task 2
- ✅ Identify merchants with consistent monthly charges (subset of bills) — Task 2 (`_build_subscriptions` filters `recurrence_pattern == "monthly"`)
- ✅ Compute `price_change_pct` vs 3 months ago — Task 2 (`_split_amounts_by_period` + `_compute_price_change_pct`)
- ✅ Flag subscriptions with >5% price increase — stored in `price_change_pct` field (UI will render the badge)
- ✅ Upsert into `subscriptions` table — Task 2 (Celery task body)
- ✅ `GET /subscriptions` endpoint — Task 4
- ✅ Register router in `main.py` — Task 4
- ✅ Unique constraint for upsert — Task 3
- ✅ Register in Celery include list — Task 5
- ✅ Chain after bill detection — Task 5
- ✅ Unit tests — Tasks 1 & 2

**Placeholder scan:** None found. All steps contain complete code.

**Type consistency:**
- `_compute_price_change_pct` takes `list[float], list[float]` → returns `float | None` — consistent across tests and implementation
- `_split_amounts_by_period` takes `list[dict], str, date` → returns `tuple[list[float], list[float]]` — consistent
- `_build_subscriptions` takes `list[dict], list[dict], str` → returns `list[dict]` — consistent
- Subscription dict keys: `id, user_id, merchant, avg_amount, billing_cycle, price_change_pct, is_active` — consistent across task and tests
