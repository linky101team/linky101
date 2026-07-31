"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronLeft, X } from "lucide-react";
import { motion } from "framer-motion";
import { createClientSupabase } from "@/lib/supabase/client";
import { completeCurriculumLesson } from "@/lib/actions/curriculum";
import { useProfileStore } from "@/hooks/useProfile";
import { getCategoryBySlug, CURRICULUM_COLOR_CLASSES } from "@/lib/curriculum";
import GradientButton from "@/components/ui/GradientButton";

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
  yellow: "border-[#FFD93D] bg-[#FFFDE7]",
  mint: "border-[#4ECDC4] bg-[#E8F5E9]",
  coral: "border-[#FF6B6B] bg-[#FFF0F0]",
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
  const [firstCompletion, setFirstCompletion] = useState(false);

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
      setFirstCompletion(result.firstCompletion);
      refreshProfile();
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#B3E5FC]">
        <p className="font-semibold text-gray-500">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#B3E5FC] p-6 text-center">
        <p className="font-bold text-gray-900">Lesson not found</p>
        <GradientButton variant="sky" onClick={() => router.push("/learn")}>
          Back to Learn
        </GradientButton>
      </div>
    );
  }

  const question = lesson.content.quiz[qIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#B3E5FC]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 py-6">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/learn")}
            aria-label="Back to Learn"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
          {category && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors.bgLight} ${colors.text}`}>
              {category.emoji} {category.title}
            </span>
          )}
          <span className="w-9" />
        </div>

        {stage === "reading" && (
          <div className="flex flex-col gap-5 pb-24">
            <div className="text-center">
              <span className="text-5xl">{lesson.emoji}</span>
              <h1 className="mt-2 text-xl font-bold text-gray-900">{lesson.title}</h1>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700 shadow-sm">
              {lesson.content.intro}
            </div>

            {lesson.content.sections.map((section, i) => (
              <div key={i} className="flex flex-col gap-1">
                <p className={`text-sm font-bold ${colors.text}`}>{section.heading}</p>
                <p className="text-sm leading-relaxed text-gray-700">{section.body}</p>
              </div>
            ))}

            {lesson.content.takeaways?.map((takeaway, i) => (
              <div key={i} className={`rounded-xl border p-4 text-sm text-gray-700 ${TAKEAWAY_STYLES[takeaway.color]}`}>
                {takeaway.text}
              </div>
            ))}

            <GradientButton variant="sky" size="lg" className="mt-2 w-full" onClick={() => setStage("quiz")}>
              {alreadyCompleted ? "Retake Mini-Quiz" : "Take the Mini-Quiz"}
            </GradientButton>
          </div>
        )}

        {stage === "quiz" && question && (
          <>
            <div className="mb-6 flex items-center justify-center gap-2">
              {lesson.content.quiz.map((_, i) => {
                let dotClass = "border-gray-200 bg-transparent";
                if (i < qIndex) dotClass = "border-[#2ECC71] bg-[#2ECC71]";
                else if (i === qIndex) dotClass = `border-gray-300 ${colors.bg} animate-pulse`;
                return <span key={i} className={`h-2.5 w-2.5 shrink-0 rounded-full border-2 ${dotClass}`} />;
              })}
            </div>

            <motion.div animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : { x: 0 }} transition={{ duration: 0.4 }}>
              <h2 className="mb-6 text-lg font-bold text-gray-900">{question.question}</h2>

              <div className="flex flex-col gap-3">
                {question.options.map((opt, i) => {
                  const isSelected = selected === i;
                  const isCorrectOption = i === question.correct;
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
                      className={`flex items-center justify-between rounded-xl border p-3 text-left text-sm font-medium text-gray-900 transition-colors ${stateClass}`}
                    >
                      <span>{opt}</span>
                      {selected !== null && isCorrectOption && <Check className="h-4 w-4 shrink-0 text-[#2ECC71]" strokeWidth={2.5} />}
                      {selected !== null && isSelected && !isCorrectOption && <X className="h-4 w-4 shrink-0 text-[#FF6B6B]" strokeWidth={2.5} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>

            {selected !== null && question.explanation && (
              <div className="mt-4 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-600 shadow-sm">
                {question.explanation}
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
            <span className="text-5xl">{firstCompletion ? "🎉" : "✅"}</span>
            <h1 className="text-2xl font-bold text-gray-900">Lesson Complete!</h1>
            <p className="text-sm text-gray-500">
              {score}/{lesson.content.quiz.length} correct on the mini-quiz
            </p>

            {submitting ? (
              <p className="text-sm text-gray-500">Saving your progress...</p>
            ) : firstCompletion ? (
              <p className="text-sm font-semibold text-[#2ECC71]">Great job! Progress saved.</p>
            ) : (
              <p className="text-sm text-gray-500">
                You&apos;ve already completed this lesson before.
              </p>
            )}

            <GradientButton variant="sky" size="lg" className="mt-4 w-full" onClick={() => router.push("/learn")}>
              Back to Lessons
            </GradientButton>
          </div>
        )}
      </div>
    </div>
  );
}
