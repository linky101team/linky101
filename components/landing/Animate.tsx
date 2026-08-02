"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Landing-page motion.
 *
 * Kept in one small client component so the page itself can stay a server
 * component — only the wrappers ship JavaScript, not the whole page.
 *
 * Everything here animates ONCE and only on the way in. Elements that keep
 * moving, or that re-animate every time you scroll past, stop being delightful
 * about ten seconds in and start being annoying. `viewport={{ once: true }}`
 * everywhere is the whole rule.
 */

interface FadeInProps {
  children: ReactNode;
  /** Stagger position — each step adds 70ms, capped so long lists don't crawl. */
  index?: number;
  /** Where it comes from. Default is up from below. */
  from?: "up" | "left" | "right";
  className?: string;
}

const OFFSET = {
  up: { y: 24, x: 0 },
  left: { y: 0, x: -28 },
  right: { y: 0, x: 28 },
};

export function FadeIn({ children, index = 0, from = "up", className = "" }: FadeInProps) {
  const offset = OFFSET[from];
  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        delay: Math.min(index, 6) * 0.07,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * The hero's app preview: slides in, then breathes very slightly forever.
 * The float is 6px over 5 seconds — enough to read as alive, small enough
 * that you never consciously notice it.
 */
export function FloatIn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/** A card that lifts when you point at it. */
export function HoverLift({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
