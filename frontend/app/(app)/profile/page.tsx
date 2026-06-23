"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProfileOverview = {
  spending_by_category: Record<string, number>;
  subscription_summary: { count: number; monthly_total: number };
  utilization_summary: {
    total_credit_limit: number;
    total_balance: number;
    utilization_pct: number;
  };
};

type MerchantSummary = {
  merchant: string;
  total_spend: number;
  transaction_count: number;
  trend: "up" | "down" | "flat";
};

type MerchantDetail = {
  merchant: string;
  total_spend: number;
  transaction_count: number;
  heatmap: Record<string, Record<string, number>>;
  monthly_trend: { month: string; amount: number }[];
  insight: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "var(--copper)",
  "#7C9C8E",
  "#6B7FA3",
  "#A3826B",
  "#8B6BA3",
  "#6BA3A3",
  "#A38B6B",
];

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function TrendBadge({ trend }: { trend: "up" | "down" | "flat" }) {
  const map = { up: { label: "↑", color: "var(--accent-red)" }, down: { label: "↓", color: "var(--positive-bright)" }, flat: { label: "→", color: "var(--on-dark-400)" } };
  const { label, color } = map[trend];
  return (
    <span style={{ fontSize: 12, color, fontWeight: 600, marginLeft: 4 }}>{label}</span>
  );
}

function SpendingRing({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total === 0) return null;

  const size = 160;
  const radius = 60;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const arcs = entries.map(([cat, val], i) => {
    const pct = val / total;
    const dash = pct * circumference;
    const arc = { cat, val, pct, dash, offset, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] };
    offset += dash;
    return arc;
  });

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
        {arcs.map((arc) => (
          <circle
            key={arc.cat}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={24}
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset}
            strokeLinecap="butt"
          />
        ))}
        <circle cx={cx} cy={cy} r={radius - 13} fill="var(--surface-1)" />
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {arcs.slice(0, 6).map((arc) => (
          <div key={arc.cat} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: arc.color, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "var(--on-dark-600)", textTransform: "capitalize" }}>
              {arc.cat}
            </span>
            <span style={{ fontSize: 13, color: "var(--paper)", fontWeight: 600, marginLeft: "auto" }}>
              {fmt(arc.val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UtilizationGauge({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100);
  const color = clamped > 30 ? "var(--accent-red)" : clamped > 8 ? "var(--copper)" : "var(--positive-bright)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--on-dark-400)" }}>
        <span>Credit utilization</span>
        <span style={{ color, fontWeight: 700 }}>{clamped.toFixed(1)}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: "var(--surface-3)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${clamped}%`, background: color, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
      <div style={{ fontSize: 11, color: "var(--on-dark-400)" }}>Target: under 8% per card</div>
    </div>
  );
}

function MerchantCard({ m, onClick }: { m: MerchantSummary; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--surface-2)", border: "1px solid var(--surface-3)",
        borderRadius: "var(--r-md)", padding: "12px 14px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", textAlign: "left", transition: "border-color 150ms",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--copper)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--surface-3)")}
    >
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--paper)" }}>{m.merchant}</div>
        <div style={{ fontSize: 12, color: "var(--on-dark-400)", marginTop: 2 }}>
          {m.transaction_count} transactions
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--paper)" }}>{fmt(m.total_spend)}</span>
        <TrendBadge trend={m.trend} />
      </div>
    </button>
  );
}

