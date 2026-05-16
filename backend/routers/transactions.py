from fastapi import APIRouter, Depends

from db.client import get_supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("")
async def get_transactions(
    user_id: str = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0,
    category: str | None = None,
):
    supabase = get_supabase()

    accts = supabase.table("accounts").select("id").eq("user_id", user_id).execute()
    account_ids = [a["id"] for a in accts.data]

    if not account_ids:
        return {"transactions": [], "total": 0}

    query = (
        supabase.table("transactions")
        .select("*", count="exact")
        .in_("account_id", account_ids)
        .order("timestamp", desc=True)
        .limit(limit)
        .offset(offset)
    )

    if category:
        query = query.eq("category", category)

    result = query.execute()
    return {"transactions": result.data, "total": result.count or 0}
