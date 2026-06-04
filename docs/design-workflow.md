# ArgusAI Design Workflow

Reference guide for the skill stack to use at each stage of the UI/UX build.

---

## Phase 1 — Project Setup (once, before any code)

| Skill | Command | Purpose |
|---|---|---|
| Impeccable | `impeccable init` | Sets up `PRODUCT.md` and `DESIGN.md` so all impeccable commands have project context |

---

## Phase 2 — Building Each Page

| Skill | When to invoke |
|---|---|
| `image-to-code` | You have a Claude Design screenshot — converts it directly to working code |
| `redesign-existing-projects` | Audit-first rebuild of existing pages (dashboard, transactions, accounts, bills, subscriptions, intelligence) |
| `impeccable craft [page]` | Building a net-new page end-to-end with full UX + code |
| `impeccable shape [page]` | Planning UX/layout before writing code for complex pages (copilot, simulator, debt) |

---

## Phase 3 — Refinement Per Page

| Skill | When to invoke |
|---|---|
| `impeccable audit [page]` | After building — checks accessibility, performance, responsiveness |
| `impeccable critique [page]` | UX review with heuristic scoring |
| `impeccable layout [page]` | Spacing, rhythm, or visual hierarchy feels off |
| `impeccable typeset [page]` | Typography hierarchy needs work |
| `impeccable harden [page]` | Adding error states, empty states, edge cases |
| `impeccable adapt [page]` | Responsive/mobile fixes |

---

## Phase 4 — Polish and Finish

| Skill | When to invoke |
|---|---|
| `emil-design-eng` | Micro-interactions, hover states, invisible details that make it feel premium |
| `impeccable animate [page]` | Adding purposeful motion to a finished page |
| `impeccable delight [page]` | Adding personality touches |
| `impeccable polish [page]` | Final quality pass before shipping |

---

## The Core Loop (per page)

```
impeccable init (once)
    ↓
image-to-code OR redesign-existing-projects
    ↓
impeccable audit + impeccable critique
    ↓
impeccable layout / typeset / harden (as needed)
    ↓
impeccable polish
    ↓
emil-design-eng (final feel)
```

---

## Skills to Skip for ArgusAI

| Skill | Reason |
|---|---|
| `industrial-brutalist-ui` | Wrong aesthetic — ArgusAI is dark/premium, not brutalist |
| `stitch-design-taste` | For Stitch MCP design tool only |
| `imagegen-frontend-web/mobile` | Image generation tools, not UI builders |
| `brandkit` | Brand identity work — not needed during the build phase |
| `gpt-taste` | Not relevant in Claude Code |
| `design-taste-frontend-v1` | Deprecated — `design-taste-frontend` is the current version |

---

## Page Build Order (recommended)

1. Dashboard (highest complexity, sets the visual language)
2. Transactions
3. Accounts
4. Bills + Bills Calendar
5. Subscriptions
6. Intelligence Feed
7. Auth pages (login, signup, verify-email)
8. Landing page
9. Settings
10. Phase 4+ pages (forecast, risk, copilot, debt, simulator, etc.) as they are built
