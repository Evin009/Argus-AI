# ArgusAI — Phase 4: Schema Fixes + Onboarding

> Week 10. Goal: fix missing `accounts` schema fields and build the onboarding questionnaire before any Phase 5 (Argus Brain) work begins.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Database | `closing_date`/`minimum_payment` on `accounts`; new `onboarding_responses` table |
| Backend | Onboarding API, seeding `user_financial_profiles` from responses |
| Frontend | 4-chapter stepped onboarding flow, gating bank linking |

---

## Git Branch Structure

```
develop
└── phase/4-schema-onboarding
      ├── feature/schema-migration
      ├── feature/onboarding-api
      └── feature/onboarding-ui
```

---

## Execution Checklist

### `feature/schema-migration` ✅
*Add missing `accounts` fields, create `onboarding_responses` table*

- [x] Create `backend/migrations/012_phase_4_schema_fixes.sql`:
  - `ALTER TABLE accounts ADD COLUMN closing_date DATE`
  - `ALTER TABLE accounts ADD COLUMN minimum_payment DECIMAL`
  - `CREATE TABLE onboarding_responses` — `user_id`, `income`, `pay_schedule`, `rent`, `major_expenses JSONB`, `goals JSONB`, `risk_tolerance`, `completed_at`
  - RLS enabled, `onboarding_responses_user_policy` scoped to `auth.uid()`
- [x] Apply migration to Supabase — verified via `supabase db query --linked` (columns + table confirmed)
- [x] Merge → `develop` — complete

---

### `feature/onboarding-api` ✅
*Persist onboarding answers, seed profile*

**Backend:**
- [x] Build `backend/routers/onboarding.py` — `POST /onboarding`
- [x] Build `GET /onboarding/status`
- [x] Upsert into `onboarding_responses` (one row per user)
- [x] Seed `user_financial_profiles` from completed onboarding data
- [x] Write `backend/tests/test_onboarding.py`
- [x] Merge → `develop`

---

### `feature/onboarding-ui` ✅
*6-chapter journey experience (expanded post-launch from the original 4-chapter spec — added Debt and Spending Behavior chapters, custom character illustrations, and a redesigned curved split-card layout; see migration 013 for the added schema fields)*

**Frontend:**
- [x] Build onboarding flow — Chapter 1: income/pay schedule, Chapter 2: fixed expenses, Chapter 3: goals, Chapter 4: spending nature/risk tolerance
- [x] Progress indicator per chapter
- [x] Gate bank linking behind onboarding completion — skip option with reminder
- [x] Merge → `develop`

---

### Phase 4 Close
- [ ] Merge `phase/4-schema-onboarding` → `develop`
- [ ] Open PR `develop` → `main`, wait for CI, merge
- [ ] Delete all feature branches + `phase/4-schema-onboarding`
- [ ] Mark Phase 4 as ✅ Complete in `Argus Details/product-plan.md`

---

## New Backend Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/onboarding` | Save onboarding chapter answers |
| `GET` | `/onboarding/status` | Whether current user has completed onboarding |

---

## Database Tables Used

```sql
onboarding_responses (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users,
  income DECIMAL,
  pay_schedule TEXT,
  rent DECIMAL,
  major_expenses JSONB,
  goals JSONB,
  risk_tolerance TEXT,
  completed_at TIMESTAMPTZ
)
```

---

## Definition of Done

- [x] Migration applied to Supabase
- [x] Onboarding flow live, gates bank linking
- [x] `user_financial_profiles` seeded from onboarding answers day one
- [ ] CI green on `main`

---

## Critical Files

| File | Why it can't be skipped |
|---|---|
| `backend/migrations/012_phase_4_schema_fixes.sql` | Pay Timing Intelligence (Phase 6) and Credit Intelligence (Phase 9) require `closing_date`/`minimum_payment` |
| `backend/routers/onboarding.py` | Argus (Phase 5) needs `user_financial_profiles` seeded to ground its reasoning in real user data |
