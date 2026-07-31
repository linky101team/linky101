"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import {
  FEATURE_UNLOCKS,
  getXPForLevel,
  getXPToNextLevel,
  type FeatureUnlock,
} from "@/lib/levels";
import GameCard from "@/components/ui/GameCard";

type Node =
  | { kind: "completed"; level: number; feature: string }
  | { kind: "current" }
  | { kind: "locked"; level: number; feature: string };

interface LevelRoadmapCardProps {
  level: number;
  xp: number;
}

function buildNodes(level: number): Node[] {
  const completed: FeatureUnlock[] = FEATURE_UNLOCKS.filter((f) => level >= f.level).slice(-2);
  const upcoming: FeatureUnlock[] = FEATURE_UNLOCKS.filter((f) => level < f.level).slice(0, 3);

  return [
    ...[...upcoming].reverse().map((f): Node => ({ kind: "locked", level: f.level, feature: f.feature })),
    { kind: "current" },
    ...[...completed].reverse().map((f): Node => ({ kind: "completed", level: f.level, feature: f.feature })),
  ];
}

export default function LevelRoadmapCard({ level, xp }: LevelRoadmapCardProps) {
  const nodes = buildNodes(level);
  const [toast, setToast] = useState<string | null>(null);

  const xpToNext = getXPToNextLevel(level, xp);

  function handleLockedTap(nodeLevel: number) {
    const needed = Math.max(0, getXPForLevel(nodeLevel) - xp);
    setToast(`Keep going! You need ${needed} more XP`);
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <GameCard borderColor="purple" glowColor="purple">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-black uppercase tracking-wide text-ink">🗺️ Level Roadmap</span>
        <Link href="/roadmap" className="text-xs font-black uppercase tracking-wide text-sky">
          View All →
        </Link>
      </div>

      <div className="flex flex-col">
        {nodes.map((node, i) => {
          const isLast = i === nodes.length - 1;
          const segmentColor =
            node.kind === "locked" ? "bg-border" : node.kind === "current" ? "bg-yellow" : "bg-green";

          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                {node.kind === "completed" && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green to-sky text-lg font-black text-ink shadow-glow-green">
                    ✓
                  </div>
                )}
                {node.kind === "current" && (
                  <div className="flex h-10 w-10 shrink-0 animate-pulse items-center justify-center rounded-full bg-gradient-yellow-orange text-lg shadow-glow-yellow">
                    📍
                  </div>
                )}
                {node.kind === "locked" && (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-3 border-border bg-navy/60">
                    <Lock className="h-4 w-4 text-text-muted" strokeWidth={3} />
                  </div>
                )}
                {!isLast && <div className={`min-h-[20px] w-1 flex-1 rounded-full ${segmentColor}`} />}
              </div>

              <div className="flex-1 pb-4">
                {node.kind === "completed" && (
                  <>
                    <p className="text-xs font-black uppercase tracking-wide text-green">
                      Level {node.level}
                    </p>
                    <p className="text-sm font-bold text-text-muted">🎁 Unlocked: {node.feature}</p>
                  </>
                )}

                {node.kind === "current" && (
                  <>
                    <span className="inline-block rounded-full border-3 border-yellow bg-navy/60 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-yellow">
                      📍 You Are Here
                    </span>
                    <p className="mt-1 text-sm font-black text-pink">
                      {xpToNext === null
                        ? "🔥 Max level reached!"
                        : `🔥 ${xpToNext} XP to Level ${level + 1}`}
                    </p>
                  </>
                )}

                {node.kind === "locked" && (
                  <button
                    type="button"
                    onClick={() => handleLockedTap(node.level)}
                    className="text-left"
                  >
                    <p className="text-xs font-black uppercase tracking-wide text-text-muted">
                      Level {node.level}
                    </p>
                    <p className="text-sm font-bold text-text-muted opacity-70">
                      🔒 Unlock: {node.feature}
                    </p>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {toast && (
        <div className="rounded-xl border-3 border-purple bg-navy/60 p-2 text-center text-xs font-black text-purple shadow-glow-purple">
          {toast}
        </div>
      )}
    </GameCard>
  );
}
