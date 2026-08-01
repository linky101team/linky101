"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  /** stagger index — each step delays entrance by ~50ms, capped so long lists don't feel slow */
  index?: number;
  className?: string;
}

/** Fades + slides an element in on mount. Wrap list items with an increasing `index` for a stagger effect. */
export function Reveal({ children, index = 0, className = "" }: RevealProps) {
  const delay = Math.min(index, 8) * 0.05;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Card that lifts on hover (desktop) and presses on tap (mobile) — use for any clickable card. */
export function LiftCard({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: "0 12px 24px -8px rgba(26,26,46,0.18)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
