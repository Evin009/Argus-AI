from fastapi import APIRouter, Depends

from db.client import get_supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/bills", tags=["bills"])


@router.get("")
async def get_bills(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("bills")
        .select("*")
        .eq("user_id", user_id)
        .order("next_due_date", desc=False)
        .execute()
    )
    return {"bills": result.data}
