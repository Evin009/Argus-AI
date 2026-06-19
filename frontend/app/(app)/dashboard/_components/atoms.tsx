"use client";

import { CardSpotlight } from "@/components/ui/card-spotlight";

// ─── money formatter ──────────────────────────────────────────────

export function money(n: number): string {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─── EyeMark — Argus eye glyph used as AI avatar in insight surfaces ──

export function EyeMark({ size = 24, color = "var(--amber-400)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <path d="M3.5 24C3.5 24 12 9.5 24 9.5C36 9.5 44.5 24 44.5 24C44.5 24 36 38.5 24 38.5C12 38.5 3.5 24 3.5 24Z" stroke={color} strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="24" cy="24" r="8.4" fill={color} />
      <circle cx="24" cy="24" r="3.6" fill="#14110D" />
      <circle cx="26.4" cy="21.4" r="1.5" fill="#F6EFE2" />
    </svg>
  );
}

// ─── Panel — shared dashboard card surface (wraps CardSpotlight) ─────

export function Panel({
  children,
  style,
  pad = 18,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  pad?: number;
}) {
  return (
    <CardSpotlight style={{ padding: pad, ...style }}>
      {children}
    </CardSpotlight>
  );
}
