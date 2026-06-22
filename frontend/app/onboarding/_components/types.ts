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
  connectedAccountsCount: number;
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
  connectedAccountsCount: 0,
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

// Split into 9 single-purpose steps (instead of 6 denser ones) so every
// chapter's content height stays consistent with the lightest chapter
// (Expenses) — no chapter should make the card taller than another.
export const CHAPTERS = [
  "Income",
  "Income Details",
  "Expenses",
  "Connect Accounts",
  "Goals",
  "Spending Habits",
  "Spending Triggers",
  "Spending Preferences",
  "Risk Tolerance",
  "Risk Details",
] as const;
