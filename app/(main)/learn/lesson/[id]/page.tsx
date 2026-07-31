"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronLeft, X } from "lucide-react";
import { motion } from "framer-motion";
import { createClientSupabase } from "@/lib/supabase/client";
import { completeCurriculumLesson } from "@/lib/actions/curriculum";
import { useProfileStore } from "@/hooks/useProfile";
import { getCategoryBySlug, CURRICULUM_COLOR_CLASSES } from "@/lib/curriculum";
import { floatXP, floatCoins } from "@/lib/floatingRewards";
import Confetti from "@/components/Confetti";
import GradientButton from "@/components/ui/GradientButton";
import LevelUpModal from "@/components/LevelUpModal";

interface LessonSection {
  heading: string;
  body: string;
}

interface LessonTakeaway {
  color: "yellow" | "mint" | "coral";
  text: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface LessonContent {
  intro: string;
  sections: LessonSection[];
  takeaways?: LessonTakeaway[];
  quiz: QuizQuestion[];
}

interface LessonData {
  id: string;
  category: string;
  title: string;
  emoji: string;
  content: LessonContent;
  xp_reward: number;
  coin_reward: number;
}

const TAKEAWAY_STYLES: Record<LessonTakeaway["color"], string> = {
  yellow: "border-yellow bg-yellow/10 text-ink",
  mint: "border-green bg-green/10 text-ink",
  coral: "border-pink bg-pink/10 text-ink",
};

type Stage = "reading" | "quiz" | "done";

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState<Stage>("reading");

  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [shake, setShake] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [firstCompletion, setFirstCompletion] = useState(false);
  const [levelUp, setLevelUp] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: lessonRow } = await supabase
        .from("curriculum_lessons")
        .select("id, category, title, emoji, content, xp_reward, coin_reward")
        .eq("id", params.id)
        .maybeSingle();

      if (lessonRow && user) {
        const { data: progressRow } = await supabase
          .from("curriculum_progress")
          .select("completed")
          .eq("user_id", user.id)
          .eq("lesson_id", params.id)
          .maybeSingle();
        setAlreadyCompleted(!!progressRow?.completed);
      }

      setLesson(lessonRow as unknown as LessonData);
      setLoading(false);
    }
    load();
  }, [params.id, supabase]);

  const category = lesson ? getCategoryBySlug(lesson.category) : undefined;
  const colors = category ? CURRICULUM_COLOR_CLASSES[category.color] : CURRICULUM_COLOR_CLASSES.sky;

  function handleSelect(index: number) {
    if (selected !== null || !lesson) return;
    setSelected(index);
    const correct = index === lesson.content.quiz[qIndex].correct;
    if (correct) {
      setScore((s) => s + 1);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  async function handleNext() {
    if (!lesson) return;
    setSelected(null);

    if (qIndex + 1 < lesson.content.quiz.length) {
      setQIndex((i) => i + 1);
      return;
    }

    setStage("done");
    setSubmitting(true);
    try {
      const finalScore = score + (selected !== null && selected === lesson.content.quiz[qIndex].correct ? 1 : 0);
      const result = await completeCurriculumLesson(lesson.id, finalScore);
      setXpEarned(result.xpEarned);
      setCoinsEarned(result.coinsEarned);
      setFirstCompletion(result.firstCompletion);
      if (result.xpEarned > 0) floatXP(result.xpEarned);
      if (result.coinsEarned > 0) floatCoins(result.coinsEarned);
      refreshProfile();
      if (result.leveledUp && result.newLevel) setLevelUp(result.newLevel);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg">
        <p className="font-black uppercase text-text-muted">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
        <p className="font-black uppercase text-ink">Lesson not found</p>
        <GradientButton variant="sky" onClick={() => router.push("/learn")}>
          Back to Learn
        </GradientButton>
      </div>
    );
  }

  const question = lesson.content.quiz[qIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/learn")}
            aria-label="Back to Learn"
            className="flex h-9 w-9 items-center justify-center rounded-full border-3 border-border bg-card text-text-muted"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={3} />
          </button>
          {category && (
            <span className={`rounded-full border-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${colors.border} ${colors.text}`}>
              {category.emoji} {category.title}
            </span>
          )}
          <span className="w-9" />
        </div>

        {stage === "reading" && (
          <div className="flex flex-col gap-5 pb-24">
            <div className="text-center">
              <span className="text-5xl">{lesson.emoji}</span>
              <h1 className="heading-game mt-2 text-xl">{lesson.title}</h1>
            </div>

            <p className="rounded-2xl border-3 border-border bg-card p-4 text-sm font-bold text-ink shadow-card">
              {lesson.content.intro}
            </p>

            {lesson.content.sections.map((section, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className={`text-sm font-black uppercase tracking-wide ${colors.text}`}>{section.heading}</p>
                <p className="text-sm font-bold leading-relaxed text-ink">{section.body}</p>
              </div>
            ))}

            {lesson.content.takeaways?.map((takeaway, i) => (
              <div key={i} className={`rounded-2xl border-3 p-4 text-sm font-bold ${TAKEAWAY_STYLES[takeaway.color]}`}>
                💡 {takeaway.text}
              </div>
            ))}

            <GradientButton variant="sky" size="lg" className="mt-2 w-full" onClick={() => setStage("quiz")}>
              {alreadyCompleted ? "Retake Mini-Quiz" : "Take the Mini-Quiz →"}
            </GradientButton>
          </div>
        )}

        {stage === "quiz" && question && (
          <>
            <div className="mb-6 flex items-center justify-center gap-2">
              {lesson.content.quiz.map((_, i) => {
                let dotClass = "border-border bg-transparent";
                if (i < qIndex) dotClass = "border-green bg-green";
                else if (i === qIndex) dotClass = `${colors.border} ${colors.bg} animate-pulse`;
                return <span key={i} className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 ${dotClass}`} />;
              })}
            </div>

            <motion.div animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
              <h2 className="heading-game mb-6 text-lg">{question.question}</h2>

              <div className="flex flex-col gap-3">
                {question.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrectOption = i === question.correct;
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
                      <span>{opt}</span>
                      {selected !== null && isCorrectOption && <Check className="h-4 w-4 shrink-0 text-green" strokeWidth={3} />}
                      {selected !== null && isSelected && !isCorrectOption && <X className="h-4 w-4 shrink-0 text-orange" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {selected !== null && question.explanation && (
              <div className="mt-4 rounded-xl border-3 border-sky bg-card p-3 text-sm font-bold text-text-muted shadow-card">
                💡 {question.explanation}
              </div>
            )}

            {selected !== null && (
              <GradientButton variant="pink" size="lg" className="mt-6 w-full" onClick={handleNext}>
                {qIndex + 1 < lesson.content.quiz.length ? "Next" : "Finish"}
              </GradientButton>
            )}
          </>
        )}

        {stage === "done" && (
          <div className="relative flex flex-1 flex-col items-center justify-center gap-3 text-center">
            {firstCompletion && <Confetti />}
            <span className="text-5xl">{firstCompletion ? "🎉" : "✅"}</span>
            <h1 className="heading-game text-2xl">Lesson Complete!</h1>
            <p className="text-sm font-bold text-text-muted">
              {score}/{lesson.content.quiz.length} correct on the mini-quiz
            </p>

            {submitting ? (
              <p className="text-sm font-bold text-text-muted">Saving your progress...</p>
            ) : firstCompletion ? (
              <div className="flex flex-col items-center gap-1">
                <p className="text-lg font-black text-sky">+{xpEarned} XP earned!</p>
                <p className="text-lg font-black text-yellow">+{coinsEarned} 🪙 LinkCoins earned!</p>
              </div>
            ) : (
              <p className="text-sm font-bold text-text-muted">
                No extra rewards — you&apos;ve already completed this lesson before.
              </p>
            )}

            <GradientButton variant="sky" size="lg" className="mt-4 w-full" onClick={() => router.push("/learn")}>
              Back to Lessons
            </GradientButton>
          </div>
        )}

        <LevelUpModal isOpen={levelUp !== null} newLevel={levelUp ?? 1} onClose={() => setLevelUp(null)} />
      </div>
    </div>
  );
}
