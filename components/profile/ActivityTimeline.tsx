"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";

type ActivityType = "post" | "quiz" | "lesson";

interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  created_at: string;
}

interface LessonProgressRow {
  lesson_id: string;
  completed_at: string;
  lesson: { title: string } | null;
}

const DOT_COLOR: Record<ActivityType, string> = {
  post: "bg-[#FF6B6B]",
  quiz: "bg-[#039BE5]",
  lesson: "bg-[#2ECC71]",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

interface ActivityTimelineProps {
  userId: string;
}

export default function ActivityTimeline({ userId }: ActivityTimelineProps) {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: posts }, { data: attempts }, { data: lessons }] = await Promise.all([
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
          .from("curriculum_progress")
          .select("lesson_id, completed_at, lesson:curriculum_lessons(title)")
          .eq("user_id", userId)
          .eq("completed", true)
          .order("completed_at", { ascending: false })
          .limit(5),
      ]);

      const lessonRows = (lessons ?? []) as unknown as LessonProgressRow[];

      const merged: ActivityItem[] = [
        ...(posts ?? []).map((p) => ({
          id: `post-${p.id}`,
          type: "post" as const,
          description: `Shared a ${p.category} on the Feed`,
          created_at: p.created_at,
        })),
        ...(attempts ?? []).map((a) => ({
          id: `quiz-${a.id}`,
          type: "quiz" as const,
          description: `Scored ${a.score}/${a.total_questions} on a quiz`,
          created_at: a.completed_at,
        })),
        ...lessonRows
          .filter((l) => l.completed_at)
          .map((l) => ({
            id: `lesson-${l.lesson_id}`,
            type: "lesson" as const,
            description: `Completed "${l.lesson?.title ?? "a lesson"}"`,
            created_at: l.completed_at,
          })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6);

      setItems(merged);
      setLoading(false);
    }
    load();
  }, [userId, supabase]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 font-bold text-gray-900">Recent activity</p>
      {loading ? (
        <p className="text-sm font-semibold text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-500">
          Complete a lesson or share a post to start your timeline 📖
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2.5">
              <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_COLOR[item.type]}`} />
              <p className="min-w-0 flex-1 truncate text-sm text-gray-700">{item.description}</p>
              <span className="shrink-0 text-xs text-gray-400">{timeAgo(item.created_at)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
