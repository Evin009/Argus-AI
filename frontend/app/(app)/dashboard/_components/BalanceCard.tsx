"use client";

import { useState } from "react";
import { ChevronDown, ArrowUpRight, Landmark, PiggyBank } from "lucide-react";

export type Account = {
  id: string;
  institution: string;
  account_type: string; // 'checking' | 'savings' | 'credit'
  balance: number;
  credit_limit: number | null;
};

const BANK_COLORS: Record<string, string> = {
  chase: "#1A54A0",
  "bank of america": "#E31837",
  "wells fargo": "#C8102E",
  ally: "#7B2D8B",
  citi: "#003B8E",
  amex: "#4A8C2A",
  "american express": "#4A8C2A",
  discover: "#E65C00",
};

function bankColor(name: string): string {
  const key = name.toLowerCase();
  for (const k of Object.keys(BANK_COLORS)) if (key.includes(k)) return BANK_COLORS[k];
  return "var(--surface-3)";
}

function BankBadge({ name, sz = 26 }: { name: string; sz?: number }) {
  const r = Math.round(sz * 0.22);
  const color = bankColor(name);
  const initial = name.slice(0, 1).toUpperCase();
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <rect width={sz} height={sz} rx={r} fill={color} />
      <text x={sz / 2} y={sz / 2 + 3.5} textAnchor="middle" fontFamily="Arial Black,sans-serif" fontSize={sz * 0.34} fontWeight={900} fill="#fff">
        {initial}
      </text>
    </svg>
  );
}

