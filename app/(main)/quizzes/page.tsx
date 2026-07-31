"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { QUIZ_CATEGORIES } from "@/lib/quizCategories";
import SectionTitle from "@/components/ui/SectionTitle";
import QuizCard, { type QuizSummary } from "@/components/quiz/QuizCard";

const CATEGORY_ORDER = Object.keys(QUIZ_CATEGORIES);

export default function QuizzesPage() {
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

  const filteredQuizzes =
    activeCategory === "all" ? quizzes : quizzes.filter((q) => q.category === activeCategory);

  if (!profile) {
    return <p className="text-sm font-bold text-text-muted">Loading quizzes...</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle emoji="🧠" title="Quizzes" />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 rounded-full border-3 px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
            activeCategory === "all" ? "border-pink bg-pink text-white shadow-glow-pink" : "border-border text-text-muted"
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
              className={`shrink-0 rounded-full border-3 px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
                activeCategory === key
                  ? `${style.border} ${style.text} bg-navy/60 shadow-glow-pink`
                  : "border-border text-text-muted"
              }`}
            >
              {style.emoji} {style.label}
            </button>
          );
        })}
      </div>

      {loading && <p className="text-sm font-bold text-text-muted">Loading quizzes...</p>}

      <div className="grid grid-cols-1 gap-3">
        {filteredQuizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} userLevel={profile.level} bestScore={bestScores[quiz.id]} />
        ))}
      </div>

      {!loading && filteredQuizzes.length === 0 && (
        <p className="py-8 text-center text-sm font-bold text-text-muted">No quizzes in this category yet.</p>
      )}
    </div>
  );
}
