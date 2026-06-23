import json
import re
import uuid
from datetime import UTC, datetime

from agents.supervisor import supervisor_graph
from db.client import get_supabase
from tasks.run_intelligence_pipeline import _retrieve_relevant_insights

_PREDICTION_BLOCK_RE = re.compile(r"```prediction\s*(\{.*?\})\s*```", re.DOTALL)

_CHAT_SYSTEM_PROMPT = """You are Argus, ArgusAI's financial brain. You speak with merchant
names, dollar amounts, and timeframes — never vague generalities. If you cannot back a
statement with a specific merchant, amount, and timeframe, stay silent on that point.

You never invent a number — only reason over the data given to you.

When you make a verifiable prediction (e.g. "you'll overdraft on the 27th"), emit a fenced
block immediately after your answer in this exact form so it can be logged and graded later:

```prediction
{"prediction_type": "balance_below_threshold", "payload": {"account_id": "<id>",
"threshold": <number>}, "resolves_at": "<ISO 8601 datetime>"}
```

Omit the block entirely if you made no verifiable prediction."""


def _strip_prediction_block(response_text: str) -> str:
    return _PREDICTION_BLOCK_RE.sub("", response_text).strip()


def _extract_prediction_block(response_text: str) -> dict | None:
    match = _PREDICTION_BLOCK_RE.search(response_text)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(1))
    except (json.JSONDecodeError, ValueError):
        return None
    if not isinstance(parsed, dict):
        return None
    if not {"prediction_type", "payload", "resolves_at"} <= parsed.keys():
        return None
    return parsed


def _log_prediction(user_id: str, prediction: dict) -> None:
    supabase = get_supabase()
    supabase.table("ai_predictions").insert({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "prediction_type": prediction["prediction_type"],
        "prediction_payload": prediction["payload"],
        "predicted_at": datetime.now(UTC).isoformat(),
        "resolves_at": prediction["resolves_at"],
    }).execute()


def _retrieve_chat_context(user_id: str, query: str) -> dict:
    supervisor_result = supervisor_graph.invoke({
        "user_id": user_id,
        "query": query,
        "selected_tools": [],
        "tool_results": {},
    })

    supabase = get_supabase()

    profile_result = (
        supabase.table("user_financial_profiles")
        .select("profile")
        .eq("user_id", user_id)
        .execute()
    )
    profile = profile_result.data[0]["profile"] if profile_result.data else {}

    predictions_result = (
        supabase.table("ai_predictions")
        .select("prediction_type, prediction_payload, was_accurate")
        .eq("user_id", user_id)
        .order("predicted_at", desc=True)
        .limit(10)
        .execute()
    )
    past_predictions = [
        p for p in (predictions_result.data or []) if p.get("was_accurate") is not None
    ]

    distilled_insights = _retrieve_relevant_insights(user_id, query)

    return {
        "tool_results": supervisor_result["tool_results"],
        "profile": profile,
        "past_predictions": past_predictions,
        "distilled_insights": distilled_insights,
    }


def _build_chat_brief(query: str, context: dict) -> str:
    return (
        f"USER QUESTION:\n{query}\n\n"
        f"USER PROFILE:\n{json.dumps(context['profile'], indent=2)}\n\n"
        f"RELEVANT LIVE DATA:\n{json.dumps(context['tool_results'], indent=2)}\n\n"
        f"RELEVANT PAST INSIGHTS:\n{json.dumps(context['distilled_insights'], indent=2)}\n\n"
        f"YOUR TRACK RECORD WITH THIS USER "
        f"(past predictions and whether they came true):\n"
        f"{json.dumps(context['past_predictions'], indent=2)}"
    )
