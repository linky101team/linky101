import { getLevelTitle } from "@/lib/levels";

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
}

export default function LevelBadge({
  level,
  size = "md",
  showTitle = true,
  className = "",
}: LevelBadgeProps) {
  const classes = SIZE_CLASSES[size];
  const title = getLevelTitle(level);

  return (
    <span
      className={`inline-flex items-center rounded-full border-3 border-pink bg-gradient-pink-purple font-black uppercase text-white shadow-glow-pink ${classes.pill} ${className}`}
    >
      <span className={classes.level}>LV {level}</span>
      {showTitle && (
        <>
          <span className="opacity-60">·</span>
          <span className={classes.title}>{title}</span>
        </>
      )}
    </span>
  );
}
