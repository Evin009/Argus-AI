# ArgusAI — Phase 1: Foundation

> Weeks 1–2. Goal: running skeleton. Auth works, DB schema exists, CI/CD is live, local dev is ready.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Backend | FastAPI app scaffold, JWT auth middleware, `/me` + `/users/sync` endpoints, Dockerfile |
| Database | Supabase project, all 8 tables, Row-Level Security policies, pgvector index |
| Frontend | Next.js 14 scaffold, Supabase clients, route protection, auth pages, landing page, settings shell |
| Infra | docker-compose for local dev, GitHub Actions CI (lint + test) |
| Deploy | Vercel (frontend) + Railway (backend) connected to GitHub |

---

## Git Branch Structure

Per `GitHub-Argus.md` — Phase 1 uses one phase branch and 3 feature branches:

```
develop
└── phase/1-foundation
      ├── feature/auth-middleware
      ├── feature/supabase-schema
      └── feature/cicd-setup
```

### Setup commands

**One-time (create develop if not done):**
```bash
git checkout main
git checkout -b develop
git push -u origin develop
```

**Create the phase branch:**
```bash
git checkout develop
git pull origin develop
git checkout -b phase/1-foundation
git push -u origin phase/1-foundation
```

**Per feature branch:**
```bash
# Start a feature
git checkout phase/1-foundation
git checkout -b feature/<name>
git push -u origin feature/<name>

# ... do your work, commit as you go ...

# When done — merge back to phase branch
git checkout phase/1-foundation
git merge feature/<name> --no-ff -m "merge: <short description>"
git push origin phase/1-foundation
git branch -d feature/<name>
git push origin --delete feature/<name>
```

**Close Phase 1 — merge into develop:**
```bash
git checkout develop
git merge phase/1-foundation --no-ff -m "phase 1 complete: foundation"
git push origin develop
git branch -d phase/1-foundation
git push origin --delete phase/1-foundation
```

---

## Execution Checklist

### `feature/auth-middleware` ✅
*FastAPI backend scaffold + JWT auth + frontend + auth pages + landing page*

**Backend:**
- [x] Create `backend/` directory with `routers/`, `middleware/`, `migrations/`, `tests/` subdirectories
- [x] Create `backend/pyproject.toml` — Python dependencies (FastAPI, Uvicorn, Pydantic, Supabase, python-jose, httpx, python-dotenv)
- [x] Create `backend/main.py` — FastAPI app entrypoint, CORS middleware, health check route
- [x] Write `backend/middleware/auth.py` — JWT verification dependency (validates Supabase-issued JWTs)
- [x] Write `backend/routers/auth.py` — `GET /me` and `POST /users/sync` endpoints
- [x] Write `backend/tests/test_auth.py` — smoke tests (5/5 passing)
- [x] Verify: unauthenticated `GET /me` → 401
- [x] Verify: invalid token → 401

**Frontend:**
- [x] Scaffold `frontend/` with `create-next-app` (TypeScript + Tailwind + App Router)
- [x] Install `@supabase/supabase-js` and `@supabase/ssr`
- [x] Write `frontend/lib/supabase/client.ts` — browser Supabase client
- [x] Write `frontend/lib/supabase/server.ts` — server Supabase client with cookie adapter
- [x] Write `frontend/middleware.ts` — redirect unauthenticated users to `/login` for all protected routes
- [x] Build `app/(auth)/login/page.tsx` — email/password + Google OAuth sign-in
- [x] Build `app/(auth)/signup/page.tsx` — registration form → verify-email redirect
- [x] Build `app/(auth)/auth/callback/route.ts` — OAuth code exchange handler
- [x] Build `app/(auth)/verify-email/page.tsx` — email confirmation screen
- [x] Build `app/page.tsx` — static landing page (hero, 3 feature highlights, CTA buttons)
- [x] Build `app/(app)/layout.tsx` — sidebar nav shell (all route links, active highlight)
- [x] Build `app/(app)/settings/page.tsx` — profile display + sign-out button
- [ ] Verify: signup → email confirm → session set → redirect to `/dashboard` *(needs real Supabase project)*
- [ ] Verify: visit `/dashboard` logged out → redirected to `/login` *(needs real Supabase project)*
- [ ] **Merge → `phase/1-foundation`**

---

### `feature/supabase-schema`
*Supabase project + all DB tables + RLS policies + pgvector index*

- [ ] Create Supabase project (Supabase dashboard — manual)
- [ ] Enable pgvector extension in SQL editor
- [ ] Write `backend/migrations/001_initial_schema.sql` — all 8 tables: `users`, `plaid_items`, `accounts`, `transactions`, `bills`, `subscriptions`, `goals`, `ai_insights`
- [ ] Write `backend/migrations/002_rls_policies.sql` — enable RLS + `auth.uid() = user_id` policy per table
- [ ] Write `backend/migrations/003_vector_indexes.sql` — ivfflat index on `transactions.embedding`
- [ ] Run all 3 migrations in Supabase SQL editor (in order)
- [ ] Verify RLS: `SET LOCAL role anon; SELECT * FROM users;` → 0 rows returned
- [ ] Confirm `auth.users` ↔ `public.users` FK works after test signup
- [ ] Copy `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET` into `.env`
- [ ] **Merge → `phase/1-foundation`**

---

### `feature/cicd-setup`
*Dockerfile + docker-compose + GitHub Actions CI + Vercel + Railway deploys*

- [ ] Write `backend/Dockerfile`
- [ ] Write `infra/docker-compose.yml` — FastAPI service (port 8000) + Redis service (port 6379)
- [ ] Verify: `docker-compose up` → `localhost:8000/health` responds, Swagger UI loads at `localhost:8000/docs`
- [ ] Write `infra/.github/workflows/ci.yml` — ruff lint + pytest on push to `main` and `develop`
- [ ] Add GitHub repo secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`
- [ ] Push to trigger CI — confirm GitHub Actions runs green
- [ ] Deploy frontend to Vercel (root directory: `frontend/`, add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Deploy backend to Railway (root directory: `backend/`, add all env vars, start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`)
- [ ] Run end-to-end smoke test on production URLs
- [ ] **Merge → `phase/1-foundation`**

---

### Phase 1 Close
- [ ] Merge `phase/1-foundation` → `develop` (see git commands above)
- [ ] Mark Phase 1 as ✅ Complete in `ROADMAP.md`

---

## Definition of Done

- [ ] `docker-compose up` → `localhost:8000/health` responds and Swagger UI loads
- [ ] `GET /me` without token → 401 Unauthorized
- [ ] `GET /me` with valid Supabase JWT → user profile returned
- [ ] Supabase RLS blocks cross-user access: `SET LOCAL role anon; SELECT * FROM users;` → 0 rows
- [ ] Full auth flow works: sign up → email confirm → login → redirect to `/dashboard`
- [ ] Protected routes redirect to `/login` when unauthenticated
- [ ] GitHub Actions CI green on push to `main` and `develop`
- [ ] Frontend live on Vercel, backend live on Railway

---

## Critical Files

| File | Why it can't be skipped |
|---|---|
| `backend/middleware/auth.py` | Every protected endpoint depends on this dependency |
| `backend/migrations/002_rls_policies.sql` | Without RLS, any authenticated user can read all rows |
| `frontend/middleware.ts` | Without this, all app pages are publicly accessible |
| `frontend/lib/supabase/server.ts` | Required for reading session in middleware and server components |
