# ArgusAI — Phase 6.5: Feature Refinement Pass

> Goal: revisit every completed feature one by one. Identify gaps, problems, and anything that feels off. Redesign and refine based on direct instruction — no AI-driven design decisions. You direct, it gets built.

---

## Git Branch Structure

```
develop
└── phase/6.5-feature-refinement
```

One branch. Commit per feature as each one is done. Single PR at the end.

---

## Features to Revisit (in order)

### 1. Auth Pages ⬜
- Login (`app/(auth)/login/page.tsx`)
- Signup (`app/(auth)/signup/page.tsx`)
- Verify Email (`app/(auth)/verify-email/page.tsx`)

### 2. Onboarding ⬜
- Multi-chapter onboarding flow (`app/onboarding/`)
- Bank linking step inside onboarding

### 3. Dashboard ⬜
- Safe to Spend hero (`_components/SafeToSpendHero.tsx`)
- Balance cards, spending wheel, recent activity, cashflow curve, subscription calendar
- Ask Argus bar

### 4. Accounts ⬜
- Account cards, Plaid Link button, sync status (`app/(app)/accounts/page.tsx`)

### 5. Transactions ⬜
- Transaction list, category filter, pagination (`app/(app)/transactions/page.tsx`)

### 6. Bills ⬜
- Bill cards, due-date urgency, AI enrichment drawer (`app/(app)/bills/page.tsx`)

### 7. Subscriptions ⬜
- Subscription cards, price creep badge, cancel recommendation (`app/(app)/subscriptions/page.tsx`)

### 8. Calendar ⬜
- Smart Payment Calendar — bills + subscriptions + AI-recommended dates (`app/(app)/calendar/page.tsx`)

### 9. Intelligence Feed ⬜
- AI analyst decisions, signal type filter, severity badges (`app/(app)/intelligence/page.tsx`)

### 10. Financial Profile ⬜
- Spending ring, utilization gauge, merchant rankings, merchant detail + heatmap + Argus insight (`app/(app)/profile/page.tsx`)

### 11. Argus Chat ⬜
- Full chat page, streaming, verdict/table/chart response cards (`app/(app)/argus/page.tsx`)

### 12. Argus Side Panel ⬜
- Cmd+K overlay, context-aware, nav-persistent (`app/(app)/_components/ArgusSidePanel.tsx`)

### 13. Settings ⬜
- User settings page (`app/(app)/settings/page.tsx`)

---

## How This Works

- Visit one feature at a time in the order above
- You review it, tell me what needs to change
- I implement exactly what you instruct — no unsolicited redesign
- Commit, move to next feature
- PR at the end when all 13 are done

---

## Phase 6.5 Close
- [ ] Merge `phase/6.5-feature-refinement` → `develop`
- [ ] Open PR `develop` → `main`, wait for CI, merge
- [ ] Mark Phase 6.5 as ✅ Complete in `Argus Details/product-plan.md`
