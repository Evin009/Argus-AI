# ArgusAI — Phase 3.5: AI Intelligence Upgrade

> Week 9. Goal: transform the Phase 3 intelligence layer from statistics + classification into a reasoning financial analyst with persistent semantic memory that learns each user's financial behavior over time.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Backend | LangGraph `StateGraph` with three agent nodes (Enrichment → Analyst → Memory) wrapped in a single Celery entry point |
| Database | `ai_enrichment` columns on `bills` and `subscriptions`; new `user_financial_profiles` table; `embedding vector(1536)` on `ai_insights` + pgvector RPC for semantic retrieval |
| Frontend | Intelligence Feed page, Dashboard Latest Intelligence card, enrichment drawers on Bills and Subscriptions pages |
| AI | Financial analyst persona with prompt caching, three-tier memory (working + semantic episodic via RAG + long-term profile), profile written back after every session |

---

## Why This Phase Exists

Phase 3 detects recurring bills and subscriptions using statistical pattern matching (median intervals, amount comparisons) and uses Claude only as a label printer for categorization. The system can tell you what happened — it cannot interpret it, remember it, or reason about what it means for you specifically.

Phase 3.5 adds a multi-agent reasoning layer on top of the existing stat engines without modifying them:

- **EnrichmentNode** annotates each detected bill and subscription with analyst-quality context — merchant background, confidence, duplicate detection, cancel recommendations.
- **AnalystNode** runs a financial reasoning session after every sync — receives the full enriched picture plus semantically relevant past decisions retrieved via pgvector RAG, reasons like a senior analyst, and produces structured decisions that grow more personalized with each session.
- **MemoryNode** persists the session output — embeds each decision for future RAG retrieval and updates the long-term user profile.

The original recency-based episodic memory (last 5 decisions by `created_at`) is replaced with **semantic RAG retrieval**: the current financial context is embedded and compared against all past decisions via cosine similarity, so the most *relevant* history surfaces regardless of when it was written.

---

## Architecture

```
detect_subscriptions
        ↓
run_intelligence_pipeline_for_user  (Celery task)
        │
        ├── Fetch: accounts, bills, subscriptions, transactions (500), profile
        ├── Compute: tx_summary (_aggregate_transactions)
        ├── RAG: embed current context → match_insights_by_embedding() → top-5 relevant past decisions
        │         (fallback: recency query if no embeddings exist yet — cold-start safety)
        │
        └── LangGraph StateGraph.invoke(initial_state)
                    │
                    ▼
             EnrichmentNode  →  AnalystNode  →  MemoryNode  →  END
```

**State flows as `IntelligenceState` TypedDict.** Each node receives the full state and returns only the keys it modifies — LangGraph merges them automatically.

---

## Work Division

### Backend Track

| Area | Work |
|---|---|
| Migration 010 | Add `ai_enrichment JSONB` to `bills` and `subscriptions`; create `user_financial_profiles` table with RLS |
| Migration 011 | Add `embedding vector(1536)` to `ai_insights`; create `ivfflat` index; create `match_insights_by_embedding()` RPC |
| `agents/enrichment_agent.py` | `enrichment_node` — one Claude call, annotates all bills + subscriptions, merges enrichment into state |
| `agents/analyst_agent.py` | `analyst_node` — reads RAG-retrieved past insights from state, generates structured decisions + updated profile |
| `agents/memory_agent.py` | `memory_node` — embeds each decision, inserts to `ai_insights` with embedding, upserts profile |
| `agents/graph.py` | Compiled LangGraph `StateGraph` singleton |
| `tasks/run_intelligence_pipeline.py` | Single Celery entry point — fetches data, runs RAG, invokes graph |
| Insights router | `GET /insights` — returns `ai_insights` rows filtered by `insight_type=analyst_decision` |
| Chain | `detect_subscriptions` → `run_intelligence_pipeline` |

### Database Track

