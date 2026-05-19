# Bill Detection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detect recurring bills from transaction history and expose them via a `GET /bills` endpoint, with detection automatically triggered after each transaction sync.

**Architecture:** A pure-function detection engine (`detect_bills.py`) groups transactions by merchant, computes intervals between charges, classifies recurrence patterns, and upserts results into the `bills` table. A FastAPI router (`bills.py`) exposes the data. The detection task is chained onto the existing `sync_transactions_for_user` Celery task so bills stay current after every sync.

**Tech Stack:** Python 3.12, FastAPI, Celery + Redis, Supabase (postgrest-py), pytest

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `backend/tasks/detect_bills.py` | Create | Detection engine + Celery task |
| `backend/routers/bills.py` | Create | `GET /bills` endpoint |
| `backend/main.py` | Modify | Register bills router |
| `backend/tasks/sync_transactions.py` | Modify | Chain bill detection after sync |
| `backend/tests/test_bill_detection.py` | Create | Unit tests for detection logic |

---

## Task 1: Write failing tests for the detection engine

**Files:**
- Create: `backend/tests/test_bill_detection.py`

The detection engine will expose three pure functions:
- `_compute_intervals(dates: list[date]) -> list[int]` — returns day-gaps between sorted dates
- `_classify_pattern(median_interval: float) -> str | None` — returns `'monthly'`, `'weekly'`, `'annual'`, or `None`
- `_detect_bills_for_transactions(transactions: list[dict], user_id: str) -> list[dict]` — full pipeline, returns list of bill dicts ready to upsert

- [ ] **Step 1: Create the test file**

```python
# backend/tests/test_bill_detection.py
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

from tasks.detect_bills import (  # noqa: E402
    _classify_pattern,
    _compute_intervals,
    _detect_bills_for_transactions,
)


def test_compute_intervals_returns_day_gaps():
    dates = [date(2024, 1, 1), date(2024, 2, 1), date(2024, 3, 2)]
    result = _compute_intervals(dates)
    assert result == [31, 30]


def test_compute_intervals_sorts_dates():
    dates = [date(2024, 3, 1), date(2024, 1, 1), date(2024, 2, 1)]
    result = _compute_intervals(dates)
    assert result == [31, 29]


def test_compute_intervals_single_date_returns_empty():
    assert _compute_intervals([date(2024, 1, 1)]) == []


def test_classify_pattern_monthly():
    assert _classify_pattern(30) == "monthly"
    assert _classify_pattern(28) == "monthly"
    assert _classify_pattern(31) == "monthly"


def test_classify_pattern_weekly():
    assert _classify_pattern(7) == "weekly"
    assert _classify_pattern(6) == "weekly"
    assert _classify_pattern(8) == "weekly"


def test_classify_pattern_annual():
    assert _classify_pattern(365) == "annual"
    assert _classify_pattern(355) == "annual"
    assert _classify_pattern(375) == "annual"


def test_classify_pattern_irregular_returns_none():
    assert _classify_pattern(45) is None
    assert _classify_pattern(15) is None


def test_detect_bills_identifies_monthly_merchant():
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2024-01-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2024-02-15"},
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2024-03-15"},
    ]
    bills = _detect_bills_for_transactions(transactions, "user-123")
    assert len(bills) == 1
    assert bills[0]["merchant"] == "Netflix"
    assert bills[0]["recurrence_pattern"] == "monthly"
    assert abs(bills[0]["avg_amount"] - 15.99) < 0.01
    assert bills[0]["user_id"] == "user-123"


def test_detect_bills_skips_single_transaction_merchant():
    transactions = [
        {"merchant": "Netflix", "amount": 15.99, "timestamp": "2024-01-15"},
        {"merchant": "OneTime Store", "amount": 99.00, "timestamp": "2024-01-20"},
    ]
    bills = _detect_bills_for_transactions(transactions, "user-123")
    merchants = [b["merchant"] for b in bills]
    assert "OneTime Store" not in merchants


def test_detect_bills_skips_irregular_merchant():
    transactions = [
        {"merchant": "Random Shop", "amount": 20.00, "timestamp": "2024-01-01"},
        {"merchant": "Random Shop", "amount": 20.00, "timestamp": "2024-01-20"},
        {"merchant": "Random Shop", "amount": 20.00, "timestamp": "2024-02-14"},
    ]
    bills = _detect_bills_for_transactions(transactions, "user-123")
    merchants = [b["merchant"] for b in bills]
    assert "Random Shop" not in merchants


def test_detect_bills_next_due_date_is_after_last_seen():
    transactions = [
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2024-01-10"},
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2024-02-10"},
        {"merchant": "Spotify", "amount": 9.99, "timestamp": "2024-03-10"},
    ]
    bills = _detect_bills_for_transactions(transactions, "user-123")
    assert len(bills) == 1
    last_seen = date.fromisoformat(bills[0]["last_seen"])
    next_due = date.fromisoformat(bills[0]["next_due_date"])
    assert next_due > last_seen
```

