from typing import TypedDict


class IntelligenceState(TypedDict):
    user_id: str
    accounts: list[dict]
    bills: list[dict]
    subscriptions: list[dict]
    tx_summary: dict
    relevant_past_insights: list[dict]
    profile: dict
    enrichment_result: dict
    decisions: list[dict]
    updated_profile: dict
