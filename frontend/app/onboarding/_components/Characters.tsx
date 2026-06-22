"use client";

import Image from "next/image";

/* Full-bleed chapter illustrations for the onboarding left panel.
   One image per chapter, no shared anatomy system left — every
   chapter that started as a hand-coded SVG has since been replaced
   with provided artwork. */

function ChapterImage({ src }: { src: string }) {
  return <Image src={src} alt="" fill sizes="52vw" style={{ objectFit: "cover" }} priority />;
}

export function IncomeWCharacter() {
  return <ChapterImage src="/onboarding/income.png" />;
}

export function IncomeDetailsCharacter() {
  return <ChapterImage src="/onboarding/income-details.png" />;
}

export function ExpensesCharacter() {
  return <ChapterImage src="/onboarding/expenses-img.png" />;
}

export function DebtCharacter() {
  return <ChapterImage src="/onboarding/debt.png" />;
}

export function GoalsCharacter() {
  return <ChapterImage src="/onboarding/goals.png" />;
}

export function SpendingHabitsCharacter() {
  return <ChapterImage src="/onboarding/spending_habit.png" />;
}

export function SpendingTriggersCharacter() {
  return <ChapterImage src="/onboarding/spending-trigg.png" />;
}

export function SpendingPreferencesCharacter() {
  return <ChapterImage src="/onboarding/spending-pref.png" />;
}

export function RiskToleranceCharacter() {
  return <ChapterImage src="/onboarding/risk-toelrence.png" />;
}

export function RiskCharacter() {
  return <ChapterImage src="/onboarding/risk.png" />;
}
