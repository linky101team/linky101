"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { createClientSupabase } from "@/lib/supabase/client";
import { submitFeedback } from "@/lib/actions/feedback";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

const CATEGORIES = [
  { value: "bug", label: "🐛 Bug Report" },
  { value: "feature_request", label: "💡 Feature Idea" },
  { value: "account_help", label: "🔐 Account Help" },
  { value: "safety_concern", label: "🛡️ Safety Concern" },
  { value: "other", label: "💬 Other" },
];

const SUBJECT_MAX = 100;
const MESSAGE_MAX = 1000;

interface FeedbackRow {
  id: string;
  category: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string | null;
  created_at: string;
}

const STATUS_STYLE: Record<string, string> = {
  pending: "border-border text-text-muted",
  in_progress: "border-sky text-sky",
  resolved: "border-green text-green",
};

export default function FeedbackPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<FeedbackRow[]>([]);
  const [, startTransition] = useTransition();

  async function loadHistory() {
    if (!profile) return;
    const { data } = await supabase
      .from("feedback")
      .select("id, category, subject, message, status, admin_response, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false });
    setHistory((data as FeedbackRow[]) ?? []);
  }

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  function handleSubmit() {
    if (!subject.trim() || !message.trim()) {
      setErrorMsg("Please fill in both a subject and a message.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    setSuccess(false);
    startTransition(async () => {
      try {
        await submitFeedback(category, subject, message);
        setSubject("");
        setMessage("");
        setSuccess(true);
        await loadHistory();
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Couldn't send your message");
      } finally {
        setSubmitting(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <SectionTitle emoji="💬" title="Contact & Feedback" actionLabel="FAQ" actionHref="/help" />

      <GameCard borderColor="pink" glowColor="pink" className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`rounded-full border-3 px-3 py-1.5 text-xs font-black uppercase tracking-wide ${
                category === c.value ? "border-pink bg-pink text-white shadow-glow-pink" : "border-border text-text-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value.slice(0, SUBJECT_MAX))}
          placeholder="Subject"
          className="w-full rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted focus:border-sky focus:outline-none"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
          rows={5}
          placeholder="Tell us what's going on..."
          className="w-full rounded-xl border-3 border-border bg-white px-3 py-2 text-sm font-bold text-ink placeholder:text-text-muted focus:border-sky focus:outline-none"
        />
        <p className="text-right text-[10px] font-bold text-text-muted">{message.length}/{MESSAGE_MAX}</p>

        {errorMsg && <p className="text-xs font-bold text-orange">{errorMsg}</p>}
        {success && <p className="text-xs font-bold text-green">✅ Sent! We read everything.</p>}

        <GradientButton variant="pink" className="w-full" disabled={submitting} onClick={handleSubmit}>
          {submitting ? "Sending..." : "Send Message"}
        </GradientButton>
      </GameCard>

      {history.length > 0 && (
        <div>
          <p className="mb-3 font-black uppercase tracking-wide text-ink">Your Messages</p>
          <div className="flex flex-col gap-2">
            {history.map((f) => (
              <GameCard key={f.id} borderColor="border">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-sm font-black text-ink">{f.subject}</span>
                  <span
                    className={`shrink-0 rounded-full border-2 px-2 py-0.5 text-[9px] font-black uppercase ${
                      STATUS_STYLE[f.status] ?? STATUS_STYLE.pending
                    }`}
                  >
                    {f.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mb-1 text-xs font-bold text-text-muted">{f.message}</p>
                {f.admin_response && (
                  <div className="mt-2 rounded-xl border-3 border-green bg-green/10 p-2">
                    <p className="text-[10px] font-black uppercase text-green">LinkY101 Team:</p>
                    <p className="text-xs font-bold text-text-muted">{f.admin_response}</p>
                  </div>
                )}
              </GameCard>
            ))}
          </div>
        </div>
      )}

      <p className="text-center text-xs font-bold text-text-muted">
        Looking for quick answers? Check the <Link href="/help" className="text-sky">FAQ</Link> first.
      </p>
    </div>
  );
}
