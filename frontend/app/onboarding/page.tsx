"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { api } from "@/lib/api";
import { AmbientBackground } from "./_components/AmbientBackground";
import {
  IncomeCharacter,
  ExpensesCharacter,
  DebtCharacter,
  GoalsCharacter,
  BehaviorCharacter,
  RiskCharacter,
} from "./_components/Characters";
import { ChapterIncome, ChapterExpenses, ChapterDebt, ChapterGoals, ChapterBehavior, ChapterRisk } from "./_components/Chapters";
import { CHAPTERS, INITIAL_STATE, type OnboardingState } from "./_components/types";

const CHARACTERS = [IncomeCharacter, ExpensesCharacter, DebtCharacter, GoalsCharacter, BehaviorCharacter, RiskCharacter];
// Chapters whose character is a full-bleed photo/illustration that should cover the entire
// left panel, instead of the default small centered icon treatment.
const CHARACTER_FILLS_PANEL = [false, true, false, false, false, false];

const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
};

const CHAPTER_SUBTITLE = [
  "Let's start with what comes in.",
  "Now, what goes out every month.",
  "Anything you're paying down?",
  "What are you working toward?",
  "How do you actually spend?",
  "Last one — how you feel about risk.",
];

function validateChapter(chapter: number, state: OnboardingState): Partial<Record<keyof OnboardingState, string>> {
  const errors: Partial<Record<keyof OnboardingState, string>> = {};
  if (chapter === 0) {
    if (!state.income) errors.income = "Income is required";
    if (!state.pay_schedule) errors.pay_schedule = "Pick a pay schedule";
  }
  if (chapter === 5) {
    if (!state.risk_tolerance) errors.risk_tolerance = "Pick how you think about risk";
  }
  return errors;
}

function toNumber(v: string): number | undefined {
  if (v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [chapter, setChapter] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof OnboardingState, string>>>({});
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);

  const isLastChapter = chapter === CHAPTERS.length - 1;
  const Character = CHARACTERS[chapter];
  const fillsPanel = CHARACTER_FILLS_PANEL[chapter];

  function goTo(next: number) {
    setDirection(next > chapter ? 1 : -1);
    setChapter(next);
  }

  async function handleNext() {
    const chapterErrors = validateChapter(chapter, state);
    if (Object.keys(chapterErrors).length > 0) {
      setErrors(chapterErrors);
      return;
    }
    setErrors({});

    if (!isLastChapter) {
      goTo(chapter + 1);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post("/onboarding", {
        income: toNumber(state.income),
        pay_schedule: state.pay_schedule || undefined,
        income_stability: state.income_stability || undefined,
        other_income: state.other_income ?? undefined,
        rent: toNumber(state.rent),
        major_expenses: state.major_expenses
          .filter((e) => e.name && e.amount)
          .map((e) => ({ name: e.name, amount: toNumber(e.amount) ?? 0 })),
        debts: state.debts
          .filter((d) => d.name && d.balance)
          .map((d) => ({
            name: d.name,
            balance: toNumber(d.balance) ?? 0,
            interest_rate: toNumber(d.interest_rate) ?? 0,
            minimum_payment: toNumber(d.minimum_payment) ?? 0,
          })),
        goals: state.goals
          .filter((g) => g.title && g.target_amount)
          .map((g, i) => ({ title: g.title, target_amount: toNumber(g.target_amount) ?? 0, priority: i + 1 })),
        risk_tolerance: state.risk_tolerance || undefined,
        impulse_spender: state.impulse_spender || undefined,
        spending_triggers: state.spending_triggers.length ? state.spending_triggers : undefined,
        balance_check_frequency: state.balance_check_frequency || undefined,
        payment_preference: state.payment_preference || undefined,
        overdraft_frequency: state.overdraft_frequency || undefined,
        buffer_preference: state.buffer_preference || undefined,
        completed: true,
      });
      router.push("/dashboard");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (chapter > 0) goTo(chapter - 1);
  }

  const chapterProps = { state, setState, errors };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <AmbientBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        style={{
          width: "100%",
          maxWidth: 880,
          minHeight: 560,
          display: "flex",
          borderRadius: 32,
          overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3)",
          border: "1px solid var(--surface-3)",
        }}
      >
        {/* Left panel — character + chapter context */}
        <div
          style={{
            width: "38%",
            flexShrink: 0,
            background: "linear-gradient(160deg, var(--surface-1) 0%, var(--surface-0) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: fillsPanel ? 0 : 32,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={chapter}
              initial={{ opacity: 0, scale: fillsPanel ? 1.04 : 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: fillsPanel ? 1.04 : 0.9 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              style={fillsPanel ? { position: "absolute", inset: 0 } : { textAlign: "center" }}
            >
              <Character />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right panel — form */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "28px 32px" }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--paper)", margin: 0 }}>
            {CHAPTERS[chapter]}
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-400)", margin: "4px 0 18px" }}>
            {CHAPTER_SUBTITLE[chapter]}
          </p>

          <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
            {CHAPTERS.map((title, i) => (
              <motion.div
                key={title}
                animate={{ background: i <= chapter ? "var(--amber-600)" : "var(--surface-3)" }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1, height: 4, borderRadius: "var(--r-pill)" }}
              />
            ))}
          </div>

          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={chapter}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
              >
                {chapter === 0 && <ChapterIncome {...chapterProps} />}
                {chapter === 1 && <ChapterExpenses {...chapterProps} />}
                {chapter === 2 && <ChapterDebt {...chapterProps} />}
                {chapter === 3 && <ChapterGoals {...chapterProps} />}
                {chapter === 4 && <ChapterBehavior {...chapterProps} />}
                {chapter === 5 && <ChapterRisk {...chapterProps} />}
              </motion.div>
            </AnimatePresence>
          </div>

          {submitError && (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--negative-bright)", marginBottom: 8 }}>
              {submitError}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <motion.button
              type="button"
              onClick={handleBack}
              disabled={chapter === 0}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>

            <motion.button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
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
                boxShadow: "0 6px 16px rgba(168,104,56,0.28)",
              }}
            >
              {submitting ? "Saving…" : isLastChapter ? "Finish" : "Continue"}
              {isLastChapter ? <Check size={15} /> : <ArrowRight size={15} />}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
