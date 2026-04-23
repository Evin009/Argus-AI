# ArgusAI — Phase 2: Bank Data Pipeline

> Weeks 3–4. Goal: connect bank accounts via Plaid, sync all transactions, generate embeddings.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Backend | Plaid Link token + token exchange endpoints, AES-256 token encryption, transaction sync Celery task, embedding generation task |
| Database | `plaid_items` + `accounts` + `transactions` populated from Plaid; pgvector RPC function for cosine search |
| Frontend | Bank linking flow (Plaid Link SDK), accounts overview page, transactions list page |
| Infra | Celery worker wired to Redis, background sync task scheduling |

---

## Git Branch Structure

Per `GitHub-Argus.md` — Phase 2 uses one phase branch and 3 feature branches:

```
develop
└── phase/2-data-pipeline
      ├── feature/plaid-integration
      ├── feature/transaction-sync
      └── feature/accounts-ui
```

### Setup commands

**Create the phase branch:**
```bash
git checkout develop
git checkout -b phase/2-data-pipeline
git push -u origin phase/2-data-pipeline
```

**Per feature branch:**
```bash
git checkout phase/2-data-pipeline
git checkout -b feature/<name>
git push -u origin feature/<name>

# ... work, commit ...

# Open PR on GitHub with base = phase/2-data-pipeline (NOT main or develop)
# After merge, delete the feature branch
git branch -d feature/<name>
git push origin --delete feature/<name>
```

**Close Phase 2 — merge into develop then main:**
```bash
git checkout develop
git merge phase/2-data-pipeline --no-ff -m "phase 2 complete: bank data pipeline"
git push origin develop
git branch -d phase/2-data-pipeline
git push origin --delete phase/2-data-pipeline
```

Then open a PR on GitHub: `develop` → `main`. After CI passes and PR is reviewed, merge it.

---

## Execution Checklist

### `feature/plaid-integration`
*Plaid Link token generation, OAuth redirect, public token exchange, AES-256 token encryption*

**Backend — Plaid setup:**
- [ ] Add Plaid dependencies to `backend/pyproject.toml` — `plaid-python`, `cryptography`
- [ ] Add env vars to `.env` and `.env.example` — `PLAID_CLIENT_ID`, `PLAID_SECRET`, `PLAID_ENV` (`sandbox`), `PLAID_ENCRYPTION_KEY`
- [ ] Create `backend/db/client.py` — centralized Supabase client factory (service role client)
- [ ] Create `backend/services/plaid_client.py` — initialize Plaid API client from env vars
- [ ] Create `backend/services/encryption.py` — AES-256-GCM encrypt/decrypt for Plaid access tokens
- [ ] Write `backend/routers/plaid.py`:
  - `POST /plaid/link-token` — generate Plaid Link token for current user
  - `POST /plaid/exchange-token` — exchange public token → access token, encrypt, upsert into `plaid_items`
  - `GET /plaid/accounts` — list all linked accounts for current user
- [ ] Write `backend/tests/test_plaid.py` — smoke tests (link-token 401 when unauthenticated, exchange-token 401 when unauthenticated)
- [ ] Register `plaid` router in `backend/main.py`
- [ ] Verify: unauthenticated `POST /plaid/link-token` → 401
- [ ] Verify (manual sandbox): full Plaid Link flow completes, `plaid_items` row inserted with encrypted token
- [ ] **Merged → `phase/2-data-pipeline`**

---

### `feature/transaction-sync`
*Celery task for Plaid /transactions/sync, embedding generation, pgvector RPC*

**Backend — Celery setup:**
- [ ] Add Celery dependencies to `backend/pyproject.toml` — `celery[redis]`, `openai`
- [ ] Add env vars to `.env` and `.env.example` — `REDIS_URL`, `OPENAI_API_KEY`
- [ ] Create `backend/celery_app.py` — initialize Celery with Redis broker and result backend
- [ ] Update `infra/docker-compose.yml` — add Celery worker service (command: `celery -A celery_app worker`)

**Backend — Transaction sync task:**
- [ ] Create `backend/tasks/sync_transactions.py`:
  - `sync_transactions_for_user(user_id)` Celery task
  - Decrypt access token from `plaid_items`
  - Call Plaid `/transactions/sync` with cursor pagination
  - Normalize Plaid transaction → `transactions` schema (merchant, amount, category, timestamp, is_recurring)
  - Upsert into `transactions` table by `plaid_transaction_id` (idempotent)
  - Update cursor in `plaid_items` after successful sync
- [ ] Write `backend/tests/test_sync.py` — unit test normalization logic with fixture data

**Backend — Embedding generation task:**
- [ ] Create `backend/tasks/generate_embeddings.py`:
  - `generate_embedding_for_transaction(transaction_id)` Celery task
  - Build embedding input string: `f"{merchant} {category} {amount}"`
  - Call OpenAI `text-embedding-3-small` → 1536-dim vector
  - Update `transactions.embedding` column
- [ ] Chain embedding task to fire after each transaction upsert in `sync_transactions.py`

