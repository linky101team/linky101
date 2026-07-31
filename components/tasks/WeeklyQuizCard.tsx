"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  min_level: number;
  question_count: number;
  xp_reward: number;
}

export default function WeeklyQuizCard() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("quizzes")
      .select("id, title, description, category, min_level, question_count, xp_reward")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setQuiz(data);
        setLoading(false);
      });
  }, [supabase]);

  if (loading || !quiz) return null;

  const locked = (profile?.level ?? 1) < quiz.min_level;

  return (
    <GameCard borderColor="sky" glowColor="sky">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-black uppercase tracking-wide text-white">🧠 Weekly Quiz</span>
        <Link href="/quizzes" className="text-[10px] font-black uppercase tracking-wide text-sky">
          All Quizzes →
        </Link>
      </div>
      <h3 className="heading-game mb-1 text-lg">{quiz.title}</h3>
      {quiz.description && <p className="mb-3 text-sm font-bold text-text-muted">{quiz.description}</p>}
      <div className="mb-3 flex items-center gap-3 text-xs font-black text-text-muted">
        <span className="text-yellow">+{quiz.xp_reward} XP</span>
        <span>{quiz.question_count} questions</span>
        {quiz.min_level > 1 && <span>Lv {quiz.min_level}+</span>}
      </div>
      {locked ? (
        <p className="rounded-xl border-3 border-border bg-navy/40 p-2 text-center text-xs font-black uppercase text-text-muted">
          🔒 Unlock at Level {quiz.min_level}
        </p>
      ) : (
        <Link href={`/quiz/${quiz.id}`}>
          <GradientButton variant="sky" className="w-full">
            Start Quiz
          </GradientButton>
        </Link>
      )}
    </GameCard>
  );
}
