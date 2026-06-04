/* Argus Dashboard — cards (forked from Argus app Overview, personal-finance copy) */

/* ---- Slim AI insight banner (signature Argus element) ---- */
function InsightBanner() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, background: "rgba(168,65,43,0.10)",
      border: "1px solid rgba(168,65,43,0.42)", borderRadius: "var(--r-lg)", padding: "12px 16px" }}>
      <EyeMark size={24} color="var(--accent-red)" />
      <p style={{ margin: 0, fontFamily: "var(--font-sans)", fontSize: 14, lineHeight: 1.45, color: "var(--on-dark-600)", flex: 1 }}>
        <b style={{ color: "var(--paper)", fontWeight: 600 }}>Heads up — overdraft risk on May 31.</b> Rent ($1,850) clears two days before payday. Move $240 from savings now and you're clear.
      </p>
      <button className="btn btn-sm" style={{ background: "var(--accent-red)", color: "#fff", border: "none", flex: "none" }}>Fix it →</button>
    </div>
  );
}

/* ---- Total Balance + wallets ---- */
function BalanceCard() {
  const wallets = [["USD", "$22,678.00", "$10k / mo", "Active", "var(--positive-bright)"],
    ["EUR", "€18,345.00", "€8k / mo", "Active", "var(--positive-bright)"],
    ["GBP", "£15,000.00", "£7.5k / mo", "Inactive", "var(--negative-bright)"]];
  return (
    <Panel style={{ display: "flex", flexDirection: "column", gap: 14, justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--on-dark-400)" }}>Total balance</span>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)",
          border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: "5px 10px",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-dark-600)" }}>USD <Ic name="chevron-down" size={13} color="currentColor" /></span>
      </div>
      <div>
        <div className="figure" style={{ fontSize: 34, fontWeight: 500, color: "var(--paper)", lineHeight: 1 }}>$689,372<span style={{ color: "var(--on-dark-400)", fontSize: 20 }}>.00</span></div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span className="ticker ticker-up" style={{ padding: "3px 8px" }}><Ic name="arrow-up-right" size={11} color="currentColor" />5%</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--on-dark-400)" }}>than last month</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-sm grain" style={{ flex: 1, justifyContent: "center", background: "var(--grad-accent)", color: "#fff", border: "none", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}><Ic name="arrow-left-right" size={15} color="#fff" /> Transfer</button>
        <button className="btn btn-sm" style={{ flex: 1, justifyContent: "center", background: "var(--surface-2)", color: "var(--paper)", border: "1px solid var(--surface-3)" }}><Ic name="arrow-down-left" size={15} color="currentColor" /> Request</button>
      </div>
      <div style={{ borderTop: "1px solid var(--surface-3)", paddingTop: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--paper)" }}>Wallets</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--on-dark-400)", letterSpacing: ".04em" }}>TOTAL 6 WALLETS</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {wallets.map(([cur, amt, lim, status, sc]) => (
            <div key={cur} style={{ background: "var(--surface-2)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-md)", padding: "10px 11px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--amber-500)", color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)" }}>{cur[0]}</span>
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 12, fontWeight: 600, color: "var(--paper)" }}>{cur}</span>
              </div>
              <div className="figure" style={{ fontSize: 15, fontWeight: 500, color: "var(--paper)", marginTop: 7 }}>{amt}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: "var(--on-dark-400)", marginTop: 3, letterSpacing: ".02em" }}>LIMIT {lim}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: sc, marginTop: 4, letterSpacing: ".04em" }}>{status}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ---- 2x2 stat cluster (one amber-highlighted) ---- */
