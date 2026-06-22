"use client";

import { Field, NumberField, SelectField, ChoiceCard, ChipMultiSelect, RepeatableRows } from "./fields";
import type { OnboardingState } from "./types";

type ChapterProps = {
  state: OnboardingState;
  setState: (s: OnboardingState) => void;
  errors: Partial<Record<keyof OnboardingState, string>>;
};

export function ChapterIncome({ state, setState, errors }: ChapterProps) {
  return (
    <>
      <Field label="Monthly income" required hint="Gross income, before taxes" error={errors.income}>
        <NumberField
          value={state.income}
          onChange={(v) => setState({ ...state, income: v })}
          placeholder="5000"
          error={!!errors.income}
        />
      </Field>
      <Field label="Pay schedule" required error={errors.pay_schedule}>
        <SelectField
          value={state.pay_schedule}
          onChange={(v) => setState({ ...state, pay_schedule: v })}
          options={[
            { value: "weekly", label: "Weekly" },
            { value: "biweekly", label: "Biweekly" },
            { value: "monthly", label: "Monthly" },
          ]}
          error={!!errors.pay_schedule}
        />
      </Field>
    </>
  );
}

export function ChapterIncomeDetails({ state, setState }: ChapterProps) {
  return (
    <>
      <Field label="Income stability">
        <div style={{ display: "flex", gap: 8 }}>
          <ChoiceCard
            selected={state.income_stability === "fixed"}
            onClick={() => setState({ ...state, income_stability: "fixed" })}
            title="Fixed"
            desc="Same amount every paycheck"
          />
          <ChoiceCard
            selected={state.income_stability === "variable"}
            onClick={() => setState({ ...state, income_stability: "variable" })}
            title="Variable"
            desc="Freelance, tips, or commission"
          />
        </div>
      </Field>
      <Field label="Other income sources?">
        <div style={{ display: "flex", gap: 8 }}>
          <ChoiceCard selected={state.other_income === true} onClick={() => setState({ ...state, other_income: true })} title="Yes" />
          <ChoiceCard selected={state.other_income === false} onClick={() => setState({ ...state, other_income: false })} title="No" />
        </div>
      </Field>
    </>
  );
}

export function ChapterExpenses({ state, setState }: ChapterProps) {
  return (
    <>
      <Field label="Monthly rent / mortgage">
        <NumberField value={state.rent} onChange={(v) => setState({ ...state, rent: v })} placeholder="1500" />
      </Field>
      <Field label="Other fixed expenses (car, utilities, etc.)">
        <RepeatableRows
          rows={state.major_expenses}
          onChange={(rows) => setState({ ...state, major_expenses: rows })}
          fields={[
            { key: "name", placeholder: "Name" },
            { key: "amount", placeholder: "Amount", numeric: true },
          ]}
          addLabel="Add expense"
        />
      </Field>
    </>
  );
}

export function ChapterDebt({ state, setState }: ChapterProps) {
  return (
    <Field label="Debts (credit cards, loans)" hint="Balance, APR, and minimum payment for each">
      <RepeatableRows
        rows={state.debts}
        onChange={(rows) => setState({ ...state, debts: rows })}
        fields={[
          { key: "name", placeholder: "Name" },
          { key: "balance", placeholder: "Balance", numeric: true },
          { key: "interest_rate", placeholder: "APR %", numeric: true },
          { key: "minimum_payment", placeholder: "Min payment", numeric: true },
        ]}
        addLabel="Add debt"
      />
    </Field>
  );
}

export function ChapterGoals({ state, setState }: ChapterProps) {
  return (
    <Field label="Financial goals" hint="List the most important one first — Argus protects it first when money's tight">
      <RepeatableRows
        rows={state.goals}
        onChange={(rows) => setState({ ...state, goals: rows })}
        fields={[
          { key: "title", placeholder: "e.g. Emergency fund" },
          { key: "target_amount", placeholder: "Target $", numeric: true },
        ]}
        addLabel="Add goal"
      />
    </Field>
  );
}