| Table | Change |
|---|---|
| `bills` | Add `ai_enrichment JSONB` column (migration 010) |
| `subscriptions` | Add `ai_enrichment JSONB` column (migration 010) |
| `user_financial_profiles` | New table — `user_id`, `profile JSONB`, `analyst_version`, `last_enriched_at`, `last_updated` (migration 010) |
| `ai_insights` | Add `embedding vector(1536)` column + `ivfflat` index + `match_insights_by_embedding()` RPC (migration 011) |

### Frontend Track

| Area | Work |
|---|---|
| Intelligence Feed | `app/(app)/intelligence/page.tsx` — analyst decision cards grouped by signal type, severity color-coded |
| Nav item | Add Intelligence to sidebar in `app/(app)/layout.tsx` (after Subscriptions, before first divider) |
| Dashboard card | Latest Intelligence card — 2 most recent warning/critical decisions, link to feed |
| Bills drawer | Click any bill → slide-out drawer with enrichment annotations |
| Subscriptions drawer | Click any subscription → slide-out drawer with service category, duplicate flag, cancel recommendation |

---

## Git Branch Structure

```
develop
└── phase/3.5-ai-intelligence-upgrade
      ├── feature/intelligence-enrichment     ← backend agents + pipeline + migration 011
      ├── feature/insights-api                ← GET /insights endpoint
      └── feature/intelligence-frontend       ← Feed page, dashboard card, drawers
```

---

## Execution Checklist

### `feature/intelligence-enrichment`
*LangGraph agent pipeline — migrations, agents package, Celery entry point*

**Database:**
- [x] Write and apply `backend/migrations/010_phase_3_5_intelligence.sql`
  - `ALTER TABLE bills ADD COLUMN IF NOT EXISTS ai_enrichment JSONB`
  - `ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS ai_enrichment JSONB`
  - `CREATE TABLE user_financial_profiles (id, user_id UNIQUE, profile JSONB, analyst_version, last_enriched_at, last_updated)`
  - RLS policy on `user_financial_profiles` scoped to `auth.uid()`
- [x] Write and apply `backend/migrations/011_ai_insights_embedding.sql`
  - `ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS embedding vector(1536)`
  - `CREATE INDEX ai_insights_embedding_idx USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)`
  - `CREATE OR REPLACE FUNCTION match_insights_by_embedding(query_embedding, match_threshold, match_count, p_user_id)` — cosine similarity filter on `insight_type = 'analyst_decision'` and non-null embedding

**Agents package:**
- [x] Create `backend/agents/__init__.py` (empty)
- [x] Create `backend/agents/state.py` — `IntelligenceState` TypedDict with 10 fields
- [x] Create `backend/agents/enrichment_agent.py`
  - Pure functions: `_SYSTEM_PROMPT`, `_build_enrichment_prompt(bills, subscriptions)`, `_parse_enrichment_response(text)`
  - `enrichment_node(state)` — calls Claude, writes `ai_enrichment` to DB, merges enrichment into in-memory state; early-returns for empty input
- [x] Create `backend/agents/analyst_agent.py`
  - Pure functions: `_ANALYST_SYSTEM_PROMPT`, `_aggregate_transactions(txns)`, `_build_analyst_brief(...)`, `_parse_synthesis_response(text)`
  - `analyst_node(state)` — reads `state["relevant_past_insights"]` (includes similarity scores from RAG), calls Claude, returns decisions + updated profile
- [x] Create `backend/agents/memory_agent.py`
  - `_embed_text(text)` — OpenAI text-embedding-3-small, 1536-dim
  - `memory_node(state)` — inserts each decision to `ai_insights` with embedding; upserts profile to `user_financial_profiles`; silently skips embedding on failure
- [x] Create `backend/agents/graph.py` — `build_intelligence_graph()` → compiled `StateGraph` singleton `intelligence_graph`

**Pipeline task:**
- [x] Create `backend/tasks/run_intelligence_pipeline.py`
  - `_build_rag_query_text(accounts, bills, subscriptions)` — pure function building a text summary of current financial state for embedding
  - `_retrieve_relevant_insights(user_id, query_text, threshold=0.6, count=5)` — embeds query, calls `match_insights_by_embedding` RPC, silently returns `[]` on error
  - `run_intelligence_pipeline_for_user(user_id)` Celery task — fetches data, computes tx_summary, runs RAG (with recency fallback), invokes graph, returns `{"user_id": ..., "decisions_written": N}`
