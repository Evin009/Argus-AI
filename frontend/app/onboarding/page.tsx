"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";

type PaySchedule = "weekly" | "biweekly" | "monthly";
type RiskTolerance = "conservative" | "moderate" | "aggressive";

type Expense = { name: string; amount: number };
type Goal = { title: string; target_amount: number };

type OnboardingState = {
  income: string;
  pay_schedule: PaySchedule | "";
  rent: string;
  major_expenses: Expense[];
  goals: Goal[];
  risk_tolerance: RiskTolerance | "";
};

const CHAPTER_TITLES = ["Income", "Expenses", "Goals", "Risk Tolerance"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "var(--font-sans)",
  fontSize: 15,
  color: "var(--paper)",
  background: "var(--surface-2)",
  border: "1px solid var(--surface-3)",
  borderRadius: "var(--r-md)",
  padding: "12px 14px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--on-dark-400)",
  marginBottom: 7,
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function ChapterIncome({ state, setState }: { state: OnboardingState; setState: (s: OnboardingState) => void }) {
  return (
    <>
      <Field label="Monthly income">
        <input
          type="number"
          style={inputStyle}
          placeholder="5000"
          value={state.income}
          onChange={(e) => setState({ ...state, income: e.target.value })}
        />
      </Field>
      <Field label="Pay schedule">
        <select
          style={inputStyle}
          value={state.pay_schedule}
          onChange={(e) => setState({ ...state, pay_schedule: e.target.value as PaySchedule })}
        >
          <option value="">Select…</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </Field>
    </>
  );
}

function ChapterExpenses({ state, setState }: { state: OnboardingState; setState: (s: OnboardingState) => void }) {
  function updateExpense(i: number, field: keyof Expense, value: string) {
    const next = [...state.major_expenses];
    next[i] = { ...next[i], [field]: field === "amount" ? Number(value) : value };
    setState({ ...state, major_expenses: next });
  }

  function addExpense() {
    setState({ ...state, major_expenses: [...state.major_expenses, { name: "", amount: 0 }] });
  }

  return (
    <>
      <Field label="Monthly rent / mortgage">
        <input
          type="number"
          style={inputStyle}
          placeholder="1500"
          value={state.rent}
          onChange={(e) => setState({ ...state, rent: e.target.value })}
        />
      </Field>
      <Field label="Other fixed expenses (car, utilities, etc.)">
        {state.major_expenses.map((exp, i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              style={{ ...inputStyle, flex: 2 }}
              placeholder="Name"
              value={exp.name}
              onChange={(e) => updateExpense(i, "name", e.target.value)}
            />
            <input
              type="number"
              style={{ ...inputStyle, flex: 1 }}
              placeholder="Amount"
              value={exp.amount || ""}
              onChange={(e) => updateExpense(i, "amount", e.target.value)}
            />
          </div>
        ))}
        <button type="button" onClick={addExpense} style={{ ...inputStyle, cursor: "pointer", color: "var(--on-dark-400)", textAlign: "left" }}>
          + Add expense
        </button>
      </Field>
    </>
  );
}

function ChapterGoals({ state, setState }: { state: OnboardingState; setState: (s: OnboardingState) => void }) {
  function updateGoal(i: number, field: keyof Goal, value: string) {
    const next = [...state.goals];
    next[i] = { ...next[i], [field]: field === "target_amount" ? Number(value) : value };
    setState({ ...state, goals: next });
  }

  function addGoal() {
    setState({ ...state, goals: [...state.goals, { title: "", target_amount: 0 }] });
  }

  return (
    <Field label="Financial goals">
      {state.goals.map((goal, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            style={{ ...inputStyle, flex: 2 }}
            placeholder="e.g. Emergency fund"
            value={goal.title}
            onChange={(e) => updateGoal(i, "title", e.target.value)}
          />
          <input
            type="number"
            style={{ ...inputStyle, flex: 1 }}
            placeholder="Target $"
            value={goal.target_amount || ""}
            onChange={(e) => updateGoal(i, "target_amount", e.target.value)}
          />
        </div>
      ))}
      <button type="button" onClick={addGoal} style={{ ...inputStyle, cursor: "pointer", color: "var(--on-dark-400)", textAlign: "left" }}>
        + Add goal
      </button>
    </Field>
  );
}

function ChapterRisk({ state, setState }: { state: OnboardingState; setState: (s: OnboardingState) => void }) {
  const options: { value: RiskTolerance; label: string; desc: string }[] = [
    { value: "conservative", label: "Conservative", desc: "I prefer safety over growth" },
    { value: "moderate", label: "Moderate", desc: "I'm comfortable with some risk" },
    { value: "aggressive", label: "Aggressive", desc: "I prioritize growth over safety" },
  ];

  return (
    <Field label="How do you think about financial risk?">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setState({ ...state, risk_tolerance: opt.value })}
            style={{
              ...inputStyle,
              cursor: "pointer",
              textAlign: "left",
              border: state.risk_tolerance === opt.value ? "1px solid var(--amber-600)" : "1px solid var(--surface-3)",
            }}
          >
            <div style={{ fontWeight: 600 }}>{opt.label}</div>
            <div style={{ fontSize: 12.5, color: "var(--on-dark-400)", marginTop: 2 }}>{opt.desc}</div>
          </button>
        ))}
      </div>
    </Field>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [chapter, setChapter] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [state, setState] = useState<OnboardingState>({
    income: "",
    pay_schedule: "",
    rent: "",
    major_expenses: [],
    goals: [],
    risk_tolerance: "",
  });

  const isLastChapter = chapter === CHAPTER_TITLES.length - 1;

  async function handleNext() {
    if (!isLastChapter) {
      setChapter((c) => c + 1);
      return;
    }

    setSubmitting(true);
    await api.post("/onboarding", {
      income: state.income ? Number(state.income) : undefined,
      pay_schedule: state.pay_schedule || undefined,
      rent: state.rent ? Number(state.rent) : undefined,
      major_expenses: state.major_expenses,
      goals: state.goals,
      risk_tolerance: state.risk_tolerance || undefined,
      completed: true,
    });
    router.push("/dashboard");
  }

  function handleBack() {
    if (chapter > 0) setChapter((c) => c - 1);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ marginBottom: 28, textAlign: "center" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "var(--paper)", margin: 0 }}>
            Let&apos;s get to know your finances
          </h1>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--on-dark-400)", marginTop: 8 }}>
            {CHAPTER_TITLES[chapter]} · Step {chapter + 1} of {CHAPTER_TITLES.length}
          </p>
        </div>

        <div
          style={{
            background: "var(--surface-1)",
            border: "1px solid var(--surface-3)",
            borderRadius: "var(--r-lg)",
            padding: 24,
          }}
        >
          {chapter === 0 && <ChapterIncome state={state} setState={setState} />}
          {chapter === 1 && <ChapterExpenses state={state} setState={setState} />}
          {chapter === 2 && <ChapterGoals state={state} setState={setState} />}
          {chapter === 3 && <ChapterRisk state={state} setState={setState} />}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <button
              type="button"
              onClick={handleBack}
              disabled={chapter === 0}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "transparent",
                border: "none",
                cursor: chapter === 0 ? "default" : "pointer",
                color: chapter === 0 ? "var(--surface-3)" : "var(--on-dark-400)",
                fontFamily: "var(--font-sans)",
                fontSize: 14,
                padding: "10px 4px",
              }}
            >
              <ArrowLeft size={15} /> Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "var(--amber-600)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--r-md)",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: 14,
                padding: "10px 18px",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {isLastChapter ? "Finish" : "Continue"} <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
