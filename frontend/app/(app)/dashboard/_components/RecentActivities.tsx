"use client";

import Link from "next/link";
import {
  Activity,
  Landmark,
  House,
  ShoppingBasket,
  Plane,
  MonitorPlay,
  Wrench,
  CreditCard,
  type LucideIcon,
} from "lucide-react";
import { Panel } from "./atoms";

export type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  timestamp: string;
};

const CAT_ICON: Record<string, { icon: LucideIcon; color: string }> = {
  income: { icon: Landmark, color: "var(--info)" },
  housing: { icon: House, color: "var(--info)" },
  rent: { icon: House, color: "var(--info)" },
  groceries: { icon: ShoppingBasket, color: "var(--positive-bright)" },
  supermarkets: { icon: ShoppingBasket, color: "var(--positive-bright)" },
  travel: { icon: Plane, color: "var(--negative-bright)" },
  entertainment: { icon: MonitorPlay, color: "var(--amber-400)" },
  subscriptions: { icon: MonitorPlay, color: "var(--amber-400)" },
  service: { icon: Wrench, color: "var(--on-dark-400)" },
};

function iconFor(category: string) {
  const key = (category ?? "").toLowerCase().replace(/[\s-]+/g, "_");
  return CAT_ICON[key] ?? { icon: CreditCard, color: "var(--on-dark-400)" };
}

export function RecentActivities({ txns }: { txns: Transaction[] }) {
  return (
    <Panel style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 21, color: "var(--paper)", display: "flex", alignItems: "center", gap: 8 }}>
          <Activity size={18} color="var(--amber-400)" strokeWidth={1.7} />
          Recent activity
        </span>
        <Link href="/transactions" className="btn btn-quiet btn-sm" style={{ marginLeft: "auto", color: "var(--amber-400)" }}>
          View all
        </Link>
      </div>
      {txns.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
          <p style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-400)", margin: "0 0 8px" }}>No transactions yet.</p>
          <Link href="/accounts" style={{ color: "var(--amber-400)", fontSize: 12, fontFamily: "var(--font-sans)" }}>
            Sync your accounts →
          </Link>
        </div>
      ) : (
        txns.map((txn, i) => {
          const { icon: Icon, color } = iconFor(txn.category);
          const isCredit = txn.amount < 0;
          const date = new Date(txn.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return (
            <div
              key={txn.id}
              className="activity-row"
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 4px", borderTop: i === 0 ? "none" : "1px solid var(--surface-3)" }}
            >
              <span style={{ width: 28, height: 28, borderRadius: 7, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={14} color={color} strokeWidth={1.7} />
              </span>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--paper)", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {txn.merchant}
              </span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--on-dark-400)", flexShrink: 0, whiteSpace: "nowrap", letterSpacing: ".03em", fontWeight: 600 }}>
                {date}
              </span>
              <span className="figure" style={{ fontSize: 13, color: isCredit ? "var(--positive-bright)" : "var(--negative-bright)", flexShrink: 0, fontWeight: 700 }}>
                {isCredit ? "+" : "−"}${Math.abs(txn.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          );
        })
      )}
    </Panel>
  );
}
