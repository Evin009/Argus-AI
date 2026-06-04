"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  {
    href: "/dashboard",
    title: "Overview",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
        <rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
      </svg>
    ),
  },
  {
    href: "/transactions",
    title: "Transactions",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
      </svg>
    ),
  },
  {
    href: "/accounts",
    title: "Accounts",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z"/>
      </svg>
    ),
  },
  {
    href: "/bills",
    title: "Bills",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>
      </svg>
    ),
  },
  {
    href: "/subscriptions",
    title: "Subscriptions",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
      </svg>
    ),
  },
  {
    href: "/intelligence",
    title: "Intelligence",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
      </svg>
    ),
  },
];

const BOTTOM = [
  {
    href: "/settings",
    title: "Settings",
    icon: (
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
        <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
      </svg>
    ),
  },
];

function RailBtn({
  icon, title, active, href, onClick,
}: {
  icon: React.ReactNode; title: string; active?: boolean;
  href?: string; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  const btnStyle: React.CSSProperties = {
    width: 44, height: 44, borderRadius: "var(--r-md)", border: "none",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", background: active ? "var(--surface-2)" : "transparent",
    color: active ? "var(--copper)" : hovered ? "var(--on-dark-600)" : "var(--on-dark-400)",
    transition: "background 150ms cubic-bezier(0.23,1,0.32,1), color 150ms cubic-bezier(0.23,1,0.32,1), transform 160ms cubic-bezier(0.23,1,0.32,1)",
    textDecoration: "none",
  };

  const indicator = active ? (
    <span style={{
      position: "absolute", left: -14, top: "50%", transform: "translateY(-50%)",
      width: 3, height: 18, borderRadius: 3, background: "var(--copper)",
    }} />
  ) : null;

  const tooltip = hovered ? (
    <span className="tooltip-enter" style={{
      position: "absolute", left: "calc(100% + 12px)", top: "50%",
      transform: "translateY(-50%)", background: "var(--surface-1)",
      border: "1px solid var(--surface-3)", borderRadius: "var(--r-md)",
      padding: "5px 10px", fontFamily: "var(--font-sans)", fontSize: 12,
      fontWeight: 500, color: "var(--paper)", whiteSpace: "nowrap",
      zIndex: 50, boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
      pointerEvents: "none",
    }}>
      {title}
    </span>
  ) : null;

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  return (
    <div style={{ position: "relative" }}>
      <motion.div whileTap={{ scale: 0.93 }} transition={{ duration: 0.12, ease: [0.23,1,0.32,1] }}>
        {href ? (
          <Link href={href} aria-label={title} style={btnStyle} {...handlers}>
            {indicator}{icon}
          </Link>
        ) : (
          <button onClick={onClick} aria-label={title} style={btnStyle} {...handlers}>
            {indicator}{icon}
          </button>
        )}
      </motion.div>
      {tooltip}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = (localStorage.getItem("argus-theme") as "dark" | "light") ?? "dark";
    setTheme(stored);
    document.body.classList.toggle("light", stored === "light");
  }, []);

  function toggleTheme(mode: "dark" | "light") {
    setTheme(mode);
    localStorage.setItem("argus-theme", mode);
    document.body.classList.toggle("light", mode === "light");
  }

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", gap: 14, padding: 14,
      maxWidth: 1560, margin: "0 auto", alignItems: "stretch",
    }}>
      {/* Icon rail */}
      <aside style={{
        width: 64, flexShrink: 0, alignSelf: "center",
        background: "var(--surface-1)", border: "1px solid var(--surface-3)",
        borderRadius: "var(--r-pill)", padding: "14px 11px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
      }}>
        {/* Theme toggle */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 4, padding: 3,
          borderRadius: "var(--r-pill)", background: "var(--surface-2)",
          border: "1px solid var(--surface-3)", marginBottom: 6,
        }}>
          {(["light", "dark"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => toggleTheme(mode)}
              title={mode === "light" ? "Light mode" : "Dark mode"}
              style={{
                width: 30, height: 30, borderRadius: "50%", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: theme === mode ? "var(--copper)" : "transparent",
                color: theme === mode ? "#fff" : "var(--on-dark-400)",
                transition: "background .15s, color .15s",
              }}
            >
              {mode === "light" ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* Nav items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <RailBtn key={item.href} href={item.href} icon={item.icon} title={item.title} active={active} />
            );
          })}
        </div>

        {/* Bottom: settings + sign out */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 6,
          paddingTop: 8, marginTop: 4, width: "100%", alignItems: "center",
          borderTop: "1px solid var(--surface-3)",
        }}>
          {BOTTOM.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <RailBtn key={item.href} href={item.href} icon={item.icon} title={item.title} active={active} />
            );
          })}
          <RailBtn
            title="Sign out"
            onClick={handleSignOut}
            icon={
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
              </svg>
            }
          />
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
