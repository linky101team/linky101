import Link from "next/link";
import { Lock } from "lucide-react";
import { getQuizCategoryStyle } from "@/lib/quizCategories";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

export interface QuizSummary {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  min_level: number;
  question_count: number;
  xp_reward: number;
}

interface QuizCardProps {
  quiz: QuizSummary;
  userLevel: number;
  bestScore?: { score: number; total: number } | null;
}

export default function QuizCard({ quiz, userLevel, bestScore }: QuizCardProps) {
  const style = getQuizCategoryStyle(quiz.category);
  const locked = userLevel < quiz.min_level;

  return (
    <GameCard borderColor={locked ? "border" : "pink"} glowColor={locked ? undefined : "pink"} className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className={`rounded-full border-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${style.border} ${style.text}`}
        >
          {style.emoji} {style.label}
        </span>
        {bestScore && (
          <span className="text-[10px] font-black text-green">
            {bestScore.score}/{bestScore.total} ✓
          </span>
        )}
      </div>

      <h3 className="heading-game text-base leading-tight">{quiz.title}</h3>
      {quiz.description && <p className="text-xs font-bold text-text-muted">{quiz.description}</p>}

      <div className="flex items-center gap-3 text-[10px] font-black text-text-muted">
        <span className="text-yellow">+{quiz.xp_reward} XP</span>
        <span>{quiz.question_count} questions</span>
      </div>

      {locked ? (
        <p className="flex items-center justify-center gap-1 rounded-xl border-3 border-border bg-navy/40 p-2 text-center text-[10px] font-black uppercase text-text-muted">
          <Lock className="h-3 w-3" /> Unlock at Level {quiz.min_level}
        </p>
      ) : (
        <Link href={`/quiz/${quiz.id}`}>
          <GradientButton variant="pink" size="sm" className="w-full">
            {bestScore ? "Play Again" : "Start Quiz"}
          </GradientButton>
        </Link>
      )}
    </GameCard>
  );
}
