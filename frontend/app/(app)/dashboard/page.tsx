"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { NumberTicker } from "@/components/ui/number-ticker";
import { CardSpotlight } from "@/components/ui/card-spotlight";

// ─── Types ────────────────────────────────────────────────────────

type Account = {
  id: string;
  institution: string;
  account_type: string;
  balance: number;
  credit_limit: number | null;
};

type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  timestamp: string;
};

type Bill = {
  id: string;
  merchant: string;
  avg_amount: number;
  next_due_date: string;
};

type Subscription = {
  id: string;
  merchant: string;
  avg_amount: number;
  billing_cycle: string;
  is_active: boolean;
};

type AnalystDecision = {
  id: string;
  summary: string;
  created_at: string;
  structured_output_json: {
    signal_type: string;
    severity: "info" | "warning" | "critical";
    title: string;
    recommendation: string;
    confidence: number;
  };
};

// ─── Helpers ──────────────────────────────────────────────────────

function fmt(n: number, d = 0): string {
  return Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
}

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function thisMonthSpending(txns: Transaction[]): number {
  const now = new Date();
  return txns
    .filter((t) => { const d = new Date(t.timestamp); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.amount > 0; })
    .reduce((s, t) => s + t.amount, 0);
}

function thisMonthIncome(txns: Transaction[]): number {
  const now = new Date();
  return txns
    .filter((t) => { const d = new Date(t.timestamp); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && t.amount < 0; })
    .reduce((s, t) => s + Math.abs(t.amount), 0);
}

function lastMonthSpending(txns: Transaction[]): number {
  const now = new Date();
  const lm = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const ly = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  return txns
    .filter((t) => { const d = new Date(t.timestamp); return d.getMonth() === lm && d.getFullYear() === ly && t.amount > 0; })
    .reduce((s, t) => s + t.amount, 0);
}

const CAT_COLORS: Record<string, string> = {
  rent: "var(--info)", housing: "var(--info)", utilities: "var(--info)", mortgage: "var(--info)",
  transportation: "var(--amber-400)", travel: "var(--amber-400)", gas_stations: "var(--amber-400)",
  groceries: "var(--positive-bright)", supermarkets: "var(--positive-bright)",
  food_and_drink: "var(--amber-600)", restaurants: "var(--amber-600)", dining: "var(--amber-600)",
  entertainment: "var(--taupe)", recreation: "var(--taupe)",
  health: "var(--negative-bright)", healthcare: "var(--negative-bright)", medical_services: "var(--negative-bright)",
  shopping: "var(--copper)", service: "var(--info)",
};
function catColor(cat: string) {
  return CAT_COLORS[cat.toLowerCase().replace(/[\s-]+/g, "_")] ?? "var(--on-dark-400)";
}
function spendingByCat(txns: Transaction[]) {
  const map: Record<string, number> = {};
  txns.filter((t) => t.amount > 0).forEach((t) => { const c = t.category || "other"; map[c] = (map[c] ?? 0) + t.amount; });
  return Object.entries(map).map(([label, amount]) => ({ label, amount, color: catColor(label) })).sort((a, b) => b.amount - a.amount).slice(0, 6);
}

// ─── EyeMark ──────────────────────────────────────────────────────

function EyeMark({ size = 24, color = "var(--amber-400)" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "block", flexShrink: 0 }}>
      <path d="M3.5 24C3.5 24 12 9.5 24 9.5C36 9.5 44.5 24 44.5 24C44.5 24 36 38.5 24 38.5C12 38.5 3.5 24 3.5 24Z" stroke={color} strokeWidth="2.6" strokeLinejoin="round"/>
      <circle cx="24" cy="24" r="8.4" fill={color}/>
      <circle cx="24" cy="24" r="3.6" fill="#14110D"/>
      <circle cx="26.4" cy="21.4" r="1.5" fill="#F6EFE2"/>
    </svg>
  );
}

// ─── Panel (uses CardSpotlight) ───────────────────────────────────

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <CardSpotlight style={style}>{children}</CardSpotlight>;
}

// ─── TopNav ───────────────────────────────────────────────────────

function TopNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const pathToTab: Record<string, string> = {
    "/dashboard": "Overview",
    "/transactions": "Transactions",
    "/accounts": "Accounts",
    "/bills": "Bills",
    "/intelligence": "Intelligence",
  };
  const active = pathToTab[pathname] ?? "Overview";
  const tabs: { label: string; href?: string }[] = [
    { label: "Overview", href: "/dashboard" },
    { label: "Transactions", href: "/transactions" },
    { label: "Accounts", href: "/accounts" },
    { label: "Bills", href: "/bills" },
    { label: "Intelligence", href: "/intelligence" },
  ];
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <header style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 16px", background: "var(--surface-1)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-xl)", flexShrink: 0 }}>
      {/* Logo */}
      <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
        <span style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, overflow: "hidden", background: "var(--surface-0)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 1px var(--surface-3)" }}>
          <EyeMark size={22} color="var(--amber-400)" />
        </span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 26, color: "var(--paper)", lineHeight: 1, letterSpacing: "-0.01em" }}>Argus</span>
      </span>

      {/* Tabs */}
      <nav className="arg-topnav-tabs" style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 14, background: "var(--surface-2)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: 4 }}>
        {tabs.map((t) => {
          const on = t.label === active;
          return (
            <Link
              key={t.label}
              href={t.href ?? "/dashboard"}
              className={on ? "grain" : undefined}
              style={{ display: "block", textDecoration: "none", padding: "8px 16px", borderRadius: "var(--r-pill)", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: on ? 600 : 500, whiteSpace: "nowrap", color: on ? "#fff" : "var(--on-dark-400)", background: on ? "var(--grad-accent)" : "transparent", transition: "color .15s, background .15s" }}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {/* Right */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }} transition={{ duration: 0.15, ease: [0.23,1,0.32,1] }}>
          <Link href="/copilot" className="grain" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--grad-accent)", borderRadius: "var(--r-pill)", padding: "9px 16px", color: "#fff", textDecoration: "none", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 16px rgba(168,65,43,0.28)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            Ask Argus
          </Link>
        </motion.div>
        <div style={{ display: "flex", alignItems: "center", gap: 9, background: "var(--surface-2)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: "5px 12px 5px 5px" }}>
          <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(140deg, var(--amber-400), var(--amber-700))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
            {initials}
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--paper)", whiteSpace: "nowrap" }}>{userName}</span>
        </div>
      </div>
    </header>
  );
}

// ─── InsightBanner ─────────────────────────────────────────────────

function InsightBanner({ insight }: { insight: AnalystDecision }) {
  const soj = insight.structured_output_json ?? {};
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(168,65,43,0.10)", border: "1px solid rgba(168,65,43,0.42)", borderRadius: "var(--r-lg)", padding: "12px 16px", flexShrink: 0 }}>
      <EyeMark size={24} color="var(--accent-red)" />
      <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.45, color: "var(--on-dark-600)", flex: 1 }}>
        <strong style={{ color: "var(--paper)", fontWeight: 600 }}>{soj.title}.</strong>{" "}{soj.recommendation}
      </p>
      <Link href="/intelligence" style={{ background: "var(--accent-red)", color: "#fff", borderRadius: "var(--r-md)", padding: "7px 14px", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
        Review →
      </Link>
    </div>
  );
}

// ─── BalanceCard ──────────────────────────────────────────────────

