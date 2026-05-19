# Phase 3.5 — AI Intelligence Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Phase 3 intelligence layer into a reasoning financial analyst with persistent memory — two Celery tasks that enrich detected records and synthesize analyst decisions, plus an Intelligence Feed UI.

**Architecture:** Stats-first tandem model — existing detection tasks run unchanged, then Layer 1 (`enrich_detected_records`) annotates each bill/subscription with a single Claude call, then Layer 2 (`synthesize_insights`) runs a financial analyst reasoning session using working + episodic + long-term memory, writes decisions to `ai_insights`, and updates a persistent user profile.

**Tech Stack:** FastAPI, Supabase (PostgreSQL), Celery + Redis, Anthropic SDK (claude-sonnet-4-6, prompt caching), Next.js 14 (App Router), TypeScript, Tailwind CSS

---

## File Map

**New backend files:**
- `backend/migrations/010_phase_3_5_intelligence.sql` — adds `ai_enrichment` columns + `user_financial_profiles` table
- `backend/tasks/enrich_detected_records.py` — Layer 1 Celery task
- `backend/tasks/synthesize_insights.py` — Layer 2 Celery task
- `backend/routers/insights.py` — `GET /insights` endpoint
- `backend/tests/test_enrich_detected_records.py` — unit tests for Layer 1 pure functions
- `backend/tests/test_synthesize_insights.py` — unit tests for Layer 2 pure functions

**Modified backend files:**
- `backend/tasks/detect_subscriptions.py` — chain to `enrich_detected_records_for_user` at end
- `backend/celery_app.py` — add two new tasks to `include` list
- `backend/main.py` — register `insights` router

**New frontend files:**
- `frontend/app/(app)/intelligence/page.tsx` — Intelligence Feed page

**Modified frontend files:**
- `frontend/app/(app)/layout.tsx` — add Intelligence nav item
- `frontend/app/(app)/dashboard/page.tsx` — add Latest Intelligence card
- `frontend/app/(app)/bills/page.tsx` — add `ai_enrichment` type + enrichment drawer
- `frontend/app/(app)/subscriptions/page.tsx` — add `ai_enrichment` type + enrichment drawer

> **Note on bills/subscriptions routers:** Both already use `select("*")` so `ai_enrichment` will appear in responses automatically once the migration runs — no router changes needed.

---

## Task 1: DB Migration

**Files:**
- Create: `backend/migrations/010_phase_3_5_intelligence.sql`

- [ ] **Step 1: Write the migration**

```sql
-- backend/migrations/010_phase_3_5_intelligence.sql

ALTER TABLE bills ADD COLUMN IF NOT EXISTS ai_enrichment JSONB;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS ai_enrichment JSONB;

CREATE TABLE IF NOT EXISTS user_financial_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users ON DELETE CASCADE,
  profile JSONB NOT NULL DEFAULT '{}',
  analyst_version INTEGER DEFAULT 1,
  last_enriched_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_financial_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_user_policy"
  ON user_financial_profiles
  FOR ALL
  USING (user_id = auth.uid());
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Run against the ArgusAI Supabase project. Verify the three schema changes appear: `bills.ai_enrichment`, `subscriptions.ai_enrichment`, and the new `user_financial_profiles` table with RLS enabled.

- [ ] **Step 3: Commit**

```bash
git add backend/migrations/010_phase_3_5_intelligence.sql
git commit -m "feat: migration 010 — ai_enrichment columns + user_financial_profiles table"
```

---

## Task 2: Layer 1 Pure Functions (TDD)

**Files:**
- Create: `backend/tests/test_enrich_detected_records.py`
- Create: `backend/tasks/enrich_detected_records.py` (pure functions only — no Celery task yet)

- [ ] **Step 1: Write the failing tests**

```python
# backend/tests/test_enrich_detected_records.py
import json

import pytest

from tasks.enrich_detected_records import (
    _build_enrichment_prompt,
    _parse_enrichment_response,
)


def test_build_prompt_includes_bill_merchant():
    bills = [{"id": "b1", "merchant": "Netflix", "avg_amount": 15.99,
               "recurrence_pattern": "monthly", "next_due_date": "2026-06-01"}]
    prompt = _build_enrichment_prompt(bills, [])
    assert "Netflix" in prompt
    assert "b1" in prompt


def test_build_prompt_includes_subscription_merchant():
    subs = [{"id": "s1", "merchant": "Spotify", "avg_amount": 9.99,
              "price_change_pct": 5.0, "billing_cycle": "monthly"}]
    prompt = _build_enrichment_prompt([], subs)
    assert "Spotify" in prompt
    assert "s1" in prompt


def test_build_prompt_handles_empty_lists():
    prompt = _build_enrichment_prompt([], [])
    assert "bills" in prompt.lower()
    assert "subscriptions" in prompt.lower()


def test_parse_valid_response():
    response = json.dumps({
        "bills": [{"id": "b1", "enrichment": {
            "ai_confidence": 0.9,
            "merchant_context": "video streaming",
            "classification_note": "monthly charges stable within $0.01",
            "is_subscription_candidate": True,
        }}],
        "subscriptions": [{"id": "s1", "enrichment": {
            "service_category": "streaming",
            "duplicate_flag": False,
            "duplicate_note": None,
            "price_trend_interpretation": "stable",
            "cancel_recommendation": False,
            "cancel_reasoning": None,
        }}],
    })
    result = _parse_enrichment_response(response)
    assert len(result["bills"]) == 1
    assert result["bills"][0]["id"] == "b1"
    assert result["bills"][0]["enrichment"]["ai_confidence"] == 0.9
    assert len(result["subscriptions"]) == 1
    assert result["subscriptions"][0]["id"] == "s1"


