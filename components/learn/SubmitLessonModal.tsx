"use client";

import { useState, useTransition } from "react";
import { createPost } from "@/lib/actions/posts";
import GradientButton from "@/components/ui/GradientButton";

type TemplateType = "lesson" | "quick_tip" | "poll" | "quote";

const TEMPLATES: { type: TemplateType; label: string; emoji: string; color: string }[] = [
  { type: "lesson", label: "Lesson", emoji: "📖", color: "border-pink" },
  { type: "quick_tip", label: "Quick Tip", emoji: "💡", color: "border-purple" },
  { type: "poll", label: "Poll", emoji: "📊", color: "border-orange" },
  { type: "quote", label: "Quote", emoji: "❝", color: "border-yellow" },
];

const fieldClass =
  "w-full rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted focus:border-sky focus:outline-none";

interface SubmitLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function SubmitLessonModal({ isOpen, onClose, onSubmitted }: SubmitLessonModalProps) {
  const [template, setTemplate] = useState<TemplateType | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState("");
  const [emoji, setEmoji] = useState("💡");
  const [attribution, setAttribution] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (!isOpen) return null;

  function reset() {
    setTemplate(null);
    setTitle("");
    setBody("");
    setTopic("");
    setEmoji("💡");
    setAttribution("");
    setOptions(["", ""]);
    setErrorMsg(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  function handleSubmit() {
    if (!template) return;
    setErrorMsg(null);

    let input: Parameters<typeof createPost>[0] | null = null;

    if (template === "lesson") {
      if (!title.trim() || !body.trim()) {
        setErrorMsg("Add a title and some content.");
        return;
      }
      input = {
        category: "tip",
        templateType: "lesson",
        title: title.trim(),
        body: body.trim(),
        feedType: "learn",
        metadata: { topic: topic.trim() || undefined },
      };
    } else if (template === "quick_tip") {
      if (!body.trim()) {
        setErrorMsg("Write your tip.");
        return;
      }
      input = {
        category: "tip",
        templateType: "quick_tip",
        body: body.trim(),
        feedType: "learn",
        metadata: { emoji },
      };
    } else if (template === "poll") {
      const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
      if (!title.trim() || cleanOptions.length < 2) {
        setErrorMsg("Add a question and at least 2 options.");
        return;
      }
      input = {
        category: "tip",
        templateType: "poll",
        title: title.trim(),
        feedType: "learn",
        metadata: { options: cleanOptions },
      };
    } else if (template === "quote") {
      if (!body.trim()) {
        setErrorMsg("Add the quote.");
        return;
      }
      input = {
        category: "tip",
        templateType: "quote",
        body: body.trim(),
        feedType: "learn",
        metadata: { attribution: attribution.trim() || undefined },
      };
    }

    if (!input) return;

    setSubmitting(true);
    startTransition(async () => {
      try {
        await createPost(input!);
        onSubmitted();
        handleClose();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Couldn't submit right now");
      } finally {
        setSubmitting(false);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-black/80 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-[430px] overflow-y-auto rounded-t-[24px] border-3 border-pink bg-card p-5 shadow-glow-pink sm:rounded-[24px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="heading-game text-lg">Submit a Lesson</h2>
          <button type="button" onClick={handleClose} className="text-text-muted">
            ✕
          </button>
        </div>

        {!template ? (
          <div className="grid grid-cols-2 gap-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setTemplate(t.type)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-3 ${t.color} bg-navy/40 p-4`}
              >
                <span className="text-3xl">{t.emoji}</span>
                <span className="text-xs font-black uppercase text-ink">{t.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {template === "lesson" && (
              <>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Topic (e.g. Marketing)"
                  className={fieldClass}
                />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Lesson title"
                  className={fieldClass}
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your lesson..."
                  rows={5}
                  className={fieldClass}
                />
              </>
            )}

            {template === "quick_tip" && (
              <>
                <input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value.slice(0, 4))}
                  placeholder="Emoji"
                  className={fieldClass}
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Your quick tip..."
                  rows={4}
                  className={fieldClass}
                />
              </>
            )}

            {template === "poll" && (
              <>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Poll question"
                  className={fieldClass}
                />
                {options.map((opt, i) => (
                  <input
                    key={i}
                    value={opt}
                    onChange={(e) =>
                      setOptions((prev) => prev.map((o, idx) => (idx === i ? e.target.value : o)))
                    }
                    placeholder={`Option ${i + 1}`}
                    className={fieldClass}
                  />
                ))}
                {options.length < 4 && (
                  <button
                    type="button"
                    onClick={() => setOptions((prev) => [...prev, ""])}
                    className="text-xs font-black uppercase text-sky"
                  >
                    + Add option
                  </button>
                )}
              </>
            )}

            {template === "quote" && (
              <>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="The quote..."
                  rows={3}
                  className={fieldClass}
                />
                <input
                  value={attribution}
                  onChange={(e) => setAttribution(e.target.value)}
                  placeholder="Attribution (optional)"
                  className={fieldClass}
                />
              </>
            )}

            {errorMsg && <p className="text-sm font-bold text-orange">{errorMsg}</p>}

            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setTemplate(null)}
                className="flex-1 rounded-xl border-3 border-border py-2 text-xs font-black uppercase text-text-muted"
              >
                Back
              </button>
              <GradientButton
                variant="pink"
                size="sm"
                className="flex-1"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit"}
              </GradientButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