- [ ] **Step 2: Run tests to confirm they all fail**

```bash
cd backend && python -m pytest tests/test_bill_detection.py -v
```

Expected: `ImportError` — `tasks.detect_bills` does not exist yet.

---

## Task 2: Implement the detection engine

**Files:**
- Create: `backend/tasks/detect_bills.py`

- [ ] **Step 1: Create `detect_bills.py`**

```python
# backend/tasks/detect_bills.py
import statistics
import uuid
from collections import defaultdict
from datetime import date, timedelta

from celery_app import celery
from db.client import get_supabase


def _compute_intervals(dates: list[date]) -> list[int]:
    sorted_dates = sorted(dates)
    return [(sorted_dates[i + 1] - sorted_dates[i]).days for i in range(len(sorted_dates) - 1)]


def _classify_pattern(median_interval: float) -> str | None:
    if 5 <= median_interval <= 9:
        return "weekly"
    if 25 <= median_interval <= 35:
        return "monthly"
    if 350 <= median_interval <= 380:
        return "annual"
    return None


def _detect_bills_for_transactions(transactions: list[dict], user_id: str) -> list[dict]:
    merchant_groups: dict[str, list] = defaultdict(list)
    for txn in transactions:
        merchant = (txn.get("merchant") or "").strip()
        if not merchant or merchant == "Unknown":
            continue
        try:
            txn_date = date.fromisoformat(str(txn["timestamp"])[:10])
        except (ValueError, KeyError):
            continue
        merchant_groups[merchant].append((txn_date, float(txn.get("amount", 0))))

    bills = []
    for merchant, entries in merchant_groups.items():
        if len(entries) < 2:
            continue

        dates = [e[0] for e in entries]
        amounts = [e[1] for e in entries]
        intervals = _compute_intervals(dates)

        if not intervals:
            continue

        median_interval = statistics.median(intervals)
        pattern = _classify_pattern(median_interval)
        if pattern is None:
            continue

        last_seen = max(dates)
        next_due = last_seen + timedelta(days=int(median_interval))
        avg_amount = round(statistics.mean(amounts), 2)

        bills.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "merchant": merchant,
            "recurrence_pattern": pattern,
            "avg_amount": avg_amount,
            "next_due_date": next_due.isoformat(),
            "last_seen": last_seen.isoformat(),
        })

    return bills


@celery.task(name="tasks.detect_bills.detect_recurring_bills_for_user")
def detect_recurring_bills_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    accts = supabase.table("accounts").select("id").eq("user_id", user_id).execute()
    account_ids = [a["id"] for a in accts.data]

    if not account_ids:
        return {"user_id": user_id, "bills_detected": 0}

    result = (
        supabase.table("transactions")
        .select("merchant, amount, timestamp")
        .in_("account_id", account_ids)
        .order("timestamp", desc=False)
        .execute()
    )

    bills = _detect_bills_for_transactions(result.data, user_id)

    for bill in bills:
        supabase.table("bills").upsert(
            bill, on_conflict="user_id,merchant"
        ).execute()

    return {"user_id": user_id, "bills_detected": len(bills)}
```

- [ ] **Step 2: Run tests to confirm they all pass**

```bash
cd backend && python -m pytest tests/test_bill_detection.py -v
```

Expected: All 11 tests PASS.

- [ ] **Step 3: Commit**

```bash
git add backend/tasks/detect_bills.py backend/tests/test_bill_detection.py
git commit -m "feat: add recurring bill detection engine with unit tests"
```

---

## Task 3: Add a unique constraint migration for bills

The upsert in `detect_recurring_bills_for_user` uses `on_conflict="user_id,merchant"`. The `bills` table needs that constraint or the upsert will fail.

**Files:**
- Create: `backend/migrations/007_bills_unique_constraint.sql`

- [ ] **Step 1: Create migration file**

```sql
-- backend/migrations/007_bills_unique_constraint.sql
ALTER TABLE public.bills
  ADD CONSTRAINT bills_user_merchant_unique UNIQUE (user_id, merchant);
```

- [ ] **Step 2: Run in Supabase SQL editor**

Open Supabase Dashboard → SQL Editor → paste and run the migration.

Verify with:
```sql
SELECT constraint_name FROM information_schema.table_constraints
WHERE table_name = 'bills' AND constraint_type = 'UNIQUE';
```

Expected: `bills_user_merchant_unique` appears in results.

- [ ] **Step 3: Commit**

```bash
git add backend/migrations/007_bills_unique_constraint.sql
git commit -m "feat: add unique constraint on bills(user_id, merchant)"
```

---

## Task 4: Build the GET /bills router

**Files:**
- Create: `backend/routers/bills.py`

- [ ] **Step 1: Create `bills.py`**

