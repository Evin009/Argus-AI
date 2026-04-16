"""
Shared tools for ArgusAI agents (LangChain format).
Each tool: Pydantic input/output, DB-grounded.
"""

from langchain_core.tools import tool
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from datetime import date
# Assume engines imported: from backend.engines.cashflow import CashflowEngine, etc.
# Placeholder for now - integrate with Phase 5 engines

class BalanceSummary(BaseModel):
    checking: float
    savings: float
    credit: float
    net_worth: float

@tool
def get_balance_summary(user_id: str) -> BalanceSummary:
    """Get current balance summary for user."""
    # TODO: Query Supabase accounts table
    # Placeholder data
    return BalanceSummary(
        checking=2500.50,
        savings=12000.00,
        credit=-450.75,
        net_worth=14050.75
    )

class ForecastParams(BaseModel):
    days: int = Field(ge=1, le=90)

class ForecastDay(BaseModel):
    date: date
    projected_balance: float
    lower_bound: float
    upper_bound: float

@tool
def get_cashflow_forecast(user_id: str, params: ForecastParams) -> List[ForecastDay]:
    """Get cashflow forecast."""
    # TODO: CashflowEngine(user_id).forecast(params.days)
    return []  # Placeholder

class SpendingPatternsParams(BaseModel):
    months: int = Field(ge=1, le=12)

class SpendingPattern(BaseModel):
    category: str
    amount: float
    mom_change_pct: float

@tool
def get_spending_patterns(user_id: str, params: SpendingPatternsParams) -> List[SpendingPattern]:
    """Get spending patterns."""
    return []  # Placeholder

class DebtSimParams(BaseModel):
    strategy: str = Field(regex="^(snowball|avalanche)$")

class DebtSchedule(BaseModel):
    month: int
    balance_remaining: float
    interest_paid: float

@tool
def run_debt_simulation(user_id: str, params: DebtSimParams) -> List[DebtSchedule]:
    """Run debt payoff simulation."""
    return []  # Placeholder

class RiskAlert(BaseModel):
    type: str
    severity: str  # low/medium/high
    message: str
    due_date: date | None

@tool
def get_risk_alerts(user_id: str) -> List[RiskAlert]:
    """Get active risk alerts."""
    return []  # Placeholder
