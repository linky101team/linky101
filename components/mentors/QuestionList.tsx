"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Hourglass, Star } from "lucide-react";
import { rateMentor } from "@/lib/actions/mentors";
import type { MentorQuestion } from "@/components/mentors/QuestionCard";

/**
 * Questions as collapsed one-line rows.
 *
 * The first version stacked full cards, which meant a member with a term's
 * worth of questions had to scroll past all of them to find anything. Here
 * each question is a single row you can scan, and you open the one you want.
 * Anything still waiting stays closed and quiet; answers are one tap away.
 */
interface QuestionListProps {
  questions: MentorQuestion[];
  currentUserId?: string;
  ratedIds?: Set<string>;
  /** Weekly-feed mode: no names, no rating, nothing identifying. */
  anonymous?: boolean;
  emptyTitle: string;
  emptyBody: string;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function QuestionList({
  questions,
  currentUserId,
  ratedIds,
  anonymous = false,
  emptyTitle,
  emptyBody,
}: QuestionListProps) {
  // Answered questions open first — that's what someone came back to read.
  const [openId, setOpenId] = useState<string | null>(
    questions.find((q) => q.answer_text)?.id ?? null
  );

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <p className="font-bold text-[#1E1B4B]">{emptyTitle}</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {questions.map((q, i) => {
        const answered = !!q.answer_text;
        const open = openId === q.id;
        return (
          <div key={q.id} className={i > 0 ? "border-t border-gray-100" : ""}>
            <button
              type="button"
              onClick={() => setOpenId(open ? null : q.id)}
              className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-gray-50"
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  answered ? "bg-[#D1FAE5]" : "bg-[#FEF3C7]"
                }`}
              >
                {answered ? (
                  <Check className="h-4 w-4 text-[#047857]" strokeWidth={3} />
                ) : (
                  <Hourglass className="h-3.5 w-3.5 text-[#92400E]" strokeWidth={2.5} />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[#1E1B4B]">
                  {q.question_text}
                </span>
                <span className="block text-[11px] font-semibold text-gray-400">
                  {answered
                    ? `${q.answerer?.display_name ?? "A mentor"} replied`
                    : "Waiting for a mentor"}
                  {" · "}
                  {shortDate(q.created_at)}
                </span>
              </span>

              <ChevronDown
                className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                strokeWidth={2.5}
              />
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 pb-3.5">
                    <p className="mb-2.5 text-sm leading-relaxed text-gray-700">
                      {q.question_text}
                    </p>
                    {answered ? (
                      <AnswerBlock
                        question={q}
                        currentUserId={currentUserId}
                        alreadyRated={ratedIds?.has(q.id)}
                        anonymous={anonymous}
                      />
                    ) : (
                      <p className="rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
                        Sitting with the mentors now. You&apos;ll get a notification the
                        moment one of them replies.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function AnswerBlock({
  question,
  currentUserId,
  alreadyRated,
  anonymous,
}: {
  question: MentorQuestion;
  currentUserId?: string;
  alreadyRated?: boolean;
  anonymous: boolean;
}) {
  const [rated, setRated] = useState(!!alreadyRated);
  const [hoverStar, setHoverStar] = useState(0);
  const [submitted, setSubmitted] = useState(0);
  const [, startTransition] = useTransition();

  const canRate =
    !anonymous &&
    !rated &&
    !!question.answered_by &&
    currentUserId === question.asked_by;

  function handleRate(star: number) {
    if (!canRate) return;
    setSubmitted(star);
    setRated(true);
    startTransition(async () => {
      try {
        await rateMentor(question.id, question.answered_by as string, star);
      } catch {
        setRated(false);
      }
    });
  }

  return (
    <div className="rounded-xl bg-[#ECFDF5] p-3">
      <p className="mb-1 text-xs font-bold text-[#047857]">
        {question.answerer?.display_name ?? "A mentor"} answered
      </p>
      <p className="text-sm leading-relaxed text-gray-700">{question.answer_text}</p>

      {(canRate || rated) && (
        <div className="mt-2.5 flex items-center gap-2 border-t border-[#A7F3D0] pt-2">
          <span className="text-[11px] font-semibold text-gray-500">
            {rated ? "Rated" : "Was this helpful?"}
          </span>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                disabled={rated}
                onMouseEnter={() => !rated && setHoverStar(star)}
                onMouseLeave={() => setHoverStar(0)}
                onClick={() => handleRate(star)}
                aria-label={`Rate ${star} stars`}
              >
                <Star
                  className={`h-4 w-4 ${
                    star <= (hoverStar || submitted)
                      ? "fill-[#F59E0B] text-[#F59E0B]"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
