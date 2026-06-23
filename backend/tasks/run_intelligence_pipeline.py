import os

from openai import OpenAI

from agents.analyst_agent import _aggregate_transactions
from agents.graph import intelligence_graph
from agents.state import IntelligenceState
from celery_app import celery
from db.client import get_supabase


def _build_rag_query_text(
    accounts: list[dict],
    bills: list[dict],
    subscriptions: list[dict],
) -> str:
    account_summary = ", ".join(
        f"{a.get('account_type', 'account')} balance {a.get('balance', 0)}" for a in accounts[:3]
    )
    bill_merchants = ", ".join(b["merchant"] for b in bills[:5] if b.get("merchant"))
    sub_merchants = ", ".join(s["merchant"] for s in subscriptions[:5] if s.get("merchant"))
    return f"Accounts: {account_summary}. Bills: {bill_merchants}. Subscriptions: {sub_merchants}."


def _retrieve_relevant_insights(
    user_id: str,
    query_text: str,
    match_threshold: float = 0.6,
    match_count: int = 5,
) -> list[dict]:
    try:
        openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=query_text,
        )
        query_embedding = response.data[0].embedding

        supabase = get_supabase()
        result = supabase.rpc(
            "match_insights_by_embedding",
            {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold,
                "match_count": match_count,
                "p_user_id": user_id,
            },
        ).execute()
        return result.data or []
    except Exception:
        return []


@celery.task(name="tasks.run_intelligence_pipeline.run_intelligence_pipeline_for_user")
def run_intelligence_pipeline_for_user(user_id: str) -> dict:
    supabase = get_supabase()

    accts_result = (
        supabase.table("accounts")
        .select("id, account_type, balance, credit_limit")
        .eq("user_id", user_id)
        .execute()
    )
    accounts_full = accts_result.data or []
    account_ids = [a["id"] for a in accounts_full]
    accounts = [{k: v for k, v in a.items() if k != "id"} for a in accounts_full]

    bills = (
        supabase.table("bills")
        .select("id, merchant, avg_amount, recurrence_pattern, next_due_date, ai_enrichment")
        .eq("user_id", user_id)
        .execute()
    ).data or []

    subscriptions = (
        supabase.table("subscriptions")
        .select("id, merchant, avg_amount, price_change_pct, billing_cycle, ai_enrichment")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    ).data or []

    transactions = (
        (
            supabase.table("transactions")
            .select("category, amount, timestamp")
            .in_("account_id", account_ids)
            .order("timestamp", desc=True)
            .limit(500)
            .execute()
        ).data
        or []
        if account_ids
        else []
    )

    profile_result = (
        supabase.table("user_financial_profiles").select("profile").eq("user_id", user_id).execute()
    )
    profile = profile_result.data[0]["profile"] if profile_result.data else {}

    tx_summary = _aggregate_transactions(transactions)

    rag_query = _build_rag_query_text(accounts_full, bills, subscriptions)
    relevant_past_insights = _retrieve_relevant_insights(user_id, rag_query)

    if not relevant_past_insights:
        relevant_past_insights = (
            supabase.table("ai_insights")
            .select("summary, structured_output_json, created_at")
            .eq("user_id", user_id)
            .eq("insight_type", "analyst_decision")
            .order("created_at", desc=True)
            .limit(5)
            .execute()
        ).data or []

    initial_state: IntelligenceState = {
        "user_id": user_id,
        "accounts": accounts,
        "bills": bills,
        "subscriptions": subscriptions,
        "tx_summary": tx_summary,
        "relevant_past_insights": relevant_past_insights,
        "profile": profile,
        "enrichment_result": {},
        "decisions": [],
        "updated_profile": {},
    }

    final_state = intelligence_graph.invoke(initial_state)

    return {
        "user_id": user_id,
        "decisions_written": len(final_state.get("decisions", [])),
    }
