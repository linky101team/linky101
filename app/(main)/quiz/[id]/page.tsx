"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, Share2, Star, X } from "lucide-react";
import { motion } from "framer-motion";
import { createClientSupabase } from "@/lib/supabase/client";
import { submitQuizAttempt } from "@/lib/actions/quiz";
import { useProfileStore } from "@/hooks/useProfile";
import { getQuizCategoryStyle } from "@/lib/quizCategories";
import Confetti from "@/components/Confetti";
import GradientButton from "@/components/ui/GradientButton";
import LevelUpModal from "@/components/LevelUpModal";
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
  const [xpEarned, setXpEarned] = useState(0);
  const [levelUp, setLevelUp] = useState<number | null>(null);
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
      const result = await submitQuizAttempt(params.id, finalScore, totalQuestions);
      setXpEarned(result.xpEarned);
      refreshProfile();
      if (result.leveledUp && result.newLevel) setLevelUp(result.newLevel);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy">
        <p className="font-black uppercase text-text-muted">Loading quiz...</p>
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-navy p-6 text-center">
        <p className="font-black uppercase text-ink">Quiz not found</p>
        <GradientButton variant="sky" onClick={() => router.push("/quizzes")}>
          Back to Quizzes
        </GradientButton>
      </div>
    );
  }

  const pct = questions.length > 0 ? score / questions.length : 0;
  const stars = starsForScore(pct);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 py-6">
        {!finished ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <button type="button" onClick={() => router.back()} className="text-text-muted">
                <X className="h-5 w-5" />
              </button>
              <span
                className={`rounded-full border-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${style.border} ${style.text}`}
              >
                {style.emoji} {style.label}
              </span>
              {timeLeft !== null ? (
                <span className={`text-xs font-black ${timeLeft <= 10 ? "text-orange" : "text-sky"}`}>
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                </span>
              ) : (
                <span className="w-5" />
              )}
            </div>

            <div className="mb-6 flex items-center justify-center gap-2">
              {questions.map((_, i) => {
                const answeredCorrect = answerLog[i];
                let dotClass = "border-border bg-transparent";
                if (i < answerLog.length) {
                  dotClass = answeredCorrect ? "border-green bg-green" : "border-orange bg-orange";
                } else if (i === currentIndex) {
                  dotClass = "border-pink bg-pink animate-pulse";
                }
                return (
                  <span key={i} className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 ${dotClass}`} />
                );
              })}
            </div>

            <motion.div animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
              <h1 className="heading-game mb-6 text-xl">{question.question_text}</h1>

              <div className="flex flex-col gap-3">
                {question.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrectOption = opt.is_correct;
                  let stateClass = "border-border bg-card";
                  if (selected !== null) {
                    if (isCorrectOption) stateClass = "border-green bg-green/10 shadow-glow-green";
                    else if (isSelected) stateClass = "border-orange bg-orange/10";
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={selected !== null}
                      onClick={() => handleSelect(i)}
                      className={`flex items-center justify-between rounded-xl border-3 p-3 text-left text-sm font-bold text-ink ${stateClass}`}
                    >
                      <span>{opt.text}</span>
                      {selected !== null && isCorrectOption && (
                        <Check className="h-4 w-4 shrink-0 text-green" strokeWidth={3} />
                      )}
                      {selected !== null && isSelected && !isCorrectOption && (
                        <X className="h-4 w-4 shrink-0 text-orange" strokeWidth={3} />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {selected !== null && question.explanation && (
              <div className="mt-4 rounded-xl border-3 border-sky bg-navy/60 p-3 text-sm font-bold text-text-muted">
                💡 {question.explanation}
              </div>
            )}

            {selected !== null && (
              <GradientButton variant="pink" size="lg" className="mt-6 w-full" onClick={handleNext}>
                {currentIndex + 1 < questions.length ? "Next" : "Finish"}
              </GradientButton>
            )}
          </>
        ) : (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-3 text-center">
            {stars >= 2 && <Confetti />}
            <span className="text-5xl">{stars === 3 ? "🏆" : stars === 2 ? "🎉" : stars === 1 ? "✅" : "💪"}</span>
            <h1 className="heading-game text-2xl">Quiz Complete!</h1>

            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <Star
                  key={i}
                  className={`h-9 w-9 ${i < stars ? "fill-yellow text-yellow" : "text-border"}`}
                  strokeWidth={2}
                />
              ))}
            </div>

            <p className="text-4xl font-black text-pink">
              {score}/{questions.length}
            </p>
            <p className="text-sm font-bold text-text-muted">{Math.round(pct * 100)}% correct</p>
            {submitting ? (
              <p className="text-sm font-bold text-text-muted">Saving your results...</p>
            ) : xpEarned > 0 ? (
              <p className="text-lg font-black text-yellow">+{xpEarned} XP earned!</p>
            ) : (
              <p className="text-sm font-bold text-text-muted">
                No XP this time — you&apos;ve already completed this quiz.
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
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-3 border-sky px-4 py-3 text-xs font-black uppercase text-sky"
              >
                <Share2 className="h-4 w-4" strokeWidth={3} />
                {showShare ? "Hide" : "Share"}
              </button>
              <GradientButton
                variant="sky"
                size="lg"
                className="flex-1"
                onClick={() => router.push("/quizzes")}
              >
                Done
              </GradientButton>
            </div>
          </div>
        )}

        <LevelUpModal isOpen={levelUp !== null} newLevel={levelUp ?? 1} onClose={() => setLevelUp(null)} />
      </div>
    </div>
  );
}
