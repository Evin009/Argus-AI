export type Expense = { name: string; amount: string };
export type Goal = { title: string; target_amount: string };
export type Debt = { name: string; balance: string; interest_rate: string; minimum_payment: string };

export type OnboardingState = {
  income: string;
  pay_schedule: string;
  income_stability: string;
  other_income: boolean | null;
  rent: string;
  major_expenses: Expense[];
  debts: Debt[];
  goals: Goal[];
  risk_tolerance: string;
  impulse_spender: string;
  spending_triggers: string[];
  balance_check_frequency: string;
  payment_preference: string;
  overdraft_frequency: string;
  buffer_preference: string;
};

export const INITIAL_STATE: OnboardingState = {
  income: "",
  pay_schedule: "",
  income_stability: "",
  other_income: null,
  rent: "",
  major_expenses: [],
  debts: [],
  goals: [],
  risk_tolerance: "",
  impulse_spender: "",
  spending_triggers: [],
  balance_check_frequency: "",
  payment_preference: "",
  overdraft_frequency: "",
  buffer_preference: "",
};

export const CHAPTERS = ["Income", "Expenses", "Debt", "Goals", "Spending Behavior", "Risk Tolerance"] as const;
