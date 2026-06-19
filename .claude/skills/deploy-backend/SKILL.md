---
name: deploy-backend
description: Use when the user wants to run, start, or test ArgusAI's backend locally instead of on Railway. Triggers include "start the backend", "run backend locally", "fire up the backend", "deploy backend" (in a local/dev context, not Railway), or when local frontend dev needs a running API.
---

# Deploy Backend Locally

## Overview

ArgusAI's backend is three services: FastAPI (`api`), Celery worker (`celery_worker`),
and Redis. For local development, all three run together via Docker Compose instead of
Railway — this avoids Railway compute billing entirely for day-to-day testing.

Railway should only be used for staging/production, not local iteration.

## One-command start

Run from the repo root:

```bash
infra/dev-up.sh
```

This script:
1. Verifies `.env` exists at the repo root (fails fast with a clear message if not —
   copy `.env.example` and fill in secrets if missing).
2. Starts Docker Desktop if the daemon isn't running, and waits for it.
3. Runs `docker compose -f infra/docker-compose.yml up -d --build`, bringing up
   `redis`, `api`, and `celery_worker` together.
4. Polls `http://localhost:8000/health` until the API responds.
5. Prints container status and the relevant URLs.

No need to start Redis, the worker, and the API separately — this replaces doing all
three by hand.

## Config notes

- Root `.env` already has `REDIS_URL=redis://localhost:6379/0` and
  `NEXT_PUBLIC_API_URL=http://localhost:8000` for local dev — no Railway URLs involved.
- `frontend/.env.local` should also point `NEXT_PUBLIC_API_URL` at
  `http://localhost:8000` when testing against the local backend (swap back to the
  Railway URL only when intentionally testing against deployed staging/prod).
- Supabase (Postgres/Auth) stays cloud-hosted either way — it isn't part of this stack
  and isn't billed per-compute-second like Railway, so there's no need to self-host it.

## Stopping / inspecting

```bash
docker compose -f infra/docker-compose.yml logs -f      # tail logs
docker compose -f infra/docker-compose.yml ps            # check status
docker compose -f infra/docker-compose.yml down          # stop everything
```

## Common mistakes

- Forgetting to flip `frontend/.env.local`'s `NEXT_PUBLIC_API_URL` back to Railway
  when you actually want to test against the deployed backend — the frontend will
  silently keep talking to localhost otherwise.
- Running this while Railway services are also up — harmless, but wasteful billing.
  No need to pause Railway for local dev (it's a separate stack entirely), but consider
  it if you're not actively using staging/prod either.
