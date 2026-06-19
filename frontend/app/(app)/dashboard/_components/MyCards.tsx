"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard as CreditCardIcon } from "lucide-react";
import { Panel } from "./atoms";

type WalletCardData = {
  id: number;
  bank: string;
  network: "visa" | "mastercard" | "amex" | "discover" | "chase" | "generic";
  num: string;
  name: string;
  exp: string;
  bg: string;
  dark: boolean;
};

const CARD_H = 170;
const PEEK = 52;

// Placeholder card art pending a "linked cards" detail endpoint — real account
// balances/utilization already shown in BalanceCard above; this stack is the
// Apple Wallet-style visual browser for the same linked cards.
const FALLBACK_CARDS: WalletCardData[] = [
  { id: 0, bank: "Discover", network: "discover", num: "6011 1234 5678 9012", name: "Cardholder", exp: "09/28", bg: "linear-gradient(135deg,#F2EDE4 0%,#DDD8CE 100%)", dark: true },
  { id: 1, bank: "Chase Sapphire", network: "chase", num: "4012 8888 8888 1881", name: "Cardholder", exp: "03/27", bg: "linear-gradient(135deg,#0D2B55 0%,#061628 100%)", dark: false },
  { id: 2, bank: "Amex Gold", network: "amex", num: "3714 4963 5398 431", name: "Cardholder", exp: "11/26", bg: "linear-gradient(135deg,#C8922A 0%,#7C520E 100%)", dark: false },
  { id: 3, bank: "Citi", network: "mastercard", num: "5500 0000 0000 0004", name: "Cardholder", exp: "07/27", bg: "linear-gradient(135deg,#0048B4 0%,#001E7A 100%)", dark: false },
  { id: 4, bank: "Visa", network: "visa", num: "4242 4242 4242 4242", name: "Cardholder", exp: "03/26", bg: "linear-gradient(135deg,#1A1F71 0%,#0D1050 100%)", dark: false },
];

function EMVChip() {
  return (
    <svg width="42" height="32" viewBox="0 0 42 32">
      <rect x="1" y="1" width="40" height="30" rx="5" fill="#C8A84B" />
      <rect x="1" y="1" width="40" height="30" rx="5" fill="none" stroke="#A08030" strokeWidth="0.8" />
      <line x1="1" y1="11" x2="41" y2="11" stroke="#A08030" strokeWidth="0.7" opacity="0.7" />
      <line x1="1" y1="21" x2="41" y2="21" stroke="#A08030" strokeWidth="0.7" opacity="0.7" />
      <line x1="14" y1="1" x2="14" y2="31" stroke="#A08030" strokeWidth="0.7" opacity="0.7" />
      <line x1="28" y1="1" x2="28" y2="31" stroke="#A08030" strokeWidth="0.7" opacity="0.7" />
      <rect x="14" y="11" width="14" height="10" rx="1.5" fill="#B89030" />
    </svg>
  );
}

function NetworkLogo({ network, dark }: { network: WalletCardData["network"]; dark: boolean }) {
  const w = dark ? "#1a1a1a" : "#fff";
  const m = dark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.92)";

  if (network === "visa")
    return (
      <span style={{ fontFamily: "'Times New Roman',Georgia,serif", fontSize: 28, fontWeight: 700, fontStyle: "italic", color: w, letterSpacing: "-1px", lineHeight: 1, textShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.25)" }}>
        VISA
      </span>
    );

  if (network === "mastercard")
    return (
      <svg width="52" height="33" viewBox="0 0 52 33">
        <defs>
          <clipPath id="mcc">
            <circle cx="34" cy="16.5" r="15" />
          </clipPath>
        </defs>
        <circle cx="18" cy="16.5" r="15" fill="#EB001B" />
        <circle cx="34" cy="16.5" r="15" fill="#F79E1B" />
        <circle cx="18" cy="16.5" r="15" fill="#FF5F00" clipPath="url(#mcc)" />
      </svg>
    );

  if (network === "amex")
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <span style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: m, lineHeight: 1.2 }}>AMERICAN</span>
        <span style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", color: m, lineHeight: 1.2 }}>EXPRESS</span>
      </div>
    );

  if (network === "discover")
    return (
      <div style={{ display: "flex", alignItems: "center", fontFamily: "'Arial Black',Arial,sans-serif", fontSize: 22, fontWeight: 900, color: "#111", letterSpacing: "-0.5px" }}>
        DISC
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: "50%", background: "#E65C00", margin: "0 1px", flexShrink: 0 }} />
        VER
      </div>
    );

  if (network === "chase")
    return (
      <svg width="34" height="34" viewBox="0 0 34 34">
        <rect x="1" y="1" width="32" height="32" rx="4" fill="rgba(255,255,255,0.95)" />
        <rect x="1" y="1" width="32" height="32" rx="4" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        <line x1="6" y1="17" x2="28" y2="17" stroke="#1A54A0" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="17" y1="6" x2="17" y2="28" stroke="#1A54A0" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );

  return null;
}

