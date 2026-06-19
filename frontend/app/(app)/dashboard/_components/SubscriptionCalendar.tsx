"use client";

import { Calendar as CalendarIcon, Sparkles, CreditCard as CreditCardIcon } from "lucide-react";
import { Panel } from "./atoms";

export type Bill = {
  id: string;
  merchant: string;
  avg_amount: number;
  next_due_date: string;
};

const BADGE_COLORS = ["#E23B2E", "#2F6FE0", "#1DB954", "#9146FF", "#FF6B35", "#00B4D8"];

function MerchantBadge({ merchant, color, i }: { merchant: string; color: string; i: number }) {
  return (
    <span
      title={merchant}
      style={{
        width: 22,
        height: 22,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginLeft: i ? -7 : 0,
        boxShadow: "0 0 0 2px var(--surface-1)",
        position: "relative",
        zIndex: 5 - i,
      }}
    >
      <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#fff", fontWeight: 700 }}>
        {merchant.slice(0, 1).toUpperCase()}
      </span>
    </span>
  );
}

export function SubscriptionCalendar({ bills }: { bills: Bill[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cells = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 2 + i);
    return d;
  });
  const dows = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const billsByDay: Record<string, Bill[]> = {};
  bills.forEach((b) => {
    const k = b.next_due_date?.slice(0, 10);
    if (!k) return;
    if (!billsByDay[k]) billsByDay[k] = [];
    billsByDay[k].push(b);
  });

  // Next upcoming bill, used for the Argus insight strip
  const upcoming = [...bills]
    .filter((b) => b.next_due_date && new Date(b.next_due_date) >= today)
    .sort((a, b) => new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime())[0];

  return (
    <Panel style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 13, paddingBottom: 13, borderBottom: "1px solid var(--surface-3)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarIcon size={18} color="var(--amber-400)" strokeWidth={1.7} />
          <span style={{ color: "var(--paper)", fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 400 }}>Payments calendar</span>
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--amber-400)", letterSpacing: ".04em" }}>
            <Sparkles size={11} color="var(--amber-400)" /> Optimal pay
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 6 }}>
        {dows.map((d, i) => (
          <span key={i} style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: ".06em", color: "var(--on-dark-400)" }}>
            {d}
          </span>
        ))}
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridAutoRows: "1fr",
          gap: 1,
          background: "var(--surface-3)",
          border: "1px solid var(--surface-3)",
          borderRadius: "var(--r-md)",
          overflow: "hidden",
          minHeight: 160,
        }}
      >
        {cells.map((d, i) => {
          const key = d.toISOString().slice(0, 10);
          const isToday = key === today.toISOString().slice(0, 10);
          const dayBills = billsByDay[key] ?? [];
          const dayTotal = dayBills.reduce((s, b) => s + b.avg_amount, 0);
          return (
            <div key={i} style={{ background: "var(--surface-1)", padding: "7px 4px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
              {isToday ? (
                <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--amber-400)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 600, color: "#fff" }}>
                  {d.getDate()}
                </span>
              ) : (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--paper)", lineHeight: "22px", fontWeight: 400 }}>{d.getDate()}</span>
              )}
              {dayBills.length > 0 && (
                <span style={{ display: "flex", alignItems: "center" }}>
                  {dayBills.slice(0, 3).map((b, bi) => (
                    <MerchantBadge key={bi} merchant={b.merchant} color={BADGE_COLORS[bi % BADGE_COLORS.length]} i={bi} />
                  ))}
                </span>
              )}
              {dayTotal > 0 && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--on-dark-600)", marginTop: "auto" }}>
                  ${dayTotal.toFixed(0)}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div
        className="grain"
        style={{
          marginTop: 10,
          background: "var(--grad-accent)",
          borderRadius: "var(--r-md)",
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
        }}
      >
        {upcoming ? (
          <>
            <CreditCardIcon size={15} color="rgba(255,255,255,0.9)" />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#fff", lineHeight: 1.4 }}>
              <b>{upcoming.merchant}</b> — ${upcoming.avg_amount.toFixed(2)} due{" "}
              <span style={{ color: "rgba(255,255,255,0.7)" }}>
                {new Date(upcoming.next_due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </span>
          </>
        ) : (
          <>
            <Sparkles size={15} color="rgba(255,255,255,0.9)" />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#fff", lineHeight: 1.4 }}>
              No upcoming bills detected yet.
            </span>
          </>
        )}
      </div>
    </Panel>
  );
}
