"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { postMentorAnswer, setAnswerPublished } from "@/lib/actions/mentors";
import SectionTitle from "@/components/ui/SectionTitle";

/**
 * Where mentor answers get posted.
 *
 * Mentors have no logins on purpose, so their replies arrive by email or
 * message and a named adult types them in here under the right name. That
 * keeps a human reading everything before it is published and means no mentor
 * ever has a private line to a member.
 */

interface Question {
  id: string;
  question_text: string;
  answer_text: string | null;
  answered_by: string | null;
  is_published: boolean;
  created_at: string;
  asker: { first_name: string | null; name: string | null } | null;
}

interface MentorOption {
  id: string;
  display_name: string;
}

function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

export default function AdminQuestionsPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mentors, setMentors] = useState<MentorOption[]>([]);
  const [tab, setTab] = useState<"waiting" | "answered">("waiting");
  const [drafts, setDrafts] = useState<Record<string, { mentorId: string; text: string; publish: boolean }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  async function load() {
    setLoading(true);
    const [{ data: qs }, { data: ms }] = await Promise.all([
      supabase
        .from("mentor_questions")
        .select(
          "id, question_text, answer_text, answered_by, is_published, created_at, asker:profiles!mentor_questions_asked_by_fkey(first_name, name)"
        )
        .order("created_at", { ascending: true })
        .limit(200),
      supabase.from("mentors").select("id, display_name").eq("is_active", true).order("display_name"),
    ]);
    setQuestions((qs ?? []) as unknown as Question[]);
    setMentors((ms ?? []) as MentorOption[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Default to LinkY101 Team, never to whoever happens to be first
  // alphabetically. Posting an answer under a real mentor's name by accident
  // is the one mistake this screen must not make easy.
  const defaultMentorId =
    mentors.find((m) => m.display_name.toLowerCase().includes("linky101"))?.id ?? "";

  function draftFor(q: Question) {
    return (
      drafts[q.id] ?? {
        mentorId: q.answered_by ?? defaultMentorId,
        text: q.answer_text ?? "",
        publish: q.is_published,
      }
    );
  }

  function updateDraft(id: string, patch: Partial<{ mentorId: string; text: string; publish: boolean }>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...draftFor(questions.find((q) => q.id === id)!), ...patch } }));
  }

  function handlePost(q: Question) {
    const draft = draftFor(q);
    if (!draft.mentorId) {
      setErrorMsg("Pick which mentor this answer is from.");
      return;
    }
    if (!draft.text.trim()) {
      setErrorMsg("Paste the mentor's answer first.");
      return;
    }
    setSavingId(q.id);
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await postMentorAnswer(q.id, draft.mentorId, draft.text, draft.publish);
        await load();
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Couldn't post that answer");
      } finally {
        setSavingId(null);
      }
    });
  }

  function handleTogglePublished(q: Question) {
    const next = !q.is_published;
    setQuestions((prev) => prev.map((x) => (x.id === q.id ? { ...x, is_published: next } : x)));
    startTransition(() => setAnswerPublished(q.id, next).catch(() => load()));
  }

  const waiting = questions.filter((q) => !q.answer_text);
  const answered = questions.filter((q) => q.answer_text);
  const visible = tab === "waiting" ? waiting : answered;

  return (
    <div className="flex flex-col gap-4">
      <SectionTitle title="Questions" />

      <p className="text-sm text-text-muted">
        Mentors send you their answers; you post them here under the right name. Tick
        &ldquo;show on the weekly feed&rdquo; for the good ones — the asker&apos;s name is
        never shown there.
      </p>

      <div className="flex gap-2 rounded-full border border-border bg-card p-1">
        {(["waiting", "answered"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-xs font-bold capitalize transition-all ${
              tab === t ? "grad-brand text-white" : "text-text-muted"
            }`}
          >
            {t} ({t === "waiting" ? waiting.length : answered.length})
          </button>
        ))}
      </div>

      {errorMsg && (
        <p className="rounded-xl bg-[#FEF2F2] p-3 text-sm font-semibold text-[#B91C1C]">{errorMsg}</p>
      )}

      {loading ? (
        <p className="text-sm font-semibold text-text-muted">Loading...</p>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-bold text-ink">
            {tab === "waiting" ? "Nothing waiting — you're all caught up" : "Nothing answered yet"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((q) => {
            const draft = draftFor(q);
            return (
              <div key={q.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold text-text-muted">
                  <span>
                    {q.asker?.first_name ?? q.asker?.name ?? "Member"} · {daysAgo(q.created_at)}
                  </span>
                  {q.answer_text && (
                    <button
                      type="button"
                      onClick={() => handleTogglePublished(q)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                        q.is_published
                          ? "bg-[#D1FAE5] text-[#047857]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {q.is_published ? "On the weekly feed" : "Not on the feed"}
                    </button>
                  )}
                </div>

                <p className="mb-3 font-semibold leading-snug text-ink">{q.question_text}</p>

                <label className="mb-1 block text-xs font-semibold text-text-muted">
                  Answer from
                </label>
                <select
                  value={draft.mentorId}
                  onChange={(e) => updateDraft(q.id, { mentorId: e.target.value })}
                  className="mb-3 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-ink focus:border-sky focus:outline-none"
                >
                  <option value="">Choose a mentor…</option>
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.display_name}
                    </option>
                  ))}
                </select>

                <textarea
                  value={draft.text}
                  onChange={(e) => updateDraft(q.id, { text: e.target.value })}
                  rows={5}
                  placeholder="Paste what the mentor sent you, in their words."
                  className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-ink placeholder:text-text-muted focus:border-sky focus:outline-none"
                />

                <label className="mt-3 flex items-center gap-2 text-sm font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={draft.publish}
                    onChange={(e) => updateDraft(q.id, { publish: e.target.checked })}
                    className="h-4 w-4 accent-[#7C3AED]"
                  />
                  Show this on the weekly feed (name removed)
                </label>

                <button
                  type="button"
                  disabled={savingId === q.id}
                  onClick={() => handlePost(q)}
                  className="grad-brand mt-3 w-full rounded-full py-2.5 text-sm font-bold text-white transition-transform active:scale-[0.98] disabled:opacity-40"
                >
                  {savingId === q.id
                    ? "Posting..."
                    : q.answer_text
                      ? "Update answer"
                      : "Post answer & notify them"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
