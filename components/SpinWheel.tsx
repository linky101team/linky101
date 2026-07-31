"use client";

import { motion } from "framer-motion";

// pink, sky, purple, yellow, green, orange — matches lib/spin.ts's
// prize -> segment mapping used by DailySpinSection.
const SEGMENTS = [
  { color: "#ff6b9d", label: "Mystery" },
  { color: "#38bdf8", label: "Boost" },
  { color: "#a78bfa", label: "Flair" },
  { color: "#f5c518", label: "XP" },
  { color: "#4ade80", label: "Bonus" },
  { color: "#f97316", label: "Shield" },
];

interface SpinWheelProps {
  /** Target rotation in degrees while spinning — parent computes many full turns + landing angle. */
  rotation: number;
  spinning: boolean;
}

export default function SpinWheel({ rotation, spinning }: SpinWheelProps) {
  const gradient = `conic-gradient(${SEGMENTS.map(
    (s, i) => `${s.color} ${i * 60}deg ${(i + 1) * 60}deg`
  ).join(", ")})`;

  return (
    <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
      <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2">
        <div className="h-0 w-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-white" />
      </div>

      <motion.div
        className="relative h-full w-full rounded-full border-4 border-white shadow-glow-purple"
        style={{ background: gradient }}
        animate={spinning ? { rotate: rotation } : { rotate: 360 }}
        transition={
          spinning
            ? { duration: 2.5, ease: [0.15, 0.8, 0.25, 1] }
            : { duration: 8, repeat: Infinity, ease: "linear" }
        }
      >
        {SEGMENTS.map((s, i) => {
          const angle = i * 60 + 30;
          return (
            <span
              key={s.label}
              className="absolute left-1/2 top-1/2 text-[10px] font-black uppercase text-ink"
              style={{
                transform: `rotate(${angle}deg) translate(0, -80px) rotate(-${angle}deg) translate(-50%, -50%)`,
                transformOrigin: "0 0",
              }}
            >
              {s.label}
            </span>
          );
        })}
      </motion.div>

      <div className="absolute flex h-14 w-14 items-center justify-center rounded-full border-3 border-purple bg-navy text-xl shadow-glow-purple">
        🎡
      </div>
    </div>
  );
}