function HeatmapGrid({ data }: { data: Record<string, Record<string, number>> }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeks = ["W1", "W2", "W3", "W4", "W5"];
  const maxVal = Math.max(...Object.values(data).flatMap((wk) => Object.values(wk)), 1);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `40px repeat(5, 1fr)`, gap: 4 }}>
        <div />
        {weeks.map((w) => (
          <div key={w} style={{ fontSize: 11, color: "var(--on-dark-400)", textAlign: "center" }}>{w}</div>
        ))}
        {days.map((day, di) => (
          <>
            <div key={`day-${di}`} style={{ fontSize: 11, color: "var(--on-dark-400)", display: "flex", alignItems: "center" }}>{day}</div>
            {weeks.map((_, wi) => {
              const count = (data[String(di)] ?? {})[String(wi)] ?? 0;
              const intensity = count / maxVal;
              return (
                <div
                  key={`${di}-${wi}`}
                  title={`${count} transaction${count !== 1 ? "s" : ""}`}
                  style={{
                    height: 24, borderRadius: 4,
                    background: count === 0 ? "var(--surface-3)" : `rgba(176, 100, 50, ${0.2 + intensity * 0.8})`,
                  }}
                />
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function MiniSparkline({ data }: { data: { month: string; amount: number }[] }) {
  if (data.length < 2) return null;
  const amounts = data.map((d) => d.amount);
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const range = max - min || 1;
  const w = 240;
  const h = 50;
  const pts = amounts.map((a, i) => {
    const x = (i / (amounts.length - 1)) * w;
    const y = h - ((a - min) / range) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke="var(--copper)" strokeWidth={2} strokeLinejoin="round" />
      {amounts.map((a, i) => {
        const x = (i / (amounts.length - 1)) * w;
        const y = h - ((a - min) / range) * h;
        return <circle key={i} cx={x} cy={y} r={3} fill="var(--copper)" />;
      })}
    </svg>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [overview, setOverview] = useState<ProfileOverview | null>(null);
  const [merchants, setMerchants] = useState<MerchantSummary[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantDetail | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<ProfileOverview>("/profile/overview"),
      api.get<{ merchants: MerchantSummary[] }>("/profile/merchants"),
    ])
      .then(([ov, m]) => {
        setOverview(ov);
        setMerchants(m.merchants);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function openMerchant(merchant: string) {
    setDetailLoading(true);
    setSelectedMerchant(null);
    try {
      const detail = await api.get<MerchantDetail>(`/profile/merchants/${encodeURIComponent(merchant)}`);
      setSelectedMerchant(detail);
    } finally {
      setDetailLoading(false);
    }
  }

  function back() {
    if (selectedMerchant) { setSelectedMerchant(null); return; }
    if (selectedCategory) { setSelectedCategory(null); }
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <span style={{ color: "var(--on-dark-400)", fontFamily: "var(--font-sans)" }}>Loading profile…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 32, color: "var(--accent-red)", fontFamily: "var(--font-sans)" }}>
        Failed to load profile: {error}
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    padding: 28, display: "flex", flexDirection: "column", gap: 24,
    fontFamily: "var(--font-sans)", minHeight: "100%",
  };

  const cardStyle: React.CSSProperties = {
    background: "var(--surface-1)", border: "1px solid var(--surface-3)",
    borderRadius: "var(--r-lg)", padding: 20,
  };

  const backBtn = (
    <button
      onClick={back}
      style={{
        background: "none", border: "none", cursor: "pointer", padding: 0,
        fontSize: 13, color: "var(--copper)", display: "flex", alignItems: "center", gap: 4,
      }}
    >
      ← Back
    </button>
  );

  // ── Level 3: Merchant Detail ──
  if (selectedMerchant) {
    return (
      <div style={containerStyle}>
        {backBtn}
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--paper)" }}>
            {selectedMerchant.merchant}
          </h1>
          <span style={{ fontSize: 14, color: "var(--on-dark-400)" }}>
            {selectedMerchant.transaction_count} transactions · {fmt(selectedMerchant.total_spend)} total
          </span>
        </div>

        {/* Insight */}
        <div style={{ ...cardStyle, borderLeft: "3px solid var(--copper)" }}>
          <div style={{ fontSize: 11, color: "var(--copper)", fontWeight: 600, marginBottom: 8, letterSpacing: "0.06em", textTransform: "uppercase" }}>Argus insight</div>
          <p style={{ margin: 0, fontSize: 14, color: "var(--paper)", lineHeight: 1.6 }}>{selectedMerchant.insight}</p>
        </div>

        {/* Trend sparkline */}
        {selectedMerchant.monthly_trend.length > 0 && (
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: "var(--on-dark-400)", marginBottom: 12 }}>Monthly spend (last 6 months)</div>
            <MiniSparkline data={selectedMerchant.monthly_trend} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              {selectedMerchant.monthly_trend.map((d) => (
                <div key={d.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--paper)", fontWeight: 600 }}>{fmt(d.amount)}</span>
                  <span style={{ fontSize: 10, color: "var(--on-dark-400)" }}>{d.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Heatmap */}
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "var(--on-dark-400)", marginBottom: 12 }}>Transaction frequency</div>
          <HeatmapGrid data={selectedMerchant.heatmap} />
        </div>
      </div>
    );
  }

  // ── Level 2: Category drill-down ──
  if (selectedCategory && overview) {
    const categoryMerchants = merchants.filter((m) => {
      // show all merchants when a category is selected — in real data merchants would have categories
      return true;
    });

    return (
      <div style={containerStyle}>
        {backBtn}
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--paper)", textTransform: "capitalize" }}>
          {selectedCategory}
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--on-dark-400)" }}>
          Total: {fmt(overview.spending_by_category[selectedCategory] ?? 0)}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {categoryMerchants.map((m) => (
            <MerchantCard key={m.merchant} m={m} onClick={() => openMerchant(m.merchant)} />
          ))}
        </div>
        {detailLoading && (
          <div style={{ color: "var(--on-dark-400)", fontSize: 13 }}>Loading merchant detail…</div>
        )}
      </div>
    );
  }

  const hasTransactionData = overview && Object.keys(overview.spending_by_category).length > 0;
  const hasMerchantData = merchants.length > 0;
  const hasAnyData = hasTransactionData || hasMerchantData;

  // ── Level 1: Overview ──
  return (
    <div style={containerStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "var(--paper)" }}>Financial Profile</h1>
      </div>

      {!hasAnyData && overview && (
        <div style={{
          ...cardStyle,
          display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", gap: 12, padding: 48, textAlign: "center",
        }}>
          <div style={{ fontSize: 32 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "var(--paper)" }}>No spending data yet</div>
          <div style={{ fontSize: 13, color: "var(--on-dark-400)", maxWidth: 320 }}>
            Link a bank account and sync transactions to see your spending breakdown, merchant history, and financial profile.
          </div>
          <a
            href="/accounts"
            style={{
              marginTop: 8, padding: "8px 20px", borderRadius: "var(--r-md)",
              background: "var(--copper)", color: "#fff", fontSize: 13, fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Connect a bank →
          </a>
        </div>
      )}

      {overview && hasAnyData && (
        <>
          {/* Spending ring */}
          <div style={cardStyle}>
            <div style={{ fontSize: 12, color: "var(--on-dark-400)", marginBottom: 16, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
              Spending by category
            </div>
            {hasTransactionData ? (
              <SpendingRing data={overview.spending_by_category} />
            ) : (
              <div style={{ fontSize: 13, color: "var(--on-dark-400)", padding: "16px 0" }}>
                No categorized transactions yet. Sync your bank to populate this.
              </div>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 20 }}>
              {Object.keys(overview.spending_by_category).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    background: "var(--surface-2)", border: "1px solid var(--surface-3)",
                    borderRadius: "var(--r-sm)", padding: "5px 12px", cursor: "pointer",
                    fontSize: 12, color: "var(--on-dark-600)", textTransform: "capitalize",
                    transition: "border-color 150ms, color 150ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--copper)"; e.currentTarget.style.color = "var(--copper)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--surface-3)"; e.currentTarget.style.color = "var(--on-dark-600)"; }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {/* Subscription summary */}
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: "var(--on-dark-400)", marginBottom: 12, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em" }}>
                Subscriptions
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "var(--paper)", fontFamily: "var(--font-display)" }}>
                {fmt(overview.subscription_summary.monthly_total)}
                <span style={{ fontSize: 13, fontWeight: 400, color: "var(--on-dark-400)", marginLeft: 6 }}>/mo</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--on-dark-400)", marginTop: 4 }}>
                {overview.subscription_summary.count} active subscription{overview.subscription_summary.count !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Utilization */}
            <div style={cardStyle}>
              <div style={{ fontSize: 12, color: "var(--on-dark-400)", marginBottom: 12, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em" }}>
                Credit utilization
              </div>
              <UtilizationGauge pct={overview.utilization_summary.utilization_pct} />
            </div>
          </div>
        </>
      )}

      {hasAnyData && (
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "var(--on-dark-400)", marginBottom: 14, textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em" }}>
            Top merchants by spend
          </div>
          {hasMerchantData ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {merchants.slice(0, 10).map((m) => (
                <MerchantCard key={m.merchant} m={m} onClick={() => openMerchant(m.merchant)} />
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--on-dark-400)", padding: "8px 0" }}>
              No merchant data yet.
            </div>
          )}
          {detailLoading && (
            <div style={{ color: "var(--on-dark-400)", fontSize: 13, marginTop: 12 }}>Loading…</div>
          )}
        </div>
      )}
    </div>
  );
}
