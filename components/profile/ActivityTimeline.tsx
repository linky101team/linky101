"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import GameCard from "@/components/ui/GameCard";

type ActivityType = "post" | "quiz" | "achievement" | "level_up";

interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  created_at: string;
}

interface EarnedAchievementRow {
  id: string;
  earned_at: string;
  achievement: { name: string } | null;
}

const DOT_COLOR: Record<ActivityType, string> = {
  post: "bg-pink",
  quiz: "bg-sky",
  achievement: "bg-yellow",
  level_up: "bg-green",
};

interface ActivityTimelineProps {
  userId: string;
}

export default function ActivityTimeline({ userId }: ActivityTimelineProps) {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: posts }, { data: attempts }, { data: earned }, { data: levelUps }] = await Promise.all([
        supabase
          .from("posts")
          .select("id, category, created_at")
          .eq("author_id", userId)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("quiz_attempts")
          .select("id, score, total_questions, completed_at")
          .eq("user_id", userId)
          .order("completed_at", { ascending: false })
          .limit(5),
        supabase
          .from("user_achievements")
          .select("id, earned_at, achievement:achievements(name)")
          .eq("user_id", userId)
          .order("earned_at", { ascending: false })
          .limit(5),
        supabase
          .from("activity_log")
          .select("id, description, created_at")
          .eq("user_id", userId)
          .eq("activity_type", "level_up")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const earnedRows = (earned ?? []) as unknown as EarnedAchievementRow[];

      const merged: ActivityItem[] = [
        ...(posts ?? []).map((p) => ({
          id: `post-${p.id}`,
          type: "post" as const,
          description: `Shared a ${p.category}`,
          created_at: p.created_at,
        })),
        ...(attempts ?? []).map((a) => ({
          id: `quiz-${a.id}`,
          type: "quiz" as const,
          description: `Scored ${a.score}/${a.total_questions} on a quiz`,
          created_at: a.completed_at,
        })),
        ...earnedRows.map((e) => ({
          id: `ach-${e.id}`,
          type: "achievement" as const,
          description: `Earned "${e.achievement?.name ?? "an achievement"}"`,
          created_at: e.earned_at,
        })),
        ...(levelUps ?? []).map((l) => ({
          id: `lvl-${l.id}`,
          type: "level_up" as const,
          description: l.description,
          created_at: l.created_at,
        })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setItems(merged);
      setLoading(false);
    }
    load();
  }, [userId, supabase]);

  return (
    <GameCard borderColor="green" glowColor="green">
      <p className="mb-3 font-black uppercase tracking-wide text-ink">📆 Recent Activity</p>
      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm font-bold text-text-muted">No activity yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[item.type]}`} />
              <p className="flex-1 text-sm font-bold text-text-muted">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </GameCard>
  );
}