```python
# backend/routers/bills.py
from fastapi import APIRouter, Depends

from db.client import get_supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/bills", tags=["bills"])


@router.get("")
async def get_bills(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("bills")
        .select("*")
        .eq("user_id", user_id)
        .order("next_due_date", desc=False)
        .execute()
    )
    return {"bills": result.data}
```

- [ ] **Step 2: Register the router in `main.py`**

In `backend/main.py`, add the import and include:

```python
# Change this line:
from routers import auth, plaid, transactions

# To this:
from routers import auth, bills, plaid, transactions
```

And add after the existing `app.include_router(transactions.router)`:
```python
app.include_router(bills.router)
```

- [ ] **Step 3: Smoke test the endpoint locally**

Start the backend:
```bash
cd backend && uvicorn main:app --reload --port 8000
```

In a second terminal, get a JWT from Supabase (use your browser's DevTools → Application → Local Storage → `sb-*-auth-token` → `access_token`), then:

```bash
curl -H "Authorization: Bearer <your_jwt>" http://localhost:8000/bills
```

Expected: `{"bills": [...]}` — may be empty if bills haven't been detected yet.

- [ ] **Step 4: Commit**

```bash
git add backend/routers/bills.py backend/main.py
git commit -m "feat: add GET /bills endpoint and register router"
```

---

## Task 5: Chain bill detection after transaction sync

After `sync_transactions_for_user` completes, automatically trigger `detect_recurring_bills_for_user`.

**Files:**
- Modify: `backend/tasks/sync_transactions.py` (last line of the function body)

- [ ] **Step 1: Add the chain at the end of `sync_transactions_for_user`**

At the bottom of the `sync_transactions_for_user` function in `backend/tasks/sync_transactions.py`, add the chained call **before** the `return` statement:

```python
    # Existing return at bottom of function — add this line above it:
    from tasks.detect_bills import detect_recurring_bills_for_user
    detect_recurring_bills_for_user.delay(user_id)

    return {"user_id": user_id, "transactions_synced": total_added}
```

- [ ] **Step 2: Verify existing sync tests still pass**

```bash
cd backend && python -m pytest tests/test_sync.py -v
```

Expected: All 7 tests still PASS (the import is inside the function body so it doesn't affect unit tests).

- [ ] **Step 3: Commit**

```bash
git add backend/tasks/sync_transactions.py
git commit -m "feat: chain bill detection task after transaction sync"
```

---

## Task 6: End-to-end manual verification

- [ ] **Step 1: Start local stack**

```bash
# Terminal 1 — backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 — Celery worker
cd backend && celery -A celery_app worker --loglevel=info
```

- [ ] **Step 2: Trigger a sync**

In browser, go to `/accounts` → click Sync. Watch Celery terminal — should see both `sync_transactions_for_user` and `detect_recurring_bills_for_user` tasks complete.

- [ ] **Step 3: Verify bills in DB**

In Supabase Dashboard → Table Editor → `bills` table. Should see rows for merchants with recurring patterns (Spotify, Netflix, etc. from sandbox data).

- [ ] **Step 4: Verify GET /bills returns data**

```bash
curl -H "Authorization: Bearer <your_jwt>" http://localhost:8000/bills
```

Expected: JSON with at least 1 bill entry containing `merchant`, `recurrence_pattern`, `avg_amount`, `next_due_date`.

---

## Task 7: Merge feature branch

- [ ] **Step 1: Run the full test suite**

```bash
cd backend && python -m pytest -v
```

Expected: All tests pass including the 11 new bill detection tests.

- [ ] **Step 2: Merge to phase branch**

```bash
git checkout phase/3-intelligence-layer
git merge feature/bill-detection
git push origin phase/3-intelligence-layer
```

---

## Self-Review

**Spec coverage check:**
- ✅ `detect_recurring_bills_for_user` Celery task — Task 2
- ✅ Group by merchant, compute median amount and interval — Task 2 (`_detect_bills_for_transactions`)
- ✅ Classify as monthly/weekly/annual — Task 2 (`_classify_pattern`)
- ✅ Upsert into `bills` table — Task 2 (Celery task body)
- ✅ `GET /bills` endpoint — Task 4
- ✅ Register bills router in `main.py` — Task 4
- ✅ Chain to fire after `sync_transactions_for_user` — Task 5
- ✅ Unit tests for pattern detection logic — Tasks 1 & 2
- ✅ Unique constraint for upsert — Task 3

**Placeholder scan:** None found. All steps contain complete code.

**Type consistency:**
- `_compute_intervals` takes `list[date]`, returns `list[int]` — used consistently in `_detect_bills_for_transactions`
- `_classify_pattern` takes `float`, returns `str | None` — used consistently
- `_detect_bills_for_transactions` takes `list[dict], str`, returns `list[dict]` — matches test assertions
- Bill dict keys: `id, user_id, merchant, recurrence_pattern, avg_amount, next_due_date, last_seen` — consistent across task and tests