function CardBg({ network }: { network: WalletCardData["network"] }) {
  if (network === "discover")
    return (
      <svg style={{ position: "absolute", right: -14, bottom: -14, opacity: 0.2, pointerEvents: "none" }} width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="52" fill="none" stroke="#E65C00" strokeWidth="10" />
        <circle cx="55" cy="55" r="34" fill="none" stroke="#E65C00" strokeWidth="5" />
      </svg>
    );
  if (network === "chase")
    return (
      <svg style={{ position: "absolute", right: -8, bottom: -8, opacity: 0.07, pointerEvents: "none" }} width="130" height="130" viewBox="0 0 130 130">
        <rect x="0" y="52" width="130" height="26" fill="white" />
        <rect x="52" y="0" width="26" height="130" fill="white" />
      </svg>
    );
  if (network === "amex")
    return (
      <>
        <div style={{ position: "absolute", right: -28, top: -28, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,0.09)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 24, bottom: -36, width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
      </>
    );
  if (network === "mastercard")
    return (
      <svg style={{ position: "absolute", right: -14, top: 0, bottom: 0, opacity: 0.06, pointerEvents: "none" }} width="100" height="170" viewBox="0 0 100 170">
        <rect x="2" y="2" width="96" height="166" rx="12" fill="none" stroke="white" strokeWidth="16" />
      </svg>
    );
  if (network === "visa")
    return (
      <svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", opacity: 0.05, pointerEvents: "none" }} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={-20 + i * 30} y1="0" x2={-20 + i * 30 + 80} y2="100" stroke="white" strokeWidth="14" />
        ))}
      </svg>
    );
  return null;
}

