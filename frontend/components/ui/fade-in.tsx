"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const offset = { up: { y: 28 }, down: { y: -28 }, left: { x: 28 }, right: { x: -28 }, none: {} };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...offset[direction] }}
      animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
