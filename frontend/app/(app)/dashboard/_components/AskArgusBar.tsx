"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

const ASK_HINTS = [
  "Can I afford a $1,200 vacation this month?",
  "How much have I spent on dining out?",
  "When will my balance drop below $500?",
  "What subscriptions am I paying for?",
  "Should I pay off Citi or Amex first?",
  "Am I on track to save $500 this month?",
  "How much did I save last month?",
  "What's my biggest spending category?",
];

export function AskArgusBar() {
  const router = useRouter();
  const [askIdx, setAskIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [askVisible, setAskVisible] = useState(true);
  const [askInput, setAskInput] = useState("");
  const [askFocused, setAskFocused] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      const next = (askIdx + 1) % ASK_HINTS.length;
      setPrevIdx(askIdx);
      setAskIdx(next);
      setAskVisible(false);
      setTimeout(() => setAskVisible(true), 80);
      setTimeout(() => setPrevIdx(null), 2400);
    }, 5000);
    return () => clearInterval(t);
  }, [askIdx]);

  function submit() {
    // Routes to /intelligence pending a dedicated AI Copilot chat route (see project plan: "Copilot + Simulations" phase)
    const q = askInput.trim();
    router.push(q ? `/intelligence?q=${encodeURIComponent(q)}` : "/intelligence");
  }

  return (
    <div
      className="grain"
      style={{
        background: "var(--grad-accent)",
        borderRadius: "var(--r-pill)",
        padding: "2px",
        display: "inline-flex",
        flexShrink: 0,
        width: 380,
        maxWidth: "100%",
        boxShadow: askFocused
          ? "0 0 0 3px rgba(200,114,56,0.35), 0 0 48px rgba(168,65,43,0.65), 0 0 90px rgba(168,65,43,0.25), inset 0 1px 0 rgba(255,255,255,0.18)"
          : "0 0 18px rgba(168,65,43,0.22), inset 0 1px 0 rgba(255,255,255,0.12)",
        transition: "box-shadow 0.7s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-0)", borderRadius: "calc(var(--r-pill) - 2px)", padding: "8px 14px", flex: 1, minWidth: 0 }}>
        <Sparkles size={15} color="rgb(255, 103, 0)" />
        <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
          <input
            type="text"
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            onFocus={() => setAskFocused(true)}
            onBlur={() => setAskFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            style={{ background: "transparent", border: "none", outline: "none", color: "var(--paper)", fontFamily: "var(--font-sans)", fontSize: 13.5, width: "100%", lineHeight: 1.4 }}
          />
          {!askInput && (
            <>
              {prevIdx !== null && (
                <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", display: "flex", flexWrap: "nowrap", gap: "0.3em", pointerEvents: "none" }}>
                  {ASK_HINTS[prevIdx].split(" ").map((word, wi) => (
                    <span
                      key={wi}
                      style={{
                        opacity: 0,
                        filter: "blur(14px)",
                        transition: `opacity 1.1s ease ${wi * 85}ms, filter 1.1s ease ${wi * 85}ms`,
                        color: "var(--on-dark-600)",
                        fontFamily: "var(--font-sans)",
                        fontSize: 13.5,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        display: "inline-block",
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </span>
              )}
              <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", display: "flex", flexWrap: "nowrap", gap: "0.3em", pointerEvents: "none" }}>
                {ASK_HINTS[askIdx].split(" ").map((word, wi) => (
                  <span
                    key={`${askIdx}-${wi}`}
                    style={{
                      opacity: askVisible ? 0.78 : 0,
                      filter: askVisible ? "blur(0px)" : "blur(14px)",
                      transition: `opacity 1.1s ease ${wi * 75}ms, filter 1.1s ease ${wi * 75}ms`,
                      color: "var(--on-dark-600)",
                      fontFamily: "var(--font-sans)",
                      fontSize: 13.5,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      display: "inline-block",
                    }}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </>
          )}
        </div>
        <button
          onClick={submit}
          className="grain"
          style={{
            background: "var(--grad-accent)",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            flexShrink: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 8px rgba(168,65,43,0.35)",
            transition: "filter .18s, transform .1s",
          }}
        >
          <ArrowRight size={13} color="#fff" strokeWidth={2.6} />
        </button>
      </div>
    </div>
  );
}
