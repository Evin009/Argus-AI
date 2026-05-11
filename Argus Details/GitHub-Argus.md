# ArgusAI — Git Branch Guide

## Branch Structure Overview

```
main                          ← production only, always stable
└── develop                   ← integration branch, all phases merge here
      ├── phase/1-foundation
      │     ├── feature/auth-middleware
      │     ├── feature/supabase-schema
      │     └── feature/cicd-setup
      │
      ├── phase/2-data-pipeline
      │     ├── feature/plaid-link
      │     ├── feature/transaction-sync
      │     └── feature/embedding-pipeline
      │
      ├── phase/3-intelligence-layer
      │     ├── feature/bill-detection
      │     ├── feature/subscription-tracker
      │     ├── feature/categorization
      │     ├── feature/spending-streak-tracker
      │     └── feature/bill-calendar
      │
      ├── phase/4-ai-reports
      │     ├── feature/anomaly-detection
      │     ├── feature/rag-pipeline
      │     └── feature/monthly-report-generator
      │
      ├── phase/5-copilot-simulations
      │     ├── feature/cashflow-engine
      │     ├── feature/debt-simulator
      │     ├── feature/health-score-engine
      │     ├── feature/risk-radar-engine
      │     ├── feature/scenario-engine
      │     ├── feature/savings-planner
      │     └── feature/copilot-chat
      │
      ├── phase/6-new-features
      │     ├── feature/payment-allocation
      │     ├── feature/bonus-recommender
      │     └── feature/credit-score-integration
      │
      └── phase/7-hardening
            ├── feature/rate-limiting
            ├── feature/security-audit
            ├── feature/load-testing
            └── feature/sync-reliability

release/v1.0                  ← cut from develop when ready to ship
hotfix/<description>          ← cut from main only, for production emergencies
```

---

## Branch Rules

| Branch | Rule |
|---|---|
| `main` | Never push directly. PR only. CI must pass. |
| `develop` | Never push directly. Phase branches merge here via PR. |
| `phase/*` | Feature branches merge here. Delete after phase merges to develop. |
| `feature/*` | Your daily work branch. Delete after merging to phase. |
| `release/*` | Final testing before going to main. No new features here. |
| `hotfix/*` | Emergency only. Merges into both main AND develop. |

---

## One-Time Setup (Do This First)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/ArgusAI.git
cd ArgusAI

# 2. Create the develop branch from main
git checkout main
git checkout -b develop
git push -u origin develop
```

---

## Phase 1 — Foundation

**Branches to create:** `phase/1-foundation` + 3 feature branches

```bash
# Create phase branch
git checkout develop
git checkout -b phase/1-foundation
git push -u origin phase/1-foundation

# --- Feature: Auth Middleware ---
git checkout phase/1-foundation
git checkout -b feature/auth-middleware
git push -u origin feature/auth-middleware
# ... do your work, commit as you go ...
git checkout phase/1-foundation
git merge feature/auth-middleware --no-ff -m "merge: auth middleware"
git push origin phase/1-foundation
git branch -d feature/auth-middleware
git push origin --delete feature/auth-middleware

# --- Feature: Supabase Schema ---
git checkout phase/1-foundation
git checkout -b feature/supabase-schema
git push -u origin feature/supabase-schema
# ... work ...
git checkout phase/1-foundation
git merge feature/supabase-schema --no-ff -m "merge: supabase schema"
git push origin phase/1-foundation
git branch -d feature/supabase-schema
git push origin --delete feature/supabase-schema

# --- Feature: CI/CD Setup ---
git checkout phase/1-foundation
git checkout -b feature/cicd-setup
git push -u origin feature/cicd-setup
# ... work ...
git checkout phase/1-foundation
git merge feature/cicd-setup --no-ff -m "merge: cicd setup"
git push origin phase/1-foundation
git branch -d feature/cicd-setup
git push origin --delete feature/cicd-setup