- [x] Add `"tasks.run_intelligence_pipeline"` to Celery include list in `backend/celery_app.py`
- [x] Remove `"tasks.enrich_detected_records"` and `"tasks.synthesize_insights"` from include list
- [x] Update chain in `detect_subscriptions_for_user`: call `run_intelligence_pipeline_for_user.delay(user_id)`
- [x] Stub out `backend/tasks/enrich_detected_records.py` (deprecation comment only)
- [x] Stub out `backend/tasks/synthesize_insights.py` (deprecation comment only)

**Tests:**
- [x] Update imports in `backend/tests/test_enrich_detected_records.py` → `agents.enrichment_agent`
- [x] Update imports in `backend/tests/test_synthesize_insights.py` → `agents.analyst_agent`
- [x] Write `backend/tests/test_agents.py` — 10 tests across enrichment_node, analyst_node, memory_node, graph smoke test
- [x] Write `backend/tests/test_run_intelligence_pipeline.py` — 5 tests for RAG helpers and pipeline task

---

### `feature/insights-api`
*GET /insights endpoint*

- [x] Create `backend/routers/insights.py`
  - `GET /insights` — queries `ai_insights` filtered by `insight_type=analyst_decision`, ordered by `created_at` desc
  - Supports `?limit=` (max 50) and `?signal_type=` query params
- [x] Register `insights` router in `backend/main.py`

---

### `feature/intelligence-frontend`
*Intelligence Feed, Dashboard card, enrichment drawers*

- [x] Create `frontend/app/(app)/intelligence/page.tsx`
- [x] Add Intelligence nav item to `frontend/app/(app)/layout.tsx`
- [x] Update `frontend/app/(app)/dashboard/page.tsx` — Latest Intelligence card
- [x] Update `frontend/app/(app)/bills/page.tsx` — enrichment drawer
- [x] Update `frontend/app/(app)/subscriptions/page.tsx` — enrichment drawer

---

### Phase 3.5 Close
- [ ] Merge `phase/3.5-ai-intelligence-upgrade` → `main`
- [ ] Delete all feature branches + `phase/3.5-ai-intelligence-upgrade`
- [ ] Mark Phase 3.5 as ✅ Complete in `ROADMAP.md`

### Post-Close
- [ ] Deploy updated backend to Railway
- [ ] Deploy updated frontend to Vercel
- [ ] Run smoke test — trigger sync, verify `ai_enrichment` populated on bills/subscriptions, analyst decisions appear in Intelligence Feed with embeddings, profile written to `user_financial_profiles`, second run retrieves past decisions via RAG (not fallback)

---

## New Backend Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/insights` | Analyst decisions for current user, ordered by recency. Supports `?limit=` and `?signal_type=` |

> `GET /bills` and `GET /subscriptions` already use `select("*")` — `ai_enrichment` appears in responses automatically once migration 010 runs.

---

## Updated Task Chain

```
sync_transactions
  → detect_bills
      → detect_subscriptions
          → run_intelligence_pipeline   ← replaces enrich + synthesize
                (LangGraph: EnrichmentNode → AnalystNode → MemoryNode)
```

---

## Three-Tier Analyst Memory

| Memory Type | Source | What It Provides |
|---|---|---|
| Working memory | Current balances, enriched bills/subscriptions, last 90 days transactions | What is happening right now |
| Semantic episodic memory | Top-5 past `ai_insights` rows retrieved via pgvector cosine similarity | The most *relevant* prior analyst decisions — ranked by similarity to current situation, not by recency |
| Long-term profile | `user_financial_profiles.profile` JSONB — Claude-authored | Who this user is financially |

The profile is written by MemoryNode after every session. Episodic memory improves over time: on the first run there are no embeddings (cold-start fallback uses recency), but after MemoryNode runs once, all subsequent sessions use semantic RAG retrieval.

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

## New Dependencies

| Package | Version | Purpose |
|---|---|---|
| `langgraph` | `>=0.2` | `StateGraph` for multi-node agent pipeline |

