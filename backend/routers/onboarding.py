from datetime import UTC, datetime
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from db.client import get_supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

_PROFILE_FIELDS = ("income", "pay_schedule", "rent", "major_expenses", "goals", "risk_tolerance")


class OnboardingRequest(BaseModel):
    income: Optional[float] = None
    pay_schedule: Optional[str] = None
    rent: Optional[float] = None
    major_expenses: Optional[list] = None
    goals: Optional[list] = None
    risk_tolerance: Optional[str] = None
    completed: Optional[bool] = None


@router.post("")
async def post_onboarding(
    body: OnboardingRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase()
    fields = body.model_dump(exclude_none=True, exclude={"completed"})
    row = {"user_id": user_id, **fields}
    if body.completed:
        row["completed_at"] = datetime.now(UTC).isoformat()

    result = supabase.table("onboarding_responses").upsert(row).execute()
    saved = result.data[0]

    if body.completed:
        profile = {k: v for k, v in row.items() if k in _PROFILE_FIELDS}
        supabase.table("user_financial_profiles").upsert(
            {"user_id": user_id, "profile": profile}
        ).execute()

    return saved


@router.get("/status")
async def get_onboarding_status(user_id: str = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("onboarding_responses")
        .select("completed_at")
        .eq("user_id", user_id)
        .maybe_single()
        .execute()
    )
    row = result.data
    return {"completed": bool(row and row.get("completed_at"))}