# --- Phase 1 Complete: Merge into develop ---
git checkout develop
git merge phase/1-foundation --no-ff -m "phase 1 complete: foundation"
git push origin develop
git branch -d phase/1-foundation
git push origin --delete phase/1-foundation
```

---

## Phase 2 — Data Pipeline

**Branches to create:** `phase/2-data-pipeline` + 3 feature branches

```bash
# Create phase branch from updated develop
git checkout develop
git pull origin develop
git checkout -b phase/2-data-pipeline
git push -u origin phase/2-data-pipeline

# --- Feature: Plaid Link ---
git checkout phase/2-data-pipeline
git checkout -b feature/plaid-link
git push -u origin feature/plaid-link
# ... work ...
git checkout phase/2-data-pipeline
git merge feature/plaid-link --no-ff -m "merge: plaid link integration"
git push origin phase/2-data-pipeline
git branch -d feature/plaid-link
git push origin --delete feature/plaid-link

# --- Feature: Transaction Sync ---
git checkout phase/2-data-pipeline
git checkout -b feature/transaction-sync
git push -u origin feature/transaction-sync
# ... work ...
git checkout phase/2-data-pipeline
git merge feature/transaction-sync --no-ff -m "merge: transaction sync pipeline"
git push origin phase/2-data-pipeline
git branch -d feature/transaction-sync
git push origin --delete feature/transaction-sync

# --- Feature: Embedding Pipeline ---
git checkout phase/2-data-pipeline
git checkout -b feature/embedding-pipeline
git push -u origin feature/embedding-pipeline
# ... work ...
git checkout phase/2-data-pipeline
git merge feature/embedding-pipeline --no-ff -m "merge: embedding pipeline"
git push origin phase/2-data-pipeline
git branch -d feature/embedding-pipeline
git push origin --delete feature/embedding-pipeline

# --- Phase 2 Complete ---
git checkout develop
git merge phase/2-data-pipeline --no-ff -m "phase 2 complete: data pipeline"
git push origin develop
git branch -d phase/2-data-pipeline
git push origin --delete phase/2-data-pipeline
```

---

## Phase 3 — Intelligence Layer

**Branches to create:** `phase/3-intelligence-layer` + 5 feature branches

```bash
git checkout develop
git pull origin develop
git checkout -b phase/3-intelligence-layer
git push -u origin phase/3-intelligence-layer

# --- Feature: Bill Detection ---
git checkout phase/3-intelligence-layer
git checkout -b feature/bill-detection
git push -u origin feature/bill-detection
# ... work ...
git checkout phase/3-intelligence-layer
git merge feature/bill-detection --no-ff -m "merge: recurring bill detection"
git push origin phase/3-intelligence-layer
git branch -d feature/bill-detection
git push origin --delete feature/bill-detection

# --- Feature: Subscription Tracker ---
git checkout phase/3-intelligence-layer
git checkout -b feature/subscription-tracker
git push -u origin feature/subscription-tracker
# ... work ...
git checkout phase/3-intelligence-layer
git merge feature/subscription-tracker --no-ff -m "merge: subscription tracker"
git push origin phase/3-intelligence-layer
git branch -d feature/subscription-tracker
git push origin --delete feature/subscription-tracker

# --- Feature: Categorization ---
git checkout phase/3-intelligence-layer
git checkout -b feature/categorization
git push -u origin feature/categorization
# ... work ...
git checkout phase/3-intelligence-layer
git merge feature/categorization --no-ff -m "merge: AI transaction categorization"
git push origin phase/3-intelligence-layer
git branch -d feature/categorization
git push origin --delete feature/categorization

# --- Feature: Spending Streak Tracker ---
git checkout phase/3-intelligence-layer
git checkout -b feature/spending-streak-tracker
git push -u origin feature/spending-streak-tracker
# ... work ...
git checkout phase/3-intelligence-layer
git merge feature/spending-streak-tracker --no-ff -m "merge: spending streak / momentum tracker"
git push origin phase/3-intelligence-layer
git branch -d feature/spending-streak-tracker
git push origin --delete feature/spending-streak-tracker

# --- Feature: Bill Calendar ---
git checkout phase/3-intelligence-layer
git checkout -b feature/bill-calendar
git push -u origin feature/bill-calendar
# ... work ...
git checkout phase/3-intelligence-layer
git merge feature/bill-calendar --no-ff -m "merge: bill due date calendar view"
git push origin phase/3-intelligence-layer
git branch -d feature/bill-calendar
git push origin --delete feature/bill-calendar