def test_parse_invalid_json_returns_empty():
    result = _parse_enrichment_response("not valid json at all")
    assert result == {"bills": [], "subscriptions": []}


def test_parse_non_dict_returns_empty():
    result = _parse_enrichment_response(json.dumps([1, 2, 3]))
    assert result == {"bills": [], "subscriptions": []}


def test_parse_missing_keys_defaults_to_empty_lists():
    result = _parse_enrichment_response(json.dumps({"bills": []}))
    assert result["subscriptions"] == []
    assert result["bills"] == []


def test_parse_strips_markdown_fences():
    response = '```json\n{"bills": [], "subscriptions": []}\n```'
    result = _parse_enrichment_response(response)
    assert result == {"bills": [], "subscriptions": []}
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && python -m pytest tests/test_enrich_detected_records.py -v
```

Expected: `ModuleNotFoundError` or `ImportError` — `tasks.enrich_detected_records` does not exist yet.

- [ ] **Step 3: Implement the pure functions**

```python
# backend/tasks/enrich_detected_records.py
import json

_SYSTEM_PROMPT = """You are ArgusAI's financial intelligence analyst. Your job is to enrich detected financial records with expert annotations.

For each bill and subscription provided, return structured enrichment that helps users understand their financial picture. Be specific and direct — no generic answers.

Respond ONLY with valid JSON in the exact shape requested. No explanation, no markdown."""


def _build_enrichment_prompt(bills: list[dict], subscriptions: list[dict]) -> str:
    bills_section = json.dumps(
        [
            {
                "id": b["id"],
                "merchant": b["merchant"],
                "avg_amount": b["avg_amount"],
                "recurrence_pattern": b["recurrence_pattern"],
                "next_due_date": b.get("next_due_date"),
            }
            for b in bills
        ],
        indent=2,
    )
    subs_section = json.dumps(
        [
            {
                "id": s["id"],
                "merchant": s["merchant"],
                "avg_amount": s["avg_amount"],
                "price_change_pct": s.get("price_change_pct"),
                "billing_cycle": s.get("billing_cycle"),
            }
            for s in subscriptions
        ],
        indent=2,
    )
    return (
        f"Enrich the following bills and subscriptions.\n\n"
        f"Bills:\n{bills_section}\n\n"
        f"Subscriptions:\n{subs_section}\n\n"
        f"Return a JSON object with this exact shape:\n"
        f'{{\n'
        f'  "bills": [\n'
        f'    {{\n'
        f'      "id": "<bill id>",\n'
        f'      "enrichment": {{\n'
        f'        "ai_confidence": <float 0-1>,\n'
        f'        "merchant_context": "<what this merchant sells>",\n'
        f'        "classification_note": "<why classified as recurring>",\n'
        f'        "is_subscription_candidate": <true|false>\n'
        f'      }}\n'
        f'    }}\n'
        f'  ],\n'
        f'  "subscriptions": [\n'
        f'    {{\n'
        f'      "id": "<subscription id>",\n'
        f'      "enrichment": {{\n'
        f'        "service_category": "<streaming|software|fitness|news|utilities|other>",\n'
        f'        "duplicate_flag": <true|false>,\n'
        f'        "duplicate_note": "<explanation or null>",\n'
        f'        "price_trend_interpretation": "<plain English interpretation>",\n'
        f'        "cancel_recommendation": <true|false>,\n'
        f'        "cancel_reasoning": "<explanation or null>"\n'
        f'      }}\n'
        f'    }}\n'
        f'  ]\n'
        f'}}'
    )


def _parse_enrichment_response(response_text: str) -> dict:
    text = response_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return {"bills": [], "subscriptions": []}
    if not isinstance(parsed, dict):
        return {"bills": [], "subscriptions": []}
    return {
        "bills": parsed.get("bills", []),
        "subscriptions": parsed.get("subscriptions", []),
    }
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd backend && python -m pytest tests/test_enrich_detected_records.py -v
```

Expected: 8 tests passing.

- [ ] **Step 5: Commit**

```bash
git add backend/tasks/enrich_detected_records.py backend/tests/test_enrich_detected_records.py
git commit -m "feat: enrich_detected_records — pure functions with tests (TDD green)"
```

---

## Task 3: Layer 1 Celery Task + Chain

**Files:**
- Modify: `backend/tasks/enrich_detected_records.py` — add Celery task
- Modify: `backend/tasks/detect_subscriptions.py` — chain to Layer 1 at end
- Modify: `backend/celery_app.py` — add to include list

- [ ] **Step 1: Add Celery task to `enrich_detected_records.py`**

Add these imports at the top of `backend/tasks/enrich_detected_records.py` after the existing content:

```python
import os
import uuid
from datetime import datetime, timezone

import anthropic