function WalletCardFace({ bank, network, num, name, exp, bg, dark, isFront }: WalletCardData & { isFront: boolean }) {
  const txt = dark ? "#1a1a1a" : "#fff";
  const sub = dark ? "rgba(0,0,0,0.48)" : "rgba(255,255,255,0.58)";

  return (
    <div style={{ height: CARD_H, borderRadius: "var(--r-xl)", background: bg, display: "flex", flexDirection: "column", padding: "14px 18px", overflow: "hidden", position: "relative", userSelect: "none", width: "100%" }}>
      <CardBg network={network} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        {network === "discover" ? <NetworkLogo network="discover" dark={dark} /> : (
          <span style={{ fontFamily: "'Arial Black',Arial,sans-serif", fontSize: 14, fontWeight: 900, color: txt, letterSpacing: "0.02em" }}>{bank}</span>
        )}
        {network !== "discover" && <NetworkLogo network={network} dark={dark} />}
      </div>

      {isFront && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, position: "relative", zIndex: 1 }}>
          <EMVChip />
          <svg width="22" height="24" viewBox="0 0 22 24">
            <circle cx="4" cy="12" r="2" fill={sub} />
            <path d="M 8 6 A 7 7 0 0 1 8 18" fill="none" stroke={sub} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 12 3 A 11 11 0 0 1 12 21" fill="none" stroke={sub} strokeWidth="1.8" strokeLinecap="round" opacity="0.65" />
            <path d="M 16 1 A 15 15 0 0 1 16 23" fill="none" stroke={sub} strokeWidth="1.8" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>
      )}

      {isFront && (
        <div style={{ marginTop: "auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: "'Courier New',Courier,monospace", fontSize: 15, color: txt, letterSpacing: "0.06em", marginBottom: 6, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{num}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 13, color: txt, fontWeight: 600 }}>{name}</span>
            <span style={{ fontFamily: "var(--font-sans)", fontSize: 11, color: sub }}>Exp {exp}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function MyCards({ cards = FALLBACK_CARDS }: { cards?: WalletCardData[] }) {
  const [order, setOrder] = useState<number[]>(cards.map((_, i) => i));
  const [dragState, setDragState] = useState<{ cardIdx: number; deltaY: number } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const dragRef = useRef<{ cardIdx: number; origSlot: number; startY: number; currentY: number } | null>(null);
  const dragActiveRef = useRef(false);
  const n = order.length;
  const containerH = (n - 1) * PEEK + CARD_H;

  const startDrag = (e: React.MouseEvent | React.TouchEvent, cardIdx: number) => {
    e.preventDefault();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragRef.current = { cardIdx, origSlot: order.indexOf(cardIdx), startY: clientY, currentY: clientY };
    dragActiveRef.current = false;
    setDragState({ cardIdx, deltaY: 0 });
    setDragActive(false);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current) return;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      dragRef.current.currentY = clientY;
      const delta = clientY - dragRef.current.startY;
      if (Math.abs(delta) > 6 && !dragActiveRef.current) {
        dragActiveRef.current = true;
        setDragActive(true);
      }
      setDragState({ cardIdx: dragRef.current.cardIdx, deltaY: delta });
    };
    const onUp = () => {
      if (!dragRef.current) return;
      const { cardIdx, origSlot, startY, currentY } = dragRef.current;
      const targetSlot = Math.max(0, Math.min(n - 1, Math.round((origSlot * PEEK + currentY - startY) / PEEK)));
      setOrder((prev) => {
        const next = prev.filter((i) => i !== cardIdx);
        next.splice(targetSlot, 0, cardIdx);
        return next;
      });
      dragRef.current = null;
      dragActiveRef.current = false;
      setDragState(null);
      setDragActive(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [n]);

  const previewOrder = (() => {
    if (!dragState || !dragRef.current) return null;
    const { cardIdx, origSlot } = dragRef.current;
    const target = Math.max(0, Math.min(n - 1, Math.round((origSlot * PEEK + dragState.deltaY) / PEEK)));
    const next = order.filter((i) => i !== cardIdx);
    next.splice(target, 0, cardIdx);
    return next;
  })();

  return (
    <Panel style={{ overflow: "visible", height: "100%", display: "flex", flexDirection: "column" }}>
      <style>{`
        .wc { transition: top .45s cubic-bezier(0.34,1.56,0.64,1), transform .45s cubic-bezier(0.34,1.56,0.64,1), box-shadow .2s ease, filter .2s ease; will-change: top, transform; }
        .wc.drag { transition: none; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <CreditCardIcon size={18} color="var(--amber-400)" />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 400, color: "var(--paper)" }}>My cards</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--on-dark-400)", letterSpacing: ".06em" }}>{n} LINKED</span>
        </div>
        <button className="btn btn-quiet btn-sm" style={{ marginLeft: "auto", color: "var(--amber-400)", fontSize: 13 }}>
          + Add new
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "center", overflowX: "hidden" }}>
        <div style={{ position: "relative", height: containerH, touchAction: "none", width: "100%", maxWidth: 320, margin: "0 auto" }}>
          {order.map((cardIdx, stackPos) => {
            const isDragging = dragState?.cardIdx === cardIdx;
            const pSlot = previewOrder ? previewOrder.indexOf(cardIdx) : stackPos;
            const isFront = !dragState && stackPos === n - 1;

            const top = isDragging && dragRef.current
              ? Math.max(0, Math.min((n - 1) * PEEK, dragRef.current.origSlot * PEEK + (dragState?.deltaY ?? 0)))
              : pSlot * PEEK;

            const slot = isDragging ? pSlot : stackPos;
            const depthBack = (n - 1 - slot) * 0.018;
            const isActiveDrag = isDragging && dragActive;
            const scale = isActiveDrag ? 1.03 : Math.max(0.92, 1 - depthBack);

            return (
              <div
                key={cardIdx}
                className={`wc${isDragging ? " drag" : ""}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top,
                  zIndex: isDragging ? n + 10 : stackPos + 1,
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  borderRadius: "var(--r-xl)",
                  cursor: isDragging ? "grabbing" : "grab",
                  height: "285px",
                }}
                onMouseDown={(e) => startDrag(e, cardIdx)}
                onTouchStart={(e) => startDrag(e, cardIdx)}
              >
                <WalletCardFace {...cards[cardIdx]} isFront={isFront} />
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ margin: "16px 0 0", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: ".1em", color: "var(--on-dark-400)", textAlign: "center", textTransform: "uppercase" }}>
        Drag to reorder
      </p>
    </Panel>
  );
}
