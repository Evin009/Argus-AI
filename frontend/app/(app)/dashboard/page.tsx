"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Bell, Info, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

import { AskArgusBar } from "./_components/AskArgusBar";
import { SafeToSpendHero } from "./_components/SafeToSpendHero";
import { BalanceCard, type Account } from "./_components/BalanceCard";
import { SpendingLimitCard, type Transaction } from "./_components/SpendingLimitCard";
import { MyCards } from "./_components/MyCards";
import { StatCluster } from "./_components/StatCluster";
import { SubscriptionCalendar, type Bill } from "./_components/SubscriptionCalendar";
import { SpendingWheel } from "./_components/SpendingWheel";
import { RecentActivities } from "./_components/RecentActivities";
import { CashflowCurve } from "./_components/CashflowCurve";
import { EyeMark } from "./_components/atoms";

function greet(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Skeleton ──────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
      <div className="skeleton" style={{ height: 62, background: "var(--surface-1)", borderRadius: "var(--r-xl)", border: "1px solid var(--surface-3)" }} />
      <div className="skeleton" style={{ height: 44, width: 260, background: "var(--surface-1)", borderRadius: "var(--r-md)" }} />
      <div className="arg-grid">
        <div className="arg-col">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton" style={{ height: 220, background: "var(--surface-1)", borderRadius: "var(--r-lg)", border: "1px solid var(--surface-3)", animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 240, background: "var(--surface-1)", borderRadius: "var(--r-lg)", border: "1px solid var(--surface-3)", animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Empty / Error states ────────────────────────────────────────────

function EmptyState() {
  return (
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
      <Link
        href="/accounts"
        className="grain pressable-cta"
        style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--grad-accent)", color: "#fff", textDecoration: "none", borderRadius: "var(--r-pill)", padding: "12px 24px", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 16px rgba(168,65,43,0.28)" }}
      >
        Link a bank account
      </Link>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
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
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [allTxns, setAllTxns] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
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
          const name = user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "there";
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
        const [a, at, b] = await Promise.all([
          api.get<{ accounts: Account[] }>("/plaid/accounts"),
          api.get<{ transactions: Transaction[] }>("/transactions?limit=200"),
          api.get<{ bills: Bill[] }>("/bills"),
        ]);
        setAccounts(a.accounts);
        setAllTxns(at.transactions);
        setBills(b.bills);
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
  if (error) return <ErrorState onRetry={() => setRetryCount((n) => n + 1)} />;

  const initials = userName.slice(0, 2).toUpperCase();
  const totalBalance = accounts.filter((a) => a.account_type !== "credit").reduce((s, a) => s + a.balance, 0);
  const recentTxns = [...allTxns]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* greeting + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <p style={{ margin: "0 0 3px", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: ".14em", color: "var(--on-dark-400)", textTransform: "uppercase" }}>
            OVERVIEW · {new Date().toLocaleString("default", { month: "long", year: "numeric" }).toUpperCase()}
          </p>
          <h1 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 36, lineHeight: 1.04, color: "var(--paper)", fontWeight: 400 }}>
            {greet()}, <em>{userName}</em>
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <AskArgusBar />
          {[Search, Bell, Info].map((Icon, i) => (
            <button
              key={i}
              style={{
                position: "relative",
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "1px solid var(--surface-3)",
                background: "var(--surface-1)",
                color: "var(--on-dark-600)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={16} color="currentColor" />
              {i === 1 && (
                <span style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: "50%", background: "var(--negative-bright)", border: "1.5px solid var(--surface-1)" }} />
              )}
            </button>
          ))}
          <button style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", background: "var(--surface-1)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: "5px 12px 5px 5px" }}>
            <span style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(140deg, var(--amber-400), var(--amber-700))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
              {initials}
            </span>
            <span style={{ textAlign: "left", lineHeight: 1.25 }}>
              <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--paper)", whiteSpace: "nowrap" }}>{userName}</span>
            </span>
            <ChevronDown size={15} color="var(--on-dark-400)" />
          </button>
        </div>
      </div>

      <SafeToSpendHero />

      {accounts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="arg-grid">
          {/* COL 1 — full height */}
          <div className="arg-col" style={{ height: "100%" }}>
            <BalanceCard accounts={accounts} />
            <SpendingLimitCard allTxns={allTxns} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <MyCards />
            </div>
          </div>

          {/* RIGHT — nested sub-grid */}
          <div className="arg-right" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
            <div className="arg-col">
              <StatCluster />
              <SubscriptionCalendar bills={bills} />
            </div>

            <div className="arg-col" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <SpendingWheel allTxns={allTxns} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, height: "100%" }}>
                <RecentActivities txns={recentTxns} />
              </div>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <CashflowCurve currentBalance={totalBalance} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
