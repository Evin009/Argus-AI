"use client";

import { motion } from "framer-motion";

/* Full-screen ambient backdrop behind the onboarding card. Deep near-black base
   with a radial mesh of slow-drifting copper/ink glow orbs — "Ethereal Glass"
   treatment. Sits at z-index 0, rendered before the card in DOM order, so the
   card naturally stacks above it without needing an explicit z-index of its own.
   (A negative z-index on a `position: fixed` element can paint behind the
   document's own background layer in some browsers — avoid it.) */
export function AmbientBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        background:
          "radial-gradient(ellipse 80% 60% at 30% 20%, rgba(190,119,64,0.10), transparent 60%)," +
          "radial-gradient(ellipse 70% 60% at 75% 80%, rgba(168,65,43,0.08), transparent 60%)," +
          "var(--surface-0)",
      }}
    >
      <motion.div
        className="grain"
        animate={{ x: [0, 60, 0], y: [0, -40, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-16%",
          left: "-10%",
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: "var(--grad-accent)",
          opacity: 0.4,
          filter: "blur(90px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -60, 0], y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-12%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "var(--copper)",
          opacity: 0.28,
          filter: "blur(110px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, 35, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "35%",
          right: "12%",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "var(--positive)",
          opacity: 0.14,
          filter: "blur(90px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -35, 0], y: [0, -30, 0] }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "10%",
          left: "8%",
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: "var(--accent-red)",
          opacity: 0.12,
          filter: "blur(100px)",
        }}
      />
      {/* Edge vignette for depth — keeps the card the visual focal point */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.45) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