function MiniStat({ icon, label, value, delta, deltaTone = "pos", hi }) {
  const dColor = hi ? "rgba(255,255,255,0.92)" : deltaTone === "pos" ? "var(--positive-bright)" : "var(--negative-bright)";
  return (
    <div className={hi ? "grain" : undefined} style={{ borderRadius: "var(--r-lg)", padding: "15px 16px", display: "flex", flexDirection: "column", gap: 12,
      background: hi ? "var(--grad-accent)" : "var(--surface-1)", border: hi ? "none" : "1px solid var(--surface-3)",
      boxShadow: hi ? "0 10px 28px rgba(168,65,43,0.30)" : "none" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: hi ? "rgba(255,255,255,0.9)" : "var(--on-dark-400)" }}>{label}</span>
        <span style={{ marginLeft: "auto", width: 28, height: 28, borderRadius: 8, background: hi ? "rgba(255,255,255,0.18)" : "var(--surface-2)",
          display: "flex", alignItems: "center", justifyContent: "center" }}><Ic name={icon} size={15} color={hi ? "#fff" : "var(--on-dark-600)"} stroke={1.7} /></span>
      </div>
      <div>
        <div className="figure" style={{ fontSize: 26, fontWeight: 500, color: hi ? "#fff" : "var(--paper)", lineHeight: 1 }}>{value}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 500, color: dColor }}>{deltaTone === "pos" ? "↑" : "↓"} {delta}</span>
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 11.5, color: hi ? "rgba(255,255,255,0.75)" : "var(--on-dark-400)" }}>This month</span>
        </div>
      </div>
    </div>
  );
}
function StatCluster() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 14, height: "100%" }}>
      <MiniStat hi icon="wallet" label="Income" value="$5,200" delta="7%" />
      <MiniStat icon="banknote" label="Spending" value="$3,140" delta="5%" deltaTone="neg" />
      <MiniStat icon="piggy-bank" label="Savings" value="$1,860" delta="8%" />
      <MiniStat icon="trending-up" label="Net flow" value="$2,060" delta="4%" />
    </div>
  );
}

/* ---- Profit & Loss bar chart ---- */
function ProfitLoss() {
  const data = [[28, 20], [33, 13], [25, 18], [30, 15], [38, 22], [46, 26], [34, 14], [22, 12]];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const max = 50;
  return (
    <Panel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--paper)" }}>Income & spending</span>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--on-dark-400)", marginTop: 2 }}>Cash flow over the last 8 months</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 14, marginTop: 4 }}>
          {[["In", "var(--amber-400)"], ["Out", "var(--surface-3)"]].map(([l, c]) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-sans)", fontSize: 11.5, color: "var(--on-dark-600)" }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: c }}></span>{l}</span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flex: 1, marginTop: 16, minHeight: 132 }}>
        {data.map(([profit, loss], i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, height: "100%", justifyContent: "flex-end" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: "100%" }}>
              <div style={{ width: 9, height: `${profit / max * 100}%`, background: "var(--amber-400)", borderRadius: "var(--r-pill)", minHeight: 6 }}></div>
              <div style={{ width: 9, height: `${loss / max * 100}%`, background: "var(--surface-3)", borderRadius: "var(--r-pill)", minHeight: 6 }}></div>
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--on-dark-400)" }}>{months[i]}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---- Monthly spending limit ---- */
function SpendingLimit() {
  return (
    <Panel>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--paper)" }}>Monthly spending limit</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".04em", color: "var(--amber-400)" }}>25% USED</span>
      </div>
      <div style={{ height: 10, borderRadius: "var(--r-pill)", background: "var(--surface-2)", overflow: "hidden",
        backgroundImage: "repeating-linear-gradient(135deg, var(--surface-3) 0 1px, transparent 1px 6px)" }}>
        <div style={{ width: "25%", height: "100%", borderRadius: "var(--r-pill)", background: "var(--amber-500)" }}></div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 11 }}>
        <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--on-dark-600)" }}><b className="figure" style={{ color: "var(--paper)", fontWeight: 600 }}>$1,400.00</b> spent out of</span>
        <span className="figure" style={{ fontSize: 14, fontWeight: 600, color: "var(--paper)" }}>$5,500.00</span>
      </div>
    </Panel>
  );
}

