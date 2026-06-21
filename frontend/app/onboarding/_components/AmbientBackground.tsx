"use client";

import { motion } from "framer-motion";

/* Full-screen ambient backdrop behind the onboarding card — slow drifting
   copper/ink blobs plus the existing brand grain texture, kept subtle so
   it reads as alive without competing with the card content. */
export function AmbientBackground() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        background: "var(--surface-0)",
      }}
    >
      <motion.div
        className="grain"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: 520,
          height: 520,
          borderRadius: "50%",
          background: "var(--grad-accent)",
          opacity: 0.16,
          filter: "blur(60px)",
        }}
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          bottom: "-15%",
          right: "-8%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "var(--copper)",
          opacity: 0.1,
          filter: "blur(80px)",
        }}
      />
      <motion.div
        animate={{ x: [0, 25, 0], y: [0, 25, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          top: "40%",
          right: "20%",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "var(--positive)",
          opacity: 0.05,
          filter: "blur(70px)",
        }}
      />
    </div>
  );
}