`anthropic>=0.25.0` and `openai` already required from Phase 3.

---

## Database Tables Used

```sql
-- New table (migration 010)
user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users ON DELETE CASCADE,
  profile JSONB NOT NULL DEFAULT '{}',
  analyst_version INTEGER DEFAULT 1,
  last_enriched_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT now()
)

-- Modified (migration 010)
bills.ai_enrichment JSONB
subscriptions.ai_enrichment JSONB

-- Modified (migration 011)
ai_insights.embedding vector(1536)
-- + ivfflat index + match_insights_by_embedding() RPC
```

---

## New Files

| File | Purpose |
|---|---|
| `backend/migrations/010_phase_3_5_intelligence.sql` | Schema: ai_enrichment columns + user_financial_profiles table |
| `backend/migrations/011_ai_insights_embedding.sql` | Schema: embedding column + ivfflat index + pgvector RPC |
| `backend/agents/__init__.py` | Package init |
| `backend/agents/state.py` | `IntelligenceState` TypedDict |
| `backend/agents/enrichment_agent.py` | Enrichment node — annotates bills + subscriptions |
| `backend/agents/analyst_agent.py` | Analyst node — reasoning session with RAG memory |
| `backend/agents/memory_agent.py` | Memory node — embeds decisions, upserts profile |
| `backend/agents/graph.py` | Compiled `StateGraph` singleton |
| `backend/tasks/run_intelligence_pipeline.py` | Celery entry point — wraps graph + RAG retrieval |
| `backend/routers/insights.py` | `GET /insights` endpoint |
| `backend/tests/test_agents.py` | Agent node + graph tests (10 tests) |
| `backend/tests/test_run_intelligence_pipeline.py` | Pipeline task + RAG helper tests (5 tests) |
| `frontend/app/(app)/intelligence/page.tsx` | Intelligence Feed page |

### Deprecated (stubbed, not deleted)

| File | Status |
|---|---|
| `backend/tasks/enrich_detected_records.py` | Stub — logic moved to `agents/enrichment_agent.py` |
| `backend/tasks/synthesize_insights.py` | Stub — logic moved to `agents/analyst_agent.py` |

---

## Definition of Done

- [x] Migration 010 applied — `ai_enrichment` columns exist, `user_financial_profiles` table exists with RLS
- [x] Migration 011 applied — `ai_insights.embedding vector(1536)` exists, `match_insights_by_embedding()` RPC callable
- [x] LangGraph graph verified: `['__start__', 'enrichment', 'analyst', 'memory', '__end__']`
- [x] After sync: bills and subscriptions have `ai_enrichment` populated with analyst annotations
- [x] After sync: analyst decisions written to `ai_insights` with `insight_type=analyst_decision` and non-null `embedding`
- [x] After sync: `user_financial_profiles.profile` updated with behavioral patterns and analyst notes
- [x] `GET /insights` returns analyst decisions in correct shape
- [x] Intelligence Feed page renders cards grouped by signal type
- [x] Dashboard Latest Intelligence card shows 2 most recent warning/critical decisions
- [x] Bills drawer shows enrichment on click
- [x] Subscriptions drawer shows enrichment on click
- [x] All backend tests passing (80 tests, 7 pre-existing network-dependent failures excluded)
- [ ] CI green on `main`

---

## Critical Files

| File | Why it matters |
|---|---|
| `backend/agents/analyst_agent.py` | Core differentiator — reasoning analyst + semantic memory is what separates ArgusAI from every other finance app |
| `backend/agents/memory_agent.py` | Closes the feedback loop — embeddings enable semantic retrieval in future sessions |
| `backend/tasks/run_intelligence_pipeline.py` | Single entry point — owns data fetching, RAG retrieval, graph invocation |
| `backend/migrations/011_ai_insights_embedding.sql` | Enables pgvector semantic search — without this, episodic memory is recency-only |
| `user_financial_profiles` table | The analyst's long-term memory — grows more valuable with every sync |
| `frontend/app/(app)/intelligence/page.tsx` | First surface where users see ArgusAI acting as an analyst, not just a dashboard |
