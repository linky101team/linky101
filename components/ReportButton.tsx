"use client";

import { useState, useTransition } from "react";
import { Flag } from "lucide-react";
import { submitReport, type ReportedType, type ReportCategory } from "@/lib/actions/reports";

const CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: "inappropriate", label: "Inappropriate" },
  { value: "bullying", label: "Bullying" },
  { value: "spam", label: "Spam" },
  { value: "personal_info", label: "Personal info shared" },
  { value: "uncomfortable", label: "Makes me uncomfortable" },
  { value: "other", label: "Other" },
];

interface ReportButtonProps {
  reportedType: ReportedType;
  reportedId: string;
  className?: string;
}

export default function ReportButton({ reportedType, reportedId, className = "" }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [, startTransition] = useTransition();

  function reset() {
    setOpen(false);
    setCategory(null);
    setDescription("");
    setSubmitted(false);
  }

  function handleSubmit() {
    if (!category) return;
    setSubmitting(true);
    startTransition(async () => {
      try {
        await submitReport(reportedType, reportedId, category, description);
        setSubmitted(true);
      } catch {
        // Keep this low-friction for the reporter — fail silently rather
        // than blocking them with an error dialog.
      } finally {
        setSubmitting(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Report"
        className={`text-gray-300 hover:text-gray-500 ${className}`}
      >
        <Flag className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 px-6"
          onClick={reset}
        >
          <div
            className="w-full max-w-[360px] rounded-2xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {submitted ? (
              <div className="text-center">
                <p className="mb-1 text-2xl">✅</p>
                <p className="font-bold text-gray-900">Report sent</p>
                <p className="mt-1 text-sm text-gray-500">
                  Our team will take a look. Thanks for helping keep LinkY101 safe.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-4 w-full rounded-full border border-gray-200 py-2.5 text-sm font-bold text-gray-600 transition-transform active:scale-[0.98]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <p className="mb-3 font-bold text-gray-900">Report this</p>
                <div className="mb-3 flex flex-col gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className={`rounded-xl border p-2.5 text-left text-sm font-medium transition-colors ${
                        category === c.value
                          ? "border-[#FF6B6B] bg-[#FFF0F0] text-[#FF6B6B]"
                          : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 500))}
                  placeholder="Add details (optional)"
                  rows={3}
                  className="mb-3 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#FF6B6B] focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-bold text-gray-500 transition-transform active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!category || submitting}
                    onClick={handleSubmit}
                    className="flex-1 rounded-full bg-[#FF6B6B] py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
                  >
                    {submitting ? "Sending..." : "Submit"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
