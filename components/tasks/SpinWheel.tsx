"use client";

import { motion } from "framer-motion";

// pink, sky, purple, yellow, green, orange — the 6 named LinkY accent colours.
const SEGMENT_COLORS = ["#ff6b9d", "#38bdf8", "#a78bfa", "#f5c518", "#4ade80", "#f97316"];

interface SpinWheelProps {
  rotation: number;
  spinning: boolean;
}

export default function SpinWheel({ rotation, spinning }: SpinWheelProps) {
  const gradient = `conic-gradient(${SEGMENT_COLORS.map(
    (c, i) => `${c} ${i * 60}deg ${(i + 1) * 60}deg`
  ).join(", ")})`;

  return (
    <div className="relative mx-auto flex h-48 w-48 items-center justify-center">
      <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2">
        <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-white" />
      </div>
      <motion.div
        className="h-full w-full rounded-full border-4 border-white shadow-glow-purple"
        style={{ background: gradient }}
        animate={{ rotate: rotation }}
        transition={{ duration: spinning ? 2.5 : 0, ease: [0.15, 0.8, 0.25, 1] }}
      />
      <div className="absolute flex h-12 w-12 items-center justify-center rounded-full border-3 border-purple bg-navy text-lg shadow-glow-purple">
        🎡
      </div>
    </div>
  );
}