# --- Phase 3 Complete ---
git checkout develop
git merge phase/3-intelligence-layer --no-ff -m "phase 3 complete: intelligence layer"
git push origin develop
git branch -d phase/3-intelligence-layer
git push origin --delete phase/3-intelligence-layer
```

---

## Phase 4 — AI Reports

**Branches to create:** `phase/4-ai-reports` + 3 feature branches

```bash
git checkout develop
git pull origin develop
git checkout -b phase/4-ai-reports
git push -u origin phase/4-ai-reports

# --- Feature: Anomaly Detection ---
git checkout phase/4-ai-reports
git checkout -b feature/anomaly-detection
git push -u origin feature/anomaly-detection
# ... work ...
git checkout phase/4-ai-reports
git merge feature/anomaly-detection --no-ff -m "merge: anomaly detection"
git push origin phase/4-ai-reports
git branch -d feature/anomaly-detection
git push origin --delete feature/anomaly-detection

# --- Feature: RAG Pipeline ---
git checkout phase/4-ai-reports
git checkout -b feature/rag-pipeline
git push -u origin feature/rag-pipeline
# ... work ...
git checkout phase/4-ai-reports
git merge feature/rag-pipeline --no-ff -m "merge: RAG retrieval pipeline"
git push origin phase/4-ai-reports
git branch -d feature/rag-pipeline
git push origin --delete feature/rag-pipeline

# --- Feature: Monthly Report Generator ---
git checkout phase/4-ai-reports
git checkout -b feature/monthly-report-generator
git push -u origin feature/monthly-report-generator
# ... work ...
git checkout phase/4-ai-reports
git merge feature/monthly-report-generator --no-ff -m "merge: monthly AI report generator"
git push origin phase/4-ai-reports
git branch -d feature/monthly-report-generator
git push origin --delete feature/monthly-report-generator

# --- Phase 4 Complete ---
git checkout develop
git merge phase/4-ai-reports --no-ff -m "phase 4 complete: AI reports"
git push origin develop
git branch -d phase/4-ai-reports
git push origin --delete phase/4-ai-reports
```

---

## Phase 5 — Copilot + Simulations

**Branches to create:** `phase/5-copilot-simulations` + 7 feature branches

```bash
git checkout develop
git pull origin develop
git checkout -b phase/5-copilot-simulations
git push -u origin phase/5-copilot-simulations

# --- Feature: Cashflow Engine ---
git checkout phase/5-copilot-simulations
git checkout -b feature/cashflow-engine
git push -u origin feature/cashflow-engine
# ... work ...
git checkout phase/5-copilot-simulations
git merge feature/cashflow-engine --no-ff -m "merge: cashflow prediction engine"
git push origin phase/5-copilot-simulations
git branch -d feature/cashflow-engine
git push origin --delete feature/cashflow-engine

# --- Feature: Debt Simulator ---
git checkout phase/5-copilot-simulations
git checkout -b feature/debt-simulator
git push -u origin feature/debt-simulator
# ... work ...
git checkout phase/5-copilot-simulations
git merge feature/debt-simulator --no-ff -m "merge: debt payoff simulator"
git push origin phase/5-copilot-simulations
git branch -d feature/debt-simulator
git push origin --delete feature/debt-simulator

# --- Feature: Health Score Engine ---
git checkout phase/5-copilot-simulations
git checkout -b feature/health-score-engine
git push -u origin feature/health-score-engine
# ... work ...
git checkout phase/5-copilot-simulations
git merge feature/health-score-engine --no-ff -m "merge: health score engine"
git push origin phase/5-copilot-simulations
git branch -d feature/health-score-engine
git push origin --delete feature/health-score-engine

# --- Feature: Risk Radar Engine ---
git checkout phase/5-copilot-simulations
git checkout -b feature/risk-radar-engine
git push -u origin feature/risk-radar-engine
# ... work ...
git checkout phase/5-copilot-simulations
git merge feature/risk-radar-engine --no-ff -m "merge: risk radar engine"
git push origin phase/5-copilot-simulations
git branch -d feature/risk-radar-engine
git push origin --delete feature/risk-radar-engine

