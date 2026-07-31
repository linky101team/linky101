"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Share2, Star, X } from "lucide-react";
import { motion } from "framer-motion";
import { createClientSupabase } from "@/lib/supabase/client";
import { submitQuizAttempt } from "@/lib/actions/quiz";
import { useProfileStore } from "@/hooks/useProfile";
import { getQuizCategoryStyle } from "@/lib/quizCategories";
import ShareCard from "@/components/ShareCard";

interface QuizOption {
  text: string;
  is_correct: boolean;
}

interface QuizQuestion {
  id: string;
  question_text: string;
  options: QuizOption[];
  explanation: string | null;
  order_index: number;
}

interface QuizData {
  id: string;
  title: string;
  category: string | null;
  time_limit_seconds: number | null;
  xp_reward: number;
}

function starsForScore(pct: number): number {
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  return pct > 0 ? 1 : 0;
}

export default function QuizPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerLog, setAnswerLog] = useState<boolean[]>([]);
  const [shake, setShake] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("id, title, category, time_limit_seconds, xp_reward")
        .eq("id", params.id)
        .maybeSingle();
      const { data: qs } = await supabase
        .from("quiz_questions")
        .select("id, question_text, options, explanation, order_index")
        .eq("quiz_id", params.id)
        .order("order_index");

      setQuiz(quizData);
      setQuestions((qs ?? []) as unknown as QuizQuestion[]);
      if (quizData?.time_limit_seconds) setTimeLeft(quizData.time_limit_seconds);
      setLoading(false);
    }
    load();
  }, [params.id, supabase]);

  async function handleFinish(finalScore: number, totalQuestions: number) {
    setFinished(true);
    setSubmitting(true);
    try {
      await submitQuizAttempt(params.id, finalScore, totalQuestions);
      refreshProfile();
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (timeLeft === null || finished || loading) return;
    if (timeLeft <= 0) {
      handleFinish(score, questions.length);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, finished, loading]);

  const question = questions[currentIndex];
  const style = getQuizCategoryStyle(quiz?.category ?? null);

  function handleSelect(index: number) {
    if (selected !== null || !question) return;
    setSelected(index);
    const correct = !!question.options[index]?.is_correct;
    setAnswerLog((prev) => [...prev, correct]);
    if (correct) {
      setScore((s) => s + 1);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  function handleNext() {
    setSelected(null);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      handleFinish(score, questions.length);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#B3E5FC]">
        <p className="font-semibold text-gray-500">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#B3E5FC] p-6 text-center">
        <p className="font-bold text-gray-900">Quiz not found</p>
        <button
          type="button"
          onClick={() => router.push("/learn?tab=quizzes")}
          className="rounded-full bg-[#1A1A2E] px-6 py-3 text-sm font-bold text-white transition-transform active:scale-95"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const pct = questions.length > 0 ? score / questions.length : 0;
  const stars = starsForScore(pct);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#B3E5FC]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 py-6">
        {!finished ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Exit quiz"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${style.bg} ${style.text}`}>
                {style.emoji} {style.label}
              </span>
              {timeLeft !== null ? (
                <span
                  className={`text-sm font-bold ${timeLeft <= 10 ? "text-[#FF6B6B]" : "text-gray-600"}`}
                >
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </span>
              ) : (
                <span className="w-9" />
              )}
            </div>

            <div className="mb-6 flex items-center justify-center gap-2">
              {questions.map((_, i) => {
                const answeredCorrect = answerLog[i];
                let dotClass = "border-gray-200 bg-transparent";
                if (i < answerLog.length) {
                  dotClass = answeredCorrect ? "border-[#2ECC71] bg-[#2ECC71]" : "border-[#FF6B6B] bg-[#FF6B6B]";
                } else if (i === currentIndex) {
                  dotClass = "border-gray-400 bg-white animate-pulse";
                }
                return (
                  <span key={i} className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 ${dotClass}`} />
                );
              })}
            </div>

            <motion.div animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="mb-6 text-lg font-bold text-gray-900">{question.question_text}</h1>

              <div className="flex flex-col gap-3">
                {question.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrectOption = opt.is_correct;
                  let stateClass = "border-gray-200 bg-white";
                  if (selected !== null) {
                    if (isCorrectOption) stateClass = "border-[#2ECC71] bg-[#E8F5E9]";
                    else if (isSelected) stateClass = "border-[#FF6B6B] bg-[#FFF0F0]";
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={selected !== null}
                      onClick={() => handleSelect(i)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium text-gray-900 transition-colors ${stateClass}`}
                    >
                      <span>{opt.text}</span>
                      {selected !== null && isCorrectOption && (
                        <Check className="h-4 w-4 shrink-0 text-[#2ECC71]" strokeWidth={2.5} />
                      )}
                      {selected !== null && isSelected && !isCorrectOption && (
                        <X className="h-4 w-4 shrink-0 text-[#FF6B6B]" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {selected !== null && question.explanation && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-600 shadow-sm">
                💡 {question.explanation}
              </div>
            )}

            {selected !== null && (
              <button
                type="button"
                onClick={handleNext}
                className="mt-6 w-full rounded-full bg-[#1A1A2E] py-4 text-base font-bold text-white transition-transform active:scale-[0.98]"
              >
                {currentIndex + 1 < questions.length ? "Next" : "Finish"}
              </button>
            )}
          </>
        ) : (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="text-5xl">{stars === 3 ? "🏆" : stars === 2 ? "🎉" : stars === 1 ? "✅" : "💪"}</span>
            <h1 className="text-2xl font-bold text-gray-900">Quiz Complete!</h1>

            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <Star
                  key={i}
                  className={`h-9 w-9 ${i < stars ? "fill-[#FFC107] text-[#FFC107]" : "text-gray-300"}`}
                  strokeWidth={2}
                />
              ))}
            </div>

            <p className="text-4xl font-extrabold text-gray-900">
              {score}/{questions.length}
            </p>
            <p className="text-sm text-gray-500">{Math.round(pct * 100)}% correct</p>
            {submitting ? (
              <p className="text-sm text-gray-500">Saving your results...</p>
            ) : (
              <p className="text-sm font-semibold text-[#2ECC71]">
                {stars === 3
                  ? "Perfect run. Seriously impressive."
                  : stars === 2
                    ? "Solid score — one more go for 3 stars?"
                    : "Every attempt makes you sharper. Go again!"}
              </p>
            )}

            {showShare && (
              <ShareCard
                emoji={stars === 3 ? "🏆" : stars === 2 ? "🎉" : "✅"}
                title={quiz.title}
                subtitle="LinkY101 Quiz Result"
                stat={`${score}/${questions.length} correct`}
                accent="sky"
                filename={`linky101-quiz-${quiz.id}`}
              />
            )}

            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={() => setShowShare((v) => !v)}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-700 transition-transform active:scale-[0.98]"
              >
                <Share2 className="h-4 w-4" strokeWidth={2.5} />
                {showShare ? "Hide" : "Share"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/learn?tab=quizzes")}
                className="flex-1 rounded-full bg-[#1A1A2E] py-3 text-sm font-bold text-white transition-transform active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