/* ---- My Cards ---- */
function CreditCard({ amber, num }) {
  return (
    <div className={amber ? "grain" : undefined} style={{ flex: 1, minWidth: 0, borderRadius: "var(--r-lg)", padding: "13px 14px", height: 116, position: "relative", overflow: "hidden",
      background: amber ? "var(--grad-accent)" : "linear-gradient(140deg, #2A251D, #14110D)",
      border: "1px solid " + (amber ? "transparent" : "var(--surface-3)"), display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Ic name="wifi" size={16} color={amber ? "rgba(255,255,255,0.9)" : "var(--on-dark-600)"} style={{ transform: "rotate(90deg)" }} />
        <span style={{ background: amber ? "rgba(255,255,255,0.22)" : "var(--surface-2)", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 9, letterSpacing: ".06em", padding: "3px 8px", borderRadius: "var(--r-pill)" }}>ACTIVE</span>
        {amber && <Ic name="sparkles" size={14} color="rgba(255,255,255,0.85)" style={{ marginLeft: "auto" }} />}
        {!amber && <div style={{ marginLeft: "auto", display: "flex" }}><span style={{ width: 17, height: 17, borderRadius: "50%", background: "var(--negative-bright)" }}></span><span style={{ width: 17, height: 17, borderRadius: "50%", background: "var(--amber-400)", marginLeft: -7 }}></span></div>}
      </div>
      <div style={{ marginTop: "auto" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 8.5, color: amber ? "rgba(255,255,255,0.7)" : "var(--on-dark-400)", letterSpacing: ".06em" }}>CARD NUMBER</div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "#fff", letterSpacing: ".08em", marginTop: 3 }}>**** **** {num}</div>
      </div>
    </div>
  );
}
function MyCards() {
  return (
    <Panel>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Ic name="credit-card" size={18} color="var(--on-dark-600)" />
          <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--paper)" }}>My cards</span>
        </div>
        <button className="btn btn-quiet btn-sm" style={{ marginLeft: "auto", color: "var(--amber-400)" }}>+ Add new</button>
      </div>
      <div style={{ display: "flex", gap: 12 }}><CreditCard num="6782" /><CreditCard amber num="4356" /></div>
    </Panel>
  );
}

/* ---- Upcoming transactions calendar (table grid w/ merchant badges) ---- */
function SubscriptionCalendar() {
  const today = 28;
  // linear 2-week window: 27 (prev mo) → 10 (next mo)
  const cal = [
    { n: 27, muted: true },
    { n: 28, today: true },
    { n: 29, badges: [["arrow-down-left", "#2F6FE0"]], amt: "$2.3k" },
    { n: 30 },
    { n: 1, badges: [["play", "#E23B2E"], ["music", "#1DB954"]], amt: "$21.98" },
    { n: 2 },
    { n: 3, badges: [["play", "#E23B2E"]], amt: "$82.99" },
    { n: 4, badges: [["cloud", "#2F6FE0"], ["gamepad-2", "#9146FF"]], amt: "$144.99" },
    { n: 5 },
    { n: 6 },
    { n: 7, badges: [["command", "#1A1714"]], amt: "$9.99" },
    { n: 8 },
    { n: 9 },
    { n: 10 },
  ];
  const dows = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const Badge = ({ ic, c, i }) => (
    <span style={{ width: 24, height: 24, borderRadius: "50%", background: c, display: "flex", alignItems: "center",
      justifyContent: "center", flex: "none", marginLeft: i ? -8 : 0, boxShadow: "0 0 0 2px var(--surface-1)", position: "relative", zIndex: 5 - i }}>
      <Ic name={ic} size={13} color="#fff" stroke={2.2} />
    </span>
  );
  return (
    <Panel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 13, paddingBottom: 13, borderBottom: "1px solid var(--surface-3)" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, letterSpacing: ".14em", color: "var(--on-dark-600)" }}>UPCOMING TRANSACTIONS</span>
        <span style={{ marginLeft: "auto", fontFamily: "var(--font-mono)", fontSize: 10.5, letterSpacing: ".04em", color: "var(--on-dark-400)" }}>MAY 2026</span>
      </div>
      {/* weekday header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 8 }}>
        {dows.map((d, i) => <span key={i} style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".06em", color: "var(--on-dark-400)" }}>{d}</span>)}
      </div>
      {/* bordered grid */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gridAutoRows: "1fr", gap: 1,
        background: "var(--surface-3)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-md)", overflow: "hidden", minHeight: 200 }}>
        {cal.map((c, i) => (
          <div key={i} style={{ background: "var(--surface-1)", padding: "8px 8px 9px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, position: "relative",
            backgroundImage: c.muted ? "repeating-linear-gradient(135deg, var(--surface-2) 0 1px, transparent 1px 7px)" : "none" }}>
            {c.today
              ? <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--surface-3)", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: 11.5, fontWeight: 600, color: "var(--paper)" }}>{c.n}</span>
              : <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: c.muted ? "var(--on-dark-400)" : "var(--paper)", lineHeight: "24px" }}>{c.n}</span>}
            {c.badges && (
              <span style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
                {c.badges.map(([ic, col], bi) => <Badge key={bi} ic={ic} c={col} i={bi} />)}
              </span>
            )}
            {c.amt && <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-dark-600)", marginTop: "auto" }}>{c.amt}</span>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---- Recent Activities (compact single-column list) ---- */
