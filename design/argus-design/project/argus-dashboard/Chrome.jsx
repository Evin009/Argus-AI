/* Argus Dashboard — chrome: top nav bar + left icon rail */

function TopNav({ onAsk }) {
  const tabs = ["Overview", "Activity", "Wallets", "Forecast", "Accounts", "Reports"];
  const [active, setActive] = useState("Overview");
  return (
    <header style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 16px",
      background: "var(--surface-1)", border: "1px solid var(--surface-3)", borderRadius: "var(--r-xl)" }}>
      <Logo size={36} />
      {/* tabs */}
      <nav style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: 14, background: "var(--surface-2)",
        border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: 4 }}>
        {tabs.map(t => {
          const on = t === active;
          return (
            <button key={t} onClick={() => setActive(t)} className={on ? "grain" : undefined} style={{ border: "none", cursor: "pointer",
              padding: "8px 16px", borderRadius: "var(--r-pill)", fontFamily: "var(--font-sans)", fontSize: 13.5,
              fontWeight: on ? 600 : 500, whiteSpace: "nowrap",
              color: on ? "#fff" : "var(--on-dark-400)",
              background: on ? "var(--grad-accent)" : "transparent", transition: "color .15s, background .15s" }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.color = "var(--on-dark-900)"; }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.color = "var(--on-dark-400)"; }}>{t}</button>
          );
        })}
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onAsk} className="grain" style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
          background: "var(--grad-accent)", border: "none", borderRadius: "var(--r-pill)", padding: "9px 16px",
          color: "#fff", fontFamily: "var(--font-sans)", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 16px rgba(168,65,43,0.28)" }}>
          <Ic name="sparkles" size={15} color="#fff" /> Ask Argus
        </button>
        {["search", "bell", "info"].map((ic, i) => (
          <button key={ic} style={{ position: "relative", width: 38, height: 38, borderRadius: "50%",
            border: "1px solid var(--surface-3)", background: "var(--surface-2)", color: "var(--on-dark-600)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic name={ic} size={16} color="currentColor" />
            {i === 1 && <span style={{ position: "absolute", top: 9, right: 10, width: 7, height: 7, borderRadius: "50%",
              background: "var(--negative-bright)", border: "1.5px solid var(--surface-2)" }}></span>}
          </button>
        ))}
        {/* profile */}
        <button style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", background: "var(--surface-2)",
          border: "1px solid var(--surface-3)", borderRadius: "var(--r-pill)", padding: "5px 12px 5px 5px" }}>
          <span style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(140deg, var(--amber-400), var(--amber-700))",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)",
            fontSize: 12, fontWeight: 600, flex: "none" }}>JR</span>
          <span style={{ textAlign: "left", lineHeight: 1.25 }}>
            <span style={{ display: "block", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "var(--paper)", whiteSpace: "nowrap" }}>Jordan Reyes</span>
            <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--on-dark-400)", whiteSpace: "nowrap" }}>jordan.reyes@gm…</span>
          </span>
          <Ic name="chevron-down" size={15} color="var(--on-dark-400)" />
        </button>
      </div>
    </header>
  );
}

function LeftRail({ theme, onToggleTheme }) {
  const items = ["layout-grid", "calendar", "mail", "file-text", "users", "layers", "settings"];
  const [active, setActive] = useState("layout-grid");
  const RailBtn = ({ icon, on, onClick, title }) => (
    <button onClick={onClick} title={title} style={{ width: 42, height: 42, borderRadius: "var(--r-md)", border: "none",
      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
      background: on ? "var(--surface-2)" : "transparent", color: on ? "var(--amber-400)" : "var(--on-dark-400)",
      transition: "background .15s, color .15s" }}
      onMouseEnter={e => { if (!on) { e.currentTarget.style.color = "var(--on-dark-600)"; e.currentTarget.style.background = "rgba(246,239,226,0.04)"; } }}
      onMouseLeave={e => { if (!on) { e.currentTarget.style.color = "var(--on-dark-400)"; e.currentTarget.style.background = "transparent"; } }}>
      {on && <span style={{ position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: 3, background: "var(--amber-400)" }}></span>}
      <Ic name={icon} size={19} color="currentColor" />
    </button>
  );
  return (
    <aside style={{ width: 64, flex: "none", alignSelf: "center", background: "var(--surface-1)", border: "1px solid var(--surface-3)",
      borderRadius: "var(--r-pill)", padding: "14px 11px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      {/* theme toggle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: 3, borderRadius: "var(--r-pill)",
        background: "var(--surface-2)", border: "1px solid var(--surface-3)", marginBottom: 6 }}>
        {[["sun", "light"], ["moon", "dark"]].map(([ic, mode]) => (
          <button key={mode} onClick={() => onToggleTheme(mode)} title={mode} style={{ width: 30, height: 30, borderRadius: "50%",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            background: theme === mode ? "var(--amber-500)" : "transparent",
            color: theme === mode ? "#fff" : "var(--on-dark-400)", transition: "background .15s, color .15s" }}>
            <Ic name={ic} size={15} color="currentColor" />
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map(ic => <RailBtn key={ic} icon={ic} on={active === ic} onClick={() => setActive(ic)} />)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 8, marginTop: 4, borderTop: "1px solid var(--surface-3)", width: "100%", alignItems: "center" }}>
        <RailBtn icon="life-buoy" title="Help" />
        <RailBtn icon="log-out" title="Sign out" />
      </div>
    </aside>
  );
}

Object.assign(window, { TopNav, LeftRail });