from celery_app import celery
from db.client import get_supabase
```

Then append the Celery task at the bottom of the file:

```python
@celery.task(name="tasks.enrich_detected_records.enrich_detected_records_for_user")
def enrich_detected_records_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    bills_result = (
        supabase.table("bills")
        .select("id, merchant, avg_amount, recurrence_pattern, next_due_date")
        .eq("user_id", user_id)
        .execute()
    )
    subs_result = (
        supabase.table("subscriptions")
        .select("id, merchant, avg_amount, price_change_pct, billing_cycle")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    )

    bills = bills_result.data or []
    subscriptions = subs_result.data or []

    if not bills and not subscriptions:
        return {"user_id": user_id, "bills_enriched": 0, "subscriptions_enriched": 0}

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    prompt = _build_enrichment_prompt(bills, subscriptions)

    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            system=[{
                "type": "text",
                "text": _SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }],
            messages=[{"role": "user", "content": prompt}],
        )
        response_text = message.content[0].text
    except Exception:
        return {"user_id": user_id, "bills_enriched": 0, "subscriptions_enriched": 0}

    enrichment = _parse_enrichment_response(response_text)

    bills_enriched = 0
    for item in enrichment.get("bills", []):
        bill_id = item.get("id")
        if not bill_id or "enrichment" not in item:
            continue
        supabase.table("bills").update({"ai_enrichment": item["enrichment"]}).eq("id", bill_id).execute()
        bills_enriched += 1

    subs_enriched = 0
    for item in enrichment.get("subscriptions", []):
        sub_id = item.get("id")
        if not sub_id or "enrichment" not in item:
            continue
        supabase.table("subscriptions").update({"ai_enrichment": item["enrichment"]}).eq("id", sub_id).execute()
        subs_enriched += 1

    now = datetime.now(timezone.utc).isoformat()
    supabase.table("user_financial_profiles").upsert(
        {"user_id": user_id, "last_enriched_at": now, "last_updated": now},
        on_conflict="user_id",
    ).execute()

    from tasks.synthesize_insights import synthesize_insights_for_user
    synthesize_insights_for_user.delay(user_id)

    return {
        "user_id": user_id,
        "bills_enriched": bills_enriched,
        "subscriptions_enriched": subs_enriched,
    }
```

- [ ] **Step 2: Chain Layer 1 at the end of `detect_subscriptions_for_user`**

In `backend/tasks/detect_subscriptions.py`, add these two lines before the `return` statement at the end of `detect_subscriptions_for_user`:

```python
    from tasks.enrich_detected_records import enrich_detected_records_for_user
    enrich_detected_records_for_user.delay(user_id)
```

The end of the function should now read:

```python
    from tasks.enrich_detected_records import enrich_detected_records_for_user
    enrich_detected_records_for_user.delay(user_id)

    return {"user_id": user_id, "subscriptions_detected": len(subs)}
```

- [ ] **Step 3: Register new tasks in `celery_app.py`**

In `backend/celery_app.py`, update the `include` list:

```python
    include=[
        "tasks.sync_transactions",
        "tasks.generate_embeddings",
        "tasks.detect_bills",
        "tasks.detect_subscriptions",
        "tasks.categorize_transactions",
        "tasks.enrich_detected_records",
        "tasks.synthesize_insights",
    ],
```

- [ ] **Step 4: Run the full test suite to confirm nothing broke**

```bash
cd backend && python -m pytest -v
```

Expected: all existing tests still passing, 8 new tests passing.

- [ ] **Step 5: Commit**

```bash
git add backend/tasks/enrich_detected_records.py backend/tasks/detect_subscriptions.py backend/celery_app.py
git commit -m "feat: enrich_detected_records Celery task — annotates bills and subscriptions after detection"
```

---

## Task 4: Layer 2 Pure Functions (TDD)

**Files:**
- Create: `backend/tests/test_synthesize_insights.py`
- Create: `backend/tasks/synthesize_insights.py` (pure functions only)

- [ ] **Step 1: Write the failing tests**

```python
# backend/tests/test_synthesize_insights.py
import json
from datetime import date, timedelta

import pytest

from tasks.synthesize_insights import (
    _aggregate_transactions,
    _build_analyst_brief,
    _parse_synthesis_response,
)


def _make_txn(category: str, amount: float, days_ago: int) -> dict:
    d = (date.today() - timedelta(days=days_ago)).isoformat()
    return {"category": category, "amount": amount, "timestamp": f"{d}T12:00:00"}


def test_aggregate_transactions_last_30():
    txns = [
        _make_txn("FOOD_AND_DRINK", 50.0, 5),
        _make_txn("FOOD_AND_DRINK", 30.0, 10),
        _make_txn("FOOD_AND_DRINK", 20.0, 80),  # outside 90-day window
    ]
    result = _aggregate_transactions(txns)
    assert "FOOD_AND_DRINK" in result
    assert result["FOOD_AND_DRINK"]["last_30_total"] == 80.0


def test_aggregate_transactions_baseline_uses_90_days():
    txns = [_make_txn("SHOPPING", 100.0, i * 10) for i in range(9)]  # 9 charges in 90 days
    result = _aggregate_transactions(txns)
    assert result["SHOPPING"]["monthly_baseline"] == pytest.approx(300.0, rel=0.05)


def test_aggregate_transactions_empty():
    result = _aggregate_transactions([])
    assert result == {}


def test_aggregate_skips_bad_timestamps():
    txns = [
        {"category": "FOOD_AND_DRINK", "amount": 10.0, "timestamp": "bad-date"},
        _make_txn("FOOD_AND_DRINK", 20.0, 5),
    ]
    result = _aggregate_transactions(txns)
    assert result["FOOD_AND_DRINK"]["last_30_total"] == 20.0


