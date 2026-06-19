"use client";

import { useEffect, useRef, useState } from "react";
import {
  ShieldAlert,
  Repeat,
  Utensils,
  Landmark,
  CreditCard,
  Activity,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type ChartType = "overdraft" | "dining" | "debt" | null;

type InsightCard = {
  tag: string;
  icon: LucideIcon;
  accent: string;
  dim: string;
  heading: React.ReactNode;
  subhead: React.ReactNode;
  chart: ChartType;
  body: string;
  cta: string;
};

// Placeholder pending AI Insights backend phase (Risk Radar / Behavioral
// Intelligence / Debt Strategy engines) — content is shaped like the
// eventual `ai_insights` structured_output_json payload.
const CARDS: InsightCard[] = [
  {
    tag: "OVERDRAFT RADAR",
    icon: ShieldAlert,
    accent: "#E05038",
    dim: "rgba(224,80,56,0.12)",
    heading: <>Balance <em>Danger Zone</em></>,
    subhead: <>Rent clears <em>2 days after</em> your paycheck runs out.</>,
    chart: "overdraft",
    body: "$240 shortfall on Jun 30 — move funds from savings before your rent bounces.",
    cta: "Move Funds",
  },
  {
    tag: "SUBSCRIPTION SURGE",
    icon: Repeat,
    accent: "#C8723A",
    dim: "rgba(200,114,58,0.12)",
    heading: <>Subscriptions Up <em>$24/mo</em></>,
    subhead: <>Three services raised prices <em>without telling you</em>.</>,
    chart: null,
    body: "Netflix, Adobe & Spotify quietly added fees since January. That's $288 extra this year you never approved.",
    cta: "Review & Cancel",
  },
  {
    tag: "SPENDING PATTERN",
    icon: Utensils,
    accent: "#6B9FE4",
    dim: "rgba(107,159,228,0.10)",
    heading: <>Dining <em>Over Budget</em></>,
    subhead: <>You&apos;ll overshoot your food budget by <em>$180</em> this month.</>,
    chart: "dining",
    body: "$680 spent with 9 days left. Your usual monthly pace is $600 — slow down or adjust the limit.",
    cta: "See Breakdown",
  },
  {
    tag: "IDLE CASH",
    icon: Landmark,
    accent: "#2DB887",
    dim: "rgba(45,184,135,0.10)",
    heading: <>Money Left on the <em>Table</em></>,
    subhead: <>$2,400 in checking is earning <em>almost nothing</em>.</>,
    chart: null,
    body: "A high-yield savings account offers 4.15% APY — move that cash today and earn ~$100 extra before year-end with zero risk.",
    cta: "Move Funds",
  },
  {
    tag: "SMART DEBT",
    icon: CreditCard,
    accent: "#C8723A",
    dim: "rgba(200,114,58,0.12)",
    heading: <>Pay Off Highest-APR <em>First</em></>,
    subhead: <>One of your cards costs <em>nearly double</em> the others in interest.</>,
    chart: "debt",
    body: "At 24.99% APR, your highest-rate card is draining the most in interest. Paying it down first saves the most, fastest.",
    cta: "See Payoff Plan",
  },
  {
    tag: "FORECAST",
    icon: Activity,
    accent: "#8BA8D4",
    dim: "rgba(139,168,212,0.09)",
    heading: <>Clear Skies for <em>45 Days</em></>,
    subhead: <>Your balance stays <em>healthy</em> through mid-August.</>,
    chart: null,
    body: "No major bills or dips forecast until late August — a safe window for a large purchase you've been weighing.",
    cta: "View Forecast",
  },
];

function InsightChart({ type, accent }: { type: ChartType; accent: string }) {
  if (type === "overdraft") {
    const pts = [88, 76, 62, 48, 32, 16, 3];
    const line = pts.map((y, i) => i * 50 + "," + y).join(" ");
    return (
      <svg viewBox="0 0 300 106" width="100%" style={{ display: "block", height: 106 }}>
        <defs>
          <linearGradient id="ic-od" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <line x1="0" y1="96" x2="300" y2="96" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="6 4" />
        <text x="2" y="106" fontSize="13" fill="rgba(255,255,255,0.55)" fontFamily="monospace" fontWeight="600">$0</text>
        <polygon points={"0,106 " + line + " 300,106"} fill="url(#ic-od)" />
        <polyline points={line} fill="none" stroke={accent} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="300" cy="3" r="8" fill={accent} />
        <text x="290" y="26" fontSize="13" fill={accent} fontFamily="monospace" fontWeight="700" textAnchor="end">RISK</text>
      </svg>
    );
  }
  if (type === "dining") {
    return (
      <svg viewBox="0 0 300 80" width="100%" style={{ display: "block", height: 80 }}>
        <rect x="0" y="12" width="300" height="22" rx="11" fill="rgba(255,255,255,0.12)" />
        <rect x="0" y="12" width="185" height="22" rx="11" fill={accent} fillOpacity="0.28" />
        <rect x="0" y="12" width="244" height="22" rx="11" fill={accent} fillOpacity="0.95" />
        <line x1="185" y1="4" x2="185" y2="38" stroke="rgba(255,255,255,0.72)" strokeWidth="2.5" />
        <text x="185" y="56" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.7)" fontFamily="monospace" fontWeight="700">PACE</text>
        <text x="2" y="74" fontSize="13" fill={accent} fontFamily="monospace" fontWeight="700">$680 spent</text>
        <text x="298" y="74" fontSize="13" fill="rgba(255,255,255,0.65)" fontFamily="monospace" fontWeight="600" textAnchor="end">$750 limit</text>
      </svg>
    );
  }
  if (type === "debt") {
    const rows: [string, number, string, boolean][] = [
      ["CITI", 0.82, "24.99%", true],
      ["AMEX", 0.52, "20.24%", false],
      ["CHASE", 0.32, "17.99%", false],
    ];
    return (
      <svg viewBox="0 0 300 90" width="100%" style={{ display: "block", height: 90 }}>
        {rows.map(([name, pct, apr, hi], i) => (
          <g key={name}>
            <text x="0" y={16 + i * 28} fontSize="14" fontWeight="700" fill={hi ? "#fff" : "rgba(255,255,255,0.62)"} fontFamily="monospace">{name}</text>
            <rect x="70" y={3 + i * 28} width="160" height="16" rx="8" fill="rgba(255,255,255,0.12)" />
            <rect x="70" y={3 + i * 28} width={pct * 160} height="16" rx="8" fill={hi ? accent : "rgba(255,255,255,0.3)"} />
            <text x="300" y={16 + i * 28} textAnchor="end" fontSize="14" fontWeight={hi ? 700 : 500} fill={hi ? accent : "rgba(255,255,255,0.62)"} fontFamily="monospace">{apr}</text>
          </g>
        ))}
      </svg>
    );
  }
  return null;
}

