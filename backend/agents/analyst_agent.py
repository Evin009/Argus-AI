import json
import os
from collections import defaultdict
from datetime import date, timedelta

import anthropic

from agents.state import IntelligenceState

_ANALYST_SYSTEM_PROMPT = """You are ArgusAI's financial intelligence analyst.
You have access to a user's complete financial picture.

Reason like a senior financial analyst: identify what matters,
simulate forward implications, and produce structured actionable decisions.

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
        [
            {
                "title": i.get("summary"),
                "created_at": i.get("created_at"),
                "similarity": (
                    round(i.get("similarity", 0), 3)
                    if i.get("similarity") is not None
                    else None
                ),
            }
            for i in past_insights
        ],
        indent=2,
    )
    return (
        f"Today: {today}\n\n"
        f"USER FINANCIAL PROFILE (long-term memory):\n{json.dumps(profile, indent=2)}\n\n"
        f"RELEVANT PAST DECISIONS"
        f" (semantic memory — ranked by relevance to current situation):"
        f"\n{recent_memory}\n\n"
        f"CURRENT ACCOUNTS:\n{json.dumps([
            {'type': a.get('account_type'), 'balance': a.get('balance'),
             'credit_limit': a.get('credit_limit')}
            for a in accounts
        ], indent=2)}\n\n"
        f"UPCOMING BILLS:\n{json.dumps([
            {'merchant': b.get('merchant'), 'amount': b.get('avg_amount'),
             'due': b.get('next_due_date'), 'enrichment': b.get('ai_enrichment')}
            for b in bills
        ], indent=2)}\n\n"
        f"ACTIVE SUBSCRIPTIONS:\n{json.dumps([
            {'merchant': s.get('merchant'), 'amount': s.get('avg_amount'),
             'price_change_pct': s.get('price_change_pct'),
             'enrichment': s.get('ai_enrichment')}
            for s in subscriptions
        ], indent=2)}\n\n"
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
        f'      "sources": ["<data sources>"]\n'
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


def analyst_node(state: IntelligenceState) -> dict:
    brief = _build_analyst_brief(
        accounts=state["accounts"],
        bills=state["bills"],
        subscriptions=state["subscriptions"],
        tx_summary=state["tx_summary"],
        past_insights=state["relevant_past_insights"],
        profile=state["profile"],
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
        return {"decisions": [], "updated_profile": {}}

    result = _parse_synthesis_response(response_text)
    return {
        "decisions": result.get("decisions", []),
        "updated_profile": result.get("updated_profile", {}),
    }
