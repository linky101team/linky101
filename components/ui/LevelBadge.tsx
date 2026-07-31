"use client";

import { getLevelTitle } from "@/lib/levels";
import { useLevelModalStore } from "@/lib/levelModalStore";

export type LevelBadgeSize = "sm" | "md" | "lg";

const SIZE_CLASSES: Record<LevelBadgeSize, { pill: string; level: string; title: string }> = {
  sm: { pill: "px-2 py-0.5 gap-1", level: "text-[10px]", title: "text-[10px]" },
  md: { pill: "px-3 py-1 gap-1.5", level: "text-xs", title: "text-xs" },
  lg: { pill: "px-5 py-2 gap-2", level: "text-lg", title: "text-sm" },
};

interface LevelBadgeProps {
  level: number;
  size?: LevelBadgeSize;
  showTitle?: boolean;
  className?: string;
  /** When true, renders as a tappable button that opens the current user's Level Progress modal. */
  interactive?: boolean;
}

export default function LevelBadge({
  level,
  size = "md",
  showTitle = true,
  className = "",
  interactive = false,
}: LevelBadgeProps) {
  const classes = SIZE_CLASSES[size];
  const title = getLevelTitle(level);
  const showLevelModal = useLevelModalStore((s) => s.show);

  const content = (
    <>
      <span className={classes.level}>LV {level}</span>
      {showTitle && (
        <>
          <span className="opacity-60">·</span>
          <span className={classes.title}>{title}</span>
        </>
      )}
    </>
  );

  const pillClass = `inline-flex items-center rounded-full border-3 border-sky bg-gradient-primary font-black uppercase text-white shadow-glow-sky ${
    size === "lg" ? "glow-pulse" : ""
  } ${classes.pill} ${className}`;

  if (interactive) {
    return (
      <button
        type="button"
        onClick={showLevelModal}
        aria-label="View level progress"
        className={`${pillClass} transition-transform active:scale-95`}
      >
        {content}
      </button>
    );
  }

  return <span className={pillClass}>{content}</span>;
}