export function StatCluster() {
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const N = CARDS.length;

  function startTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive((a) => (a + 1) % N), 6000);
  }
  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (dir: number) => {
    setActive((a) => (a + dir + N) % N);
    startTimer();
  };

  const getPos = (i: number) => {
    let off = ((i - active) % N + N) % N;
    if (off > N / 2) off -= N;
    const abs = Math.abs(off);
    if (abs > 2) return null;
    const sign = abs === 0 ? 0 : off > 0 ? 1 : -1;
    return {
      tx: sign * (abs === 1 ? 12 : 22),
      rot: sign * (abs === 1 ? 2 : 4),
      sc: abs === 0 ? 1 : abs === 1 ? 0.96 : 0.92,
      op: abs === 0 ? 1 : abs === 1 ? 0.55 : 0.28,
      zi: abs === 0 ? 10 : abs === 1 ? 5 : 2,
      isActive: abs === 0,
      clickable: abs > 0,
    };
  };

  return (
    <div style={{ padding: 0, overflow: "hidden" }}>
      <style>{`
        @keyframes argShine2 { 0% { transform: translateX(-130%) skewX(-14deg); } 100% { transform: translateX(130%) skewX(-14deg); } }
        .arg-icta2 { position:relative; overflow:hidden; cursor:pointer; transition:filter .18s, transform .1s; }
        .arg-icta2::after { content:''; position:absolute; inset:0; background:linear-gradient(90deg,transparent 20%,rgba(255,255,255,0.35) 50%,transparent 80%); transform:translateX(-130%) skewX(-14deg); pointer-events:none; }
        .arg-icta2:hover { filter:brightness(1.12); }
        .arg-icta2:hover::after { animation:argShine2 .48s ease-out forwards; }
        .arg-icta2:active { transform:translateY(1px); }
        .arg-soft2 { cursor:pointer; transition:background .18s, filter .18s, transform .1s; }
        .arg-soft2:hover { filter:brightness(1.18); }
        .arg-soft2:active { transform:translateY(1px); }
      `}</style>

      <div style={{ position: "relative", height: 480, margin: "12px 12px 0" }}>
        {CARDS.map((c, i) => {
          const pos = getPos(i);
          if (!pos) return null;
          const hasChart = !!c.chart;
          const ae = c.accent.replace("#", "%23");
          const Icon = c.icon;
          return (
            <div
              key={i}
              onClick={() => {
                if (pos.clickable) {
                  setActive(i);
                  startTimer();
                }
              }}
              style={{
                position: "absolute",
                inset: 0,
                transformOrigin: "bottom center",
                transform: `translateX(${pos.tx}px) rotate(${pos.rot}deg) scale(${pos.sc})`,
                opacity: pos.op,
                zIndex: pos.zi,
                transition: "transform .46s cubic-bezier(.4,0,.2,1), opacity .34s ease",
                cursor: pos.clickable ? "pointer" : "default",
              }}
            >
              <div
                style={{
                  height: "100%",
                  boxSizing: "border-box",
                  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32'%3E%3Cline x1='0' y1='0' x2='32' y2='32' stroke='${ae}' stroke-width='0.55' stroke-opacity='0.07'/%3E%3Cline x1='0' y1='32' x2='32' y2='0' stroke='${ae}' stroke-width='0.55' stroke-opacity='0.07'/%3E%3C/svg%3E") repeat, radial-gradient(ellipse 210px 220px at calc(100% + 24px) calc(100% + 24px), ${c.accent}22 0%, transparent 68%), radial-gradient(ellipse 160px 120px at 94% 4%, ${c.accent}18 0%, transparent 62%), radial-gradient(ellipse 85% 75% at 50% 42%, rgba(200,168,75,0.09) 0%, transparent 68%), linear-gradient(158deg, #221B0F 0%, #0D0A07 100%)`,
                  border: `1px solid ${c.accent}28`,
                  borderTop: `2.5px solid ${c.accent}`,
                  borderRadius: "var(--r-lg)",
                  padding: "16px 16px 14px",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: pos.isActive
                    ? `0 24px 60px rgba(0,0,0,0.78), 0 0 0 1px ${c.accent}38, 0 0 80px ${c.accent}0C`
                    : `0 4px 16px rgba(0,0,0,0.35), 0 0 0 1px ${c.accent}14`,
                  overflow: "hidden",
                  alignItems: "stretch",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, flexDirection: "row", alignItems: "stretch" }}>
                  <div style={{ flex: 1, display: "flex", textAlign: "left", justifyContent: "flex-start" }}>
                    <span style={{ fontFamily: "var(--font-mono)", letterSpacing: ".16em", textTransform: "uppercase", color: c.accent, fontWeight: 900, fontSize: "15px", textAlign: "left" }}>
                      {c.tag}
                    </span>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: "var(--r-md)", flexShrink: 0, background: c.dim, border: `1.5px solid ${c.accent}40`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px ${c.accent}22` }}>
                    <Icon size={18} color={c.accent} strokeWidth={1.9} />
                  </div>
                </div>

                <div style={{ fontWeight: 400, color: "var(--paper)", lineHeight: 1.1, marginBottom: 8, fontSize: "30px", fontFamily: "var(--font-display)", textAlign: "center", width: "100%" }}>
                  {c.heading}
                </div>

                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, color: c.accent, lineHeight: 1.3, textAlign: "center", width: "100%", marginBottom: hasChart ? 14 : 10, fontSize: "18px", padding: "10px 0px" }}>
                  {c.subhead}
                </div>

                {hasChart && (
                  <div style={{ marginBottom: 12 }}>
                    <InsightChart type={c.chart} accent={c.accent} />
                  </div>
                )}

                <div style={{ fontFamily: "var(--font-sans)", fontWeight: 500, color: "var(--on-dark-600)", lineHeight: 1.55, flex: 1, fontSize: "16px" }}>
                  {c.body}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                  <button
                    className="arg-soft2 grain"
                    style={{
                      padding: "11px 0",
                      border: "none",
                      background: "var(--grad-accent)",
                      color: "#fff",
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 16px rgba(168,65,43,0.28)",
                      cursor: "pointer",
                      borderRadius: "12px",
                    }}
                  >
                    {c.cta}
                    <ArrowRight size={14} color="#fff" strokeWidth={2.4} />
                  </button>
                  <button
                    className="arg-soft2 grain"
                    style={{
                      padding: "11px 0",
                      borderRadius: "var(--r-md)",
                      border: "none",
                      background: "var(--grad-accent)",
                      color: "#fff",
                      fontFamily: "var(--font-sans)",
                      fontSize: 13,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      cursor: "pointer",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 16px rgba(168,65,43,0.28)",
                    }}
                  >
                    <Sparkles size={14} color="#fff" strokeWidth={1.8} />
                    Ask Argus
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 0 14px" }}>
        <button
          onClick={() => go(-1)}
          style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--surface-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronLeft size={11} color="var(--on-dark-400)" />
        </button>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActive(i);
                startTimer();
              }}
              style={{
                width: i === active ? 18 : 5,
                height: 5,
                borderRadius: "var(--r-pill)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                background: i === active ? "var(--amber-400)" : "var(--surface-3)",
                transition: "all .25s cubic-bezier(.4,0,.2,1)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => go(1)}
          style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--surface-2)", border: "1px solid var(--surface-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ChevronRight size={11} color="var(--on-dark-400)" />
        </button>
      </div>
    </div>
  );
}
