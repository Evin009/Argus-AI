# ArgusAI — Phase 3.5: AI Intelligence Upgrade

> Week 7. Goal: transform the Phase 3 intelligence layer from statistics + classification into a reasoning financial analyst with persistent memory that learns each user's financial behavior over time.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Backend | Two new Celery tasks — per-record enrichment (Layer 1) and analyst reasoning session (Layer 2) |
| Database | `ai_enrichment` columns on `bills` and `subscriptions`; new `user_financial_profiles` table |
| Frontend | Intelligence Feed page, Dashboard Latest Intelligence card, enrichment drawers on Bills and Subscriptions pages |
| AI | Financial analyst persona with prompt caching, three-tier memory (working + episodic + long-term profile), profile written back after every session |

---

## Why This Phase Exists

Phase 3 detects recurring bills and subscriptions using statistical pattern matching (median intervals, amount comparisons) and uses Claude only as a label printer for categorization. The system can tell you what happened — it cannot interpret it, remember it, or reason about what it means for you specifically.

Phase 3.5 adds two AI layers on top of the existing stat engines without modifying them:

- **Layer 1** enriches each detected bill and subscription with analyst-quality annotations — merchant context, confidence, duplicate detection, cancel recommendations.
- **Layer 2** runs a financial analyst reasoning session after every sync — receives the full enriched picture, reasons about it like a senior analyst, and produces structured decisions that grow more personalized with each session through a persistent user profile.

---

## Work Division

### Backend Track

| Area | Work |
|---|---|
| Migration 010 | Add `ai_enrichment JSONB` to `bills` and `subscriptions`; create `user_financial_profiles` table with RLS |
| Layer 1 | `enrich_detected_records_for_user` Celery task — one Claude call per sync, batches all bills + subscriptions, writes `ai_enrichment` back to each record |
| Layer 2 | `synthesize_insights_for_user` Celery task — loads 3 memory types, analyst persona (prompt cached), generates structured decisions, writes profile update |
| Insights router | `GET /insights` — returns `ai_insights` rows filtered by `insight_type=analyst_decision` |
| Chain | `detect_subscriptions` → `enrich_detected_records` → `synthesize_insights` |

### Database Track

| Table | Change |
|---|---|
| `bills` | Add `ai_enrichment JSONB` column |
| `subscriptions` | Add `ai_enrichment JSONB` column |
| `user_financial_profiles` | New table — `user_id`, `profile JSONB`, `analyst_version`, `last_enriched_at`, `last_updated` |

### Frontend Track

| Area | Work |
|---|---|
| Intelligence Feed | `app/(app)/intelligence/page.tsx` — analyst decision cards grouped by signal type, severity color-coded |
| Nav item | Add Intelligence to sidebar in `app/(app)/layout.tsx` |
| Dashboard card | Latest Intelligence card — 2 most recent warning/critical decisions, link to feed |
| Bills drawer | Click any bill → slide-out drawer with Layer 1 enrichment annotations |
| Subscriptions drawer | Click any subscription → slide-out drawer with service category, duplicate flag, cancel recommendation |

---

## Git Branch Structure

```
develop
└── phase/3.5-ai-intelligence-upgrade
      ├── feature/intelligence-enrichment     ← Layer 1 + Layer 2 backend
      ├── feature/insights-api                ← GET /insights endpoint
      └── feature/intelligence-frontend       ← Feed page, dashboard card, drawers
```

---

## Execution Checklist

### `feature/intelligence-enrichment`
*Layer 1 per-record enrichment + Layer 2 analyst reasoning session*

**Database:**
- [ ] Write and apply `backend/migrations/010_phase_3_5_intelligence.sql`
  - `ALTER TABLE bills ADD COLUMN IF NOT EXISTS ai_enrichment JSONB`
  - `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS ai_enrichment JSONB`
  - `CREATE TABLE user_financial_profiles (id, user_id UNIQUE, profile JSONB, analyst_version, last_enriched_at, last_updated)`
  - RLS policy on `user_financial_profiles`

**Layer 1 — `enrich_detected_records`:**
- [ ] Create `backend/tasks/enrich_detected_records.py`
  - `_SYSTEM_PROMPT` — analyst enrichment persona (used as cached system message)
  - `_build_enrichment_prompt(bills, subscriptions)` — batches all records into one prompt
  - `_parse_enrichment_response(response_text)` — returns `{"bills": [...], "subscriptions": [...]}`
  - `enrich_detected_records_for_user(user_id)` Celery task — one Claude call, writes `ai_enrichment` to each record, updates `last_enriched_at`, chains to Layer 2