def test_build_analyst_brief_includes_all_sections():
    accounts = [{"account_type": "checking", "balance": 1000.0, "credit_limit": None}]
    bills = [{"merchant": "Rent", "avg_amount": 1200.0, "next_due_date": "2026-06-01", "ai_enrichment": None}]
    subs = [{"merchant": "Netflix", "avg_amount": 15.99, "price_change_pct": 0.0, "ai_enrichment": None}]
    tx_summary = {"FOOD_AND_DRINK": {"monthly_baseline": 200.0, "last_30_total": 280.0, "change_pct": 40.0}}
    brief = _build_analyst_brief(accounts, bills, subs, tx_summary, [], {})
    assert "Rent" in brief
    assert "Netflix" in brief
    assert "FOOD_AND_DRINK" in brief
    assert "decisions" in brief
    assert "updated_profile" in brief


def test_parse_synthesis_response_valid():
    response = json.dumps({
        "decisions": [{
            "signal_type": "behavioral",
            "severity": "warning",
            "title": "Dining up 40%",
            "reasoning": "Three week trend",
            "recommendation": "Set a limit",
            "simulation": "Will reach $400 by August",
            "confidence": 0.85,
            "sources": ["transactions:FOOD_AND_DRINK"],
        }],
        "updated_profile": {
            "income_pattern": {},
            "spending_baselines": {},
            "behavioral_patterns": [],
            "known_risks": [],
            "analyst_notes": "First session",
            "resolved_patterns": [],
        },
    })
    result = _parse_synthesis_response(response)
    assert len(result["decisions"]) == 1
    assert result["decisions"][0]["title"] == "Dining up 40%"
    assert result["updated_profile"]["analyst_notes"] == "First session"


def test_parse_synthesis_response_invalid_json():
    result = _parse_synthesis_response("garbage")
    assert result == {"decisions": [], "updated_profile": {}}


def test_parse_synthesis_response_strips_markdown():
    inner = json.dumps({"decisions": [], "updated_profile": {}})
    result = _parse_synthesis_response(f"```json\n{inner}\n```")
    assert result["decisions"] == []
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && python -m pytest tests/test_synthesize_insights.py -v
```

Expected: `ImportError` — `tasks.synthesize_insights` does not exist yet.

- [ ] **Step 3: Implement the pure functions**

```python
# backend/tasks/synthesize_insights.py
import json
from collections import defaultdict
from datetime import date, timedelta

_ANALYST_SYSTEM_PROMPT = """You are ArgusAI's financial intelligence analyst. You have access to a user's complete financial picture.

Reason like a senior financial analyst: identify what matters, simulate forward implications, and produce structured actionable decisions.

Rules:
- Never describe data — interpret it
- Never state the obvious — surface what the user would not notice themselves
- Reference prior patterns from the user profile where relevant
- Be direct and specific in recommendations
- Simulate consequences: "At current trajectory, X will cost Y by Z"

Respond ONLY with valid JSON in the exact shape requested. No explanation, no markdown."""


def _aggregate_transactions(transactions: list[dict]) -> dict:
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    ninety_days_ago = today - timedelta(days=90)

    by_category: dict[str, dict] = defaultdict(lambda: {"last_30": [], "last_90": []})

    for txn in transactions:
        try:
            txn_date = date.fromisoformat(str(txn["timestamp"])[:10])
        except (ValueError, KeyError):
            continue
        category = txn.get("category", "OTHER")
        amount = float(txn.get("amount", 0))
        if txn_date >= ninety_days_ago:
            by_category[category]["last_90"].append(amount)
        if txn_date >= thirty_days_ago:
            by_category[category]["last_30"].append(amount)

    result = {}
    for category, data in by_category.items():
        last_90_total = sum(data["last_90"])
        last_30_total = sum(data["last_30"])
        monthly_baseline = last_90_total / 3 if data["last_90"] else 0
        change_pct = (
            round(((last_30_total - monthly_baseline) / monthly_baseline) * 100, 1)
            if monthly_baseline
            else 0
        )
        result[category] = {
            "monthly_baseline": round(monthly_baseline, 2),
            "last_30_total": round(last_30_total, 2),
            "change_pct": change_pct,
        }
    return result


