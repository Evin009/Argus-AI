"use client";

import { useMemo, useState } from "react";
import { PieChart, ChevronDown } from "lucide-react";
import { Panel, money } from "./atoms";

export type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  timestamp: string;
};

const CAT_PALETTE = ["#4A90D9", "#C87238", "#4CAF82", "#8B4A18", "#9E8A72", "#E05555"];

function thisMonthSpending(txns: Transaction[]) {
  const now = new Date();
  return txns.filter((t) => {
    const d = new Date(t.timestamp);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.amount > 0;
  });
}

function spendingByCat(txns: Transaction[]) {
  const map: Record<string, number> = {};
  txns.forEach((t) => {
    const c = t.category || "Other";
    map[c] = (map[c] ?? 0) + t.amount;
  });
  return Object.entries(map)
    .map(([name, amt], i) => ({ name, amt, hex: CAT_PALETTE[i % CAT_PALETTE.length] }))
    .sort((a, b) => b.amt - a.amt)
    .slice(0, 6);
}

export function SpendingWheel({ allTxns }: { allTxns: Transaction[] }) {
  const [active, setActive] = useState<number | null>(null);

  const cats = useMemo(() => spendingByCat(thisMonthSpending(allTxns)), [allTxns]);
  const total = cats.reduce((s, c) => s + c.amt, 0);
  const GAP = 3.5;
  const OUTSET = 8;

  let acc = 0;
  const arcs = cats.map((cat) => {
    const pct = total > 0 ? (cat.amt / total) * 100 : 0;
    const dashOffset = 25 - acc;
    const midAngleRad = -Math.PI / 2 + (acc + pct / 2) / 100 * 2 * Math.PI;
    const tx = Math.cos(midAngleRad) * OUTSET;
    const ty = Math.sin(midAngleRad) * OUTSET;
    acc += pct;
    return { ...cat, pct, dash: Math.max(pct - GAP, 0.5), dashOffset, tx, ty };
  });

  const CX = 116, CY = 116, R = 90, SW = 18;
  const sel = active !== null ? arcs[active] : null;
  const monthLabel = new Date().toLocaleString("default", { month: "short" });

  return (
    <Panel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--paper)", display: "flex", alignItems: "center", gap: 8 }}>
            <PieChart size={18} color="var(--amber-400)" strokeWidth={1.7} />
            Spending by category
          </span>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--on-dark-400)", marginTop: 2 }}>This month</div>
        </div>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--surface-2)",
            border: "1px solid var(--surface-3)",
            borderRadius: "var(--r-pill)",
            padding: "5px 10px",
            flexShrink: 0,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--on-dark-600)",
          }}
        >
          {monthLabel} <ChevronDown size={13} color="currentColor" />
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "stretch", padding: "16px 10px 16px 20px" }}>
        {total === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-400)" }}>No spending data yet</span>
          </div>
        ) : (
          <svg width={CX * 2} height={CY * 2} viewBox={`0 0 ${CX * 2} ${CY * 2}`} style={{ overflow: "visible" }}>
            {arcs.map((a, i) => {
              const isActive = active === i;
              const hasActive = active !== null;
              return (
                <circle
                  key={i}
                  cx={CX}
                  cy={CY}
                  r={R}
                  fill="none"
                  stroke={a.hex}
                  strokeWidth={isActive ? SW + 8 : SW}
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={`${a.dash} ${100 - a.dash}`}
                  strokeDashoffset={a.dashOffset}
                  style={{
                    transform: isActive ? `translate(${a.tx}px, ${a.ty}px)` : "translate(0,0)",
                    transition: "transform .35s cubic-bezier(0.34,1.56,0.64,1), stroke-width .25s ease, opacity .2s ease, filter .2s ease",
                    cursor: "pointer",
                    opacity: hasActive && !isActive ? 0.25 : 1,
                    filter: isActive ? `drop-shadow(0 0 14px ${a.hex}) drop-shadow(0 6px 18px ${a.hex}90)` : "none",
                    transformOrigin: `${CX}px ${CY}px`,
                  }}
                  onClick={() => setActive(active === i ? null : i)}
                />
              );
            })}

            {sel ? (
              <>
                <text x={CX} y={CY - 18} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize="11" fontWeight="700" letterSpacing="0.1em" fill={`${sel.hex}CC`}>
                  {sel.name.toUpperCase()}
                </text>
                <text x={CX} y={CY + 6} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans)" fontSize="30" fontWeight="700" fill={sel.hex} style={{ fontVariantNumeric: "tabular-nums" }}>
                  {money(sel.amt)}
                </text>
                <text x={CX} y={CY + 28} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize="9" letterSpacing="0.08em" fill="var(--on-dark-400)">
                  {Math.round(sel.pct)}% OF TOTAL
                </text>
              </>
            ) : (
              <>
                <text x={CX} y={CY - 10} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-sans)" fontSize="30" fontWeight="700" fill="var(--paper)" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {money(total)}
                </text>
                <text x={CX} y={CY + 16} textAnchor="middle" dominantBaseline="middle" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="0.1em" fill="var(--on-dark-400)">
                  TOTAL SPENT
                </text>
              </>
            )}
          </svg>
        )}
      </div>
    </Panel>
  );
}
