"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { api } from "@/lib/api";
import { AmbientBackground } from "./_components/AmbientBackground";
import {
  IncomeWCharacter,
  IncomeDetailsCharacter,
  ExpensesCharacter,
  DebtCharacter,
  GoalsCharacter,
  BehaviorCharacter,
  RiskCharacter,
} from "./_components/Characters";
import {
  ChapterIncome,
  ChapterIncomeDetails,
  ChapterExpenses,
  ChapterDebt,
  ChapterGoals,
  ChapterSpendingHabits,
  ChapterSpendingPreferences,
  ChapterRiskTolerance,
  ChapterRiskDetails,
} from "./_components/Chapters";
import { CHAPTERS, INITIAL_STATE, type OnboardingState } from "./_components/types";

// One component per chapter — index-aligned with CHAPTERS in types.ts.
const CHAPTER_COMPONENTS = [
  ChapterIncome,
  ChapterIncomeDetails,
  ChapterExpenses,
  ChapterDebt,
  ChapterGoals,
  ChapterSpendingHabits,
  ChapterSpendingPreferences,
  ChapterRiskTolerance,
  ChapterRiskDetails,
];

// Same character reused across sibling chapters of the same theme, so splitting
// a dense chapter into two steps doesn't require new artwork.
const CHARACTERS = [
  IncomeWCharacter,
  IncomeDetailsCharacter,
  ExpensesCharacter,
  DebtCharacter,
  GoalsCharacter,
  BehaviorCharacter,
  BehaviorCharacter,
  RiskCharacter,
  RiskCharacter,
];
// Chapters whose character is a full-bleed photo/illustration that should cover the entire
// left panel, instead of the default small centered icon treatment.
const CHARACTER_FILLS_PANEL = [true, true, true, false, false, false, false, false, false];

const slideVariants: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
};

function SavingDots() {
  return (
    <span style={{ display: "flex", gap: 3 }}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
          style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }}
        />
      ))}
    </span>
  );
}

const CHAPTER_SUBTITLE = [
  "Let's start with what comes in.",
  "A bit more about how it arrives.",
  "Now, what goes out every month.",
  "Anything you're paying down?",
  "What are you working toward?",
  "How do you actually spend?",
  "How you check in and pay.",
  "How you feel about risk.",
  "Last one — your safety net.",
];

const INCOME_CHAPTER = 0;
const RISK_TOLERANCE_CHAPTER = 7;

function validateChapter(chapter: number, state: OnboardingState): Partial<Record<keyof OnboardingState, string>> {
  const errors: Partial<Record<keyof OnboardingState, string>> = {};
  if (chapter === INCOME_CHAPTER) {
    if (!state.income) errors.income = "Income is required";
    if (!state.pay_schedule) errors.pay_schedule = "Pick a pay schedule";
  }
  if (chapter === RISK_TOLERANCE_CHAPTER) {
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
  const CurrentChapter = CHAPTER_COMPONENTS[chapter];

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

      {/* Double-bezel: outer shell (machined frame) holding the inner card (the glass plate),
          concentric radii — 44px outer, 36px inner (44 - 8px shell padding). */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: 1056,
          padding: 8,
          borderRadius: 44,
          background: "rgba(20,17,13,0.35)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.55), 0 10px 28px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            minHeight: 620,
            borderRadius: 36,
            overflow: "hidden",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            border: "1px solid var(--surface-3)",
            background: "var(--surface-1)",
          }}
        >
        {/* Left panel — character + chapter context */}
        <div
          style={{
            width: "52%",
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

        {/* Right panel — form. Deliberately light/cream against the dark character
            panel and ambient background, so it reads as the focal surface. */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 44px", background: "#F3E7D6" }}>
          <AnimatePresence mode="wait">
            <motion.span
              key={chapter}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              style={{
                alignSelf: "flex-start",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "var(--amber-700)",
                background: "#EFDFCB",
                borderRadius: "var(--r-pill)",
                padding: "5px 12px",
                marginBottom: 14,
              }}
            >
              Chapter {chapter + 1} of {CHAPTERS.length}
            </motion.span>
          </AnimatePresence>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 32, color: "#1C1815", margin: 0 }}>
            {CHAPTERS[chapter]}
          </p>
          <p style={{ fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 15, color: "#4A433B", margin: "6px 0 26px" }}>
            {CHAPTER_SUBTITLE[chapter]}
          </p>

          <div style={{ display: "flex", gap: 6, marginBottom: 28 }}>
            {CHAPTERS.map((title, i) => (
              <motion.div
                key={title}
                animate={{ background: i <= chapter ? "var(--amber-600)" : "rgba(20,17,13,0.12)" }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
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
                <CurrentChapter {...chapterProps} />
              </motion.div>
            </AnimatePresence>
          </div>

          {submitError && (
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 14.5, color: "#B5462F", marginBottom: 8 }}>
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
                gap: 7,
                background: "transparent",
                border: "none",
                cursor: chapter === 0 ? "default" : "pointer",
                color: chapter === 0 ? "rgba(20,17,13,0.25)" : "#6B6052",
                fontFamily: "var(--font-sans)",
                fontSize: 16,
                padding: "10px 4px",
              }}
            >
              <ArrowLeft size={16} strokeWidth={1.5} /> Back
            </motion.button>

            {/* Button-in-button CTA: trailing icon lives in its own nested circular
                badge, flush to the inner edge — not floating loose next to the text. */}
            <motion.button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              initial="rest"
              whileHover="hover"
              whileTap={{ scale: 0.97 }}
              animate="rest"
              className="grain"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                border: "none",
                borderRadius: "var(--r-pill)",
                cursor: "pointer",
                padding: "8px 8px 8px 22px",
                opacity: submitting ? 0.6 : 1,
                background: "var(--grad-accent)",
                boxShadow: "0 10px 28px rgba(168,65,43,0.3)",
              }}
            >
              <span style={{ color: "#fff", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: 16 }}>
                {submitting ? "Saving" : isLastChapter ? "Finish" : "Continue"}
              </span>
              <motion.span
                variants={{ rest: { x: 0, y: 0, scale: 1 }, hover: { x: 2, y: -1, scale: 1.06 } }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {submitting ? (
                  <SavingDots />
                ) : isLastChapter ? (
                  <Check size={16} strokeWidth={1.75} color="#fff" />
                ) : (
                  <ArrowRight size={16} strokeWidth={1.75} color="#fff" />
                )}
              </motion.span>
            </motion.button>
          </div>
        </div>
        </div>
      </motion.div>
    </div>
  );
}
