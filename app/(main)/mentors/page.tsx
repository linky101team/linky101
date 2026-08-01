"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { AMBASSADORS } from "@/lib/ambassadors";
import type { Mentor } from "@/components/mentors/MentorCard";
import QuestionCard, { type MentorQuestion } from "@/components/mentors/QuestionCard";
import AskQuestionModal from "@/components/mentors/AskQuestionModal";
import { Reveal, LiftCard } from "@/components/ui/Reveal";

export default function MentorsPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [questions, setQuestions] = useState<MentorQuestion[]>([]);
  const [ratedQuestionIds, setRatedQuestionIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [loading, setLoading] = useState(true);
  const [showAsk, setShowAsk] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function loadQuestions() {
    const { data } = await supabase
      .from("mentor_questions")
      .select(
        "id, question_text, answer_text, asked_by, mentor_id, answered_by, created_at, asker:profiles!mentor_questions_asked_by_fkey(first_name), answerer:mentors!mentor_questions_answered_by_fkey(display_name)"
      )
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(30);
    setQuestions((data ?? []) as unknown as MentorQuestion[]);
  }

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const { data: mentorRows } = await supabase
        .from("mentors")
        .select("id, display_name, bio, expertise, is_verified, avatar_url, rating_avg, rating_count")
        .eq("is_active", true);
      setMentors(mentorRows ?? []);

      const { data: myRatings } = await supabase
        .from("mentor_ratings")
        .select("question_id")
        .eq("user_id", profile!.id);
      setRatedQuestionIds(new Set((myRatings ?? []).map((r) => r.question_id)));

      await loadQuestions();
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, supabase]);

  if (!profile) {
    return <p className="text-sm font-semibold text-gray-400">Loading...</p>;
  }

  const visibleQuestions =
    tab === "mine" ? questions.filter((q) => q.asked_by === profile.id) : questions;

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div>
        <h1 className="text-lg font-bold text-gray-900">🌟 Ambassadors</h1>
        <p className="text-sm text-gray-500">
          Real people who share their story and want to help young founders grow
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {AMBASSADORS.map((a, i) => {
          const isOpen = expanded === a.id;
          return (
            <Reveal key={a.id} index={i}>
            <LiftCard>
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                  style={{ backgroundColor: a.color }}
                >
                  {a.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold leading-snug text-gray-900">{a.name}</p>
                  <p className="truncate text-xs text-gray-500">{a.role}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {a.tags.map((t) => (
                      <span
                        key={t.label}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${t.bg} ${t.text}`}
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : a.id)}
                  className="shrink-0 rounded-full bg-[#1A1A2E] px-4 py-2 text-sm font-bold text-white transition-transform active:scale-95"
                >
                  {isOpen ? "Close" : "View →"}
                </button>
              </div>

              {isOpen && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-sm leading-relaxed text-gray-600">{a.bio}</p>
                  <Link
                    href="/premium"
                    className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-[#FFF7DB] py-2.5 text-sm font-bold text-[#B8860B] transition-transform active:scale-[0.98]"
                  >
                    <Crown className="h-4 w-4" strokeWidth={2.5} />
                    Message 1-on-1 — Pro
                  </Link>
                </div>
              )}
            </div>
            </LiftCard>
            </Reveal>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#FFF8E1] p-4">
        <p className="font-bold text-gray-900">💡 Become an Ambassador</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">
          Give 10 minutes of your story and inspire the next generation of founders.
        </p>
        <Link
          href="/feedback"
          className="mt-3 inline-block rounded-full bg-[#1A1A2E] px-5 py-2 text-sm font-bold text-white transition-transform active:scale-95"
        >
          Get in touch →
        </Link>
      </div>

      <div className="mt-1">
        <h2 className="font-bold text-gray-900">❓ Ask them anything</h2>
        <p className="text-sm text-gray-500">
          Post a question — the best ones get answered publicly every week
        </p>
      </div>

      <div className="flex gap-2 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
        {(["all", "mine"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
              tab === t ? "bg-[#1A1A2E] text-white" : "text-gray-500"
            }`}
          >
            {t === "all" ? "All questions" : "My questions"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-gray-400">Loading...</p>
      ) : visibleQuestions.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <span className="text-4xl">❓</span>
          <p className="mt-2 font-bold text-gray-900">
            {tab === "mine" ? "You haven't asked anything yet" : "No questions yet"}
          </p>
          <p className="text-sm text-gray-500">
            Tap + and ask — what would you love to know from a real founder?
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              currentUserId={profile.id}
              alreadyRated={ratedQuestionIds.has(q.id)}
            />
          ))}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30">
        <div className="mx-auto max-w-[430px] px-5">
          <button
            type="button"
            onClick={() => setShowAsk(true)}
            aria-label="Ask a question"
            className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1A2E] text-2xl font-bold text-white shadow-lg transition-transform active:scale-90"
          >
            +
          </button>
        </div>
      </div>

      <AskQuestionModal
        isOpen={showAsk}
        mentors={mentors}
        onClose={() => setShowAsk(false)}
        onSubmitted={loadQuestions}
      />
    </div>
  );
}