# --- Feature: Scenario Engine ---
git checkout phase/5-copilot-simulations
git checkout -b feature/scenario-engine
git push -u origin feature/scenario-engine
# ... work ...
git checkout phase/5-copilot-simulations
git merge feature/scenario-engine --no-ff -m "merge: scenario simulator engine"
git push origin phase/5-copilot-simulations
git branch -d feature/scenario-engine
git push origin --delete feature/scenario-engine

# --- Feature: Savings Planner ---
git checkout phase/5-copilot-simulations
git checkout -b feature/savings-planner
git push -u origin feature/savings-planner
# ... work ...
git checkout phase/5-copilot-simulations
git merge feature/savings-planner --no-ff -m "merge: goal-based savings planner"
git push origin phase/5-copilot-simulations
git branch -d feature/savings-planner
git push origin --delete feature/savings-planner

# --- Feature: Copilot Chat ---
git checkout phase/5-copilot-simulations
git checkout -b feature/copilot-chat
git push -u origin feature/copilot-chat
# ... work ...
git checkout phase/5-copilot-simulations
git merge feature/copilot-chat --no-ff -m "merge: AI copilot chat interface"
git push origin phase/5-copilot-simulations
git branch -d feature/copilot-chat
git push origin --delete feature/copilot-chat

# --- Phase 5 Complete ---
git checkout develop
git merge phase/5-copilot-simulations --no-ff -m "phase 5 complete: copilot and simulations"
git push origin develop
git branch -d phase/5-copilot-simulations
git push origin --delete phase/5-copilot-simulations
```

---

## Phase 6 — New Features

**Branches to create:** `phase/6-new-features` + 3 feature branches

```bash
git checkout develop
git pull origin develop
git checkout -b phase/6-new-features
git push -u origin phase/6-new-features

# --- Feature: Payment Allocation ---
git checkout phase/6-new-features
git checkout -b feature/payment-allocation
git push -u origin feature/payment-allocation
# ... work ...
git checkout phase/6-new-features
git merge feature/payment-allocation --no-ff -m "merge: smart payment allocation"
git push origin phase/6-new-features
git branch -d feature/payment-allocation
git push origin --delete feature/payment-allocation

# --- Feature: Bonus Recommender ---
git checkout phase/6-new-features
git checkout -b feature/bonus-recommender
git push -u origin feature/bonus-recommender
# ... work ...
git checkout phase/6-new-features
git merge feature/bonus-recommender --no-ff -m "merge: bonus recommender"
git push origin phase/6-new-features
git branch -d feature/bonus-recommender
git push origin --delete feature/bonus-recommender

# --- Feature: Credit Score Integration ---
git checkout phase/6-new-features
git checkout -b feature/credit-score-integration
git push -u origin feature/credit-score-integration
# ... work ...
git checkout phase/6-new-features
git merge feature/credit-score-integration --no-ff -m "merge: credit score integration"
git push origin phase/6-new-features
git branch -d feature/credit-score-integration
git push origin --delete feature/credit-score-integration

# --- Phase 6 Complete ---
git checkout develop
git merge phase/6-new-features --no-ff -m "phase 6 complete: new features"
git push origin develop
git branch -d phase/6-new-features
git push origin --delete phase/6-new-features
```

---

## Phase 7 — Production Hardening

**Branches to create:** `phase/7-hardening` + 4 feature branches

```bash
git checkout develop
git pull origin develop
git checkout -b phase/7-hardening
git push -u origin phase/7-hardening

# --- Feature: Rate Limiting ---
git checkout phase/7-hardening
git checkout -b feature/rate-limiting
git push -u origin feature/rate-limiting
# ... work ...
git checkout phase/7-hardening
git merge feature/rate-limiting --no-ff -m "merge: per-user rate limiting"
git push origin phase/7-hardening
git branch -d feature/rate-limiting
git push origin --delete feature/rate-limiting

# --- Feature: Security Audit ---
git checkout phase/7-hardening
git checkout -b feature/security-audit
git push -u origin feature/security-audit
# ... work ...
git checkout phase/7-hardening
git merge feature/security-audit --no-ff -m "merge: security audit fixes"
git push origin phase/7-hardening
git branch -d feature/security-audit
git push origin --delete feature/security-audit

