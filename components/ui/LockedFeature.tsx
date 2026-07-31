import type { ReactNode } from "react";
import { Lock } from "lucide-react";

interface LockedFeatureProps {
  level: number;
  children: ReactNode;
  className?: string;
}

export default function LockedFeature({ level, children, className = "" }: LockedFeatureProps) {
  return (
    <div className={`relative overflow-hidden rounded-[18px] ${className}`}>
      <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy/60">
        <Lock className="h-6 w-6 text-ink" strokeWidth={3} />
        <span className="rounded-full border-3 border-purple bg-card px-3 py-1 text-xs font-black uppercase tracking-wide text-ink shadow-glow-purple">
          Unlock at Level {level}
        </span>
      </div>
    </div>
  );
}