- [ ] Write `backend/tests/test_enrich_detected_records.py` — unit tests for all 3 pure functions (8 tests)
- [ ] Add `"tasks.enrich_detected_records"` to Celery include list in `backend/celery_app.py`
- [ ] Chain: add `enrich_detected_records_for_user.delay(user_id)` at end of `detect_subscriptions_for_user`

**Layer 2 — `synthesize_insights`:**
- [ ] Create `backend/tasks/synthesize_insights.py`
  - `_ANALYST_SYSTEM_PROMPT` — financial analyst persona (prompt cached)
  - `_aggregate_transactions(transactions)` — groups last 90 days by category, computes monthly baseline and 30-day total
  - `_build_analyst_brief(accounts, bills, subscriptions, tx_summary, past_insights, profile)` — assembles full context for analyst
  - `_parse_synthesis_response(response_text)` — returns `{"decisions": [...], "updated_profile": {...}}`
  - `synthesize_insights_for_user(user_id)` Celery task — loads 3 memory types, calls Claude, writes decisions to `ai_insights`, upserts profile
- [ ] Write `backend/tests/test_synthesize_insights.py` — unit tests for all 3 pure functions (8 tests)
- [ ] Add `"tasks.synthesize_insights"` to Celery include list in `backend/celery_app.py`
- [ ] **Merged → `phase/3.5-ai-intelligence-upgrade`**

---

### `feature/insights-api`
*GET /insights endpoint*

- [ ] Create `backend/routers/insights.py`
  - `GET /insights` — queries `ai_insights` filtered by `insight_type=analyst_decision`, ordered by `created_at` desc
  - Supports `?limit=` (max 50) and `?signal_type=` query params
  - Signal type filtering done in Python (JSONB path filter)
- [ ] Register `insights` router in `backend/main.py`
- [ ] **Merged → `phase/3.5-ai-intelligence-upgrade`**

---

### `feature/intelligence-frontend`
*Intelligence Feed, Dashboard card, enrichment drawers*

- [ ] Create `frontend/app/(app)/intelligence/page.tsx`
  - Fetches `GET /insights?limit=50`
  - Renders analyst decision cards grouped by `signal_type` in priority order: risk → behavioral → anomaly → subscription → opportunity
  - Each card: title, severity chip (red/amber/blue), reasoning, recommendation, simulation (if present), confidence %
  - Empty state with link to sync accounts
- [ ] Add Intelligence nav item to `frontend/app/(app)/layout.tsx` (after Subscriptions, before first divider)
- [ ] Update `frontend/app/(app)/dashboard/page.tsx`
  - Add `AnalystDecision` type
  - Fetch `GET /insights?limit=2` in parallel with existing calls
  - Render Latest Intelligence card (full width, above Recent Transactions) when warning/critical decisions exist
- [ ] Update `frontend/app/(app)/bills/page.tsx`
  - Add `BillEnrichment` type and `ai_enrichment` field to `Bill` type
  - Add `selectedBill` state
  - Make bill rows clickable
  - Add enrichment drawer (slide-in from right) — shows merchant context, classification note, confidence, subscription candidate flag
- [ ] Update `frontend/app/(app)/subscriptions/page.tsx`
  - Add `SubscriptionEnrichment` type and `ai_enrichment` field to `Subscription` type
  - Add `selectedSub` state
  - Make subscription rows clickable
  - Add enrichment drawer — shows service category, price trend interpretation, duplicate flag + note, cancel recommendation + reasoning
- [ ] **Merged → `phase/3.5-ai-intelligence-upgrade`**

---

### Phase 3.5 Close
- [ ] Merge `phase/3.5-ai-intelligence-upgrade` → `develop`
- [ ] Open PR `develop` → `main`, wait for CI, merge
- [ ] Delete all feature branches + `phase/3.5-ai-intelligence-upgrade`
- [ ] Mark Phase 3.5 as ✅ Complete in `ROADMAP.md`

### Post-Close
- [ ] Deploy updated backend to Railway
- [ ] Deploy updated frontend to Vercel
- [ ] Run smoke test — trigger sync, verify `ai_enrichment` populated on bills/subscriptions, analyst decisions appear in Intelligence Feed, profile written to `user_financial_profiles`

---

## New Backend Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/insights` | Analyst decisions for current user, ordered by recency. Supports `?limit=` and `?signal_type=` |