function BalanceCard({ accounts, allTxns }: { accounts: Account[]; allTxns: Transaction[] }) {
  const total = accounts.filter((a) => a.account_type !== "credit").reduce((s, a) => s + a.balance, 0);
  const spending = thisMonthSpending(allTxns);
  const lastMonth = lastMonthSpending(allTxns);
  const pct = lastMonth > 0 ? ((spending - lastMonth) / lastMonth) * 100 : 0;
  const better = pct <= 0;
  const checking = accounts.filter((a) => a.account_type !== "credit").slice(0, 3);

  return (
    <Panel style={{ display: "flex", flexDirection: "column", gap: 14, justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--on-dark-400)" }}>Total balance</span>
        <span style={{ marginLeft: "auto", background: "var(--surface-2)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: "5px 10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-dark-600)" }}>USD</span>
      </div>

      <div>
        <div className="figure" style={{ fontSize: 34, fontWeight: 500, color: "var(--paper)", lineHeight: 1 }}>
          <NumberTicker value={total} prefix="$" decimals={0} delay={100} />
          <span style={{ color: "var(--on-dark-400)", fontSize: 20 }}>
            .<NumberTicker value={Math.round((total % 1) * 100)} decimals={0} delay={100} style={{ display: "inline" }} />
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4, background: better ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.12)", color: better ? "var(--positive-bright)" : "var(--negative-bright)", borderRadius: "var(--r-pill)", padding: "3px 8px", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500 }}>
            {better ? "↓" : "↑"} {Math.abs(pct).toFixed(1)}%
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--on-dark-400)" }}>spending vs last month</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <motion.div whileTap={{ scale: 0.97 }} whileHover={{ scale: 1.01 }} transition={{ duration: 0.15, ease: [0.23,1,0.32,1] }} style={{ flex: 1 }}>
          <Link href="/accounts" className="grain" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "var(--grad-accent)", color: "#fff", textDecoration: "none", borderRadius: "var(--r-md)", padding: "9px 0", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}>
            Sync accounts
          </Link>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }} transition={{ duration: 0.15, ease: [0.23,1,0.32,1] }} style={{ flex: 1 }}>
          <Link href="/transactions" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", color: "var(--paper)", textDecoration: "none", border: "1px solid var(--surface-3)", borderRadius: "var(--r-md)", padding: "9px 0", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600 }}>
            View all →
          </Link>
        </motion.div>
      </div>

      {checking.length > 0 && (
        <div style={{ borderTop: "1px solid var(--surface-3)", paddingTop: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--paper)" }}>Accounts</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--on-dark-400)", letterSpacing: ".04em" }}>
              {accounts.filter((a) => a.account_type !== "credit").length} LINKED
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {checking.map((acct) => (
              <div key={acct.id} style={{ background: "var(--surface-2)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-md)", padding: "10px 11px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--amber-500)", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", flexShrink: 0 }}>
                    {acct.institution.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--paper)" }}>{acct.institution}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--on-dark-400)", letterSpacing: ".04em", textTransform: "uppercase" }}>{acct.account_type}</div>
                  </div>
                </div>
                <div className="figure" style={{ fontSize: 13, fontWeight: 500, color: "var(--paper)" }}>${fmt(acct.balance, 2)}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

// ─── KPI Cluster ──────────────────────────────────────────────────

function MiniStat({ label, amount, sub, hi, positive = true, icon, delay = 0 }: {
  label: string; amount: number; sub: string;
  hi?: boolean; positive?: boolean; icon: React.ReactNode; delay?: number;
}) {
  const dColor = hi ? "rgba(255,255,255,0.92)" : positive ? "var(--positive-bright)" : "var(--negative-bright)";
  return (
    <div className={hi ? "grain" : undefined} style={{ borderRadius: "var(--r-lg)", padding: "15px 16px", display: "flex", flexDirection: "column", gap: 12, background: hi ? "var(--grad-accent)" : "var(--surface-1)", border: hi ? "none" : "1px solid var(--surface-3)", boxShadow: hi ? "0 10px 28px rgba(168,65,43,0.30)" : "none", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: hi ? "rgba(255,255,255,0.9)" : "var(--on-dark-400)" }}>{label}</span>
        <span style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: 8, background: hi ? "rgba(255,255,255,0.18)" : "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", color: hi ? "#fff" : "var(--on-dark-600)" }}>{icon}</span>
      </div>
      <div>
        <div className="figure" style={{ fontSize: 26, fontWeight: 500, color: hi ? "#fff" : "var(--paper)", lineHeight: 1 }}>
          {amount < 0 ? "-" : ""}
          <NumberTicker value={Math.abs(amount)} prefix="$" decimals={0} delay={delay} style={{ color: "inherit" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, color: dColor }}>{positive ? "↑" : "↓"}</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: hi ? "rgba(255,255,255,0.75)" : "var(--on-dark-400)" }}>{sub}</span>
        </div>
      </div>
    </div>
  );
}

