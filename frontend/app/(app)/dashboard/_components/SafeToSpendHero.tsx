"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type SafeToSpend = {
  safe_amount: number;
  breakdown: {
    balance: number;
    bills_due: number;
    buffer_reserve: number;
    window_days: number;
  };
  computed_at: string | null;
};

export function SafeToSpendHero() {
  const [data, setData] = useState<SafeToSpend | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<SafeToSpend>("/insights/safe-to-spend")
      .then(setData)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        className="skeleton"
        style={{ height: 80, borderRadius: "var(--r-xl)", background: "var(--surface-1)", border: "1px solid var(--surface-3)" }}
      />
    );
  }

  if (!data) return null;

  return (
    <div
      onClick={() => setOpen((o) => !o)}
      style={{
        background: "var(--surface-1)", borderRadius: "var(--r-xl)",
        border: "1px solid var(--surface-3)", padding: "20px 24px",
        cursor: "pointer", userSelect: "none",
      }}
    >
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: "var(--text-eyebrow)",
        textTransform: "uppercase", letterSpacing: "var(--text-eyebrow--letter-spacing)",
        color: "var(--on-dark-400)", margin: "0 0 4px",
      }}>
        Safe to spend today
      </p>
      <p style={{
        fontFamily: "var(--font-display)", fontSize: "var(--text-hero)",
        color: "var(--positive-bright)", margin: 0, fontWeight: 400,
      }}>
        ${data.safe_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>

      {open && (
        <div style={{
          marginTop: 16, borderTop: "1px solid var(--surface-3)",
          paddingTop: 16, display: "flex", flexDirection: "column", gap: 8,
        }}>
          {(
            [
              ["Current balance", data.breakdown.balance, false],
              ["Bills due this window", data.breakdown.bills_due, true],
              ["Buffer reserve", data.breakdown.buffer_reserve, true],
            ] as [string, number, boolean][]
          ).map(([label, val, negative]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-sub)", color: "var(--on-dark-400)" }}>
                {label}
              </span>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: "var(--text-sub)",
                color: negative ? "var(--accent-red)" : "var(--paper)",
              }}>
                {negative ? "-" : ""}${val.toFixed(2)}
              </span>
            </div>
          ))}
          <p style={{
            fontFamily: "var(--font-sans)", fontSize: "var(--text-eyebrow)",
            color: "var(--on-dark-400)", margin: "4px 0 0", textAlign: "right",
          }}>
            {data.breakdown.window_days}-day window · tap to close
          </p>
        </div>
      )}
    </div>
  );
}
