# Phase 6: Daily Intelligence

> Weeks 13–14. Goal: ship Safe to Spend (how much money is safe to use today) and Smart Payment Calendar (when to pay what) — the two screens users open every morning.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Backend engines | Pure Python math — no AI-invented numbers |
| Celery | Nightly Safe to Spend recompute |
| API | `/insights/safe-to-spend`, `/insights/pay-timing`, `/calendar` |
| Argus tools | Register both engines so Argus can answer questions about them in chat |
| Frontend | Smart Payment Calendar page, Safe to Spend hero on dashboard |
| Service | Merchant logo fetch + DB cache (Clearbit) |

---

## Git Branch Structure

```
develop
└── phase/6-daily-intelligence
      ├── feature/safe-to-spend
      ├── feature/pay-timing
      ├── feature/merchant-logos
      └── feature/smart-calendar
```

---

## Global Constraints

- All financial math in plain Python — no AI-invented numbers
- Every new endpoint requires `get_current_user` auth dependency
- New tables need RLS enabled + user-scoped policy
- New Celery tasks must be added to `include` list in `backend/celery_app.py`
- New routers must be registered in `backend/main.py`
- Frontend uses design tokens only — no raw Tailwind color utilities
- Tests mock Supabase via `unittest.mock.patch`; never hit real DB

---

## Execution Checklist

### `feature/safe-to-spend` ✅

**Migration**
- [x] `backend/migrations/016_safe_to_spend_cache.sql` — `safe_to_spend_cache` table: `user_id UUID PK`, `safe_amount DECIMAL`, `breakdown JSONB`, `computed_at TIMESTAMPTZ`. RLS enabled, user-scoped policy.

**Engine**
- [x] `backend/engines/safe_to_spend.py` — `compute_safe_to_spend(balance, bills, pay_schedule, buffer_reserve) -> dict`. Logic: balance minus bills due before next payday window (derived from pay_schedule) minus buffer reserve. Clamps to zero minimum. Returns `safe_amount` + `breakdown`.
- [x] `backend/tests/test_safe_to_spend_engine.py`

**Celery task**
- [x] `backend/tasks/recompute_safe_to_spend.py` — fetches accounts, bills, pay_schedule for a user, runs engine, upserts result to `safe_to_spend_cache`
- [x] Added to `celery_app.py` include list + nightly beat schedule (2am UTC)
- [x] `backend/tests/test_recompute_safe_to_spend.py`

**Endpoint**
- [x] `GET /insights/safe-to-spend` added to `backend/routers/insights.py` — returns cached row if exists, falls back to live compute if not
- [x] `backend/tests/test_safe_to_spend_endpoint.py`

**Argus tool**
- [x] `get_safe_to_spend` registered in `backend/agents/tools.py` — reads from cache, returns safe amount + breakdown
- [x] `backend/tests/test_safe_to_spend_tool.py`

- [x] Merge → `phase/6-daily-intelligence`

---

### `feature/pay-timing` ✅

**Engine**
- [x] `backend/engines/pay_timing.py` — two functions:
  - `compute_pay_timing(accounts, bills, balance) -> dict` — for each credit account, computes pay_amount to reach 8% utilization. Detects 3-day bill stacking windows where total_due exceeds balance.
  - `infer_closing_date(transactions)` — finds most common transaction day from history
  - `bills_in_window(bills, window_days)` — filters bills due within window
- [x] `backend/tests/test_pay_timing_engine.py`

**Endpoint + Argus tool**
- [x] `backend/routers/pay_timing.py` — `GET /insights/pay-timing` — fetches accounts + bills, runs engine, returns `{ card_recommendations, stacked_windows }`
- [x] Registered in `backend/main.py`
- [x] `get_pay_timing` registered in `backend/agents/tools.py`
- [x] `backend/tests/test_pay_timing_endpoint.py`

- [x] Merge → `phase/6-daily-intelligence`

---

### `feature/merchant-logos` ✅

**Migration**
- [x] `backend/migrations/017_merchant_logos.sql` — `merchant_logos` table: `merchant TEXT PK`, `logo_url TEXT`, `fetched_at TIMESTAMPTZ`. No RLS — logos are not user data.

**Service**
- [x] `backend/services/merchant_logos.py` — `get_logo_url(merchant, supabase) -> str | None`. Checks DB cache first. On miss: fetches from Clearbit (`logo.clearbit.com/{slug}.com`), stores result (including None on 404). Returns URL or None.
- [x] `backend/tests/test_merchant_logos.py`

- [x] Merge → `phase/6-daily-intelligence`

---

### `feature/smart-calendar` ✅

**Endpoint**
- [x] `backend/routers/calendar.py` — `GET /calendar` — fetches bills + active subscriptions, adds logo via merchant logo service, assigns urgency (high ≤3 days, medium ≤7 days, low otherwise), sorts by due date ascending, returns `{ entries: list }`
- [x] Registered in `backend/main.py`
- [x] `backend/tests/test_calendar_endpoint.py`

**Frontend**
- [x] `frontend/app/(app)/calendar/page.tsx` — Smart Payment Calendar page:
  - Filter chips: all / bills / subscriptions
  - Logo tile per entry (Clearbit image or copper initial fallback)
  - Urgency color on left border (red / amber / grey)
  - Stacking warning banner when pay timing detects bill stack
  - Sorted by due date
- [x] Calendar nav item added to sidebar in `frontend/app/(app)/layout.tsx`
- [x] `frontend/app/(app)/dashboard/_components/SafeToSpendHero.tsx` — tappable hero number at top of dashboard; tap expands breakdown (balance → bills → buffer → safe amount)
- [x] Wired into `frontend/app/(app)/dashboard/page.tsx`

- [x] Merge → `phase/6-daily-intelligence`

---

### Phase 6 Close
- [x] Merge `phase/6-daily-intelligence` → `develop`
- [x] Open PR `develop` → `main`, wait for CI, merge
- [x] Delete all feature branches + `phase/6-daily-intelligence`
- [x] Mark Phase 6 as ✅ Complete in `Argus Details/product-plan.md`

---

## New Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/insights/safe-to-spend` | Safe amount + breakdown (cached or live) |
| `GET` | `/insights/pay-timing` | Card pay recommendations + bill stacking windows |
| `GET` | `/calendar` | Unified bills + subscriptions feed, sorted by due date |

---

## New Database Tables

```
safe_to_spend_cache — user_id, safe_amount, breakdown, computed_at
merchant_logos      — merchant, logo_url, fetched_at
```

---

## Definition of Done

- [x] Safe to Spend hero visible on dashboard with correct number
- [x] Calendar page loads bills + subscriptions sorted by date, urgency-coded
- [x] Pay timing returns correct card pay amounts (8% utilization target)
- [x] Both engines registered as Argus tools
- [x] CI green on main