function KPICluster({ allTxns, subs, bills }: { allTxns: Transaction[]; subs: Subscription[]; bills: Bill[] }) {
  const income = thisMonthIncome(allTxns);
  const spending = thisMonthSpending(allTxns);
  const subTotal = subs.reduce((s, x) => s + x.avg_amount, 0);
  const netFlow = income - spending;
  const now = new Date(); const in30 = new Date(now); in30.setDate(in30.getDate() + 30);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 14, height: "100%" }}>
      <MiniStat hi label="Income" amount={income} sub="This month" positive delay={200} icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
      }/>
      <MiniStat label="Spending" amount={spending} sub="This month" positive={false} delay={300} icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
      }/>
      <MiniStat label="Subscriptions" amount={subTotal} sub={`${subs.length} active`} positive delay={400} icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
      }/>
      <MiniStat label="Net flow" amount={netFlow} sub="This month" positive={netFlow >= 0} delay={500} icon={
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
      }/>
    </div>
  );
}

// ─── Spending Donut ───────────────────────────────────────────────

function SpendingDonut({ allTxns }: { allTxns: Transaction[] }) {
  const { cats, total, arcs } = useMemo(() => {
    const cats = spendingByCat(allTxns);
    const total = cats.reduce((s, c) => s + c.amount, 0);
    const gap = 5; let acc = 0;
    const arcs = cats.map((c) => {
      const pct = total > 0 ? (c.amount / total) * 100 : 0;
      const seg = { ...c, dash: Math.max(pct - gap, 0.5), offset: -acc };
      acc += pct; return seg;
    });
    return { cats, total, arcs };
  }, [allTxns]);
  const month = new Date().toLocaleString("default", { month: "short" }).toUpperCase();

  return (
    <Panel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--paper)" }}>Spending by category</span>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--on-dark-400)", marginTop: 2 }}>This month</div>
        </div>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", background: "var(--surface-2)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: "5px 10px", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-dark-600)" }}>{month}</span>
      </div>
      <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 220 }}>
        <svg width="232" height="232" viewBox="0 0 172 172" style={{ transform: "rotate(-90deg)" }}
          role="img"
          aria-label={total > 0 ? `Spending by category: ${arcs.map((a) => `${a.label} $${fmt(a.amount)}`).join(", ")}` : "No spending data this month"}>
          <circle cx="86" cy="86" r="72" fill="none" stroke="var(--surface-2)" strokeWidth="13"/>
          {total > 0 && arcs.map((a, i) => (
            <motion.circle
              key={i} cx="86" cy="86" r="72" fill="none" stroke={a.color} strokeWidth="13" strokeLinecap="round"
              pathLength={100}
              initial={{ strokeDasharray: "0 100", strokeDashoffset: a.offset }}
              animate={{ strokeDasharray: `${a.dash} ${100 - a.dash}`, strokeDashoffset: a.offset }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.08, ease: [0.23, 1, 0.32, 1] }}
            />
          ))}
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          {total > 0 ? (
            <>
              <div className="figure" style={{ fontSize: 28, fontWeight: 500, color: "var(--paper)", lineHeight: 1 }}>${fmt(total)}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".08em", color: "var(--on-dark-400)", marginTop: 6 }}>TOTAL SPENT</div>
            </>
          ) : (
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-400)" }}>No data yet</div>
          )}
        </div>
      </div>
    </Panel>
  );
}

// ─── Spending Limit ────────────────────────────────────────────────

function SpendingLimitCard({ allTxns }: { allTxns: Transaction[] }) {
  const spending = thisMonthSpending(allTxns);
  const limit = 5000;
  const pct = Math.min((spending / limit) * 100, 100);
  const over = pct > 80;
  return (
    <Panel>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--paper)" }}>Monthly spending</span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".04em", color: over ? "var(--accent-red)" : "var(--amber-400)" }}>{pct.toFixed(0)}% USED</span>
          <Link href="/settings" style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, letterSpacing: ".06em", color: "var(--on-dark-400)", textDecoration: "none" }}>SET LIMIT</Link>
        </div>
      </div>
      <div style={{ height: 10, borderRadius: "var(--r-pill)", background: "var(--surface-2)", overflow: "hidden", backgroundImage: "repeating-linear-gradient(135deg, var(--surface-3) 0 1px, transparent 1px 6px)" }}>
        <div className="spending-bar-fill" style={{ width: "100%", height: "100%", borderRadius: "var(--r-pill)", background: over ? "var(--accent-red)" : "var(--amber-500)", transformOrigin: "left", transform: `scaleX(${pct / 100})`, transition: "transform .5s cubic-bezier(0.16,1,0.3,1)" }}/>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 11 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-600)" }}>
          <b className="figure" style={{ color: "var(--paper)", fontWeight: 600 }}>${fmt(spending, 2)}</b> spent of
        </span>
        <span className="figure" style={{ fontSize: 14, fontWeight: 600, color: "var(--paper)" }}>
          ${fmt(limit, 2)}<span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "var(--on-dark-400)", marginLeft: 4, letterSpacing: ".04em" }}>est.</span>
        </span>
      </div>
    </Panel>
  );
}