def _build_analyst_brief(
    accounts: list[dict],
    bills: list[dict],
    subscriptions: list[dict],
    tx_summary: dict,
    past_insights: list[dict],
    profile: dict,
) -> str:
    today = date.today().isoformat()
    recent_memory = json.dumps(
        [{"title": i.get("summary"), "created_at": i.get("created_at")} for i in past_insights],
        indent=2,
    )
    return (
        f"Today: {today}\n\n"
        f"USER FINANCIAL PROFILE (long-term memory):\n{json.dumps(profile, indent=2)}\n\n"
        f"RECENT ANALYST DECISIONS (episodic memory — last 5):\n{recent_memory}\n\n"
        f"CURRENT ACCOUNTS:\n{json.dumps([{'type': a.get('account_type'), 'balance': a.get('balance'), 'credit_limit': a.get('credit_limit')} for a in accounts], indent=2)}\n\n"
        f"UPCOMING BILLS:\n{json.dumps([{'merchant': b.get('merchant'), 'amount': b.get('avg_amount'), 'due': b.get('next_due_date'), 'enrichment': b.get('ai_enrichment')} for b in bills], indent=2)}\n\n"
        f"ACTIVE SUBSCRIPTIONS:\n{json.dumps([{'merchant': s.get('merchant'), 'amount': s.get('avg_amount'), 'price_change_pct': s.get('price_change_pct'), 'enrichment': s.get('ai_enrichment')} for s in subscriptions], indent=2)}\n\n"
        f"SPENDING SUMMARY (last 90 days by category):\n{json.dumps(tx_summary, indent=2)}\n\n"
        f"Generate 3-5 analyst decisions AND an updated user profile.\n\n"
        f"Return this exact JSON shape:\n"
        f'{{\n'
        f'  "decisions": [\n'
        f'    {{\n'
        f'      "signal_type": "<behavioral|risk|opportunity|anomaly|subscription>",\n'
        f'      "severity": "<info|warning|critical>",\n'
        f'      "title": "<specific, concrete title>",\n'
        f'      "reasoning": "<interpret, reference history, explain pattern>",\n'
        f'      "recommendation": "<specific action>",\n'
        f'      "simulation": "<forward projection>",\n'
        f'      "confidence": <float 0-1>,\n'
        f'      "sources": ["<data sources>"]  \n'
        f'    }}\n'
        f'  ],\n'
        f'  "updated_profile": {{\n'
        f'    "income_pattern": {{}},\n'
        f'    "spending_baselines": {{}},\n'
        f'    "behavioral_patterns": [],\n'
        f'    "known_risks": [],\n'
        f'    "analyst_notes": "<running notes about this user>",\n'
        f'    "resolved_patterns": []\n'
        f'  }}\n'
        f'}}'
    )


def _parse_synthesis_response(response_text: str) -> dict:
    text = response_text.strip()
    if text.startswith("```"):
        lines = text.splitlines()
        text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
    try:
        parsed = json.loads(text)
    except (json.JSONDecodeError, ValueError):
        return {"decisions": [], "updated_profile": {}}
    if not isinstance(parsed, dict):
        return {"decisions": [], "updated_profile": {}}
    return {
        "decisions": parsed.get("decisions", []),
        "updated_profile": parsed.get("updated_profile", {}),
    }
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd backend && python -m pytest tests/test_synthesize_insights.py -v
```

Expected: 8 tests passing.

- [ ] **Step 5: Commit**

```bash
git add backend/tasks/synthesize_insights.py backend/tests/test_synthesize_insights.py
git commit -m "feat: synthesize_insights — pure functions with tests (TDD green)"
```

---

## Task 5: Layer 2 Celery Task

**Files:**
- Modify: `backend/tasks/synthesize_insights.py` — add Celery task

- [ ] **Step 1: Add imports at the top of `synthesize_insights.py`**

After the existing imports, add:

```python
import os
import uuid
from datetime import datetime, timezone

import anthropic

from celery_app import celery
from db.client import get_supabase
```

- [ ] **Step 2: Append the Celery task at the bottom of `synthesize_insights.py`**

```python
@celery.task(name="tasks.synthesize_insights.synthesize_insights_for_user")
def synthesize_insights_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    accts = (
        supabase.table("accounts")
        .select("account_type, balance, credit_limit")
        .eq("user_id", user_id)
        .execute()
    )
    account_ids_result = (
        supabase.table("accounts")
        .select("id")
        .eq("user_id", user_id)
        .execute()
    )
    account_ids = [a["id"] for a in account_ids_result.data or []]

    bills_result = (
        supabase.table("bills")
        .select("merchant, avg_amount, next_due_date, ai_enrichment")
        .eq("user_id", user_id)
        .execute()
    )
    subs_result = (
        supabase.table("subscriptions")
        .select("merchant, avg_amount, price_change_pct, ai_enrichment")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    )

    txn_result = (
        supabase.table("transactions")
        .select("category, amount, timestamp")
        .in_("account_id", account_ids)
        .order("timestamp", desc=True)
        .limit(500)
        .execute()
    ) if account_ids else type("R", (), {"data": []})()

    past_insights = (
        supabase.table("ai_insights")
        .select("summary, created_at")
        .eq("user_id", user_id)
        .eq("insight_type", "analyst_decision")
        .order("created_at", desc=True)
        .limit(5)
        .execute()
    ).data or []

    profile_result = (
        supabase.table("user_financial_profiles")
        .select("profile")
        .eq("user_id", user_id)
        .execute()
    )
    profile = profile_result.data[0]["profile"] if profile_result.data else {}

    tx_summary = _aggregate_transactions(txn_result.data or [])
    brief = _build_analyst_brief(
        accounts=accts.data or [],
        bills=bills_result.data or [],
        subscriptions=subs_result.data or [],
        tx_summary=tx_summary,
        past_insights=past_insights,
        profile=profile,
    )

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=8096,
            system=[{
                "type": "text",
                "text": _ANALYST_SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            }],
            messages=[{"role": "user", "content": brief}],
        )
        response_text = message.content[0].text
    except Exception:
        return {"user_id": user_id, "decisions_written": 0}

    result = _parse_synthesis_response(response_text)

    now = datetime.now(timezone.utc).isoformat()
    decisions_written = 0
    for decision in result.get("decisions", []):
        supabase.table("ai_insights").insert({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "insight_type": "analyst_decision",
            "summary": decision.get("title", ""),
            "structured_output_json": decision,
            "created_at": now,
        }).execute()
        decisions_written += 1

    updated_profile = result.get("updated_profile")
    if updated_profile:
        supabase.table("user_financial_profiles").upsert(
            {"user_id": user_id, "profile": updated_profile, "last_updated": now},
            on_conflict="user_id",
        ).execute()

    return {"user_id": user_id, "decisions_written": decisions_written}
