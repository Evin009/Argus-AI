# ArgusAI — Frontend Page Structure

## User Flow

```
Landing Page
    ↓
Login / Signup
    ↓
Onboarding (4-chapter flow)
    ↓
Dashboard  ←─────────────────────────────┐
    ├── Accounts                          │
    ├── Transactions ───→ Transaction Detail (drawer)
    ├── Subscriptions                     │
    ├── Calendar                          │
    ├── Financial Profile                 │
    │       ├── Category Drill-down       │
    │       └── Merchant Page (dynamic)  │
    ├── Cashflow                          │
    ├── Health Score                      │
    ├── Scenario Simulator                │
    ├── Goals                             │
    ├── Credit Hub                        │
    ├── Copilot (full page)               │
    └── Intelligence Feed ───────────────┘
```

---

## All Pages

### Public
| Route | Page | Type |
|---|---|---|
| `/` | Landing Page | Static |
| `/login` | Login | Static |
| `/signup` | Signup | Static |

### Onboarding
| Route | Page | Type |
|---|---|---|
| `/onboarding` | 4-chapter stepped flow | Static |

### App (requires auth + linked bank)
| Route | Page | Type |
|---|---|---|
| `/dashboard` | Home — Safe to Spend, cards, previews | Static |
| `/accounts` | Linked banks, balances, Plaid Link | Static |
| `/transactions` | Full transaction list + filters | Static |
| `/subscriptions` | Active subscriptions, price creep, alternatives | Static |
| `/calendar` | Smart Payment Calendar — bills, subscriptions, AI dates | Static |
| `/profile` | Financial Profile — Level 1 overview | Static |
| `/profile/[category]` | Category drill-down — merchants ranked by spend | Dynamic |
| `/profile/[category]/[merchant]` | Merchant Intelligence — per-merchant page | Dynamic |
| `/cashflow` | 60-day cashflow curve + risk windows | Static |
| `/health` | Financial Health Score — gamified, streak grid | Static |
| `/simulator` | Scenario Simulator — Custom + Life Events tabs | Static |
| `/goals` | Goal cards + recovery plans | Static |
| `/credit` | Credit Intelligence Hub — card stack, bonuses, score | Static |
| `/copilot` | AI Copilot full page | Static |
| `/intelligence` | Intelligence Feed — AI insights stream | Static |

---

## Dynamic Pages

| Page | Generated from | Exists when |
|---|---|---|
| `/profile/[category]` | Spending categories in transaction history | User has transactions in that category |
| `/profile/[category]/[merchant]` | Per-merchant transaction history | User has 1+ transaction at that merchant |

---

## Global Components (not pages)

| Component | Trigger | Lives on |
|---|---|---|
| Copilot Side Panel | Cmd+K from any screen | All app pages |
| Transaction Detail Drawer | Tap any transaction row | `/transactions` |
| Recovery Plan Modal | Goal falls behind / Guardian fires | `/goals`, Guardian |
| Guardian Verdict Panel | Chrome extension only | Browser overlay |

---

## Build Phases vs Pages

| Phase | Pages unlocked |
|---|---|
| 1–3.5 (done) | Login, Signup, Accounts, Dashboard (partial), Transactions, Subscriptions, Calendar (basic), Intelligence Feed |
| Phase 4 | Onboarding |
| Phase 5 | Dashboard (full), Calendar (full) |
| Phase 6 | Financial Profile, Merchant Intelligence, Copilot |
| Phase 7 | Cashflow, Health Score, Simulator, Goals |
| Phase 8 | Credit Hub |

---

## Page Count

- Public: 3
- Onboarding: 1
- App (static): 12
- App (dynamic): 2
- **Total: 18 pages**
