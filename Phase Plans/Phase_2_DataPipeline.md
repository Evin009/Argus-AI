# ArgusAI — Phase 2: Bank Data Pipeline ✅

> Weeks 3–4. Goal: connect bank accounts via Plaid, sync all transactions, generate embeddings.
> **Status: Complete.** All features merged to `main`. 48 sandbox transactions synced with embeddings verified end-to-end.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Backend | Plaid Link token + token exchange endpoints, AES-256 token encryption, transaction sync Celery task, embedding generation task |
| Database | `plaid_items` + `accounts` + `transactions` populated from Plaid; pgvector RPC function for cosine search |
| Frontend | Bank linking flow (Plaid Link SDK), accounts overview page, transactions list page, dashboard |
| Infra | Celery worker wired to Redis, background sync task scheduling |

---

## Work Division

### Backend Track
All Python/FastAPI work. Lives in `backend/`.

| Area | Work |
|---|---|
| Plaid API | Link token generation, public token exchange, OAuth redirect handling |
| Encryption | AES-256-GCM encrypt/decrypt for Plaid access tokens before DB storage |
| Routers | `POST /plaid/link-token`, `POST /plaid/exchange-token`, `GET /plaid/accounts`, `POST /plaid/sync`, `GET /transactions` |
| Celery tasks | `sync_transactions_for_user` — Plaid `/transactions/sync` → normalize → upsert |
| Embedding tasks | `generate_embedding_for_transaction` — OpenAI `text-embedding-3-small` → store in `transactions.embedding` |
| Database | Migration `004_vector_search_rpc.sql` — pgvector cosine search RPC function |
| Tests | Auth guard smoke tests for all new endpoints, normalization unit tests |

### Frontend Track
All Next.js/React work. Lives in `frontend/`.

| Area | Work |
|---|---|
| API layer | `lib/api.ts` — typed fetch wrapper that attaches Supabase JWT to every backend request |
| Plaid Link | `react-plaid-link` SDK integration — fetch link token → open modal → exchange token on success |
| Accounts page | `app/(app)/accounts/page.tsx` — linked bank cards, "Connect a bank" CTA, sync trigger, utilization bar |
| Transactions page | `app/(app)/transactions/page.tsx` — paginated table with date/merchant/category/amount/recurring badge |
| Dashboard page | `app/(app)/dashboard/page.tsx` — onboarding empty state if no accounts; summary cards if accounts exist |

---

## Git Branch Structure

```
develop
└── phase/2-data-pipeline ✅ merged
      ├── feature/plaid-integration ✅ merged
      ├── feature/transaction-sync ✅ merged
      └── feature/accounts-ui ✅ merged
```

---

## Execution Checklist

### `feature/plaid-integration` ✅

- [x] Add Plaid dependencies to `backend/pyproject.toml` — `plaid-python`, `cryptography`
- [x] Add env vars to `.env` and `.env.example` — `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV`, `PLAID_TOKEN_ENCRYPTION_KEY`
- [x] Create `backend/db/client.py` — centralized Supabase client factory (service role client)
- [x] Create `backend/services/plaid_client.py` — initialize Plaid API client from env vars
- [x] Create `backend/services/encryption.py` — AES-256-GCM encrypt/decrypt for Plaid access tokens
- [x] Write `backend/routers/plaid.py` — `POST /plaid/link-token`, `POST /plaid/exchange-token`, `GET /plaid/accounts`
- [x] Write `backend/tests/test_plaid.py` — smoke tests (401 on unauthenticated requests)
- [x] Register `plaid` router in `backend/main.py`
- [x] Merged → `phase/2-data-pipeline`

---

### `feature/transaction-sync` ✅

- [x] Add `celery[redis]`, `openai` to `backend/pyproject.toml`
- [x] Add `REDIS_URL`, `OPENAI_API_KEY` to `.env` and `.env.example`
- [x] Create `backend/celery_app.py` — Celery init with Redis broker and result backend
- [x] Update `infra/docker-compose.yml` — add Celery worker service
- [x] Create `backend/tasks/sync_transactions.py` — full sync task with cursor pagination, normalization, upsert
- [x] Create `backend/tasks/generate_embeddings.py` — OpenAI embedding generation, chained from sync task
- [x] Write `backend/tests/test_sync.py` — normalization unit tests (7/7 passing)
- [x] Write `backend/migrations/004_vector_search_rpc.sql` — pgvector cosine search RPC
- [x] Add `POST /plaid/sync` endpoint to `backend/routers/plaid.py`
- [x] Merged → `phase/2-data-pipeline`

---

### `feature/accounts-ui` ✅

- [x] Install `react-plaid-link` in `frontend/`
- [x] Confirm `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- [x] Create `frontend/lib/api.ts` — JWT-authenticated fetch wrapper
- [x] Build `app/(app)/accounts/page.tsx` — Plaid Link flow, account cards, utilization bar, sync button
- [x] Write `backend/routers/transactions.py` — `GET /transactions` with pagination + category filter
- [x] Register `transactions` router in `backend/main.py`
- [x] Build `app/(app)/transactions/page.tsx` — paginated table, recurring badge, category filter
- [x] Build `app/(app)/dashboard/page.tsx` — empty state onboarding + summary cards
- [x] Merged → `phase/2-data-pipeline`

---

### Phase 2 Close ✅

- [x] Merge `phase/2-data-pipeline` → `develop`
- [x] Open PR `develop` → `main`, CI passes, merge
- [x] Delete all feature branches + `phase/2-data-pipeline`
- [x] Mark Phase 2 as ✅ Complete in `ROADMAP.md`

### Post-Close
- [ ] Deploy updated backend + Celery worker to Railway
- [ ] Deploy updated frontend to Vercel
- [ ] Run end-to-end smoke test on production

---

## Fixes & Additions Made During Phase 2

These were not in the original plan but were required:

| Fix | Why |
|---|---|
| `Dockerfile` — switched from hardcoded `pip install` to `pip install -e .` | Hardcoded list was missing `celery`, `plaid-python` etc — caused container crash |
| CORS middleware — allow `localhost:3000–3009` | Frontend running on port 3001 was blocked |
| Auth middleware — replaced `python-jose` JWT decode with `supabase.auth.get_user()` | Supabase migrated to new JWT Signing Keys (RS256), breaking HS256 verification |
| Migration 005 — unique constraint on `plaid_items(institution_id, user_id)` | Required for upsert `on_conflict` in exchange-token endpoint |
| Migration 006 — `handle_new_user` trigger + backfill | `public.users` rows not created on signup, causing FK violation on `plaid_items` |
| `REDIS_URL=redis://redis:6379/0` | Docker containers can't reach Redis via `localhost` — must use service name |

---

## Definition of Done ✅

- [x] `POST /plaid/link-token` with valid JWT → returns Plaid Link token
- [x] Full Plaid Link sandbox flow completes → `plaid_items` row exists with encrypted access token
- [x] `POST /plaid/sync` enqueues Celery task → transactions upserted into `transactions` table
- [x] Each synced transaction has a populated `embedding` column (1536-dim vector)
- [x] `match_transactions_by_embedding` RPC deployed in Supabase
- [x] Accounts page shows linked banks and account balances
- [x] Transactions page shows full transaction list with pagination
- [x] New user onboarding: dashboard → accounts → Plaid Link → data visible
- [x] CI green on `main`
