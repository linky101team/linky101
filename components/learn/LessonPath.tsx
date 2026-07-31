"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { CURRICULUM_CATEGORIES, CURRICULUM_COLOR_CLASSES } from "@/lib/curriculum";

interface ProgressRow {
  lesson_id: string;
  completed: boolean;
}

interface LessonRow {
  id: string;
  category: string;
}

export default function LessonPath() {
  const { profile } = useProfile();
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const [{ data: lessonRows }, { data: progressRows }] = await Promise.all([
        supabase.from("curriculum_lessons").select("id, category").order("order_index"),
        supabase.from("curriculum_progress").select("lesson_id, completed").eq("user_id", profile!.id),
      ]);
      setLessons((lessonRows as LessonRow[]) ?? []);
      const map: Record<string, boolean> = {};
      for (const row of (progressRows as ProgressRow[]) ?? []) {
        if (row.completed) map[row.lesson_id] = true;
      }
      setProgress(map);
      setLoading(false);
    }
    load();
  }, [profile?.id, profile, supabase]);

  if (!profile || loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-shimmer h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {CURRICULUM_CATEGORIES.map((category) => {
        const colors = CURRICULUM_COLOR_CLASSES[category.color];
        const categoryLessons = lessons.filter((l) => l.category === category.slug);
        const completedCount = categoryLessons.filter((l) => progress[l.id]).length;
        const totalCount = categoryLessons.length || category.lessonTitles.length;
        const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => router.push(`/learn/topic/${category.slug}`)}
            className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-transform active:scale-[0.98] text-left"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors.bgLight}`}>
              <span className="text-2xl">{category.emoji}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-gray-900">{category.title}</p>
              <p className="text-xs text-gray-500">{completedCount}/{totalCount} lessons completed</p>
              <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100">
                <div
                  className={`h-1.5 rounded-full ${colors.bg} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
          </button>
        );
      })}
    </div>
  );
}
