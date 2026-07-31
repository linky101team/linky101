"use client";

import { motion } from "framer-motion";
import { getLevelProgress, getNextLevelXP, getXPForLevel } from "@/lib/levels";

interface XPBarProps {
  level: number;
  xp: number;
  showLabel?: boolean;
  className?: string;
}

export default function XPBar({ level, xp, showLabel = true, className = "" }: XPBarProps) {
  const progress = getLevelProgress(level, xp);
  const nextLevelXP = getNextLevelXP(level);
  const floor = getXPForLevel(level);

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-[10px] font-black uppercase tracking-wide text-text-muted">
          <span>Lv {level}</span>
          <span>
            {nextLevelXP === null
              ? "Max Level"
              : `${xp - floor} / ${nextLevelXP - floor} XP`}
          </span>
        </div>
      )}
      <div className="h-3 w-full overflow-hidden rounded-full bg-border">
        <motion.div
          className="h-full rounded-full bg-gradient-yellow-orange shadow-glow-yellow"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
