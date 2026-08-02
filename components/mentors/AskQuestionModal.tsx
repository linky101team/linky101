"use client";

import { useState, useTransition } from "react";
import { Check, Lock, X } from "lucide-react";
import { askQuestion } from "@/lib/actions/mentors";

const QUESTION_MAX = 500;

interface AskQuestionModalProps {
  isOpen: boolean;
  /** How many this member has left this week, for the counter. */
  questionsLeft: number;
  onClose: () => void;
  onSubmitted: () => void;
}

/**
 * One box. No mentor picker.
 *
 * Questions go to the whole pool, so nobody forms a one-to-one relationship
 * with a named adult, and a question doesn't die because one volunteer is
 * away. They save privately; only the answers chosen for the weekly feed are
 * ever shown to other members, and those have the asker's name stripped.
 */
export default function AskQuestionModal({
  isOpen,
  questionsLeft,
  onClose,
  onSubmitted,
}: AskQuestionModalProps) {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (!isOpen) return null;

  const outOfQuestions = questionsLeft <= 0;

  function reset() {
    setText("");
    setErrorMsg(null);
    setSent(false);
    onClose();
  }

  function handleSubmit() {
    if (!text.trim()) {
      setErrorMsg("Write your question first.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await askQuestion(text);
        onSubmitted();
        setSent(true);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Couldn't send your question");
      } finally {
        setSubmitting(false);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-[460px] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
        {sent ? (
          <div className="py-6 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#D1FAE5]">
              <Check className="h-8 w-8 text-[#047857]" strokeWidth={3} />
            </span>
            <p className="mt-4 text-lg font-extrabold text-[#1E1B4B]">Sent to the mentors</p>
            <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-gray-500">
              It&apos;s in the queue. You&apos;ll get a notification the moment someone
              answers — usually within a week.
            </p>
            <button
              type="button"
              onClick={reset}
              className="grad-brand mt-5 w-full rounded-full py-3.5 text-sm font-extrabold text-white transition-transform active:scale-[0.98]"
            >
              Done
            </button>
          </div>
        ) : (
        <>
        <div className="mb-1 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#1E1B4B]">Ask all our mentors</h2>
            <p className="text-sm text-gray-500">
              Five verified adults see it. Whoever knows the answer replies.
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform active:scale-90"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, QUESTION_MAX))}
          disabled={outOfQuestions}
          placeholder="What do you actually want to know? Be specific — you'll get a better answer."
          rows={5}
          className="mt-4 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#7C3AED] focus:outline-none focus:ring-1 focus:ring-[#7C3AED] disabled:bg-gray-50"
        />
        <div className="mb-3 flex items-center justify-between text-xs font-semibold">
          <span className={outOfQuestions ? "text-[#DC2626]" : "text-gray-400"}>
            {questionsLeft} question{questionsLeft === 1 ? "" : "s"} left this week
          </span>
          <span className="text-gray-400">
            {text.length}/{QUESTION_MAX}
          </span>
        </div>

        {/*
          Says exactly who can see it. Deliberately avoids the word "private",
          because a 13-year-old reads that as "nobody", and that isn't true —
          a named adult reads everything on this platform.
        */}
        <div className="mb-4 flex gap-2.5 rounded-2xl bg-[#F3E8FF] p-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-[#7C3AED]" strokeWidth={2.5} />
          <p className="text-xs leading-relaxed text-[#5B21B6]">
            Other members won&apos;t see this. Only the mentors and the LinkY101 team can.
            If yours is one of the best questions that week we may share the answer on
            the feed with your name taken off — we&apos;ll never show who asked.
          </p>
        </div>

        {errorMsg && (
          <p className="mb-3 rounded-xl bg-[#FEF2F2] p-3 text-sm font-semibold leading-relaxed text-[#B91C1C]">
            {errorMsg}
          </p>
        )}

        <button
          type="button"
          disabled={submitting || outOfQuestions}
          onClick={handleSubmit}
          className="grad-brand w-full rounded-full py-3.5 text-sm font-extrabold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {outOfQuestions
            ? "No questions left this week"
            : submitting
              ? "Sending..."
              : "Send to the mentors"}
        </button>
        </>
        )}
      </div>
    </div>
  );
}