export function BalanceCard({ accounts }: { accounts: Account[] }) {
  const [acctTab, setAcctTab] = useState<"CHK" | "SAV">("CHK");
  const [selectedCC, setSelectedCC] = useState(0);
  const [dropOpen, setDropOpen] = useState(false);

  const debitAccounts = accounts.filter((a) => a.account_type !== "credit");
  const filtered = debitAccounts.filter((a) =>
    acctTab === "CHK" ? a.account_type === "checking" : a.account_type !== "checking"
  );
  const tabTotal = filtered.reduce((s, a) => s + a.balance, 0);
  const tabInsight =
    acctTab === "CHK"
      ? { icon: Landmark, text: "Tracking recent deposits" }
      : { icon: PiggyBank, text: "Savings earning steady interest" };

  const creditCards = accounts.filter((a) => a.account_type === "credit" && a.credit_limit);
  const cc = creditCards[selectedCC];
  const usedPct = cc ? (cc.balance / (cc.credit_limit ?? 1)) * 100 : 0;
  // Placeholder pending credit-intelligence backend phase: "safe limit" heuristic (70% of credit limit)
  const safePct = 70;
  const overSafe = usedPct > safePct;
  const barColor = overSafe ? "var(--negative-bright)" : "var(--amber-400)";
  const safeAmt = cc ? Math.round((cc.credit_limit ?? 0) * (safePct / 100)) : 0;

  const trackItems = filtered.length > 0 ? [...filtered, ...filtered] : [];

  return (
    <div
      className="arg-panel"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--surface-3)",
        borderRadius: "var(--r-lg)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* SECTION 1 — total debit balance */}
      <div style={{ padding: "18px 18px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <p
            style={{
              margin: 0,
              letterSpacing: ".14em",
              color: "var(--on-dark-400)",
              textTransform: "uppercase",
              fontWeight: 600,
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
            }}
          >
            DEBIT · TOTAL BALANCE
          </p>
          <div
            style={{
              display: "flex",
              background: "var(--surface-2)",
              border: "1px solid var(--surface-3)",
              borderRadius: "var(--r-pill)",
              padding: 3,
              gap: 2,
            }}
          >
            {(["CHK", "SAV"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setAcctTab(tab)}
                style={{
                  padding: "4px 12px",
                  borderRadius: "var(--r-pill)",
                  border: "none",
                  cursor: "pointer",
                  background: acctTab === tab ? "var(--amber-400)" : "transparent",
                  color: acctTab === tab ? "#fff" : "var(--on-dark-400)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".08em",
                  transition: "background .18s, color .18s",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <div>
            <div className="figure" style={{ fontSize: 34, fontWeight: 500, color: "var(--paper)", lineHeight: 1 }}>
              ${tabTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 6 }}>
              <span className="ticker ticker-up" style={{ padding: "3px 8px" }}>
                <ArrowUpRight size={11} color="currentColor" />
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--on-dark-400)" }}>
                vs last month
              </span>
            </div>
          </div>
          <div
            className="grain"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "var(--grad-accent)",
              borderRadius: "var(--r-md)",
              padding: "9px 11px",
              flexShrink: 0,
              maxWidth: 160,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
            }}
          >
            <tabInsight.icon size={14} color="#fff" strokeWidth={1.7} />
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: "#fff", lineHeight: 1.35, opacity: 0.92 }}>
              {tabInsight.text}
            </span>
          </div>
        </div>

        {/* Infinite-scroll carousel of linked accounts */}
        <style>{`
          @keyframes argDebitScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          .arg-debit-track { display: flex; gap: 8px; animation: argDebitScroll 18s linear infinite; width: max-content; }
          .arg-debit-track:hover { animation-play-state: paused; }
        `}</style>
        {trackItems.length > 0 ? (
          <div style={{ overflow: "hidden", width: "100%", padding: "8px 0" }}>
            <div className="arg-debit-track">
              {trackItems.map((acc, i) => (
                <div
                  key={`${acc.id}-${i}`}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--surface-3)",
                    borderRadius: "var(--r-md)",
                    padding: "8px 10px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    height: "60px",
                    width: "150px",
                  }}
                >
                  <BankBadge name={acc.institution} sz={28} />
                  <div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, fontWeight: 600, color: "var(--paper)", whiteSpace: "nowrap", lineHeight: 1.2 }}>
                      {acc.institution}
                    </div>
                    <div className="figure" style={{ fontSize: 13, fontWeight: 500, color: "var(--paper)", marginTop: 2 }}>
                      ${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: "var(--on-dark-400)", marginTop: 2, letterSpacing: ".04em", textTransform: "uppercase" }}>
                      {acc.account_type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--on-dark-400)", margin: "8px 0 0" }}>
            No linked accounts yet.
          </p>
        )}
      </div>

      <div style={{ height: 1, background: "var(--surface-3)" }} />

      {/* SECTION 2 — credit utilization */}
      <div style={{ padding: "16px 18px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <p
              style={{
                margin: "0 0 4px",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: ".14em",
                color: "var(--on-dark-400)",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              CREDIT USAGE
            </p>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--paper)", fontWeight: 400 }}>
              Spend vs <em>safe limit</em>
            </span>
          </div>

          {creditCards.length > 0 && (
            <div style={{ position: "relative", flexShrink: 0 }}>
              <button
                onClick={() => setDropOpen((d) => !d)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  background: "var(--surface-2)",
                  border: "1px solid var(--surface-3)",
                  borderRadius: "var(--r-md)",
                  padding: "7px 11px",
                  color: "var(--paper)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: bankColor(cc.institution), flexShrink: 0 }} />
                {cc.institution}
                <ChevronDown size={13} color="var(--on-dark-400)" />
              </button>
              {dropOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 4px)",
                    zIndex: 20,
                    background: "var(--surface-1)",
                    border: "1px solid var(--surface-3)",
                    borderRadius: "var(--r-md)",
                    overflow: "hidden",
                    minWidth: "100%",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
                  }}
                >
                  {creditCards.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCC(i);
                        setDropOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        width: "100%",
                        padding: "9px 14px",
                        background: i === selectedCC ? "var(--surface-2)" : "transparent",
                        border: "none",
                        borderTop: i > 0 ? "1px solid var(--surface-3)" : "none",
                        cursor: "pointer",
                        color: "var(--paper)",
                        fontFamily: "var(--font-sans)",
                        fontSize: 13,
                        textAlign: "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: bankColor(c.institution), flexShrink: 0 }} />
                      {c.institution}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {!cc ? (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-400)", margin: 0 }}>
            No credit cards linked yet.
          </p>
        ) : (
          <>
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  position: "relative",
                  height: 14,
                  background: "var(--surface-2)",
                  border: "1px solid var(--surface-3)",
                  borderRadius: "var(--r-pill)",
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: `${Math.min(usedPct, 100)}%`,
                    borderRadius: "var(--r-pill)",
                    background: barColor,
                    transition: "width .55s cubic-bezier(.4,0,.2,1), background .3s",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: -5,
                    bottom: -5,
                    left: `${safePct}%`,
                    width: 2,
                    background: "var(--positive-bright)",
                    borderRadius: 2,
                  }}
                />
              </div>
              <div style={{ position: "relative", height: 14 }}>
                <span style={{ position: "absolute", left: 0, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--on-dark-400)", letterSpacing: ".04em" }}>$0</span>
                <span style={{ position: "absolute", left: `${safePct}%`, transform: "translateX(-50%)", fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--positive-bright)", whiteSpace: "nowrap", letterSpacing: ".04em" }}>
                  SAFE ${safeAmt.toLocaleString()}
                </span>
                <span style={{ position: "absolute", right: 0, fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--on-dark-400)", letterSpacing: ".04em" }}>
                  LIMIT ${(cc.credit_limit ?? 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
              <div
                style={{
                  background: overSafe ? "rgba(125,30,8,0.18)" : "var(--surface-2)",
                  border: `1px solid ${overSafe ? "rgba(125,30,8,0.50)" : "var(--surface-3)"}`,
                  borderRadius: "var(--r-md)",
                  padding: "8px 10px",
                  transition: "background .3s, border-color .3s",
                }}
              >
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--on-dark-400)", letterSpacing: ".08em", marginBottom: 4 }}>SPENT</div>
                <div className="figure" style={{ fontSize: 13, fontWeight: 600, color: barColor, transition: "color .3s" }}>
                  ${cc.balance.toLocaleString()}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, letterSpacing: ".04em", marginTop: 3, lineHeight: 1.2, color: overSafe ? "var(--negative-bright)" : "transparent" }}>
                  +${Math.max(0, Math.round(cc.balance - safeAmt)).toLocaleString()} over
                </div>
              </div>

              <div style={{ background: "var(--surface-2)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-md)", padding: "8px 10px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--on-dark-400)", letterSpacing: ".08em", marginBottom: 4 }}>SAFE LIMIT</div>
                <div className="figure" style={{ fontSize: 13, fontWeight: 600, color: "var(--positive-bright)" }}>${safeAmt.toLocaleString()}</div>
              </div>

              <div style={{ background: "var(--surface-2)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-md)", padding: "8px 10px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--on-dark-400)", letterSpacing: ".08em", marginBottom: 4 }}>AVAILABLE</div>
                <div className="figure" style={{ fontSize: 13, fontWeight: 600, color: "var(--paper)" }}>
                  ${Math.max(0, (cc.credit_limit ?? 0) - cc.balance).toLocaleString()}
                </div>
              </div>

              <div style={{ background: "var(--surface-2)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-md)", padding: "8px 10px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--on-dark-400)", letterSpacing: ".08em", marginBottom: 4 }}>UTILIZATION</div>
                <div className="figure" style={{ fontSize: 13, fontWeight: 600, color: overSafe ? "var(--negative-bright)" : "var(--amber-400)", transition: "color .3s" }}>
                  {Math.round(usedPct)}%
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
