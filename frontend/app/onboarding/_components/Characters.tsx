"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/* Notion-style line-art characters, custom-drawn in Argus brand colors.
   Shared anatomy (head/glasses/body) keeps the cast feeling like one
   family; each character carries one signature object tied to its
   onboarding chapter. */

const INK = "#1C1815";
const SKIN = "#E7D8BF";
const COPPER = "#BE7740";
const COPPER_DARK = "#8A5429";
const POSITIVE = "#3F7D55";
const PAPER = "#F6EFE2";

function Bounce({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      style={{ display: "inline-block" }}
    >
      {children}
    </motion.div>
  );
}

function Head({ cx = 100, cy = 70 }: { cx?: number; cy?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="30" fill={SKIN} stroke={INK} strokeWidth="3" />
      {/* round glasses */}
      <circle cx={cx - 11} cy={cy + 2} r="9" fill="none" stroke={INK} strokeWidth="2.5" />
      <circle cx={cx + 11} cy={cy + 2} r="9" fill="none" stroke={INK} strokeWidth="2.5" />
      <line x1={cx - 2} y1={cy + 2} x2={cx + 2} y2={cy + 2} stroke={INK} strokeWidth="2.5" />
      {/* hair */}
      <path d={`M${cx - 28} ${cy - 8} Q${cx} ${cy - 42} ${cx + 28} ${cy - 8}`} fill="none" stroke={INK} strokeWidth="3" />
      {/* smile */}
      <path d={`M${cx - 8} ${cy + 14} Q${cx} ${cy + 19} ${cx + 8} ${cy + 14}`} fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

function Body({ color = COPPER }: { color?: string }) {
  return <path d="M70 130 Q70 100 100 100 Q130 100 130 130 L132 175 Q100 188 68 175 Z" fill={color} stroke={INK} strokeWidth="3" />;
}

export function IncomeCharacter({ size = 140 }: { size?: number }) {
  return (
    <Bounce>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <Body color={COPPER} />
        <Head />
        {/* watering can hand */}
        <path d="M132 145 L158 132" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <rect x="152" y="118" width="26" height="18" rx="4" fill={PAPER} stroke={INK} strokeWidth="2.5" />
        <path d="M178 124 L192 118" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
        {/* coin plant */}
        <path d="M76 175 L76 150" stroke={POSITIVE} strokeWidth="3" strokeLinecap="round" />
        <circle cx="76" cy="142" r="9" fill={PAPER} stroke={POSITIVE} strokeWidth="2.5" />
        <text x="76" y="146" fontSize="11" fontWeight="700" fill={POSITIVE} textAnchor="middle">$</text>
        <circle cx="60" cy="160" r="6" fill="none" stroke={POSITIVE} strokeWidth="2" />
        <circle cx="92" cy="160" r="6" fill="none" stroke={POSITIVE} strokeWidth="2" />
      </svg>
    </Bounce>
  );
}

export function ExpensesCharacter() {
  return (
    <Image
      src="/onboarding/expenses-character.png"
      alt=""
      fill
      sizes="38vw"
      style={{ objectFit: "cover" }}
      priority
    />
  );
}

export function DebtCharacter({ size = 140 }: { size?: number }) {
  return (
    <Bounce>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <Body color="#A8412B" />
        <Head />
        {/* broken chain */}
        <ellipse cx="58" cy="130" rx="11" ry="15" fill="none" stroke={INK} strokeWidth="3" />
        <ellipse cx="58" cy="158" rx="11" ry="15" fill="none" stroke="#A8412B" strokeWidth="3" strokeDasharray="4 4" />
        {/* scissors hand */}
        <path d="M70 120 L92 110" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M92 110 L106 100 M92 110 L106 118" stroke={COPPER} strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="92" cy="110" r="3" fill={INK} />
      </svg>
    </Bounce>
  );
}

export function GoalsCharacter({ size = 140 }: { size?: number }) {
  return (
    <Bounce>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        {/* hill */}
        <path d="M30 185 Q70 140 100 150 Q130 158 170 185 Z" fill="#EFDFCB" stroke={INK} strokeWidth="2.5" />
        <Body color={COPPER} />
        <Head cx={95} cy={68} />
        {/* flag */}
        <line x1="135" y1="100" x2="135" y2="150" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M135 100 L160 110 L135 120 Z" fill={POSITIVE} stroke={INK} strokeWidth="2" />
      </svg>
    </Bounce>
  );
}

export function BehaviorCharacter({ size = 140 }: { size?: number }) {
  return (
    <Bounce>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        {/* cross-legged seated body */}
        <path d="M62 175 Q70 150 100 150 Q130 150 138 175 Q100 190 62 175 Z" fill={COPPER_DARK} stroke={INK} strokeWidth="3" />
        <Head cy={100} />
        {/* thought bubble */}
        <circle cx="148" cy="58" r="4" fill="none" stroke={INK} strokeWidth="2" />
        <circle cx="158" cy="46" r="6" fill="none" stroke={INK} strokeWidth="2" />
        <ellipse cx="174" cy="28" rx="20" ry="15" fill={PAPER} stroke={INK} strokeWidth="2.5" />
        <path d="M166 24 Q174 18 182 24 Q182 32 174 34 Q166 32 166 24Z" fill={COPPER} opacity="0.5" />
      </svg>
    </Bounce>
  );
}

export function RiskCharacter({ size = 140 }: { size?: number }) {
  return (
    <Bounce>
      <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
        <Body color={COPPER} />
        <Head />
        {/* umbrella */}
        <line x1="100" y1="100" x2="100" y2="60" stroke={INK} strokeWidth="3" />
        <path d="M68 60 Q100 30 132 60 Q116 50 100 60 Q84 50 68 60Z" fill={POSITIVE} stroke={INK} strokeWidth="2.5" />
        {/* balance line underfoot */}
        <line x1="55" y1="180" x2="145" y2="180" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </svg>
    </Bounce>
  );
}
