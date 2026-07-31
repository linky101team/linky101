import Link from "next/link";
import { getQuizCategoryStyle } from "@/lib/quizCategories";
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

export default function QuizCard({ quiz, bestScore }: QuizCardProps) {
  const style = getQuizCategoryStyle(quiz.category);
  const minutes = Math.max(2, Math.round(quiz.question_count * 0.5));

  return (
    <div className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl ${style.bg}`}>
        {style.emoji}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-snug text-gray-900">{quiz.title}</h3>
          {bestScore && (
            <span className="shrink-0 rounded-full bg-[#E8F5E9] px-2 py-0.5 text-[11px] font-bold text-[#2ECC71]">
              Best {bestScore.score}/{bestScore.total}
            </span>
          )}
        </div>

        {quiz.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{quiz.description}</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <p className={`text-xs font-semibold ${style.text}`}>
            {quiz.question_count} questions · ~{minutes} min
          </p>
          <Link href={`/quiz/${quiz.id}`}>
            <GradientButton variant="dark" size="sm">
              {bestScore ? "Play again" : "Start"}
            </GradientButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
