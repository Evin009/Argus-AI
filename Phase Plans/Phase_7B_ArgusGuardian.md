# Phase 7B: Argus Guardian (Chrome Extension)

> Goal: Argus reaches the browser. When user lands on a checkout or product page, Guardian fires a verdict — can they afford this, should they wait, which card to use. Post-purchase, Argus reacts within seconds of the transaction clearing. One account, same brain, new surface.

---

## What This Phase Covers

| Layer | Goal |
|---|---|
| Chrome extension | Manifest v3 extension: detection, verdict panel, notification trigger |
| Backend | `/guardian/analyze` endpoint, post-purchase webhook handler |
| Argus tool | `analyze_purchase` registered so chat can answer pre-purchase questions too |
| Main app | Guardian status card on dashboard, notification settings |
| Settings sync | Extension reads notification preferences from main app account |

---

## Git Branch Structure

```
develop
└── phase/7B-argus-guardian
      ├── feature/guardian-backend
      ├── feature/guardian-extension
      └── feature/guardian-app-integration
```

---

## Global Constraints

- Extension uses manifest v3 — no manifest v2 APIs
- Extension auth: same JWT from ArgusAI login, stored in `chrome.storage.local`
- No financial logic in extension — all intelligence in backend
- Verdict response must return within 2 seconds — Argus reasoning time budget enforced
- Post-purchase webhook must verify Plaid signature before processing
- `analyze_purchase` tool routes through same LangGraph supervisor as chat — not a separate model call
- New routers registered in `backend/main.py`
- Tests mock Supabase and Plaid webhook payloads; never hit real services

---

## Execution Checklist

### `feature/guardian-backend`

**Migration**
- [ ] `backend/migrations/018_guardian_events.sql` — `guardian_events` table: `id UUID PK`, `user_id UUID`, `merchant TEXT`, `detected_amount DECIMAL`, `verdict TEXT`, `reason TEXT`, `safe_to_spend DECIMAL`, `created_at TIMESTAMPTZ`. RLS enabled, user-scoped policy. Stores every Guardian verdict fired — used by Argus outcome ledger and dashboard status card.

**Guardian verdict endpoint**
- [ ] `backend/routers/guardian.py` — `POST /guardian/analyze`:
  - Accepts: merchant name, detected amount, page URL, page type (checkout/product)
  - Pulls: Safe to Spend from cache, pay timing, bill schedule for user
  - Routes through Argus supervisor — Argus reasons over all context, returns verdict + one-line reason + recommended card if applicable
  - Writes event to `guardian_events`
  - Returns: `{ verdict, reason, safe_to_spend, recommended_card, impact_summary }`
- [ ] Registered in `backend/main.py`
- [ ] `backend/tests/test_guardian_endpoint.py`

**Post-purchase webhook**
- [ ] `POST /guardian/webhook/plaid` — receives Plaid transaction webhook, verifies Plaid signature, identifies if transaction matches a recent Guardian event, triggers Argus to generate impact analysis + two recovery options, stores result back to `guardian_events`
- [ ] `backend/tests/test_guardian_webhook.py`

**Argus tool**
- [ ] `analyze_purchase` registered in `backend/agents/tools.py` — takes merchant + amount, runs same logic as `/guardian/analyze`, returns verdict. Makes pre-purchase reasoning available in Argus chat too.
- [ ] `backend/tests/test_guardian_tool.py`

- [ ] Merge → `phase/7B-argus-guardian`

---

### `feature/guardian-extension`

**Scaffold**
- [ ] `chrome-extension/manifest.json` — manifest v3, declares permissions: `activeTab`, `storage`, `notifications`, `scripting`. Content script runs on all URLs. Background service worker registered.
- [ ] `chrome-extension/icons/` — Argus copper mark in 16/48/128px sizes

**Detection — content script**
- [ ] `chrome-extension/content.js` — runs on every page, detects:
  - Checkout pages: URL patterns (`/checkout`, `/cart`, `/order`, `/payment`) across major retailers (Amazon, Walmart, Target, Best Buy, Shopify stores, etc.)
  - Product pages: price element presence + add-to-cart button detection
  - Extracts: merchant name (from domain), detected amount (from price elements on page)
  - On detection: sends message to background service worker with merchant + amount + page type

