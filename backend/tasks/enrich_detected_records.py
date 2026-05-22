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