```

- [ ] **Step 3: Run the full test suite**

```bash
cd backend && python -m pytest -v
```

Expected: all tests passing (no regressions).

- [ ] **Step 4: Commit**

```bash
git add backend/tasks/synthesize_insights.py
git commit -m "feat: synthesize_insights Celery task — financial analyst reasoning session with persistent profile"
```

---

## Task 6: `GET /insights` Endpoint

**Files:**
- Create: `backend/routers/insights.py`
- Modify: `backend/main.py` — register insights router

- [ ] **Step 1: Create the router**

```python
# backend/routers/insights.py
from fastapi import APIRouter, Depends, Query

from db.client import get_supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("")
async def get_insights(
    limit: int = Query(default=20, le=50),
    signal_type: str | None = Query(default=None),
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase()
    result = (
        supabase.table("ai_insights")
        .select("id, insight_type, summary, structured_output_json, created_at")
        .eq("user_id", user_id)
        .eq("insight_type", "analyst_decision")
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    data = result.data or []
    if signal_type:
        data = [
            r for r in data
            if (r.get("structured_output_json") or {}).get("signal_type") == signal_type
        ]
    return data
```

- [ ] **Step 2: Register the router in `main.py`**

In `backend/main.py`, update the imports line and add the router:

```python
from routers import auth, bills, insights, plaid, subscriptions, transactions
```

And add after the existing `app.include_router(subscriptions.router)` line:

```python
app.include_router(insights.router)
```

- [ ] **Step 3: Verify the endpoint is registered**

```bash
cd backend && python -c "from main import app; print([r.path for r in app.routes])"
```

Expected output includes `/insights`.

- [ ] **Step 4: Commit**

```bash
git add backend/routers/insights.py backend/main.py
git commit -m "feat: GET /insights endpoint — returns analyst decisions feed"
```

---

## Task 7: Intelligence Feed Page + Nav Item

**Files:**
- Create: `frontend/app/(app)/intelligence/page.tsx`
- Modify: `frontend/app/(app)/layout.tsx` — add Intelligence nav item

- [ ] **Step 1: Create the Intelligence Feed page**

```tsx
// frontend/app/(app)/intelligence/page.tsx
"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";

type AnalystDecision = {
  id: string;
  summary: string;
  created_at: string;
  structured_output_json: {
    signal_type: "behavioral" | "risk" | "opportunity" | "anomaly" | "subscription";
    severity: "info" | "warning" | "critical";
    title: string;
    reasoning: string;
    recommendation: string;
    simulation?: string;
    confidence: number;
    sources?: string[];
  };
};

const SEVERITY_CHIP: Record<string, string> = {
  critical: "bg-red-900/40 text-red-400 border border-red-800/40",
  warning: "bg-amber-900/40 text-amber-400 border border-amber-800/40",
  info: "bg-blue-900/40 text-blue-400 border border-blue-800/40",
};

const CARD_BORDER: Record<string, string> = {
  critical: "border-red-800/30",
  warning: "border-amber-800/30",
  info: "border-gray-800",
};

const SIGNAL_LABEL: Record<string, string> = {
  behavioral: "Behavioral",
  risk: "Risk",
  opportunity: "Opportunity",
  anomaly: "Anomaly",
  subscription: "Subscription",
};

const SIGNAL_ORDER = ["risk", "behavioral", "anomaly", "subscription", "opportunity"];

function DecisionCard({ decision }: { decision: AnalystDecision }) {
  const d = decision.structured_output_json;
  return (
    <div className={`bg-gray-900 rounded-2xl border ${CARD_BORDER[d.severity] ?? "border-gray-800"} p-6 space-y-3`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm font-semibold text-white">{d.title}</p>
        <span className={`text-xs font-semibold uppercase tracking-wide px-2 py-0.5 rounded shrink-0 ${SEVERITY_CHIP[d.severity] ?? SEVERITY_CHIP.info}`}>
          {d.severity}
        </span>
      </div>
      <p className="text-sm text-gray-300">{d.reasoning}</p>
      <p className="text-sm text-indigo-300 font-medium">→ {d.recommendation}</p>
      {d.simulation && (
        <p className="text-xs text-gray-500 italic">{d.simulation}</p>
      )}
      <p className="text-xs text-gray-600">
        {new Date(decision.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
        {typeof d.confidence === "number" && (
          <> &middot; {Math.round(d.confidence * 100)}% confidence</>
        )}
      </p>
    </div>
  );
}

export default function IntelligencePage() {
  const [decisions, setDecisions] = useState<AnalystDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<AnalystDecision[]>("/insights?limit=50")
      .then(setDecisions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const grouped = SIGNAL_ORDER.reduce<Record<string, AnalystDecision[]>>((acc, type) => {
    const items = decisions.filter((d) => d.structured_output_json.signal_type === type);
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Intelligence Feed</h1>
        <p className="text-gray-500 text-sm">Analyst decisions generated after each account sync</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 animate-pulse space-y-3">
              <div className="h-4 w-48 bg-gray-800 rounded" />
              <div className="h-3 w-full bg-gray-800 rounded" />
              <div className="h-3 w-3/4 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      ) : decisions.length === 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 px-6 py-12 text-center">
          <p className="text-sm text-gray-500">No analyst decisions yet.</p>
          <p className="text-xs text-gray-600 mt-1">
            <Link href="/accounts" className="text-indigo-400 hover:underline">
              Sync your accounts →
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([type, items]) => (
            <section key={type}>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {SIGNAL_LABEL[type] ?? type}
              </h2>
              <div className="space-y-4">
                {items.map((d) => (
                  <DecisionCard key={d.id} decision={d} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add Intelligence nav item to `layout.tsx`**

In `frontend/app/(app)/layout.tsx`, find the `navItems` array. After the `Subscriptions` item (before the first `{ type: "divider" }`), insert:

```tsx
  {
    label: "Intelligence",
    href: "/intelligence",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
```

- [ ] **Step 3: Commit**

```bash
git add frontend/app/(app)/intelligence/page.tsx frontend/app/(app)/layout.tsx
git commit -m "feat: Intelligence Feed page + nav item"
```

---

## Task 8: Dashboard "Latest Intelligence" Card

**Files:**
- Modify: `frontend/app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Add the `AnalystDecision` type and fetch to `dashboard/page.tsx`**

Add the type after the existing `Subscription` type:

```tsx
type AnalystDecision = {
  id: string;
  summary: string;
  created_at: string;
  structured_output_json: {
    signal_type: string;
    severity: "info" | "warning" | "critical";
    title: string;
    recommendation: string;
  };
};
```

- [ ] **Step 2: Add state and fetch for insights**

In the component, add state after existing `useState` declarations:

```tsx
  const [topInsights, setTopInsights] = useState<AnalystDecision[]>([]);
```

In the `load()` function inside `useEffect`, add to the `Promise.all`:

```tsx
    const [acctsData, txnData, allTxnData, billsData, subsData, insightsData] =
      await Promise.all([
        api.get<{ accounts: Account[] }>("/plaid/accounts"),
        api.get<{ transactions: Transaction[] }>("/transactions?limit=5"),
        api.get<{ transactions: Transaction[] }>("/transactions?limit=200"),
        api.get<{ bills: Bill[] }>("/bills"),
        api.get<{ subscriptions: Subscription[] }>("/subscriptions"),
        api.get<AnalystDecision[]>("/insights?limit=2").catch(() => []),
      ]);
    // ... existing setters ...
    setTopInsights(insightsData.filter((d) =>
      d.structured_output_json.severity === "critical" ||
      d.structured_output_json.severity === "warning"
    ).slice(0, 2));
```

- [ ] **Step 3: Add the card in the JSX**

After the existing second row of cards (`Upcoming Bills`, `Subscriptions`, `Spending This Month`), add a full-width Latest Intelligence card before the Recent Transactions table:

```tsx
      {topInsights.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-indigo-900/40 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Latest Intelligence</h2>
            <Link href="/intelligence" className="text-xs text-indigo-400 hover:underline">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-gray-800/50">
            {topInsights.map((insight) => {
              const d = insight.structured_output_json;
              const severityColor = d.severity === "critical" ? "text-red-400" : "text-amber-400";
              return (
                <div key={insight.id} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase ${severityColor}`}>{d.severity}</span>
                    <span className="text-xs text-gray-600">{d.signal_type}</span>
                  </div>
                  <p className="text-sm text-white">{d.title}</p>
                  <p className="text-xs text-indigo-300 mt-1">→ {d.recommendation}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/(app)/dashboard/page.tsx
git commit -m "feat: dashboard Latest Intelligence card — shows 2 most recent warning/critical decisions"
```

---

## Task 9: Bills Enrichment Drawer

**Files:**
- Modify: `frontend/app/(app)/bills/page.tsx`

- [ ] **Step 1: Update the `Bill` type and add drawer state**

Replace the existing `Bill` type with:

```tsx
type BillEnrichment = {
  ai_confidence: number;
  merchant_context: string;
  classification_note: string;
  is_subscription_candidate: boolean;
};

type Bill = {
  id: string;
  merchant: string;
  recurrence_pattern: string;
  avg_amount: number;
  next_due_date: string;
  last_seen: string;
  ai_enrichment: BillEnrichment | null;
};
```

Add drawer state after existing `useState` declarations:

```tsx
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
```

- [ ] **Step 2: Make bill rows clickable**

In the bill list, replace:

```tsx
              <div key={bill.id} className="px-6 py-4 flex items-center justify-between">
```

with:

```tsx
              <div
                key={bill.id}
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/40 transition-colors"
                onClick={() => setSelectedBill(bill)}
              >
```

- [ ] **Step 3: Add the drawer JSX at the end of the returned JSX (before the closing `</div>`)**

```tsx
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedBill(null)}>
          <div
            className="w-full max-w-sm bg-gray-900 border-l border-gray-800 h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white">{selectedBill.merchant}</h2>
              <button
                onClick={() => setSelectedBill(null)}
                className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Amount</p>
                <p className="text-white font-medium">
                  ${selectedBill.avg_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} / {selectedBill.recurrence_pattern}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Next Due</p>
                <p className={urgencyColor(selectedBill.next_due_date)}>
                  {urgencyLabel(selectedBill.next_due_date)} &middot;{" "}
                  {new Date(selectedBill.next_due_date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                </p>
              </div>

              {selectedBill.ai_enrichment ? (
                <>
                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Analyst Annotations</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">What is this?</p>
                    <p className="text-gray-300">{selectedBill.ai_enrichment.merchant_context}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Why classified as recurring?</p>
                    <p className="text-gray-300">{selectedBill.ai_enrichment.classification_note}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Confidence</p>
                    <p className="text-white">{Math.round(selectedBill.ai_enrichment.ai_confidence * 100)}%</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Subscription candidate?</p>
                    <p className={selectedBill.ai_enrichment.is_subscription_candidate ? "text-indigo-400" : "text-gray-500"}>
                      {selectedBill.ai_enrichment.is_subscription_candidate ? "Yes" : "No"}
                    </p>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-500">Analyst annotations not yet available. Run a sync to generate enrichment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/(app)/bills/page.tsx
git commit -m "feat: bills enrichment drawer — click any bill to see analyst annotations"
```

---

## Task 10: Subscriptions Enrichment Drawer

**Files:**
- Modify: `frontend/app/(app)/subscriptions/page.tsx`

- [ ] **Step 1: Update the `Subscription` type and add drawer state**

Replace the existing `Subscription` type with:

```tsx
type SubscriptionEnrichment = {
  service_category: string;
  duplicate_flag: boolean;
  duplicate_note: string | null;
  price_trend_interpretation: string;
  cancel_recommendation: boolean;
  cancel_reasoning: string | null;
};

type Subscription = {
  id: string;
  merchant: string;
  avg_amount: number;
  billing_cycle: string;
  price_change_pct: number | null;
  is_active: boolean;
  ai_enrichment: SubscriptionEnrichment | null;
};
```

Add drawer state after existing `useState` declarations:

```tsx
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
```

- [ ] **Step 2: Make subscription rows clickable**

In the subscription list, replace:

```tsx
              <div key={sub.id} className="px-6 py-4 flex items-center justify-between">
```

with:

```tsx
              <div
                key={sub.id}
                className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-800/40 transition-colors"
                onClick={() => setSelectedSub(sub)}
              >
```

- [ ] **Step 3: Add the drawer JSX at the end of the returned JSX (before the closing `</div>`)**

```tsx
      {selectedSub && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedSub(null)}>
          <div
            className="w-full max-w-sm bg-gray-900 border-l border-gray-800 h-full overflow-y-auto p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-white">{selectedSub.merchant}</h2>
              <button
                onClick={() => setSelectedSub(null)}
                className="text-gray-500 hover:text-white transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Cost</p>
                <p className="text-white font-medium">
                  ${selectedSub.avg_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}/mo
                </p>
              </div>
              {selectedSub.price_change_pct !== null && selectedSub.price_change_pct > 5 && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Price Creep</p>
                  <p className="text-red-400">+{selectedSub.price_change_pct.toFixed(1)}% vs 3 months ago</p>
                </div>
              )}

              {selectedSub.ai_enrichment ? (
                <>
                  <div className="border-t border-gray-800 pt-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Analyst Annotations</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Service type</p>
                    <p className="text-gray-300 capitalize">{selectedSub.ai_enrichment.service_category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price trend</p>
                    <p className="text-gray-300">{selectedSub.ai_enrichment.price_trend_interpretation}</p>
                  </div>
                  {selectedSub.ai_enrichment.duplicate_flag && (
                    <div>
                      <p className="text-xs text-amber-400 mb-1">⚠ Duplicate service detected</p>
                      <p className="text-gray-300">{selectedSub.ai_enrichment.duplicate_note}</p>
                    </div>
                  )}
                  {selectedSub.ai_enrichment.cancel_recommendation && (
                    <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-3">
                      <p className="text-xs text-red-400 font-semibold mb-1">Analyst recommends cancellation</p>
                      <p className="text-gray-300 text-xs">{selectedSub.ai_enrichment.cancel_reasoning}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="border-t border-gray-800 pt-4">
                  <p className="text-xs text-gray-500">Analyst annotations not yet available. Run a sync to generate enrichment.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/app/(app)/subscriptions/page.tsx
git commit -m "feat: subscriptions enrichment drawer — analyst service category, duplicate flags, cancel recommendations"
```

---

## Final Verification

- [ ] **Run the complete backend test suite**

```bash
cd backend && python -m pytest -v
```

Expected: all tests passing, no regressions.

- [ ] **Verify Celery task chain in Python REPL**

```python
# From backend/ directory
from tasks.detect_subscriptions import detect_subscriptions_for_user
import inspect
src = inspect.getsource(detect_subscriptions_for_user)
assert "enrich_detected_records_for_user" in src
print("Chain verified")
```

- [ ] **Verify all new tasks registered in Celery**

```python
from celery_app import celery
tasks = list(celery.tasks.keys())
assert "tasks.enrich_detected_records.enrich_detected_records_for_user" in tasks
assert "tasks.synthesize_insights.synthesize_insights_for_user" in tasks
print("Tasks registered:", [t for t in tasks if "enrich" in t or "synth" in t])
```

- [ ] **Final commit**

```bash
git add -A
git commit -m "feat: Phase 3.5 complete — AI intelligence upgrade with analyst reasoning and persistent profile"
```
