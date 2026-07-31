"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import ReportButton from "@/components/ReportButton";
import { rateMentor } from "@/lib/actions/mentors";

export interface MentorQuestion {
  id: string;
  question_text: string;
  answer_text: string | null;
  asked_by: string;
  mentor_id: string | null;
  answered_by: string | null;
  created_at: string;
  asker: { first_name: string } | null;
  answerer: { display_name: string } | null;
}

interface QuestionCardProps {
  question: MentorQuestion;
  currentUserId?: string;
  alreadyRated?: boolean;
}

export default function QuestionCard({ question, currentUserId, alreadyRated }: QuestionCardProps) {
  const answered = !!question.answer_text;
  const canRate = answered && currentUserId === question.asked_by && question.answered_by && !alreadyRated;

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
    <div
      className={`rounded-[18px] border-3 bg-card p-4 ${
        answered ? "border-green shadow-glow-green" : "border-border"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-black text-pink">{question.asker?.first_name ?? "Member"} asked:</span>
        <ReportButton reportedType="profile" reportedId={question.asked_by} />
      </div>
      <p className="mb-3 text-sm font-bold text-ink">{question.question_text}</p>

      {answered ? (
        <div className="rounded-xl border-3 border-green bg-navy/40 p-3">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-xs font-black uppercase text-green">
              ✅ {question.answerer?.display_name ?? "A mentor"} answered:
            </span>
            {question.answered_by && <ReportButton reportedType="mentor" reportedId={question.answered_by} />}
          </div>
          <p className="text-sm font-bold text-text-muted">{question.answer_text}</p>

          {(canRate || rated) && (
            <div className="mt-3 flex items-center gap-2 border-t-3 border-border pt-2">
              <span className="text-[10px] font-black uppercase text-text-muted">
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
                        star <= (hoverStar || submittedRating) ? "fill-yellow text-yellow" : "text-border"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <span className="inline-block rounded-full border-2 border-border px-2 py-0.5 text-[10px] font-black uppercase text-text-muted">
          ⏳ Waiting for a mentor
        </span>
      )}
    </div>
  );
}
