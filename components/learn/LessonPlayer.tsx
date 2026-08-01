"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, ChevronRight, Lightbulb, PartyPopper } from "lucide-react";
import type { Card, QuizQuestion } from "@/lib/lessonCards";

interface LessonPlayerProps {
  cards: Card[];
  title: string;
  onExit: () => void;
  /** Called once, when the final card is passed. `score` is correct answers. */
  onComplete: (score: number, total: number) => void;
  children?: React.ReactNode;
}

const TAKEAWAY_STYLE: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: "bg-[#FEF3C7]", border: "border-[#F59E0B]", text: "text-[#92400E]" },
  mint: { bg: "bg-[#D1FAE5]", border: "border-[#10B981]", text: "text-[#065F46]" },
  coral: { bg: "bg-[#FCE7F3]", border: "border-[#EC4899]", text: "text-[#9D174D]" },
};

function QuizCard({
  question,
  onAnswered,
}: {
  question: QuizQuestion;
  onAnswered: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    onAnswered(i === question.correct);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xl font-extrabold leading-snug text-[#1E1B4B]">{question.question}</p>

      <div className="flex flex-col gap-2.5">
        {question.options.map((option, i) => {
          const isPicked = selected === i;
          const isRight = i === question.correct;
          const answered = selected !== null;

          // After answering, always reveal the correct option — getting it
          // wrong should teach, not just mark you down.
          let cls = "border-gray-200 bg-white text-[#1E1B4B]";
          if (answered && isRight) cls = "border-[#10B981] bg-[#F0FDF4] text-[#065F46]";
          else if (answered && isPicked) cls = "border-[#EC4899] bg-[#FDF2F8] text-[#9D174D]";
          else if (answered) cls = "border-gray-200 bg-white text-gray-400";

          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left text-sm font-bold transition-all ${cls} ${
                !answered ? "hover:border-[#7C3AED] active:scale-[0.98]" : ""
              }`}
            >
              <span className="flex-1">{option}</span>
              {answered && isRight && <Check className="h-5 w-5 shrink-0 text-[#10B981]" strokeWidth={3} />}
              {answered && isPicked && !isRight && <X className="h-5 w-5 shrink-0 text-[#EC4899]" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function LessonPlayer({ cards, title, onExit, onComplete }: LessonPlayerProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answeredThisCard, setAnsweredThisCard] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);

  const card = cards[index];
  const isQuiz = card?.kind === "quiz";
  const total = cards.length;
  const quizTotal = cards.filter((c) => c.kind === "quiz").length;

  // A quiz card blocks Continue until it's been answered; everything else is
  // always advanceable.
  const canAdvance = !isQuiz || answeredThisCard;

  const advance = useCallback(() => {
    if (!canAdvance) return;
    if (index + 1 >= total) {
      setFinished(true);
      onComplete(score, quizTotal);
      return;
    }
    setIndex((i) => i + 1);
    setAnsweredThisCard(false);
    setLastCorrect(null);
  }, [canAdvance, index, total, onComplete, score, quizTotal]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (finished) return;
      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advance();
      }
      if (e.key === "ArrowLeft" && index > 0) {
        setIndex((i) => i - 1);
        setAnsweredThisCard(false);
        setLastCorrect(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, index, finished]);

  function handleAnswered(correct: boolean) {
    setAnsweredThisCard(true);
    setLastCorrect(correct);
    if (correct) setScore((s) => s + 1);
  }

  if (finished) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-bg p-6 text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 220 }}
          className="grad-brand flex h-24 w-24 items-center justify-center rounded-full"
        >
          <PartyPopper className="h-12 w-12 text-white" strokeWidth={2} />
        </motion.div>

        <h2 className="mt-6 text-3xl font-extrabold text-[#1E1B4B]">Lesson complete</h2>
        <p className="mt-1 max-w-xs text-sm text-gray-500">{title}</p>

        {quizTotal > 0 && (
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white px-8 py-4">
            <p className="text-3xl font-extrabold text-[#7C3AED]">
              {score}/{quizTotal}
            </p>
            <p className="text-xs font-semibold text-gray-400">questions right</p>
          </div>
        )}

        <button
          type="button"
          onClick={onExit}
          className="grad-brand mt-8 w-full max-w-xs rounded-full px-8 py-4 text-base font-extrabold text-white transition-transform active:scale-95"
        >
          Keep going →
        </button>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-bg">
      {/* Progress — Duolingo's single most-copied element. Tells you how much
          is left, which is the main thing that stops a lesson feeling endless. */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit lesson"
          className="shrink-0 text-gray-400 transition-colors hover:text-gray-600"
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
          <motion.div
            className="grad-brand h-3 rounded-full"
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <span className="shrink-0 text-xs font-bold text-gray-400">
          {index + 1}/{total}
        </span>
      </div>

      {/* Card */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            {card.kind === "intro" && (
              <div className="text-center">
                <span className="text-6xl">{card.emoji}</span>
                <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[#1E1B4B]">{card.title}</h1>
                <p className="mt-3 text-base leading-relaxed text-gray-600">{card.body}</p>
              </div>
            )}

            {card.kind === "text" && (
              <div>
                {card.heading && (
                  <h2 className="mb-3 text-2xl font-extrabold leading-tight text-[#7C3AED]">{card.heading}</h2>
                )}
                <p className="text-lg leading-relaxed text-[#1E1B4B]">{card.body}</p>
              </div>
            )}

            {card.kind === "takeaway" && (
              <div
                className={`rounded-3xl border-2 p-6 ${TAKEAWAY_STYLE[card.color]?.bg ?? "bg-[#FEF3C7]"} ${
                  TAKEAWAY_STYLE[card.color]?.border ?? "border-[#F59E0B]"
                }`}
              >
                <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider">
                  <Lightbulb className="h-4 w-4" strokeWidth={2.5} />
                  Remember this
                </p>
                <p className={`text-lg font-bold leading-relaxed ${TAKEAWAY_STYLE[card.color]?.text ?? ""}`}>
                  {card.body}
                </p>
              </div>
            )}

            {card.kind === "quiz" && <QuizCard question={card.question} onAnswered={handleAnswered} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback sheet slides up over the Continue bar once a question is answered */}
      <AnimatePresence>
        {isQuiz && answeredThisCard && lastCorrect !== null && (
          <motion.div
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className={`px-5 pb-3 pt-4 ${lastCorrect ? "bg-[#F0FDF4]" : "bg-[#FDF2F8]"}`}
          >
            <div className="mx-auto max-w-lg">
              <p
                className={`flex items-center gap-2 text-base font-extrabold ${
                  lastCorrect ? "text-[#065F46]" : "text-[#9D174D]"
                }`}
              >
                {lastCorrect ? <Check className="h-5 w-5" strokeWidth={3} /> : <Lightbulb className="h-5 w-5" strokeWidth={2.5} />}
                {lastCorrect ? "Nice one" : "Not quite — here's why"}
              </p>
              <p className={`mt-1 text-sm leading-relaxed ${lastCorrect ? "text-[#065F46]" : "text-[#9D174D]"}`}>
                {(card as Extract<Card, { kind: "quiz" }>).question.explanation}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue */}
      <div className="border-t border-gray-200 bg-white px-5 py-4">
        <button
          type="button"
          onClick={advance}
          disabled={!canAdvance}
          className={`mx-auto flex w-full max-w-lg items-center justify-center gap-2 rounded-full py-4 text-base font-extrabold text-white transition-all active:scale-[0.98] ${
            canAdvance ? "grad-brand" : "cursor-not-allowed bg-gray-200 text-gray-400"
          }`}
        >
          {canAdvance ? (
            <>
              {index + 1 >= total ? "Finish" : "Continue"}
              <ChevronRight className="h-5 w-5" strokeWidth={3} />
            </>
          ) : (
            "Pick an answer"
          )}
        </button>
      </div>
    </div>
  );
}
