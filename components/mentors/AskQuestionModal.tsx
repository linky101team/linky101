"use client";

import { useState, useTransition } from "react";
import { askQuestion } from "@/lib/actions/mentors";
import type { Mentor } from "./MentorCard";

const QUESTION_MAX = 500;

interface AskQuestionModalProps {
  isOpen: boolean;
  mentors: Mentor[];
  onClose: () => void;
  onSubmitted: () => void;
}

export default function AskQuestionModal({ isOpen, mentors, onClose, onSubmitted }: AskQuestionModalProps) {
  const [text, setText] = useState("");
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (!isOpen) return null;

  function reset() {
    setText("");
    setMentorId(null);
    setErrorMsg(null);
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
        await askQuestion(text, mentorId);
        onSubmitted();
        reset();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Couldn't send your question");
      } finally {
        setSubmitting(false);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">❓ Ask a question</h2>
          <button
            type="button"
            onClick={reset}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform active:scale-90"
          >
            ✕
          </button>
        </div>

        {mentors.length > 0 && (
          <>
            <label className="mb-1 block text-xs font-semibold text-gray-500">
              Tag a specific mentor (optional)
            </label>
            <select
              value={mentorId ?? ""}
              onChange={(e) => setMentorId(e.target.value || null)}
              className="mb-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#039BE5] focus:outline-none"
            >
              <option value="">Open to any mentor</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.display_name}
                </option>
              ))}
            </select>
          </>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, QUESTION_MAX))}
          placeholder="What would you love to know from a real founder?"
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#039BE5] focus:outline-none focus:ring-1 focus:ring-[#039BE5]"
        />
        <p className="mb-3 text-right text-xs font-semibold text-gray-400">
          {text.length}/{QUESTION_MAX}
        </p>

        {errorMsg && <p className="mb-3 text-sm font-semibold text-[#FF6B6B]">{errorMsg}</p>}

        <button
          type="button"
          disabled={submitting}
          onClick={handleSubmit}
          className="w-full rounded-full bg-[#1A1A2E] py-3 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
        >
          {submitting ? "Sending..." : "Send question"}
        </button>
      </div>
    </div>
  );
}
