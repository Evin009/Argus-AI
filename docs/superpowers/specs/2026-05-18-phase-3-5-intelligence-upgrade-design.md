# ArgusAI — Phase 3.5: Intelligence Upgrade Design

**Date:** 2026-05-18  
**Status:** Approved  
**Branch:** `phase/3.5-intelligence-upgrade`

---

## Problem

Phase 3 is statistics with a classification skin. Bill detection uses median interval math with hardcoded thresholds. Subscription detection computes a percentage diff between two 60-day windows. Categorization uses Claude as a label printer — no reasoning, no context, no memory. The system can tell you what happened. It cannot interpret it, remember it, or reason about what it means.

---

## Goal

Upgrade the intelligence layer so it reasons like a financial analyst: interprets detected patterns, simulates forward implications, builds a persistent model of each user's financial behavior, and produces structured actionable decisions — not summaries.

---

## Scope

Phase 3.5 is a new phase after Phase 3 completes. It does not modify existing Phase 3 tasks. All additions are net-new Celery tasks, schema columns, a new table, and new frontend surfaces.

---

## Architecture

### Pipeline

The existing Phase 3 chain:

```
sync_transactions → detect_bills → detect_subscriptions
```

Phase 3.5 extends it:

```
sync_transactions
  → detect_bills
      → detect_subscriptions
          → enrich_detected_records      ← Layer 1
              → synthesize_insights      ← Layer 2
```

Both new tasks are Celery tasks chained to the existing pipeline. `recategorize_transactions` remains manual-only and is not part of this chain.

---

## Layer 1 — Per-Record Enrichment (`enrich_detected_records`)

**Purpose:** Annotate each detected bill and subscription with analyst-quality context so Layer 2 has clean, interpreted inputs.

**Mechanism:** One Claude call per sync. All bills and subscriptions for the user are batched into a single prompt. Claude returns a JSON array of annotations, one per record.

### Bill annotations (`bills.ai_enrichment` JSONB)

```json
{
  "ai_confidence": 0.91,
  "merchant_context": "Monthly streaming service — video content",
  "classification_note": "4 charges on consistent 30-day intervals, amounts stable within ±$0.01",
  "is_subscription_candidate": true
}
```

### Subscription annotations (`subscriptions.ai_enrichment` JSONB)

```json
{
  "service_category": "streaming",
  "duplicate_flag": true,
  "duplicate_note": "Overlaps with Netflix and Disney+ — all three are video streaming",
  "price_trend_interpretation": "Price increased 12% over 90 days, above typical annual adjustment range",
  "cancel_recommendation": true,
  "cancel_reasoning": "Duplicate service category with two existing subscriptions"
}
```

### Schema changes

```sql
ALTER TABLE bills ADD COLUMN ai_enrichment JSONB;
ALTER TABLE subscriptions ADD COLUMN ai_enrichment JSONB;
```

Enrichment is additive. Existing records are untouched until re-enriched.

### Skip condition

If no new bills or subscriptions were detected in the current sync (compared to `user_financial_profiles.last_enriched_at`), Layer 1 is skipped. Bills and subscriptions already have enrichment from the prior run.

---

## Layer 2 — Financial Analyst Reasoning Session (`synthesize_insights`)

**Purpose:** Reason like a senior financial analyst across the user's complete financial picture. Produce structured decisions — not descriptions. Surface what the user wouldn't notice themselves.

### Three memory types

| Type | Source | Scope |
|---|---|---|
| Working memory | Current balances, enriched bills, enriched subscriptions, last 90 days transactions aggregated by category/week | This sync |
| Episodic memory | Past `ai_insights` rows retrieved via pgvector similarity search | Relevant prior decisions |
| Long-term profile | `user_financial_profiles.profile` JSONB | Persistent across all sessions |

### Analyst persona (system prompt)

> You are ArgusAI's financial intelligence analyst. You have access to a complete financial picture for this user. Reason like a senior financial analyst: identify what matters, simulate forward implications, and produce structured actionable decisions. Never describe data — interpret it. Never state the obvious — surface what the user would not notice themselves. Use the user's profile and history to personalize your analysis. Reference prior patterns where relevant.

### Output — `analyst_decisions` array

Each decision is written as a row in `ai_insights` with `insight_type: "analyst_decision"`:

```json
{
  "signal_type": "behavioral | risk | opportunity | anomaly | subscription",
  "severity": "info | warning | critical",
  "title": "Dining spend is 40% above your 90-day baseline",
  "reasoning": "Your dining category averaged $280/mo over the past 90 days. The last 30 days show $392. This is not a one-time spike — it has been climbing weekly for 3 consecutive weeks, which suggests a behavioral shift, not an event.",
  "recommendation": "At current trajectory, dining will cost an additional $1,344 this year. Consider a soft monthly limit of $300.",
  "simulation": "At current trajectory, dining reaches $480/month by August 2026.",
  "confidence": 0.87,
  "sources": ["transactions:FOOD_AND_DRINK", "behavioral_baseline"]
}
```

### Profile update

After generating decisions, the analyst writes back to `user_financial_profiles.profile`. It appends newly observed patterns, updates confidence scores on existing patterns, marks resolved issues, and adds analyst notes. The profile is Claude-authored — not a computed stats object.

