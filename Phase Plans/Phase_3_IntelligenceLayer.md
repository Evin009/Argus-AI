# ArgusAI — Phase 3: Intelligence Layer

> Weeks 5–6. Goal: detect patterns in transaction data, surface recurring bills, track subscriptions, categorize spending with AI, and build the behavioral intelligence foundation.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Backend | Recurring bill detection engine, subscription tracker, AI categorization pipeline, behavioral spending analysis |
| Database | `bills` and `subscriptions` tables populated; category corrections stored |
| Frontend | Bills page, Bills Calendar, Subscriptions page, updated Dashboard with intelligence cards |
| Infra | New Celery tasks for bill detection, subscription analysis, categorization |

---

## Work Division

### Backend Track

| Area | Work |
|---|---|
| Bill detection | `detect_recurring_bills` Celery task — merchant + amount pattern matching across transaction history |
| Subscription tracker | `detect_subscriptions` Celery task — identify recurring charges, detect price creep vs 3 months ago |
| AI categorization | Claude few-shot classification to normalize + improve Plaid's raw categories |
| Behavioral intelligence | Spending velocity, category drift, impulse pattern detection |
| Routers | `GET /bills`, `GET /subscriptions`, `GET /insights/spending` |
| Triggers | Auto-run detection tasks after each transaction sync |

### Frontend Track

| Area | Work |
|---|---|
| Bills page | `app/(app)/bills/page.tsx` — list of detected recurring bills with amounts, frequency, next due date |
| Bills Calendar | Monthly calendar view, color-coded by urgency (due soon = red, upcoming = yellow) |
| Subscriptions page | `app/(app)/subscriptions/page.tsx` — active subscriptions, price creep badges, monthly total |
| Dashboard update | Add intelligence cards — upcoming bills total, subscription spend, spending vs last month |

---

## Git Branch Structure

```
develop
└── phase/3-intelligence-layer
      ├── feature/bill-detection
      ├── feature/subscription-tracker
      ├── feature/ai-categorization
      └── feature/intelligence-ui
```

---

## Execution Checklist

### `feature/bill-detection` ✅
*Detect recurring bills from transaction history*

**Backend:**
- [x] Create `backend/tasks/detect_bills.py`:
  - `detect_recurring_bills_for_user(user_id)` Celery task
  - Group transactions by merchant, compute median amount and interval
  - Classify as `monthly`, `weekly`, or `annual` based on date gaps
  - Upsert into `bills` table — merchant, recurrence_pattern, avg_amount, next_due_date
- [x] Write `backend/routers/bills.py` — `GET /bills` endpoint
- [x] Register `bills` router in `backend/main.py`
- [x] Chain `detect_recurring_bills_for_user` to fire after `sync_transactions_for_user` completes
- [x] Write `backend/tests/test_bill_detection.py` — unit tests for pattern detection logic
- [x] **Merged → `phase/3-intelligence-layer`**

---

### `feature/subscription-tracker`
*Track active subscriptions and detect price creep*

**Backend:**
- [ ] Create `backend/tasks/detect_subscriptions.py`:
  - `detect_subscriptions_for_user(user_id)` Celery task
  - Identify merchants with consistent monthly charges (subset of bills)
  - Compute `price_change_pct` — compare avg amount vs 3 months ago
  - Flag subscriptions with > 5% price increase as "creeping"
  - Upsert into `subscriptions` table
- [ ] Write `backend/routers/subscriptions.py` — `GET /subscriptions` endpoint
- [ ] Register `subscriptions` router in `backend/main.py`
- [ ] Write `backend/tests/test_subscription_detection.py` — unit tests for creep detection
- [ ] **Merged → `phase/3-intelligence-layer`**

---

### `feature/ai-categorization`
*Improve transaction categories using Claude few-shot classification*

**Backend:**
- [ ] Create `backend/tasks/categorize_transactions.py`:
  - `recategorize_transactions_for_user(user_id)` Celery task
  - Pull uncategorized or `OTHER` transactions
  - Build few-shot prompt with merchant + amount → category examples
  - Call Claude claude-sonnet-4-6 with structured output (Pydantic validated)
  - Update `transactions.category` and `transactions.subcategory`
