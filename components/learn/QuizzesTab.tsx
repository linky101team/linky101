"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { QUIZ_CATEGORIES } from "@/lib/quizCategories";
import QuizCard, { type QuizSummary } from "@/components/quiz/QuizCard";

const CATEGORY_ORDER = Object.keys(QUIZ_CATEGORIES);

export default function QuizzesTab() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [bestScores, setBestScores] = useState<Record<string, { score: number; total: number }>>({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const [{ data: quizRows }, { data: attempts }] = await Promise.all([
        supabase
          .from("quizzes")
          .select("id, title, description, category, min_level, question_count, xp_reward")
          .eq("is_active", true)
          .order("min_level"),
        supabase
          .from("quiz_attempts")
          .select("quiz_id, score, total_questions")
          .eq("user_id", profile!.id),
      ]);

      setQuizzes((quizRows as QuizSummary[]) ?? []);

      const best: Record<string, { score: number; total: number }> = {};
      for (const attempt of attempts ?? []) {
        const current = best[attempt.quiz_id];
        if (!current || attempt.score > current.score) {
          best[attempt.quiz_id] = { score: attempt.score, total: attempt.total_questions };
        }
      }
      setBestScores(best);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const filteredQuizzes = activeCategory === "all" ? quizzes : quizzes.filter((q) => q.category === activeCategory);

  if (!profile || loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-shimmer h-28 rounded-[18px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-24">
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
            activeCategory === "all"
              ? "bg-[#1A1A2E] text-white shadow-sm"
              : "border border-gray-200 bg-white text-gray-500"
          }`}
        >
          All
        </button>
        {CATEGORY_ORDER.map((key) => {
          const style = QUIZ_CATEGORIES[key];
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveCategory(key)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                activeCategory === key
                  ? `${style.bg} ${style.text} shadow-sm`
                  : "border border-gray-200 bg-white text-gray-500"
              }`}
            >
              {style.emoji} {style.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filteredQuizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} userLevel={profile.level} bestScore={bestScores[quiz.id]} />
        ))}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <span className="text-4xl">🧠</span>
          <p className="mt-2 font-bold text-gray-900">No quizzes here yet</p>
          <p className="text-sm text-gray-500">New quizzes drop every week — check back soon.</p>
        </div>
      )}
    </div>
  );
}