> `GET /bills` and `GET /subscriptions` already use `select("*")` — `ai_enrichment` will appear in responses automatically once the migration runs. No router changes needed.

---

## New Celery Tasks

| Task | Trigger | Description |
|---|---|---|
| `enrich_detected_records_for_user` | After `detect_subscriptions` | One Claude call, annotates all bills + subscriptions, updates `last_enriched_at` |
| `synthesize_insights_for_user` | After `enrich_detected_records` | Analyst reasoning session — 3 memory types, generates decisions, writes profile |

### Updated Task Chain

```
sync_transactions
  → detect_bills
      → detect_subscriptions
          → enrich_detected_records      ← new
              → synthesize_insights      ← new
```

---

## Three-Tier Analyst Memory

| Memory Type | Source | What It Provides |
|---|---|---|
| Working memory | Current balances, enriched bills/subscriptions, last 90 days transactions | What is happening right now |
| Episodic memory | Last 5 `ai_insights` rows (ordered by `created_at` desc) | What the analyst noticed before |
| Long-term profile | `user_financial_profiles.profile` JSONB — Claude-authored | Who this user is financially |

The profile is written by the analyst after every session. It accumulates income patterns, spending baselines, behavioral patterns, known risks, and analyst notes. Each session starts with richer context than the last.

---

## Analyst Decision Shape

Each decision written to `ai_insights.structured_output_json`:

```json
{
  "signal_type": "behavioral | risk | opportunity | anomaly | subscription",
  "severity": "info | warning | critical",
  "title": "Dining spend is 40% above your 90-day baseline",
  "reasoning": "Interpretation, not description. References history where relevant.",
  "recommendation": "Specific action the user should take.",
  "simulation": "At current trajectory, dining reaches $480/month by August.",
  "confidence": 0.87,
  "sources": ["transactions:FOOD_AND_DRINK", "behavioral_baseline"]
}
```

---

## New Environment Variables

None — `ANTHROPIC_API_KEY` already required from Phase 3 AI categorization.

---

## New Dependencies

None — `anthropic>=0.25.0` already added in Phase 3.

---

## Database Tables Used

```sql
-- New table
user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users ON DELETE CASCADE,
  profile JSONB NOT NULL DEFAULT '{}',
  analyst_version INTEGER DEFAULT 1,
  last_enriched_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT now()
)

-- Modified (new column added to each)
bills.ai_enrichment JSONB
subscriptions.ai_enrichment JSONB
```

---

## New Files

| File | Purpose |
|---|---|
| `backend/migrations/010_phase_3_5_intelligence.sql` | Schema changes |
| `backend/tasks/enrich_detected_records.py` | Layer 1 Celery task |
| `backend/tasks/synthesize_insights.py` | Layer 2 Celery task |
| `backend/routers/insights.py` | `GET /insights` endpoint |
| `backend/tests/test_enrich_detected_records.py` | Layer 1 pure function tests |
| `backend/tests/test_synthesize_insights.py` | Layer 2 pure function tests |
| `frontend/app/(app)/intelligence/page.tsx` | Intelligence Feed page |

---

## Definition of Done

- [ ] Migration 010 applied — `ai_enrichment` columns exist, `user_financial_profiles` table exists with RLS
- [ ] After sync: bills and subscriptions have `ai_enrichment` populated with analyst annotations
- [ ] After sync: analyst decisions written to `ai_insights` with `insight_type=analyst_decision`
- [ ] After sync: `user_financial_profiles.profile` updated with behavioral patterns and analyst notes
- [ ] `GET /insights` returns analyst decisions in correct shape
- [ ] Intelligence Feed page renders cards grouped by signal type
- [ ] Dashboard Latest Intelligence card shows 2 most recent warning/critical decisions
- [ ] Bills drawer shows Layer 1 enrichment on click
- [ ] Subscriptions drawer shows Layer 1 enrichment on click
- [ ] All backend tests passing (target: 66+ tests, 16 new)
- [ ] CI green on `main`

---

## Critical Files

| File | Why it matters |
|---|---|
| `backend/tasks/synthesize_insights.py` | Core differentiator — reasoning analyst + learning profile is what separates ArgusAI from every other finance app |
| `backend/tasks/enrich_detected_records.py` | Data preparation for the analyst — clean enrichment is required for accurate reasoning in Layer 2 |
| `user_financial_profiles` table | The analyst's long-term memory — grows more valuable with every sync |
| `frontend/app/(app)/intelligence/page.tsx` | First surface where users see ArgusAI acting as an analyst, not just a dashboard |