function RecentActivities() {
  const rows = [
    ["Salary — Acme Inc.", "landmark", "var(--info)", "+$5,200.00", "17 May", true],
    ["Apartment rent", "house", "var(--info)", "−$1,850.00", "16 May", false],
    ["Whole Foods Market", "shopping-basket", "var(--positive-bright)", "−$142.30", "15 May", false],
    ["Delta Air Lines", "plane", "var(--negative-bright)", "−$612.40", "14 May", false],
    ["Netflix", "monitor-play", "var(--amber-400)", "−$19.99", "10 May", false],
  ];
  return (
    <Panel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 21, color: "var(--paper)" }}>Recent activity</span>
        <button className="btn btn-quiet btn-sm" style={{ marginLeft: "auto", color: "var(--amber-400)" }}>View all</button>
      </div>
      {rows.map(([name, icon, ic, amt, date, sel], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 4px",
          borderTop: i === 0 ? "none" : "1px solid var(--surface-3)" }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: "var(--surface-2)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><Ic name={icon} size={15} color={ic} stroke={1.7} /></span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "var(--font-sans)", fontSize: 13.5, color: "var(--paper)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--on-dark-400)", marginTop: 2 }}>{date}</div>
          </div>
          <span className="figure" style={{ fontSize: 13.5, fontWeight: 500, color: amt[0] === "+" ? "var(--positive-bright)" : "var(--paper)", flex: "none" }}>{amt}</span>
        </div>
      ))}
    </Panel>
  );
}

/* ---- Spending wheel (segmented donut) ---- */
function SpendingWheel() {
  const cats = [
    ["Household", "house", 1220, "var(--info)"],
    ["Auto & transport", "car", 960, "var(--amber-400)"],
    ["Groceries", "shopping-basket", 810, "var(--positive-bright)"],
    ["Drinks & dining", "utensils", 720, "var(--amber-600)"],
    ["Entertainment", "gamepad-2", 700, "var(--taupe)"],
    ["Health care", "heart-pulse", 660, "var(--negative-bright)"],
  ];
  const total = cats.reduce((s, c) => s + c[2], 0);
  const gap = 5; // percent gap between arcs
  let acc = 0;
  const arcs = cats.map(([name, icon, amt, color]) => {
    const pct = (amt / total) * 100;
    const seg = { color, dash: Math.max(pct - gap, 0.5), offset: -acc };
    acc += pct;
    return seg;
  });
  return (
    <Panel style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 6 }}>
        <div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--paper)" }}>Spending by category</span>
          <div style={{ fontFamily: "var(--font-sans)", fontSize: 12.5, color: "var(--on-dark-400)", marginTop: 2 }}>This month</div>
        </div>
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, background: "var(--surface-2)",
          border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: "5px 10px",
          fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--on-dark-600)" }}>May <Ic name="chevron-down" size={13} color="currentColor" /></span>
      </div>
      {/* donut */}
      <div style={{ position: "relative", flex: 1, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240 }}>
        <svg width="232" height="232" viewBox="0 0 172 172" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="86" cy="86" r="72" fill="none" stroke="var(--surface-2)" strokeWidth="13" />
          {arcs.map((a, i) => (
            <circle key={i} cx="86" cy="86" r="72" fill="none" stroke={a.color} strokeWidth="13" strokeLinecap="round"
              pathLength="100" strokeDasharray={`${a.dash} ${100 - a.dash}`} strokeDashoffset={a.offset} />
          ))}
        </svg>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="figure" style={{ fontSize: 36, fontWeight: 500, color: "var(--paper)", lineHeight: 1 }}>{money(total)}</div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".08em", color: "var(--on-dark-400)", marginTop: 6 }}>TOTAL SPENT</div>
        </div>
      </div>
    </Panel>
  );
}

Object.assign(window, { InsightBanner, BalanceCard, StatCluster, ProfitLoss, SpendingWheel, SpendingLimit, MyCards, SubscriptionCalendar, RecentActivities });
