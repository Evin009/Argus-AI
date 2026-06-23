from datetime import date, timedelta

from fastapi import APIRouter, Depends

from db.client import get_supabase
from middleware.auth import get_current_user
from services.merchant_logos import get_logo_url

router = APIRouter(prefix="/calendar", tags=["calendar"])


def _urgency(due_date_str: str) -> str:
    try:
        days = (date.fromisoformat(due_date_str) - date.today()).days
    except (ValueError, TypeError):
        return "low"
    if days <= 3:
        return "high"
    if days <= 7:
        return "medium"
    return "low"


@router.get("")
async def get_calendar(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()

    bills = (
        supabase.table("bills")
        .select("id, merchant, avg_amount, next_due_date")
        .eq("user_id", user_id)
        .order("next_due_date")
        .execute()
    ).data or []

    subscriptions = (
        supabase.table("subscriptions")
        .select("id, merchant, avg_amount, next_due_date")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .execute()
    ).data or []

    entries = []

    for b in bills:
        entries.append({
            "id": b["id"],
            "type": "bill",
            "merchant": b["merchant"],
            "amount": b.get("avg_amount"),
            "due_date": b.get("next_due_date"),
            "logo_url": get_logo_url(b["merchant"], supabase),
            "urgency": _urgency(b.get("next_due_date") or ""),
            "ai_reasoning": None,
        })

    for s in subscriptions:
        entries.append({
            "id": s["id"],
            "type": "subscription",
            "merchant": s["merchant"],
            "amount": s.get("avg_amount"),
            "due_date": s.get("next_due_date"),
            "logo_url": get_logo_url(s["merchant"], supabase),
            "urgency": _urgency(s.get("next_due_date") or ""),
            "ai_reasoning": None,
        })

    entries.sort(key=lambda e: e.get("due_date") or "9999-12-31")

    return {"entries": entries}