# --- Feature: Load Testing ---
git checkout phase/7-hardening
git checkout -b feature/load-testing
git push -u origin feature/load-testing
# ... work ...
git checkout phase/7-hardening
git merge feature/load-testing --no-ff -m "merge: load testing + performance fixes"
git push origin phase/7-hardening
git branch -d feature/load-testing
git push origin --delete feature/load-testing

# --- Feature: Sync Reliability ---
git checkout phase/7-hardening
git checkout -b feature/sync-reliability
git push -u origin feature/sync-reliability
# ... work ...
git checkout phase/7-hardening
git merge feature/sync-reliability --no-ff -m "merge: sync reliability indicator per account"
git push origin phase/7-hardening
git branch -d feature/sync-reliability
git push origin --delete feature/sync-reliability

# --- Phase 7 Complete ---
git checkout develop
git merge phase/7-hardening --no-ff -m "phase 7 complete: production hardening"
git push origin develop
git branch -d phase/7-hardening
git push origin --delete phase/7-hardening
```

---

## Shipping to Production (Release Flow)

Run this when develop is stable and a phase is ready to go live.

```bash
# Cut a release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.0

# Do final testing on this branch only
# Fix any last bugs here — no new features

# Merge into main (goes live)
git checkout main
git merge release/v1.0 --no-ff -m "release: v1.0"
git tag -a v1.0 -m "ArgusAI v1.0"
git push origin main
git push origin v1.0

# Merge back into develop so develop has the release fixes too
git checkout develop
git merge release/v1.0 --no-ff -m "sync release/v1.0 back into develop"
git push origin develop

# Clean up
git branch -d release/v1.0
git push origin --delete release/v1.0
```

---

## Hotfix Flow (Production Emergency Only)

```bash
# Cut hotfix directly from main
git checkout main
git pull origin main
git checkout -b hotfix/fix-plaid-token-leak

# Fix the issue, commit
git add .
git commit -m "hotfix: mask plaid token from API response"

# Merge into main
git checkout main
git merge hotfix/fix-plaid-token-leak --no-ff -m "hotfix: plaid token masking"
git tag -a v1.0.1 -m "hotfix v1.0.1"
git push origin main
git push origin v1.0.1

# Also merge into develop so the fix carries forward
git checkout develop
git merge hotfix/fix-plaid-token-leak --no-ff -m "sync hotfix into develop"
git push origin develop

# Clean up
git branch -d hotfix/fix-plaid-token-leak
git push origin --delete hotfix/fix-plaid-token-leak
```

---

## Daily Workflow (What You Do Every Day)

```bash
# Start of day — pull latest changes
git checkout feature/your-current-feature
git pull origin phase/current-phase   # get any updates from phase branch

# Do your work
git add <specific-files>
git commit -m "feat: short description of what you did"

# Push your work
git push origin feature/your-current-feature

# When feature is done — open a PR on GitHub
# feature/your-feature → phase/current-phase
# Get it reviewed, CI passes, then merge
```

---

## All Branches At a Glance

| Branch | Cut From | Merges Into | When |
|---|---|---|---|
| `develop` | `main` | — | One-time setup |
| `phase/1-foundation` | `develop` | `develop` | Start of Phase 1 |
| `phase/2-data-pipeline` | `develop` | `develop` | Start of Phase 2 |
| `phase/3-intelligence-layer` | `develop` | `develop` | Start of Phase 3 |
| `phase/4-ai-reports` | `develop` | `develop` | Start of Phase 4 |
| `phase/5-copilot-simulations` | `develop` | `develop` | Start of Phase 5 |
| `phase/6-new-features` | `develop` | `develop` | Start of Phase 6 |
| `phase/7-hardening` | `develop` | `develop` | Start of Phase 7 |
| `feature/*` | current phase | current phase | Per feature |
| `release/v*` | `develop` | `main` + `develop` | Before shipping |
| `hotfix/*` | `main` | `main` + `develop` | Emergencies only |

**Total feature branches across all phases: 25**
