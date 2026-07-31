"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/lib/actions/posts";
import GradientButton from "@/components/ui/GradientButton";

type Category = "win" | "question" | "idea" | "tip" | "motivation";
type Step = "category" | "form" | "preview";

const CATEGORY_TILES: { value: Category; label: string; emoji: string; color: string }[] = [
  { value: "win", label: "Win", emoji: "🏆", color: "border-green" },
  { value: "question", label: "Question", emoji: "❓", color: "border-pink" },
  { value: "idea", label: "Idea", emoji: "💡", color: "border-orange" },
  { value: "tip", label: "Tip", emoji: "🛠️", color: "border-yellow" },
  { value: "motivation", label: "Motivation", emoji: "🚀", color: "border-purple" },
];

const fieldClass =
  "w-full rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted focus:border-sky focus:outline-none";

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
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/80 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-[430px] overflow-y-auto rounded-t-[24px] border-3 border-pink bg-card p-5 shadow-glow-pink sm:rounded-[24px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading-game text-lg">New Post</h2>
          <button type="button" onClick={handleClose} className="text-text-muted">
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
                className={`flex flex-col items-center gap-2 rounded-2xl border-3 ${t.color} bg-navy/40 p-4`}
              >
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-xs font-black uppercase text-ink">{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {step === "form" && (
          <div className="flex flex-col gap-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className={fieldClass}
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share the details..."
              rows={5}
              className={fieldClass}
            />
            {errorMsg && <p className="text-sm font-bold text-orange">{errorMsg}</p>}
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep("category")}
                className="flex-1 rounded-xl border-3 border-border py-2 text-xs font-black uppercase text-text-muted"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep("preview")}
                className="flex-1 rounded-xl border-3 border-sky bg-gradient-sky-purple py-2 text-xs font-black uppercase text-white"
              >
                Preview
              </button>
            </div>
          </div>
        )}

        {step === "preview" && tile && (
          <div className="flex flex-col gap-3">
            <div className={`rounded-[18px] border-3 ${tile.color} bg-navy/40 p-4`}>
              <span className="mb-2 inline-block rounded-full border-2 border-border px-2 py-0.5 text-[10px] font-black uppercase text-text-muted">
                {tile.emoji} {tile.label}
              </span>
              {title && <h3 className="heading-game mb-1 text-base">{title}</h3>}
              {body && <p className="text-sm font-bold text-text-muted">{body}</p>}
            </div>
            {errorMsg && <p className="text-sm font-bold text-orange">{errorMsg}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="flex-1 rounded-xl border-3 border-border py-2 text-xs font-black uppercase text-text-muted"
              >
                Edit
              </button>
              <GradientButton
                variant="pink"
                size="sm"
                className="flex-1"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Posting..." : "Post (+20 XP)"}
              </GradientButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