- [ ] Add `POST /transactions/recategorize` endpoint to trigger manually
- [ ] Write `backend/tests/test_categorization.py` — mock Claude responses, test prompt structure
- [ ] **Merged → `phase/3-intelligence-layer`**

---

### `feature/intelligence-ui`
*Bills page, Subscriptions page, Bills Calendar, Dashboard intelligence cards*

**Frontend:**
- [ ] Build `app/(app)/bills/page.tsx`:
  - Fetch `GET /bills` — display as list: merchant, frequency, avg amount, next due date
  - Color-coded urgency: due within 7 days (red), 14 days (yellow), safe (green)
  - Total upcoming bills this month summary card
- [ ] Build `app/(app)/bills/calendar/page.tsx`:
  - Monthly calendar grid
  - Each bill plotted on its `next_due_date`
  - Click bill → show details panel
- [ ] Build `app/(app)/subscriptions/page.tsx`:
  - Fetch `GET /subscriptions` — display as list with monthly cost
  - Price creep badge on subscriptions with > 5% increase
  - Total monthly subscription spend summary card
- [ ] Update `app/(app)/dashboard/page.tsx`:
  - Add "Upcoming Bills" card — total due in next 30 days
  - Add "Subscriptions" card — monthly total + count
  - Add "Spending vs Last Month" card — % change with arrow indicator
- [ ] **Merged → `phase/3-intelligence-layer`**

---

### Phase 3 Close
- [ ] Merge `phase/3-intelligence-layer` → `develop`
- [ ] Open PR `develop` → `main`, wait for CI, merge
- [ ] Delete all feature branches + `phase/3-intelligence-layer`
- [ ] Mark Phase 3 as ✅ Complete in `ROADMAP.md`

### Post-Close
- [ ] Deploy updated backend to Railway
- [ ] Deploy updated frontend to Vercel
- [ ] Run smoke tests — bills detected, subscriptions identified, categories improved

---

## New Backend Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/bills` | All detected recurring bills for current user |
| `GET` | `/subscriptions` | All active subscriptions for current user |
| `POST` | `/transactions/recategorize` | Trigger AI recategorization for current user |
| `GET` | `/insights/spending` | Spending summary — this month vs last month per category |

---

## New Celery Tasks

| Task | Trigger | Description |
|---|---|---|
| `detect_recurring_bills_for_user` | After sync | Groups transactions by merchant, detects recurrence patterns |
| `detect_subscriptions_for_user` | After bill detection | Filters bills to subscriptions, computes price creep |
| `recategorize_transactions_for_user` | Manual or after sync | Claude few-shot categorization for `OTHER` transactions |

---

## New Dependencies

**Backend (`backend/pyproject.toml`):**
```
anthropic>=0.25.0
```

---

## New Environment Variables

**Backend (`.env`):**
```
ANTHROPIC_API_KEY=       # Claude API key for categorization
```

---

## Database Tables Used

```sql
bills (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  merchant TEXT,
  recurrence_pattern TEXT,  -- 'monthly' | 'weekly' | 'annual'
  avg_amount DECIMAL,
  next_due_date DATE,
  last_seen TIMESTAMPTZ
)

subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  merchant TEXT,
  avg_amount DECIMAL,
  billing_cycle TEXT,
  price_change_pct DECIMAL,
  first_detected TIMESTAMPTZ,
  is_active BOOLEAN
)
```

---

## Definition of Done

- [ ] Recurring bills detected from sandbox transaction history — at least 3 merchants identified
- [ ] Subscriptions table populated with `price_change_pct` computed
- [ ] `OTHER` transactions recategorized via Claude — category distribution improved
- [ ] Bills page shows list with urgency colors and next due dates
- [ ] Subscriptions page shows monthly total and price creep badges
- [ ] Dashboard shows upcoming bills + subscription spend cards
- [ ] CI green on `main`

---

## Critical Files

| File | Why it can't be skipped |
|---|---|
| `backend/tasks/detect_bills.py` | Foundation for Risk Radar (Phase 5) — overdraft alerts depend on knowing upcoming bills |
| `backend/tasks/detect_subscriptions.py` | Subscription creep detection is a core ArgusAI differentiator |
| `backend/tasks/categorize_transactions.py` | Clean categories are required for accurate cashflow forecasting in Phase 5 |
| `app/(app)/bills/page.tsx` | First intelligence surface visible to users |
