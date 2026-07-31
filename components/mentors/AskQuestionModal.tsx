"use client";

import { useState, useTransition } from "react";
import { askQuestion } from "@/lib/actions/mentors";
import GradientButton from "@/components/ui/GradientButton";
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
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/80 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-[430px] overflow-y-auto rounded-t-[24px] border-3 border-sky bg-card p-5 shadow-glow-sky sm:rounded-[24px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading-game text-lg">Ask a Question</h2>
          <button type="button" onClick={reset} className="text-text-muted">
            ✕
          </button>
        </div>

        <label className="mb-1 block text-xs font-black uppercase tracking-wide text-text-muted">
          Tag a specific mentor (optional)
        </label>
        <select
          value={mentorId ?? ""}
          onChange={(e) => setMentorId(e.target.value || null)}
          className="mb-3 w-full rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink focus:border-sky focus:outline-none"
        >
          <option value="">Open to any mentor</option>
          {mentors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.display_name}
            </option>
          ))}
        </select>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, QUESTION_MAX))}
          placeholder="What do you want to ask?"
          rows={4}
          className="w-full rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted focus:border-sky focus:outline-none"
        />
        <p className="mb-3 text-right text-xs font-bold text-text-muted">
          {text.length}/{QUESTION_MAX}
        </p>

        {errorMsg && <p className="mb-3 text-sm font-bold text-orange">{errorMsg}</p>}

        <GradientButton variant="sky" className="w-full" disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Sending..." : "Send Question"}
        </GradientButton>
      </div>
    </div>
  );
}