// ─── Credit Cards ─────────────────────────────────────────────────

function CreditCards({ accounts }: { accounts: Account[] }) {
  const cards = accounts.filter((a) => a.account_type === "credit").slice(0, 2);
  return (
    <Panel>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--on-dark-600)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--paper)" }}>Credit cards</span>
        </div>
        <Link href="/accounts" style={{ marginLeft: "auto", color: "var(--amber-400)", fontFamily: "var(--font-sans)", fontSize: 13, textDecoration: "none" }}>+ Add new</Link>
      </div>
      {cards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-400)", margin: "0 0 8px" }}>No credit cards linked</p>
          <Link href="/accounts" style={{ color: "var(--amber-400)", fontSize: 12, fontFamily: "var(--font-sans)" }}>Link a card →</Link>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12 }}>
          {cards.map((card, i) => (
            <div key={card.id} className={i === 0 ? "grain" : undefined} style={{ flex: 1, minWidth: 0, borderRadius: "var(--r-lg)", padding: "13px 14px", height: 110, position: "relative", overflow: "hidden", background: i === 0 ? "var(--grad-accent)" : "linear-gradient(140deg, var(--card-dark-from), var(--card-dark-to))", border: "1px solid " + (i === 0 ? "transparent" : "var(--surface-3)"), display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ background: i === 0 ? "rgba(255,255,255,0.22)" : "var(--surface-2)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".06em", padding: "3px 8px", borderRadius: "var(--r-pill)" }}>ACTIVE</span>
                {card.credit_limit && (
                  <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 9, color: i === 0 ? "rgba(255,255,255,0.7)" : "var(--on-dark-400)" }}>
                    {((card.balance / card.credit_limit) * 100).toFixed(0)}% used
                  </span>
                )}
              </div>
              <div style={{ marginTop: "auto" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: i === 0 ? "rgba(255,255,255,0.7)" : "var(--on-dark-400)", letterSpacing: ".06em" }}>{card.institution.toUpperCase()}</div>
                <div className="figure" style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "#fff", letterSpacing: ".04em", marginTop: 3 }}>${fmt(card.balance, 2)}</div>
              </div>
            </div>
          ))}
          {cards.length === 1 && (
            <Link href="/accounts" style={{ flex: 1, minWidth: 0, borderRadius: "var(--r-lg)", border: "1px dashed var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--on-dark-400)", fontFamily: "var(--font-sans)", fontSize: 13, textDecoration: "none", height: 110 }}>
              + Add card
            </Link>
          )}
        </div>
      )}
    </Panel>
  );
}

// ─── Upcoming Bills Calendar ───────────────────────────────────────

