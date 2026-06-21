from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from db.client import get_supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


class OnboardingRequest(BaseModel):
    income: Optional[float] = None
    pay_schedule: Optional[str] = None
    rent: Optional[float] = None
    major_expenses: Optional[list] = None
    goals: Optional[list] = None
    risk_tolerance: Optional[str] = None


@router.post("")
async def post_onboarding(
    body: OnboardingRequest,
    user_id: str = Depends(get_current_user),
):
    supabase = get_supabase()
    row = {"user_id": user_id, **body.model_dump(exclude_none=True)}
    result = supabase.table("onboarding_responses").upsert(row).execute()
    return result.data[0]