export function ChapterSpendingHabits({ state, setState }: ChapterProps) {
  return (
    <Field label="Do you consider yourself an impulse spender?">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { v: "never", l: "Never", d: "I stick to what I plan to spend" },
          { v: "sometimes", l: "Sometimes", d: "It happens occasionally" },
          { v: "often", l: "Often", d: "I buy things I didn't plan for regularly" },
        ].map((o) => (
          <ChoiceCard
            key={o.v}
            selected={state.impulse_spender === o.v}
            onClick={() => setState({ ...state, impulse_spender: o.v })}
            title={o.l}
            desc={o.d}
          />
        ))}
      </div>
    </Field>
  );
}

export function ChapterSpendingTriggers({ state, setState }: ChapterProps) {
  return (
    <Field label="What usually triggers extra spending? (pick any)">
      <ChipMultiSelect
        selected={state.spending_triggers}
        onToggle={(v) =>
          setState({
            ...state,
            spending_triggers: state.spending_triggers.includes(v)
              ? state.spending_triggers.filter((t) => t !== v)
              : [...state.spending_triggers, v],
          })
        }
        options={[
          { value: "stress", label: "Stress" },
          { value: "boredom", label: "Boredom" },
          { value: "social", label: "Social events" },
          { value: "sales", label: "Sales / deals" },
          { value: "none", label: "None of these" },
        ]}
      />
    </Field>
  );
}

export function ChapterSpendingPreferences({ state, setState }: ChapterProps) {
  return (
    <>
      <Field label="How often do you check your balance?">
        <SelectField
          value={state.balance_check_frequency}
          onChange={(v) => setState({ ...state, balance_check_frequency: v })}
          options={[
            { value: "daily", label: "Daily" },
            { value: "weekly", label: "Weekly" },
            { value: "rarely", label: "Rarely" },
          ]}
        />
      </Field>
      <Field label="Preferred payment method">
        <SelectField
          value={state.payment_preference}
          onChange={(v) => setState({ ...state, payment_preference: v })}
          options={[
            { value: "credit", label: "Credit card" },
            { value: "debit", label: "Debit card" },
            { value: "bnpl", label: "Buy now, pay later" },
          ]}
        />
      </Field>
    </>
  );
}

export function ChapterRiskTolerance({ state, setState, errors }: ChapterProps) {
  return (
    <Field label="How do you think about financial risk?" required error={errors.risk_tolerance}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { v: "conservative", l: "Conservative", d: "I prefer safety over growth" },
          { v: "moderate", l: "Moderate", d: "I'm comfortable with some risk" },
          { v: "aggressive", l: "Aggressive", d: "I prioritize growth over safety" },
        ].map((o) => (
          <ChoiceCard
            key={o.v}
            selected={state.risk_tolerance === o.v}
            onClick={() => setState({ ...state, risk_tolerance: o.v })}
            title={o.l}
            desc={o.d}
          />
        ))}
      </div>
    </Field>
  );
}

export function ChapterRiskDetails({ state, setState }: ChapterProps) {
  return (
    <>
      <Field label="How often have you overdrafted in the last 6 months?">
        <SelectField
          value={state.overdraft_frequency}
          onChange={(v) => setState({ ...state, overdraft_frequency: v })}
          options={[
            { value: "never", label: "Never" },
            { value: "rarely", label: "Rarely (1-2 times)" },
            { value: "sometimes", label: "Sometimes (3-5 times)" },
            { value: "often", label: "Often (6+ times)" },
          ]}
        />
      </Field>
      <Field label="How do you feel about your cash buffer?">
        <SelectField
          value={state.buffer_preference}
          onChange={(v) => setState({ ...state, buffer_preference: v })}
          options={[
            { value: "thin", label: "Comfortable running thin" },
            { value: "moderate", label: "Want a moderate cushion" },
            { value: "large", label: "Want a large cushion" },
          ]}
        />
      </Field>
    </>
  );
}
