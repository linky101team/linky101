"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { toggleQuizActive } from "@/lib/actions/adminContent";
import { getQuizCategoryStyle } from "@/lib/quizCategories";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";

interface Quiz {
  id: string;
  title: string;
  category: string | null;
  min_level: number;
  question_count: number;
  xp_reward: number;
  is_active: boolean;
}

export default function AdminQuizzesPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    async function load() {
      const [{ data: quizRows }, { data: attempts }] = await Promise.all([
        supabase
          .from("quizzes")
          .select("id, title, category, min_level, question_count, xp_reward, is_active")
          .order("min_level"),
        supabase.from("quiz_attempts").select("quiz_id"),
      ]);
      setQuizzes((quizRows as Quiz[]) ?? []);

      const counts: Record<string, number> = {};
      for (const a of attempts ?? []) counts[a.quiz_id] = (counts[a.quiz_id] ?? 0) + 1;
      setAttemptCounts(counts);
      setLoading(false);
    }
    load();
  }, [supabase]);

  function handleToggle(quiz: Quiz) {
    const next = !quiz.is_active;
    setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? { ...q, is_active: next } : q)));
    startTransition(() => toggleQuizActive(quiz.id, next));
  }

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle emoji="🧠" title="Quizzes" />
      <p className="text-xs font-bold text-text-muted">
        {quizzes.length} quizzes seeded across 6 categories. Toggle a quiz off to hide it from players.
      </p>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {quizzes.map((quiz) => {
            const style = getQuizCategoryStyle(quiz.category);
            return (
              <GameCard key={quiz.id} borderColor="border" className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">{quiz.title}</p>
                  <p className={`text-[10px] font-bold ${style.text}`}>
                    {style.label} · Lv{quiz.min_level}+ · {quiz.question_count}Q · {attemptCounts[quiz.id] ?? 0} attempts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle(quiz)}
                  className={`shrink-0 rounded-full border-2 px-2 py-1 text-[9px] font-black uppercase ${
                    quiz.is_active ? "border-green bg-green/20 text-green" : "border-border text-text-muted"
                  }`}
                >
                  {quiz.is_active ? "Active" : "Inactive"}
                </button>
              </GameCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