**Background service worker**
- [ ] `chrome-extension/background.js` — receives detection message from content script, retrieves stored JWT from `chrome.storage.local`, calls `POST /guardian/analyze`, receives verdict, sends verdict back to content script for display. Also triggers OS notification if verdict is warning-level.

**Verdict panel — injected UI**
- [ ] `chrome-extension/panel.js` — injected into detected page by content script. Slides in from right (280px wide). Shows:
  - Argus copper mark + "Guardian" label
  - Merchant logo (from merchant logos cache) or copper initial fallback
  - Verdict chip: green "Looks good" / amber "Proceed carefully" / red "Wait on this"
  - One-line reason (from Argus)
  - Safe to Spend amount
  - Recommended card if applicable
  - Tap to expand: full impact summary, bill schedule context
  - Dismiss button
- [ ] Panel styled with copper/paper/charcoal tokens matching ArgusAI design language — no external CSS frameworks

**Auth flow**
- [ ] `chrome-extension/popup.html` + `chrome-extension/popup.js` — extension popup (toolbar icon click). If not logged in: shows "Log in with ArgusAI" button, opens ArgusAI login page, listens for auth token via `chrome.runtime.sendMessage`. If logged in: shows active status + link to ArgusAI dashboard.

- [ ] Merge → `phase/7B-argus-guardian`

---

### `feature/guardian-app-integration`

**Dashboard status card**
- [ ] `frontend/app/(app)/dashboard/_components/GuardianStatusCard.tsx` — shows Guardian active/inactive status, last verdict fired (merchant + verdict + time), link to Guardian settings. Wired into dashboard page.

**Notification settings**
- [ ] `frontend/app/(app)/settings/page.tsx` (or new Guardian settings section) — controls:
  - Guardian active toggle (on/off)
  - Quiet hours (start time + end time — no notifications during this window)
  - Minimum amount threshold (only fire Guardian if detected amount exceeds this)
  - Notification type: panel only / OS notification / both
- [ ] `GET /guardian/settings` + `PUT /guardian/settings` endpoints — read/write notification preferences to `onboarding_responses` or new `guardian_settings` table
- [ ] Extension reads these settings on each detection event — respects quiet hours and threshold before firing panel
- [ ] `backend/tests/test_guardian_settings.py`

- [ ] Merge → `phase/7B-argus-guardian`

---

### Phase 7B Close
- [ ] Merge `phase/7B-argus-guardian` → `develop`
- [ ] Open PR `develop` → `main`, wait for CI, merge
- [ ] Delete all feature branches + `phase/7B-argus-guardian`
- [ ] Mark Phase 7B as ✅ Complete in `Argus Details/product-plan.md`

---

## New Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/guardian/analyze` | Verdict for a detected purchase — merchant, amount, page context in; verdict + reason out |
| `POST` | `/guardian/webhook/plaid` | Post-purchase webhook — impact analysis + recovery options |
| `GET` | `/guardian/settings` | Read user notification preferences |
| `PUT` | `/guardian/settings` | Update notification preferences |

---

## New Database Tables

```
guardian_events  — id, user_id, merchant, detected_amount, verdict, reason, safe_to_spend, created_at
```

---

## Extension Files

```
chrome-extension/
  manifest.json        — v3 manifest, permissions, content script + service worker declarations
  background.js        — service worker: API calls, auth, notification trigger
  content.js           — page detection, amount extraction, panel injection trigger
  panel.js             — verdict UI injected into detected pages
  popup.html           — toolbar icon click popup
  popup.js             — auth state, login flow, settings link
  icons/               — 16px, 48px, 128px copper mark
```

---

## Definition of Done

- [ ] Extension detects checkout on Amazon, Shopify store, at minimum
- [ ] Verdict panel slides in within 2 seconds of detection
- [ ] Verdict uses live Safe to Spend + bill schedule — not hardcoded
- [ ] Post-purchase webhook fires impact analysis within 10 seconds of Plaid notification
- [ ] Guardian status card visible on dashboard
- [ ] Notification settings respected (quiet hours, threshold, type)
- [ ] `analyze_purchase` callable by Argus in chat
- [ ] CI green on main
