"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import ReportButton from "@/components/ReportButton";
import { rateMentor } from "@/lib/actions/mentors";

export interface MentorQuestion {
  id: string;
  question_text: string;
  answer_text: string | null;
  /** Absent on the public weekly feed — that query never joins the asker. */
  asked_by?: string;
  mentor_id: string | null;
  answered_by: string | null;
  created_at: string;
  asker?: { first_name: string } | null;
  answerer: { display_name: string } | null;
}

interface QuestionCardProps {
  question: MentorQuestion;
  currentUserId?: string;
  alreadyRated?: boolean;
  /**
   * Weekly-feed mode: show the question and answer with nothing that could
   * identify who asked. Not a styling choice — the feed query doesn't select
   * the asker at all, so there is nothing here to leak even by accident.
   */
  anonymous?: boolean;
}

export default function QuestionCard({
  question,
  currentUserId,
  alreadyRated,
  anonymous = false,
}: QuestionCardProps) {
  const answered = !!question.answer_text;
  const canRate =
    !anonymous && answered && currentUserId === question.asked_by && question.answered_by && !alreadyRated;

  const [rated, setRated] = useState(!!alreadyRated);
  const [hoverStar, setHoverStar] = useState(0);
  const [submittedRating, setSubmittedRating] = useState(0);
  const [, startTransition] = useTransition();

  function handleRate(star: number) {
    if (!canRate || rated) return;
    setSubmittedRating(star);
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
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-gray-500">
          {anonymous ? "A member asked" : "You asked"}
        </span>
        {!anonymous && !answered && (
          <span className="rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-[10px] font-bold text-[#92400E]">
            Waiting for a mentor
          </span>
        )}
        {!anonymous && question.asked_by && (
          <ReportButton reportedType="profile" reportedId={question.asked_by} />
        )}
      </div>
      <p className="mb-3 font-semibold leading-snug text-gray-900">{question.question_text}</p>

      {answered ? (
        <div className="rounded-xl bg-[#E8F5E9] p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#1E8E5A]">
              ✅ {question.answerer?.display_name ?? "A mentor"} answered
            </span>
            {question.answered_by && <ReportButton reportedType="mentor" reportedId={question.answered_by} />}
          </div>
          <p className="text-sm leading-relaxed text-gray-700">{question.answer_text}</p>

          {(canRate || rated) && (
            <div className="mt-3 flex items-center gap-2 border-t border-[#CDEBD9] pt-2">
              <span className="text-[11px] font-semibold text-gray-500">
                {rated ? "Rated" : "Rate this answer"}
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
                        star <= (hoverStar || submittedRating)
                          ? "fill-[#FFC107] text-[#FFC107]"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-gray-500">
          ⏳ Waiting for an answer
        </span>
      )}
    </div>
  );
}