---

## Persistent User Financial Profile

### Table

```sql
CREATE TABLE user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users ON DELETE CASCADE,
  profile JSONB NOT NULL DEFAULT '{}',
  analyst_version INTEGER DEFAULT 1,
  last_enriched_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT now()
);
```

### Profile shape

```json
{
  "income_pattern": {
    "typical_amount": 4200,
    "frequency": "bi-weekly",
    "typical_days": [1, 15],
    "reliability": "high",
    "confidence": 0.91
  },
  "spending_baselines": {
    "FOOD_AND_DRINK": { "monthly_avg": 280, "volatility": "medium" },
    "ENTERTAINMENT": { "monthly_avg": 120, "volatility": "low" },
    "TRANSPORTATION": { "monthly_avg": 95, "volatility": "low" }
  },
  "behavioral_patterns": [
    {
      "pattern": "dining_spike_post_payday",
      "description": "Dining spend increases ~40% in the 5 days after income deposits",
      "confidence": 0.83,
      "first_observed": "2025-02",
      "still_active": true
    }
  ],
  "known_risks": ["subscription_creep", "irregular_income_months"],
  "analyst_notes": "User has 3 overlapping streaming services. Responded to March subscription recommendation — cancelled one service the following week.",
  "resolved_patterns": []
}
```

The profile grows with each session. The analyst decides what is meaningful enough to record, when to adjust confidence, and when a pattern is resolved. This is qualitative judgment, not arithmetic.

---

## Learning Loop

```
Session N:
  1. Load profile           (long-term memory — what I know about this user)
  2. Load past insights     (episodic memory — what I noticed before)
  3. Load current data      (working memory — what is happening now)
  4. Reason → generate decisions
  5. Write back to profile  (update patterns, confidence, notes)

Session N+1:
  Analyst starts with richer context than Session N
```

After 6 months the analyst knows: income schedule, post-payday behavioral patterns, subscription signup habits, responsiveness to prior recommendations. Every session is personalized.

---

## New API Endpoint

| Method | Path | Description |
|---|---|---|
| `GET` | `/insights` | Returns `ai_insights` rows for the current user, filtered by `insight_type=analyst_decision`, ordered by `created_at` desc. Supports `?limit=` and `?signal_type=` query params. |

Existing `GET /bills` and `GET /subscriptions` responses are updated to include `ai_enrichment` in each record.

---

## Frontend

### New page: `app/(app)/intelligence/page.tsx`

Intelligence Feed. Fetches `GET /insights`. Renders analyst decision cards grouped by `signal_type`. Each card shows: title, severity chip (color-coded), reasoning, recommendation, simulation (if present). Cards are sorted by severity then recency.

### Dashboard update

New "Latest Intelligence" card — shows the 2 most recent `warning` or `critical` decisions. Links to the full Intelligence Feed.

### Enrichment drawer

Bills and subscriptions pages: clicking a record opens a detail drawer rendering the `ai_enrichment` JSON — merchant context, confidence, analyst notes, duplicate flags, cancel recommendation.

---

## Cost & Reliability

### Cost controls

- Layer 1 is one Claude call per sync (all records batched), not one call per record.
- Layer 2 system prompt (analyst persona + schema) uses Anthropic prompt caching. Only the variable financial context is billed per call.
- Both layers are skipped if no new data since `last_enriched_at`.

### Reliability

- Both tasks are wrapped in try/except. Failures degrade gracefully — records remain intact without enrichment, prior profile is preserved.
- Profile updates are atomic — no partial writes.
- Both tasks are idempotent — safe to re-run, overwrites prior enrichment, appends new insight batch.
- RLS policies on `user_financial_profiles` and `ai_insights` enforce user-scoped access.

---

## New Files

| File | Purpose |
|---|---|
| `backend/tasks/enrich_detected_records.py` | Layer 1 Celery task |
| `backend/tasks/synthesize_insights.py` | Layer 2 Celery task |
| `backend/routers/insights.py` | `GET /insights` endpoint |
| `backend/migrations/010_phase_3_5_intelligence.sql` | Adds `ai_enrichment` columns + `user_financial_profiles` table |
| `frontend/app/(app)/intelligence/page.tsx` | Intelligence Feed page |

---

## Definition of Done

- [ ] `user_financial_profiles` table created with RLS
- [ ] `bills.ai_enrichment` and `subscriptions.ai_enrichment` columns added
- [ ] `enrich_detected_records` task runs after subscription detection, annotates all records in one Claude call
- [ ] `synthesize_insights` task runs after enrichment, produces analyst decisions in `ai_insights`
- [ ] Profile is written and updated after each synthesis session
- [ ] Episodic memory (pgvector retrieval) injected into analyst context
- [ ] `GET /insights` endpoint returns analyst decisions
- [ ] Intelligence Feed page renders decisions grouped by signal type
- [ ] Dashboard "Latest Intelligence" card shows 2 most recent warnings/criticals
- [ ] Bills + subscriptions detail drawer shows `ai_enrichment`
- [ ] Prompt caching active on analyst system prompt
- [ ] All tasks degrade gracefully on failure
- [ ] CI green