function UpcomingCalendar({ bills }: { bills: Bill[] }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const cells = Array.from({ length: 14 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() - 2 + i); return d; });
  const billsByDay: Record<string, Bill[]> = {};
  bills.forEach((b) => { const k = b.next_due_date.slice(0, 10); if (!billsByDay[k]) billsByDay[k] = []; billsByDay[k].push(b); });
  const DOW = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const monthYear = today.toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase();
  const COLORS = ["#E23B2E", "#2F6FE0", "#1DB954", "#9146FF", "#FF6B35", "#00B4D8"];

  return (
    <Panel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 13, paddingBottom: 13, borderBottom: "1px solid var(--surface-3)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".14em", color: "var(--on-dark-600)" }}>UPCOMING BILLS</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".04em", color: "var(--on-dark-400)" }}>{monthYear}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 8 }}>
        {DOW.map((d) => <span key={d} style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".06em", color: "var(--on-dark-400)" }}>{d}</span>)}
      </div>
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gridAutoRows: "1fr", gap: 1, background: "var(--surface-3)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-md)", overflow: "hidden", minHeight: 180 }}>
        {cells.map((d, i) => {
          const key = d.toISOString().slice(0, 10);
          const isToday = key === today.toISOString().slice(0, 10);
          const isPast = d < today;
          const dayBills = billsByDay[key] ?? [];
          const dayTotal = dayBills.reduce((s, b) => s + b.avg_amount, 0);
          return (
            <div key={i} style={{ background: "var(--surface-1)", padding: "8px 8px 9px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, backgroundImage: isPast ? "repeating-linear-gradient(135deg,var(--surface-2) 0 1px,transparent 1px 7px)" : "none" }}>
              {isToday ? (
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 600, color: "var(--paper)" }}>{d.getDate()}</span>
              ) : (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: isPast ? "var(--on-dark-400)" : "var(--paper)", lineHeight: "24px" }}>{d.getDate()}</span>
              )}
              {dayBills.length > 0 && (
                <span style={{ display: "flex", alignItems: "center" }}>
                  {dayBills.slice(0, 3).map((b, bi) => (
                    <span key={bi} title={b.merchant} style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS[bi % COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: bi ? -7 : 0, boxShadow: "0 0 0 2px var(--surface-1)", zIndex: 5 - bi, position: "relative" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 7, color: "#fff", fontWeight: 700 }}>{b.merchant.slice(0, 1).toUpperCase()}</span>
                    </span>
                  ))}
                </span>
              )}
              {dayTotal > 0 && <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--on-dark-600)", marginTop: "auto" }}>${fmt(dayTotal)}</span>}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

// ─── Recent Activity ──────────────────────────────────────────────

const CAT_EMOJI: Record<string, string> = {
  food_and_drink: "🍽", groceries: "🛒", transportation: "🚗",
  entertainment: "🎬", health: "💊", shopping: "🛍", housing: "🏠",
  utilities: "⚡", travel: "✈️", restaurants: "🍽", service: "🔧",
};

function RecentActivity({ txns }: { txns: Transaction[] }) {
  return (
    <Panel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 21, color: "var(--paper)" }}>Recent activity</span>
        <Link href="/transactions" className="pressable" style={{ marginLeft: "auto", color: "var(--amber-400)", fontFamily: "var(--font-sans)", fontSize: 13, textDecoration: "none" }}>View all →</Link>
      </div>
      {txns.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-400)", margin: "0 0 8px" }}>No transactions yet.</p>
          <Link href="/accounts" style={{ color: "var(--amber-400)", fontSize: 12, fontFamily: "var(--font-sans)" }}>Sync your accounts →</Link>
        </div>
      ) : txns.map((txn, i) => {
        const isCredit = txn.amount < 0;
        const emoji = CAT_EMOJI[(txn.category ?? "").toLowerCase()] ?? "💳";
        const date = new Date(txn.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return (
          <div key={txn.id} className="activity-row" style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 4px", borderTop: i === 0 ? "none" : "1px solid var(--surface-3)" }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>{emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--paper)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{txn.merchant}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--on-dark-400)", marginTop: 2 }}>{date}</div>
            </div>
            <span className="figure" style={{ fontSize: 13.5, fontWeight: 500, flexShrink: 0, color: isCredit ? "var(--positive-bright)" : "var(--paper)" }}>
              {isCredit ? "+" : ""}${fmt(Math.abs(txn.amount), 2)}
            </span>
          </div>
        );
      })}
    </Panel>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
      <div className="skeleton" style={{ height: 62, background: "var(--surface-1)", borderRadius: "var(--r-xl)", border: "1px solid var(--surface-3)" }}/>
      <div className="skeleton" style={{ height: 44, width: 260, background: "var(--surface-1)", borderRadius: "var(--r-md)" }}/>
      <div className="skeleton" style={{ height: 52, background: "var(--surface-1)", borderRadius: "var(--r-lg)", border: "1px solid rgba(168,65,43,0.2)" }}/>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(320px,1fr) minmax(290px,1.12fr) minmax(330px,1.28fr)", gap: 14 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 240, background: "var(--surface-1)", borderRadius: "var(--r-lg)", border: "1px solid var(--surface-3)", animationDelay: `${i * 0.1}s` }}/>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────

