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
