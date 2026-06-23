# ArgusAI — Phase 5: Argus Brain (Skeleton)

> Weeks 11–12. Goal: stand up Argus as living infrastructure — alive with whatever tools exist today (categorization, bills, subscriptions from Phase 3.5), built to grow as later phases add engines without rearchitecting. Most important phase in the remaining roadmap; everything after this is Argus gaining new senses.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Database | `ai_predictions` outcome ledger table |
| Backend | LangGraph supervisor graph, tool registry, outcome-resolution Celery task, `POST /argus/chat` SSE endpoint with RAG |
| Frontend | Argus chat page, Cmd+K side panel (context-aware, persists across navigation) |
| Infra | New Celery task for periodic outcome resolution |

**Note:** `backend/agents/` already exists from Phase 3.5 (`graph.py`, `analyst_agent.py`, `enrichment_agent.py`, `memory_agent.py`) — that's a background pipeline that runs after transaction sync. Phase 5's supervisor graph is a separate, new graph for live interactive chat — different purpose, same package.

---

## Git Branch Structure

```
develop
└── phase/5-argus-brain
      ├── feature/outcome-ledger
      ├── feature/supervisor-graph
      ├── feature/argus-chat-api
      ├── feature/argus-chat-ui
      └── feature/argus-side-panel
```

---

## Execution Checklist

### `feature/outcome-ledger` ⬜
*Every prediction Argus makes gets logged and later graded*

**Backend:**
- [ ] Migration — `ai_predictions` table: `id`, `user_id`, `prediction_type`, `prediction_payload JSONB`, `predicted_at`, `resolves_at`, `actual_outcome JSONB`, `was_accurate BOOLEAN`, RLS policy
- [ ] `backend/tasks/resolve_predictions.py` — Celery task, runs periodically, checks unresolved predictions (`resolves_at <= now()`) against actual transaction/balance data, fills `actual_outcome` + `was_accurate`
- [ ] Tests for the resolution logic (pure function, mocked Supabase)
- [ ] Merge → `develop`

---

### `feature/supervisor-graph` ⬜
*Argus's routing brain — starts small, grows without rearchitecting*

**Backend:**
- [ ] `backend/agents/tools.py` — tool registry pattern; new engine tools register themselves here as later phases ship
- [ ] Register Phase 3.5's existing capabilities (categorization, bills, subscriptions) as the first tools
- [ ] `backend/agents/supervisor.py` — LangGraph supervisor graph routing queries to specialist nodes based on available tools
- [ ] Tests for tool registration and routing logic
- [ ] Merge → `develop`

---

### `feature/argus-chat-api` ⬜
*The endpoint the frontend actually talks to*

**Backend:**
- [ ] `backend/routers/argus.py` — `POST /argus/chat` SSE streaming endpoint
- [ ] RAG retrieval wired in: hot transactions (pgvector, last 90 days) + distilled monthly summaries (`ai_insights`) + profile (`user_financial_profiles`) + outcome ledger (relevant past predictions + accuracy for this user)
- [ ] Every response that makes a prediction/recommendation logs to `ai_predictions`
- [ ] Tests for the endpoint (mocked RAG + supervisor)
- [ ] Merge → `develop`

---

### `feature/argus-chat-ui` ⬜
*Where users actually talk to Argus*

**Frontend:**
- [ ] `app/(app)/argus/page.tsx` — chat page, SSE streaming consumption
- [ ] Responses render as charts/tables/verdict cards — no paragraph-only responses (per the Specificity rule in `Argus Details/product-detail.md`)
- [ ] Merge → `develop`

---

### `feature/argus-side-panel` ⬜
*Argus everywhere, not just its own page*

**Frontend:**
- [ ] Side panel component — slides in from right (380px)
- [ ] Cmd+K trigger from any screen
- [ ] Context-aware per current screen (knows what page the user is on)
- [ ] Conversation persists across navigation (not reset per route change)
- [ ] Merge → `develop`

---

### Phase 5 Close
- [ ] Merge `phase/5-argus-brain` → `develop`
- [ ] Open PR `develop` → `main`, wait for CI, merge
- [ ] Delete all feature branches + `phase/5-argus-brain`
- [ ] Mark Phase 5 as ✅ Complete in `Argus Details/product-plan.md`

---

## New Backend Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/argus/chat` | SSE streaming chat endpoint, RAG-grounded, routes through supervisor graph |

---

## Database Tables Used

```sql
ai_predictions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  prediction_type TEXT,
  prediction_payload JSONB,
  predicted_at TIMESTAMPTZ,
  resolves_at TIMESTAMPTZ,
  actual_outcome JSONB,
  was_accurate BOOLEAN
)
```

---

## Definition of Done

- [ ] Outcome ledger live, predictions logged and later resolved
- [ ] Supervisor graph routes to whatever tools exist today (categorization, bills, subscriptions)
- [ ] `/argus/chat` answers questions grounded in real data, never invents a number
- [ ] Chat page + Cmd+K side panel both live, side panel works from any screen
- [ ] CI green on `main`

---

## Critical Files

| File | Why it can't be skipped |
|---|---|
| `backend/agents/tools.py` | The registry pattern every later phase's engine (Cashflow, Goal Planning, Card Routing, Credit) plugs into — get this wrong and every later phase needs rearchitecting |
| `backend/migrations/0XX_ai_predictions.sql` | Self-improvement loop depends on this existing before Argus ever answers its first question |
| `backend/routers/argus.py` | The actual product — every other Phase 5 file exists to support this endpoint |
