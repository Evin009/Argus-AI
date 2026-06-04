/* Argus Dashboard — shared atoms */
const { useState, useEffect, useRef } = React;

function Ic({ name, size = 20, color, stroke = 1.75, style }) {
  return <i data-lucide={name} style={{ width: size, height: size, color, strokeWidth: stroke, ...style }}></i>;
}

/* Brand mark — the uploaded Argus logo, cropped to a circle */
function Logo({ size = 38, withWord = true }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
      <span style={{ width: size, height: size, borderRadius: "50%", flex: "none", overflow: "hidden",
        background: "#0C0A07", display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 0 1px var(--surface-3), inset 0 0 0 1px rgba(216,197,173,0.08)" }}>
        <img src="logo-argus.png" alt="Argus" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </span>
      {withWord && <span style={{ fontFamily: "var(--font-display)", fontSize: size * 0.74, color: "var(--paper)", lineHeight: 1, letterSpacing: "-0.01em" }}>Argus</span>}
    </span>
  );
}

/* Eye mark — used as the avatar of the AI in insight surfaces */
function EyeMark({ size = 24, color = "var(--amber-400)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" style={{ display: "block", flex: "none" }}>
      <path d="M3.5 24C3.5 24 12 9.5 24 9.5C36 9.5 44.5 24 44.5 24C44.5 24 36 38.5 24 38.5C12 38.5 3.5 24 3.5 24Z" stroke={color} strokeWidth="2.6" strokeLinejoin="round"/>
      <circle cx="24" cy="24" r="8.4" fill={color}/>
      <circle cx="24" cy="24" r="3.6" fill="#14110D"/>
      <circle cx="26.4" cy="21.4" r="1.5" fill="#F6EFE2"/>
    </svg>
  );
}

function money(n) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }

function Panel({ children, style, pad = 18 }) {
  return <div className="arg-panel" style={{ background: "var(--surface-1)", border: "1px solid var(--surface-3)",
    borderRadius: "var(--r-lg)", padding: pad, ...style }}>{children}</div>;
}

Object.assign(window, { useState, useEffect, useRef, Ic, Logo, EyeMark, money, Panel });
