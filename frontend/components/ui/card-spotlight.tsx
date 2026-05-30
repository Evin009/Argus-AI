"use client";

import { useRef, useState, type MouseEvent } from "react";

interface CardSpotlightProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  spotlightColor?: string;
}

export function CardSpotlight({
  children,
  className,
  style,
  spotlightColor = "rgba(200,130,74,0.07)",
}: CardSpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`arg-panel ${className ?? ""}`}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--surface-1)",
        border: "1px solid var(--surface-3)",
        borderRadius: "var(--r-lg)",
        padding: 18,
        ...style,
      }}
    >
      {/* Cursor spotlight */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity,
          transition: "opacity 300ms ease",
          background: `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      {/* Border glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: opacity * 0.5,
          transition: "opacity 300ms ease",
          background: `radial-gradient(200px circle at ${pos.x}px ${pos.y}px, rgba(200,130,74,0.15), transparent 70%)`,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}
