"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type CalendarEntry = {
  id: string;
  type: "bill" | "subscription" | "ai_recommendation";
  merchant: string;
  amount: number | null;
  due_date: string | null;
  logo_url: string | null;
  urgency: "low" | "medium" | "high";
  ai_reasoning: string | null;
};

type PayTiming = {
  card_recommendations: { account_id: string; pay_amount: number; closing_day: number | null }[];
  stacked_windows: { window_start: string; total_due: number; priority_order: { merchant: string; avg_amount: number }[] }[];
};

const URGENCY_COLOR: Record<string, string> = {
  high: "var(--accent-red)",
  medium: "var(--copper)",
  low: "var(--surface-3)",
};

const FILTER_OPTIONS = ["all", "bills", "subscriptions"] as const;
type Filter = (typeof FILTER_OPTIONS)[number];

function LogoTile({ merchant, logoUrl }: { merchant: string; logoUrl: string | null }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={merchant}
        style={{
          width: 36, height: 36, borderRadius: "var(--r-md)",
          objectFit: "contain", background: "var(--surface-2)",
          flexShrink: 0,
        }}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "var(--r-md)", flexShrink: 0,
      background: "var(--grad-accent)", display: "flex", alignItems: "center",
      justifyContent: "center", color: "#fff",
      fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700,
    }}>
      {merchant[0]?.toUpperCase()}
    </div>
  );
}

export default function CalendarPage() {
  const [entries, setEntries] = useState<CalendarEntry[]>([]);
  const [payTiming, setPayTiming] = useState<PayTiming | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<{ entries: CalendarEntry[] }>("/calendar"),
      api.get<PayTiming>("/insights/pay-timing"),
    ]).then(([cal, pt]) => {
      setEntries(cal.entries);
      setPayTiming(pt);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = entries.filter((e) => {
    if (filter === "all") return true;
    if (filter === "bills") return e.type === "bill";
    if (filter === "subscriptions") return e.type === "subscription";
    return true;
  });

  if (loading) {
    return (
      <div style={{ padding: "32px 24px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="skeleton"
            style={{
              height: 68, marginBottom: 12,
              borderRadius: "var(--r-lg)", background: "var(--surface-1)",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 680, margin: "0 auto" }}>
      <p style={{
        fontFamily: "var(--font-sans)", fontSize: "var(--text-eyebrow)",
        letterSpacing: "var(--text-eyebrow--letter-spacing)", textTransform: "uppercase",
        color: "var(--on-dark-400)", margin: "0 0 6px",
      }}>
        Smart Payment Calendar
      </p>
      <h1 style={{
        fontFamily: "var(--font-display)", fontSize: "var(--text-hero)",
        color: "var(--paper)", margin: "0 0 24px", fontWeight: 400,
      }}>
        What&apos;s coming up
      </h1>

      {payTiming && payTiming.stacked_windows.length > 0 && (
        <div style={{
          background: "rgba(168,65,43,0.10)", border: "1px solid rgba(168,65,43,0.3)",
          borderRadius: "var(--r-lg)", padding: "16px 20px", marginBottom: 24,
        }}>
          <p style={{
            fontFamily: "var(--font-sans)", fontSize: "var(--text-sub)",
            color: "var(--accent-red)", margin: "0 0 8px", fontWeight: 600,
          }}>
            Bills stacking — balance may not cover all
          </p>
          {payTiming.stacked_windows[0].priority_order.map((b, i) => (
            <p key={i} style={{
              fontFamily: "var(--font-sans)", fontSize: "var(--text-sub)",
              color: "var(--paper)", margin: "2px 0",
            }}>
              {i + 1}. {b.merchant} — ${b.avg_amount.toFixed(2)}
            </p>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontFamily: "var(--font-sans)", fontSize: "var(--text-sub)", fontWeight: 500,
              padding: "6px 14px", borderRadius: "var(--r-pill)", cursor: "pointer", border: "1px solid",
              borderColor: filter === f ? "var(--copper)" : "var(--surface-3)",
              background: filter === f ? "rgba(168,65,43,0.12)" : "var(--surface-1)",
              color: filter === f ? "var(--copper)" : "var(--on-dark-400)",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <p style={{
            fontFamily: "var(--font-sans)", fontSize: "var(--text-body)",
            color: "var(--on-dark-400)", textAlign: "center", padding: "40px 0",
          }}>
            Nothing due
          </p>
        )}
        {filtered.map((entry) => (
          <div
            key={entry.id}
            style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "var(--surface-1)", borderRadius: "var(--r-lg)",
              border: "1px solid var(--surface-3)", padding: "14px 18px",
              borderLeft: `3px solid ${URGENCY_COLOR[entry.urgency]}`,
            }}
          >
            <LogoTile merchant={entry.merchant} logoUrl={entry.logo_url} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: "var(--text-body)",
                color: "var(--paper)", margin: 0, fontWeight: 500,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {entry.merchant}
              </p>
              <p style={{
                fontFamily: "var(--font-sans)", fontSize: "var(--text-sub)",
                color: "var(--on-dark-400)", margin: "2px 0 0",
              }}>
                {entry.due_date
                  ? new Date(entry.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "—"}
              </p>
            </div>
            <p style={{
              fontFamily: "var(--font-mono)", fontSize: "var(--text-body)",
              color: "var(--paper)", margin: 0, fontWeight: 600, flexShrink: 0,
            }}>
              {entry.amount != null ? `$${entry.amount.toFixed(2)}` : "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
