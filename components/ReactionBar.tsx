"use client";

import { useState, useTransition } from "react";
import { toggleReaction, type ReactionType } from "@/lib/actions/reactions";

const REACTIONS: { type: ReactionType; emoji: string }[] = [
  { type: "fire", emoji: "🔥" },
  { type: "lightbulb", emoji: "💡" },
  { type: "rocket", emoji: "🚀" },
  { type: "heart", emoji: "❤️" },
  { type: "clap", emoji: "👏" },
];

interface ReactionBarProps {
  postId: string;
  counts: Partial<Record<ReactionType, number>>;
  active: ReactionType[];
}

export default function ReactionBar({ postId, counts: initialCounts, active: initialActive }: ReactionBarProps) {
  const [counts, setCounts] = useState(initialCounts);
  const [active, setActive] = useState<Set<ReactionType>>(new Set(initialActive));
  const [, startTransition] = useTransition();

  function handleTap(type: ReactionType) {
    const wasActive = active.has(type);

    setActive((prev) => {
      const next = new Set(prev);
      if (wasActive) next.delete(type);
      else next.add(type);
      return next;
    });
    setCounts((prev) => ({ ...prev, [type]: (prev[type] ?? 0) + (wasActive ? -1 : 1) }));

    startTransition(async () => {
      try {
        await toggleReaction(postId, type);
      } catch {
        setActive((prev) => {
          const next = new Set(prev);
          if (wasActive) next.add(type);
          else next.delete(type);
          return next;
        });
        setCounts((prev) => ({ ...prev, [type]: (prev[type] ?? 0) + (wasActive ? 1 : -1) }));
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTIONS.map(({ type, emoji }) => {
        const isActive = active.has(type);
        const count = counts[type] ?? 0;
        return (
          <button
            key={type}
            type="button"
            onClick={() => handleTap(type)}
            className={`flex items-center gap-1 rounded-full border-3 px-2 py-1 text-xs font-black transition-colors ${
              isActive ? "border-pink bg-pink/20 text-pink" : "border-border bg-navy/40 text-text-muted"
            }`}
          >
            <span>{emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
