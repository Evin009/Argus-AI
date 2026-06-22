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

1. **Phase plan first.** Write the phase plan in `Phase Plans/Phase_X_Name.md`, matching the
   existing convention (git branch tree, feature checklist, endpoints, schema, Definition of Done).
   List every feature branch the phase needs.
2. **One feature at a time.** Never start a second feature before the current one is fully closed out.
   Create each feature branch off the phase branch automatically — no need to ask.
3. **Within a feature, one task at a time, TDD style** (`superpowers:test-driven-development`):
   write the failing test → write the code → run it → confirm it passes → commit immediately.
   Keep iterating task to task without stopping to ask — quick, continuous commits.
4. **Update the phase plan checklist after every single task** is completed — check it off in
   `Phase Plans/Phase_X_Name.md` before moving on, not just at the end of the feature.
5. **Stop only once the feature is fully done.** Give a concise, bulleted, one-line-per-point
   summary of what was implemented (architecture/approach) — not verbose, no long prose.
6. **Merge the feature branch into the phase branch autonomously** — but always pause and ask
   ("merge about to happen, proceed?") before that merge actually executes. Same rule applies to
   merging the phase branch into `develop`, opening the `develop` → `main` PR, and the final merge
   to `main`: handle CI fixes and the mechanics solo, but never execute a merge or open a PR
   without an explicit go-ahead first.

Never commit code changes automatically without asking — except the task-by-task commits inside
an in-progress feature, which proceed without stopping. Merges and PR creation always require
an explicit go-ahead first, no exceptions.

---

## Communication Style

Be concise. No filler, no over-explaining, no restating the obvious. Same standard
applies to any doc, plan, or explanation written for this project.
