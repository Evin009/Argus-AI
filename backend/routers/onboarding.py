from datetime import UTC, datetime
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, model_validator

from db.client import get_supabase
from middleware.auth import get_current_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

_PROFILE_FIELDS = (
    "income",
    "pay_schedule",
    "income_stability",
    "rent",
    "major_expenses",
    "debts",
    "goals",
    "risk_tolerance",
    "impulse_spender",
    "spending_triggers",
    "buffer_preference",
)


class Expense(BaseModel):
    name: str
    amount: float = Field(ge=0)


class Goal(BaseModel):
    title: str
    target_amount: float = Field(ge=0)
    priority: Optional[int] = None


class Debt(BaseModel):
    name: str
    balance: float = Field(ge=0)
    interest_rate: float = Field(ge=0)
    minimum_payment: float = Field(ge=0)


class OnboardingRequest(BaseModel):
    income: Optional[float] = Field(default=None, ge=0)
    pay_schedule: Optional[str] = None
    income_stability: Optional[str] = None
    other_income: Optional[bool] = None
    rent: Optional[float] = Field(default=None, ge=0)
    major_expenses: Optional[list[Expense]] = None
    debts: Optional[list[Debt]] = None
    goals: Optional[list[Goal]] = None
    risk_tolerance: Optional[str] = None
    impulse_spender: Optional[str] = None
    spending_triggers: Optional[list[str]] = None
    balance_check_frequency: Optional[str] = None
    payment_preference: Optional[str] = None
    overdraft_frequency: Optional[str] = None
    buffer_preference: Optional[str] = None
    completed: Optional[bool] = None

    @model_validator(mode="after")
    def _required_fields_when_completing(self):
        if self.completed and (self.income is None or not self.pay_schedule or not self.risk_tolerance):
            raise ValueError("income, pay_schedule, and risk_tolerance are required to complete onboarding")
        return self


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
