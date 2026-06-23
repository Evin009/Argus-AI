from fastapi import APIRouter, Depends

from db.client import get_supabase
from engines.pay_timing import compute_pay_timing
from middleware.auth import get_current_user

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("/pay-timing")
async def get_pay_timing(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()

    accounts = (
        supabase.table("accounts")
        .select("id, account_type, balance, credit_limit, closing_date")
        .eq("user_id", user_id)
        .execute()
    ).data or []

    bills = (
        supabase.table("bills")
        .select("avg_amount, next_due_date, merchant")
        .eq("user_id", user_id)
        .execute()
    ).data or []

    balance = sum(
        a.get("balance") or 0 for a in accounts if a.get("account_type") != "credit"
    )

    return compute_pay_timing(accounts=accounts, bills=bills, balance=balance)