**Database — pgvector RPC:**
- [ ] Write `backend/migrations/004_vector_search_rpc.sql` — Supabase RPC function `match_transactions_by_embedding(query_embedding vector, match_threshold float, match_count int)`
- [ ] Run migration in Supabase SQL editor
- [ ] Verify: calling RPC via Supabase client returns nearest transactions by cosine similarity

**Backend — Sync trigger endpoint:**
- [ ] Add `POST /plaid/sync` endpoint to `backend/routers/plaid.py` — enqueues `sync_transactions_for_user` Celery task for current user
- [ ] Verify: `POST /plaid/sync` with valid token → task enqueued, transactions appear in DB after worker runs
- [ ] **Merged → `phase/2-data-pipeline`**

---

### `feature/accounts-ui`
*Bank linking flow (Plaid Link SDK), accounts overview page, transactions list page*

**Frontend — Plaid Link flow:**
- [ ] Install `react-plaid-link` — `npm install react-plaid-link`
- [ ] Add env var to `frontend/.env.local` — `NEXT_PUBLIC_API_URL` (Railway backend URL)
- [ ] Create `frontend/lib/api.ts` — typed fetch wrapper for all backend API calls (attaches Supabase JWT)
- [ ] Build `app/(app)/accounts/page.tsx`:
  - On mount: fetch `GET /plaid/accounts` — if no accounts, show "Connect a bank" CTA
  - "Connect a bank" button: calls `POST /plaid/link-token` → opens Plaid Link modal
  - On Plaid Link success: calls `POST /plaid/exchange-token` then `POST /plaid/sync` → reloads accounts
  - Account list: card per account (institution name, account type, balance)
- [ ] Add `/accounts` link to sidebar nav in `app/(app)/layout.tsx`

**Frontend — Transactions list:**
- [ ] Build `app/(app)/transactions/page.tsx`:
  - Fetch all transactions for current user from backend (`GET /transactions`)
  - Display as paginated table: date, merchant, category, amount, recurring badge
  - Filter by account, category, date range (client-side for MVP)
- [ ] Write `backend/routers/transactions.py` — `GET /transactions` endpoint (returns all transactions for current user, newest first)
- [ ] Register `transactions` router in `backend/main.py`
- [ ] Add `/transactions` link to sidebar nav

**Frontend — Onboarding flow:**
- [ ] Build `app/(app)/dashboard/page.tsx`:
  - If user has no linked accounts: redirect to `/accounts` with onboarding message
  - If accounts exist: show summary cards (total balance, monthly spend, account count)
- [ ] Verify: new user → dashboard → redirected to `/accounts` → connect bank → return to dashboard with data
- [ ] **Merged → `phase/2-data-pipeline`**

---

### Phase 2 Close
- [ ] Merge `phase/2-data-pipeline` → `develop`
- [ ] Open PR on GitHub: `develop` → `main` — wait for CI to pass, then merge
- [ ] CI passes on `main`
- [ ] Delete all feature branches + `phase/2-data-pipeline`
- [ ] Mark Phase 2 as ✅ Complete in `ROADMAP.md`

### Post-Close
- [ ] Deploy updated backend to Railway (Celery worker as separate Railway service)
- [ ] Deploy updated frontend to Vercel
- [ ] Run end-to-end smoke test on production: connect sandbox bank → transactions appear → embeddings stored
- [ ] Verify: `match_transactions_by_embedding` RPC returns sensible results on production data

---

## Definition of Done

- [ ] `POST /plaid/link-token` with valid JWT → returns Plaid Link token
- [ ] Full Plaid Link sandbox flow completes → `plaid_items` row exists with encrypted access token
- [ ] `POST /plaid/sync` enqueues Celery task → transactions upserted into `transactions` table
- [ ] Each synced transaction has a populated `embedding` column (1536-dim vector)
- [ ] `match_transactions_by_embedding` RPC returns nearest transactions for a test query
- [ ] Accounts page shows linked banks and account balances
- [ ] Transactions page shows full transaction list with pagination
- [ ] New user onboarding: dashboard → accounts → Plaid Link → data visible
- [ ] CI green on `main` (lint + tests passing)

---

## Critical Files

| File | Why it can't be skipped |
|---|---|
| `backend/services/encryption.py` | Plaid access tokens must never be stored in plaintext |
| `backend/tasks/sync_transactions.py` | Core data ingestion — all downstream intelligence depends on this |
| `backend/tasks/generate_embeddings.py` | Without embeddings, RAG and semantic search in Phase 4+ won't work |
| `backend/migrations/004_vector_search_rpc.sql` | pgvector cosine search is used by the AI Copilot in Phase 5 |
| `frontend/lib/api.ts` | Centralized JWT-authenticated fetch — every page depends on this |

---

## New Dependencies

**Backend (`backend/pyproject.toml`):**
```
plaid-python>=28.0.0
cryptography>=42.0.0
celery[redis]>=5.3.0
openai>=1.0.0
```

**Frontend (`frontend/package.json`):**
```
react-plaid-link>=3.5.0
```

## New Environment Variables

**Backend (`.env`):**
```
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox
PLAID_ENCRYPTION_KEY=          # 32-byte hex key for AES-256
REDIS_URL=redis://localhost:6379/0
OPENAI_API_KEY=
```

**Frontend (`.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
