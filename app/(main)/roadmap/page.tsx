"use client";

import { Lock } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { LEVEL_THRESHOLDS, getFeatureForLevel, getLevelTitle } from "@/lib/levels";
import SectionTitle from "@/components/ui/SectionTitle";

export default function RoadmapPage() {
  const { profile } = useProfile();
  const level = profile?.level ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="🗺️" title="Level Roadmap" />

      <div className="flex flex-col">
        {LEVEL_THRESHOLDS.map((entry, i) => {
          const isLast = i === LEVEL_THRESHOLDS.length - 1;
          const status =
            entry.level < level ? "completed" : entry.level === level ? "current" : "locked";
          const feature = getFeatureForLevel(entry.level);

          const segmentColor =
            status === "locked" ? "bg-border" : status === "current" ? "bg-yellow" : "bg-green";

          return (
            <div key={entry.level} className="flex gap-3">
              <div className="flex flex-col items-center">
                {status === "completed" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green to-sky text-sm font-black text-navy shadow-glow-green">
                    ✓
                  </div>
                )}
                {status === "current" && (
                  <div className="flex h-9 w-9 shrink-0 animate-pulse items-center justify-center rounded-full bg-gradient-yellow-orange text-sm shadow-glow-yellow">
                    📍
                  </div>
                )}
                {status === "locked" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-3 border-border bg-navy/60">
                    <Lock className="h-3.5 w-3.5 text-text-muted" strokeWidth={3} />
                  </div>
                )}
                {!isLast && <div className={`min-h-[14px] w-1 flex-1 rounded-full ${segmentColor}`} />}
              </div>

              <div className={`flex-1 pb-3 ${status === "locked" ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-black uppercase tracking-wide ${
                      status === "completed"
                        ? "text-green"
                        : status === "current"
                          ? "text-yellow"
                          : "text-text-muted"
                    }`}
                  >
                    Level {entry.level}
                  </p>
                  {status === "current" && (
                    <span className="rounded-full border-2 border-yellow px-1.5 text-[9px] font-black uppercase text-yellow">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-text-muted">
                  {getLevelTitle(entry.level)} · {entry.xp.toLocaleString()} XP
                </p>
                {feature && (
                  <p className="mt-0.5 text-xs font-bold text-purple">
                    {status === "locked" ? "🔒" : "🎁"} {feature}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
