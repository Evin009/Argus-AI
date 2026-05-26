import os
import uuid
from datetime import datetime, timezone

from openai import OpenAI

from agents.state import IntelligenceState
from db.client import get_supabase


def _embed_text(text: str) -> list[float]:
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text,
    )
    return response.data[0].embedding


def memory_node(state: IntelligenceState) -> dict:
    user_id = state["user_id"]
    decisions = state.get("decisions", [])
    updated_profile = state.get("updated_profile", {})

    supabase = get_supabase()
    now = datetime.now(timezone.utc).isoformat()

    for decision in decisions:
        title = decision.get("title", "")

        try:
            embedding = _embed_text(title)
        except Exception:
            embedding = None

        row = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "insight_type": "analyst_decision",
            "summary": title,
            "structured_output_json": decision,
            "created_at": now,
        }
        if embedding is not None:
            row["embedding"] = embedding

        supabase.table("ai_insights").insert(row).execute()

    if updated_profile:
        supabase.table("user_financial_profiles").upsert(
            {
                "user_id": user_id,
                "profile": updated_profile,
                "last_enriched_at": now,
                "last_updated": now,
            },
            on_conflict="user_id",
        ).execute()

    return {}
