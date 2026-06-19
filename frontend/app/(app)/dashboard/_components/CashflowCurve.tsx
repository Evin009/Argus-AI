"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { Panel } from "./atoms";

const CF_DAYS = 30;

// Placeholder pending the Cashflow Prediction Engine backend phase (30-60 day
// forward simulation). Shape mirrors what that engine will eventually return:
// a daily delta series anchored to the user's current balance.
function buildPlaceholderCurve(startingBalance: number) {
  const deltas = [
    0, 5200, -120, -1850, -45, -82, 0, -19, -142, -38,
    -55, 0, -612, -29, -44, 0, -88, -23, 0, -67,
    -31, 0, -19, 5200, -150, -1850, -42, 0, -75, -19,
  ];
  let running = startingBalance;
  return deltas.map((delta, i) => {
    running += delta;
    return { day: i + 1, balance: running, delta };
  });
}

export function CashflowCurve({ currentBalance }: { currentBalance: number }) {
  const data = useMemo(() => buildPlaceholderCurve(currentBalance || 3820), [currentBalance]);

  const W = 460, H = 130, PX = 12, PY = 14;
  const iW = W - PX * 2, iH = H - PY * 2;
  const today = new Date().getDate();
  const todayIdx = Math.min(today - 1, CF_DAYS - 1);

  const vals = data.map((d) => d.balance);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const cx = (i: number) => PX + (i / (CF_DAYS - 1)) * iW;
  const cy = (v: number) => PY + iH - ((v - minV) / range) * iH;

  const pts = data.map((d, i) => [cx(i), cy(d.balance)] as const);
  const pathD = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = pts[i - 1];
    const cpx = (px + x) / 2;
    return acc + ` C${cpx},${py} ${cpx},${y} ${x},${y}`;
  }, "");

  const areaD = pathD + ` L${pts[CF_DAYS - 1][0]},${PY + iH} L${pts[0][0]},${PY + iH} Z`;
  const todayX = cx(todayIdx);
  const todayY = cy(data[todayIdx].balance);
  const bal = data[todayIdx].balance;
  const monthLabel = new Date().toLocaleString("default", { month: "short" }).toUpperCase();

  return (
    <Panel>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p style={{ margin: "0 0 4px", fontFamily: "var(--font-display)", fontSize: 21, color: "var(--paper)", fontWeight: 400, display: "flex", alignItems: "center", gap: 8 }}>
            Cash flow · 30 days
            <TrendingUp size={18} color="var(--amber-400)" strokeWidth={1.7} />
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 400, color: "var(--paper)", lineHeight: 1 }}>
              ${bal.toLocaleString()}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--on-dark-400)", letterSpacing: ".06em" }}>BALANCE TODAY</span>
          </div>
        </div>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--amber-400)", letterSpacing: ".08em", background: "var(--amber-tint-dark)", padding: "4px 10px", borderRadius: "var(--r-pill)" }}>
          {monthLabel} FORECAST
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, overflow: "visible", display: "block" }}>
        <defs>
          <linearGradient id="cfGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--amber-500)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--amber-500)" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="cfLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--amber-600)" />
            <stop offset="50%" stopColor="var(--amber-400)" />
            <stop offset="100%" stopColor="var(--amber-300)" />
          </linearGradient>
          <filter id="cfGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PY + t * iH;
          return <line key={t} x1={PX} y1={y} x2={PX + iW} y2={y} stroke="var(--surface-3)" strokeWidth="0.8" strokeDasharray="3 4" />;
        })}

        <path d={areaD} fill="url(#cfGrad)" />
        <path d={pathD} fill="none" stroke="url(#cfLine)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" filter="url(#cfGlow)" />
        <line x1={todayX} y1={PY} x2={todayX} y2={PY + iH} stroke="var(--amber-400)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
        <circle cx={todayX} cy={todayY} r="5" fill="var(--amber-400)" stroke="var(--surface-1)" strokeWidth="2" />

        {[1, 8, 15, 22, 30].map((d) => (
          <text key={d} x={cx(d - 1)} y={H - 1} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--on-dark-400)" textAnchor="middle" letterSpacing="0.04em">
            {d === 1 ? "DAY 1" : d === 30 ? "DAY 30" : `${d}`}
          </text>
        ))}
      </svg>

      <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
        {[
          { label: "Income", color: "var(--positive-bright)", val: "+$10,400" },
          { label: "Expenses", color: "var(--negative-bright)", val: "−$4,590" },
          { label: "Net", color: "var(--amber-400)", val: "+$5,810" },
        ].map(({ label, color, val }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--on-dark-400)", letterSpacing: ".06em", textTransform: "uppercase" }}>{label}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--paper)" }}>{val}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
