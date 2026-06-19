"use client";

export type Transaction = {
  id: string;
  merchant: string;
  amount: number;
  category: string;
  timestamp: string;
};

function todaySpending(txns: Transaction[]): number {
  const now = new Date();
  return txns
    .filter((t) => {
      const d = new Date(t.timestamp);
      return d.toDateString() === now.toDateString() && t.amount > 0;
    })
    .reduce((s, t) => s + t.amount, 0);
}

export function SpendingLimitCard({ allTxns }: { allTxns: Transaction[] }) {
  const spent = Math.round(todaySpending(allTxns));
  // Placeholder pending user-configurable spending-limit backend phase
  const limit = 180;
  const pct = Math.min(Math.round((spent / limit) * 100), 100);
  const remaining = Math.max(limit - spent, 0);

  return (
    <div
      className="grain"
      style={{
        background: "var(--grad-accent)",
        borderRadius: "var(--r-lg)",
        padding: 20,
        boxShadow: "0 8px 24px rgba(168,65,43,0.32), inset 0 1px 0 rgba(255,255,255,0.14)",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "rgb(255, 255, 250)",
              fontSize: "21px",
              margin: 0,
            }}
          >
            Daily spending limit
          </p>
          <span style={{ fontFamily: "var(--font-display)", color: "#fff", lineHeight: 1, fontSize: "30px", fontWeight: 700 }}>
            ${spent}
          </span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "rgba(255,255,255,0.65)", marginLeft: 8, fontWeight: 700 }}>
            of ${limit}
          </span>
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: ".08em",
            color: "rgba(255,255,255,0.9)",
            background: "rgba(0,0,0,0.22)",
            padding: "4px 10px",
            borderRadius: "var(--r-pill)",
          }}
        >
          {pct}% USED
        </span>
      </div>

      <div style={{ height: 8, borderRadius: "var(--r-pill)", background: "rgba(0,0,0,0.25)", overflow: "hidden", marginBottom: 12 }}>
        <div
          className="spending-bar-fill"
          style={{
            width: `${pct}%`,
            height: "100%",
            borderRadius: "var(--r-pill)",
            boxShadow: "0 0 8px rgba(255,255,255,0.5)",
            transition: "width .6s cubic-bezier(.4,0,.2,1)",
            background: "rgba(255, 255, 255, 0.918)",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
          <b style={{ color: "#fff", fontWeight: 600 }}>${remaining}</b> left today
        </span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: ".06em", fontWeight: 900, fontFamily: "var(--font-sans)" }}>
          RESETS MIDNIGHT
        </span>
      </div>
    </div>
  );
}
