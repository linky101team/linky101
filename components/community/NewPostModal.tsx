"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/lib/actions/posts";

type Category = "win" | "question" | "idea" | "tip" | "motivation";
type Step = "category" | "form";

const CATEGORY_TILES: { value: Category; label: string; emoji: string; bg: string }[] = [
  { value: "win", label: "Win", emoji: "🏆", bg: "bg-[#E8F5E9]" },
  { value: "question", label: "Question", emoji: "❓", bg: "bg-[#E3F2FD]" },
  { value: "idea", label: "Idea", emoji: "💡", bg: "bg-[#FFF8E1]" },
  { value: "tip", label: "Tip", emoji: "🛠️", bg: "bg-[#FFF0F0]" },
  { value: "motivation", label: "Motivation", emoji: "🚀", bg: "bg-[#F3E8FF]" },
];

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#039BE5] focus:outline-none focus:ring-1 focus:ring-[#039BE5]";

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function NewPostModal({ isOpen, onClose, onSubmitted }: NewPostModalProps) {
  const [step, setStep] = useState<Step>("category");
  const [category, setCategory] = useState<Category | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (!isOpen) return null;

  function reset() {
    setStep("category");
    setCategory(null);
    setTitle("");
    setBody("");
    setErrorMsg(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!category) return;
    if (!title.trim() && !body.trim()) {
      setErrorMsg("Add a title or some details.");
      return;
    }
    setSubmitting(true);
    startTransition(async () => {
      try {
        await createPost({
          category,
          templateType: "post",
          title: title.trim() || undefined,
          body: body.trim() || undefined,
          feedType: "community",
        });
        onSubmitted();
        handleClose();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Couldn't post right now");
      } finally {
        setSubmitting(false);
      }
    });
  }

  const tile = CATEGORY_TILES.find((t) => t.value === category);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/50 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {step === "category" ? "What are you sharing?" : `${tile?.emoji} New ${tile?.label}`}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-transform active:scale-90"
          >
            ✕
          </button>
        </div>

        {step === "category" && (
          <div className="grid grid-cols-2 gap-3">
            {CATEGORY_TILES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setCategory(t.value);
                  setStep("form");
                }}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition-transform active:scale-95 ${t.bg}`}
              >
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-sm font-bold text-gray-900">{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === "form" && (
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give it a title..."
              className={fieldClass}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share the details — what happened, what do you need?"
              rows={5}
              className={fieldClass}
            />
            {errorMsg && <p className="text-sm font-semibold text-[#FF6B6B]">{errorMsg}</p>}
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setStep("category")}
                className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-bold text-gray-500 transition-transform active:scale-[0.98]"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex-1 rounded-full bg-[#1A1A2E] py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
              >
                {submitting ? "Posting..." : "Post it 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
