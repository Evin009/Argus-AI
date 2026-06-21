# ArgusAI — Project Guide

AI-powered financial intelligence system. Not a budgeting app — Argus predicts
what's about to happen to your finances and tells you what to do about it.

## Source of Truth

| Doc | Contents |
|---|---|
| `Argus Details/product-detail.md` | Full product spec, features, Argus architecture |
| `Argus Details/product-plan.md` | 12-phase roadmap, current phase status |
| `backend/migrations/*.sql` | Actual DB schema — always current, don't duplicate it elsewhere |

This file is operating instructions for AI agents working in this repo. For
product/feature detail, go to the docs above instead of asking here.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router, TS), Tailwind, Zustand + TanStack Query |
| Backend | FastAPI (Python 3.11+) |
| Auth | Supabase Auth (JWT, RLS-enforced) |
| Data | Supabase Postgres + pgvector, Redis + Celery |
| AI | Claude Sonnet 4.6, LangGraph multi-agent, text-embedding-3-small |
| Bank data | Plaid API |
| Hosting | Vercel (frontend), Railway (backend + Celery) |

Local dev: `infra/dev-up.sh` starts API + Celery + Redis via Docker Compose. See
`.claude/skills/deploy-backend`.

---

## Architecture Principles

- **Argus is core infrastructure, not a feature.** It starts alive with whatever
  tools exist and gains new ones as each engine ships (tool registry pattern,
  `backend/agents/tools.py`).
- **Self-improving, never self-retraining.** Every prediction Argus makes is
  logged to an outcome ledger, graded against what actually happened, and fed
  back into future reasoning for that user. Model weights are never touched.
- **Deterministic math, narrated by AI.** All financial calculations run in
  plain Python engines. Argus reasons over the output — it never invents a
  number.
- **Specificity or silence.** Every Argus insight needs a merchant, dollar
  amount, and timeframe, or it doesn't surface.

---

## Security Non-Negotiables

- RLS enabled on every table, policy scoped to `auth.uid()`
- Plaid tokens encrypted at the application layer before insert, never returned in API responses
- No secrets in code — env vars / Railway secrets only
- All financial data access logged with `user_id` + timestamp
- Rate limits on all AI endpoints

---

## Development Workflow

Follow this exactly when starting any phase or feature work:

1. **Write the phase plan** in `Phase Plans/` (format: `Phase_X_Name.md`, see existing files for convention) — what's being built and why, scoped to that phase.
2. **List the feature branches** that phase needs, inside that same phase-plan doc.
3. **Work one feature at a time**, TDD style, using the `superpowers:test-driven-development` skill:
   write the failing test → write the code → run the test → confirm it passes.
4. **Stop after each feature.** Give a short summary (what / why / how, no fluff), then stop and prompt for commit + push — never commit or push automatically.

No skipping ahead to the next feature before that prompt-and-stop happens.

---

## Communication Style

Be concise. No filler, no over-explaining, no restating the obvious. Same standard
applies to any doc, plan, or explanation written for this project.
