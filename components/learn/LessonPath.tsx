"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Check } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { CURRICULUM_CATEGORIES, CURRICULUM_COLOR_CLASSES } from "@/lib/curriculum";

interface LessonRow {
  id: string;
  category: string;
  order_index: number;
  title: string;
  emoji: string;
}

interface ProgressRow {
  lesson_id: string;
  completed: boolean;
}

// Zigzag offsets for the Duolingo-style path — cycles every 4 nodes.
const OFFSETS = ["justify-center", "justify-end pr-6", "justify-center", "justify-start pl-6"];

export default function LessonPath() {
  const { profile } = useProfile();
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [{ data: lessonRows }, { data: progressRows }] = await Promise.all([
        supabase.from("curriculum_lessons").select("id, category, order_index, title, emoji").order("order_index"),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  function showLockedToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  }

  if (!profile || loading) {
    return (
      <div className="flex flex-col gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-shimmer h-48 rounded-[20px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-10 pb-24">
      {CURRICULUM_CATEGORIES.map((category, catIndex) => {
        const colors = CURRICULUM_COLOR_CLASSES[category.color];
        const categoryUnlocked = profile.level >= category.levelUnlock;
        const categoryLessons = lessons
          .filter((l) => l.category === category.slug)
          .sort((a, b) => a.order_index - b.order_index);

        let currentAssigned = false;

        return (
          <div key={category.slug} className="flex flex-col gap-4">
            <div
              className={`flex items-center gap-3 rounded-2xl border-3 bg-card p-3 shadow-card ${
                categoryUnlocked ? colors.border : "border-border opacity-60"
              }`}
            >
              <span className="text-2xl">{category.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-black uppercase tracking-wide ${categoryUnlocked ? colors.text : "text-text-muted"}`}>
                  {category.title}
                </p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">
                  {categoryUnlocked ? `Level ${category.levelUnlock}` : `🔒 Unlocks at Level ${category.levelUnlock}`}
                </p>
              </div>
            </div>

            {categoryLessons.length === 0 ? (
              <div className="skeleton-shimmer h-16 rounded-[18px]" />
            ) : (
              <div className="flex flex-col gap-4">
                {categoryLessons.map((lesson, i) => {
                  const completed = !!progress[lesson.id];
                  const isCurrent = categoryUnlocked && !completed && !currentAssigned;
                  if (isCurrent) currentAssigned = true;
                  const locked = !categoryUnlocked || (!completed && !isCurrent);
                  const offsetClass = OFFSETS[(catIndex * 4 + i) % OFFSETS.length];

                  function handleTap() {
                    if (!categoryUnlocked) {
                      showLockedToast(`🔒 Reach Level ${category.levelUnlock} to unlock ${category.title}!`);
                      return;
                    }
                    if (locked) {
                      showLockedToast("🔒 Finish the lesson above first!");
                      return;
                    }
                    router.push(`/learn/lesson/${lesson.id}`);
                  }

                  return (
                    <div key={lesson.id} className={`flex ${offsetClass}`}>
                      <button
                        type="button"
                        onClick={handleTap}
                        className="flex w-24 flex-col items-center gap-1 transition-transform active:scale-95"
                      >
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full border-3 text-2xl ${
                            completed
                              ? `${colors.border} ${colors.bg} ${colors.glow} text-white`
                              : isCurrent
                                ? `${colors.border} bg-card ${colors.glow} glow-pulse`
                                : "border-border bg-card opacity-50"
                          }`}
                        >
                          {completed ? <Check className="h-7 w-7" strokeWidth={4} /> : locked ? <Lock className="h-6 w-6 text-text-muted" strokeWidth={3} /> : lesson.emoji}
                        </div>
                        <p className={`text-center text-[10px] font-black leading-tight ${locked ? "text-text-muted" : "text-ink"}`}>
                          {lesson.title}
                        </p>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-[70] mx-auto w-fit max-w-[90%] rounded-full border-3 border-sky bg-card px-4 py-2 text-sm font-black text-ink shadow-glow-sky">
          {toast}
        </div>
      )}
    </div>
  );
}
