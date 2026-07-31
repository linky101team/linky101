"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";

type ActivityType = "post" | "quiz" | "achievement" | "level_up";

interface ActivityItem {
  id: string;
  type: ActivityType;
  name: string;
  description: string;
  created_at: string;
}

interface EarnedAchievementRow {
  id: string;
  user_id: string;
  earned_at: string;
  achievement: { name: string } | null;
}

const TYPE_STYLE: Record<ActivityType, { icon: string; color: string }> = {
  post: { icon: "📝", color: "text-pink" },
  quiz: { icon: "🧠", color: "text-sky" },
  achievement: { icon: "🏅", color: "text-yellow" },
  level_up: { icon: "⬆️", color: "text-green" },
};

export default function TeamActivityFeed() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    if (!profile.school_id) {
      setLoading(false);
      return;
    }

    async function load() {
      const schoolId = profile!.school_id!;
      const { data: members } = await supabase
        .from("profiles")
        .select("id, first_name")
        .eq("school_id", schoolId);

      const memberIds = (members ?? []).map((m) => m.id);
      const nameById = new Map((members ?? []).map((m) => [m.id, m.first_name]));

      if (memberIds.length === 0) {
        setLoading(false);
        return;
      }

      const [{ data: posts }, { data: attempts }, { data: earned }, { data: levelUps }] = await Promise.all([
        supabase
          .from("posts")
          .select("id, author_id, category, created_at")
          .in("author_id", memberIds)
          .eq("moderation_status", "approved")
          .order("created_at", { ascending: false })
          .limit(10),
        supabase
          .from("quiz_attempts")
          .select("id, user_id, score, total_questions, completed_at")
          .in("user_id", memberIds)
          .order("completed_at", { ascending: false })
          .limit(10),
        supabase
          .from("user_achievements")
          .select("id, user_id, earned_at, achievement:achievements(name)")
          .in("user_id", memberIds)
          .order("earned_at", { ascending: false })
          .limit(10),
        supabase
          .from("activity_log")
          .select("id, user_id, description, created_at")
          .in("user_id", memberIds)
          .eq("activity_type", "level_up")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const earnedRows = (earned ?? []) as unknown as EarnedAchievementRow[];

      const merged: ActivityItem[] = [
        ...(posts ?? []).map((p) => ({
          id: `post-${p.id}`,
          type: "post" as const,
          name: nameById.get(p.author_id) ?? "Member",
          description: `shared a ${p.category}`,
          created_at: p.created_at,
        })),
        ...(attempts ?? []).map((a) => ({
          id: `quiz-${a.id}`,
          type: "quiz" as const,
          name: nameById.get(a.user_id) ?? "Member",
          description: `scored ${a.score}/${a.total_questions} on a quiz`,
          created_at: a.completed_at,
        })),
        ...earnedRows.map((e) => ({
          id: `ach-${e.id}`,
          type: "achievement" as const,
          name: nameById.get(e.user_id) ?? "Member",
          description: `earned "${e.achievement?.name ?? "an achievement"}"`,
          created_at: e.earned_at,
        })),
        ...(levelUps ?? []).map((l) => ({
          id: `lvl-${l.id}`,
          type: "level_up" as const,
          name: nameById.get(l.user_id) ?? "Member",
          description: l.description,
          created_at: l.created_at,
        })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 15);

      setItems(merged);
      setLoading(false);
    }

    load();
  }, [profile, supabase]);

  if (!profile?.school_id) return null;

  return (
    <div>
      <p className="mb-3 font-black uppercase tracking-wide text-ink">📣 Team Activity</p>
      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm font-bold text-text-muted">No activity yet — be the first!</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => {
            const style = TYPE_STYLE[item.type];
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-xl border-3 border-border bg-card p-2"
              >
                <span className={`text-lg ${style.color}`}>{style.icon}</span>
                <p className="flex-1 text-sm font-bold text-ink">
                  <span className="text-pink">{item.name}</span> {item.description}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