function EmptyState({ userName }: { userName: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
      <TopNav userName={userName} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 20px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "var(--r-xl)", background: "var(--surface-1)", border: "1px solid var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <EyeMark size={36} color="var(--amber-400)" />
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--paper)", margin: "0 0 10px", lineHeight: 1.2, fontWeight: 400 }}>
          Connect your first account
        </h1>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--on-dark-400)", maxWidth: 360, lineHeight: 1.6, margin: "0 0 28px" }}>
          Link your bank or credit card to unlock cashflow forecasts, risk alerts, and AI-powered financial intelligence.
        </p>
        <Link href="/accounts" className="grain pressable-cta" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--grad-accent)", color: "#fff", textDecoration: "none", borderRadius: "var(--r-pill)", padding: "12px 24px", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 16px rgba(168,65,43,0.28)" }}>
          Link a bank account
        </Link>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────

function ErrorState({ onRetry, userName }: { onRetry: () => void; userName: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <TopNav userName={userName} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "60px 20px" }}>
        <div style={{ width: 64, height: 64, borderRadius: "var(--r-xl)", background: "rgba(168,65,43,0.10)", border: "1px solid rgba(168,65,43,0.3)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <EyeMark size={32} color="var(--accent-red)" />
        </div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--paper)", margin: "0 0 8px", fontWeight: 400 }}>
          Unable to load your data
        </h2>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--on-dark-400)", maxWidth: 320, lineHeight: 1.6, margin: "0 0 24px" }}>
          Check your connection and try again. If the problem persists, the backend may be restarting.
        </p>
        <button onClick={onRetry} className="pressable" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--surface-2)", color: "var(--paper)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: "10px 20px", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          Retry
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allTxns, setAllTxns] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [insights, setInsights] = useState<AnalystDecision[]>([]);
  const [userName, setUserName] = useState("there");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(false);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name?.split(" ")[0]
            ?? user.email?.split("@")[0]
            ?? "there";
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
        const [a, at, b, s, i] = await Promise.all([
          api.get<{ accounts: Account[] }>("/plaid/accounts"),
          api.get<{ transactions: Transaction[] }>("/transactions?limit=200"),
          api.get<{ bills: Bill[] }>("/bills"),
          api.get<{ subscriptions: Subscription[] }>("/subscriptions"),
          api.get<AnalystDecision[]>("/insights?limit=3"),
        ]);
        setAccounts(a.accounts);
        setAllTxns(at.transactions);
        setBills(b.bills);
        setSubs(s.subscriptions);
        setInsights(i);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [retryCount]);

  if (loading) return <Skeleton />;
  if (error) return <ErrorState userName={userName} onRetry={() => setRetryCount((n) => n + 1)} />;
  if (accounts.length === 0) return <EmptyState userName={userName} />;

  const criticalInsight = insights.find(
    (d) => d.structured_output_json?.severity === "critical" || d.structured_output_json?.severity === "warning"
  ) ?? null;

  const ease = [0.23, 1, 0.32, 1] as const;
  const cardVariants = {
    hidden: { opacity: 0, y: 18 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.45, delay: i * 0.07, ease },
    }),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <TopNav userName={userName} />

      <motion.h1
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ margin: 0, padding: "2px 4px 0", fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.05, color: "var(--paper)", fontWeight: 400, textWrap: "balance" }}
      >
        {greet()}, <em style={{ fontStyle: "italic" }}>{userName}</em>
      </motion.h1>

      <AnimatePresence>
        {criticalInsight && (
          <motion.div
            key="banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            <InsightBanner insight={criticalInsight} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="arg-grid">
        {[
          <BalanceCard key="balance" accounts={accounts} allTxns={allTxns} />,
          <KPICluster key="kpi" allTxns={allTxns} subs={subs} bills={bills} />,
          <SpendingDonut key="donut" allTxns={allTxns} />,
          <div key="col" className="arg-col" style={{ height: "100%" }}>
            <SpendingLimitCard allTxns={allTxns} />
            <CreditCards accounts={accounts} />
          </div>,
          <UpcomingCalendar key="calendar" bills={bills} />,
          <RecentActivity key="activity" txns={allTxns.slice(0, 5)} />,
        ].map((child, i) => (
          <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible" style={{ minWidth: 0 }}>
            {child}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
