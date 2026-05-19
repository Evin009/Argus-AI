from fastapi import APIRouter, Depends

from db.client import get_supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


@router.get("")
async def get_subscriptions(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("subscriptions")
        .select("*")
        .eq("user_id", user_id)
        .eq("is_active", True)
        .order("avg_amount", desc=True)
        .execute()
    )
    return {"subscriptions": result.data}
