"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { CURRICULUM_CATEGORIES, CURRICULUM_COLOR_CLASSES, getCategoryBySlug } from "@/lib/curriculum";

interface ProgressRow {
  lesson_id: string;
  completed: boolean;
}

interface LessonRow {
  id: string;
  category: string;
  title: string;
  emoji: string;
  order_index: number;
}

function progressMessage(done: number, total: number): string {
  if (total === 0) return "Lessons loading...";
  if (done === 0) return "Pick a topic and dive in 🚀";
  if (done < total / 2) return "Nice one — keep it going 🔥";
  if (done < total) return "Over halfway. Seriously impressive 💪";
  return "You've completed every lesson 👑";
}

export default function LessonPath() {
  const { profile } = useProfile();
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const [{ data: lessonRows }, { data: progressRows }] = await Promise.all([
        supabase.from("curriculum_lessons").select("id, category, title, emoji, order_index").order("order_index"),
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
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton-shimmer h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  const totalDone = lessons.filter((l) => progress[l.id]).length;
  const totalAll = lessons.length;

  // ---------- Category detail view ----------
  if (openCategory) {
    const category = getCategoryBySlug(openCategory);
    if (!category) {
      setOpenCategory(null);
      return null;
    }
    const colors = CURRICULUM_COLOR_CLASSES[category.color];
    const categoryLessons = lessons
      .filter((l) => l.category === category.slug)
      .sort((a, b) => a.order_index - b.order_index);
    const doneCount = categoryLessons.filter((l) => progress[l.id]).length;
    const upNext = categoryLessons.find((l) => !progress[l.id]);

    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setOpenCategory(null)}
          className="flex w-fit items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-600 transition-transform active:scale-95"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          All topics
        </button>

        <div className={`rounded-2xl p-5 ${colors.bgLight}`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{category.emoji}</span>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
              <p className="text-sm text-gray-600">
                {doneCount}/{categoryLessons.length} lessons complete
              </p>
              <div className="mt-2 h-2 w-full rounded-full bg-white/70">
                <div
                  className={`h-2 rounded-full ${colors.bg} transition-all`}
                  style={{ width: `${categoryLessons.length ? (doneCount / categoryLessons.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {upNext && (
          <button
            type="button"
            onClick={() => router.push(`/learn/lesson/${upNext.id}`)}
            className="flex items-center gap-3 rounded-2xl bg-[#1A1A2E] p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15">
              <Play className="h-5 w-5 fill-white text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-white/60">Up next</p>
              <p className="truncate font-semibold text-white">{upNext.title}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-white/60" />
          </button>
        )}

        <div className="flex flex-col gap-2.5">
          {categoryLessons.map((lesson, i) => {
            const done = !!progress[lesson.id];
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => router.push(`/learn/lesson/${lesson.id}`)}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-transform active:scale-[0.98]"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    done ? "bg-[#2ECC71] text-white" : `${colors.bgLight} ${colors.text}`
                  }`}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {lesson.emoji} {lesson.title}
                  </p>
                  <p className="text-xs text-gray-500">{done ? "Completed" : "≈ 4 min + mini-quiz"}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------- Category grid view ----------
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-bold text-gray-900">
            {totalDone}/{totalAll || 28} lessons
          </p>
          <span className="text-sm text-gray-500">{progressMessage(totalDone, totalAll)}</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
          <div
            className="h-2 rounded-full bg-[#2ECC71] transition-all"
            style={{ width: `${totalAll ? (totalDone / totalAll) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CURRICULUM_CATEGORIES.map((category) => {
          const colors = CURRICULUM_COLOR_CLASSES[category.color];
          const categoryLessons = lessons.filter((l) => l.category === category.slug);
          const completedCount = categoryLessons.filter((l) => progress[l.id]).length;
          const totalCount = categoryLessons.length || category.lessonTitles.length;
          const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const isDone = totalCount > 0 && completedCount === totalCount;

          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => setOpenCategory(category.slug)}
              className={`relative flex flex-col items-start gap-2 rounded-2xl p-4 text-left shadow-sm transition-transform active:scale-[0.97] ${colors.bgLight}`}
            >
              {isDone && (
                <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-[#2ECC71]">
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                </span>
              )}
              <span className="text-4xl">{category.emoji}</span>
              <p className="font-bold leading-tight text-gray-900">{category.title}</p>
              <p className="text-xs text-gray-500">
                {completedCount}/{totalCount} lessons
              </p>
              <div className="h-1.5 w-full rounded-full bg-white/80">
                <div
                  className={`h-1.5 rounded-full ${colors.bg} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
