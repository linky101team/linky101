"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import AmbassadorGrid from "@/components/discover/AmbassadorGrid";
import type { Mentor } from "@/components/mentors/MentorCard";
import QuestionCard, { type MentorQuestion } from "@/components/mentors/QuestionCard";
import AskQuestionModal from "@/components/mentors/AskQuestionModal";
import { Reveal } from "@/components/ui/Reveal";

export default function MentorsPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [questions, setQuestions] = useState<MentorQuestion[]>([]);
  const [ratedQuestionIds, setRatedQuestionIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [loading, setLoading] = useState(true);
  const [showAsk, setShowAsk] = useState(false);

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
      <Reveal>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Ambassadors ⭐</h1>
            <p className="text-sm text-gray-500">
              Real founders sharing one hard-won lesson each
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAsk(true)}
            className="grad-brand hidden shrink-0 rounded-full px-4 py-2.5 text-sm font-bold text-white transition-transform active:scale-95 lg:block"
          >
            + Ask a question
          </button>
        </div>
      </Reveal>

      <AmbassadorGrid />

      <Reveal>
        <div className="grad-gold rounded-2xl border border-[#F59E0B]/40 p-5">
          <p className="font-extrabold text-[#92400E]">💡 Become an Ambassador</p>
          <p className="mt-1 text-sm leading-relaxed text-[#92400E]">
            Give ten minutes of your story and inspire the next generation of founders.
          </p>
          <Link
            href="/feedback"
            className="mt-3 inline-block rounded-full bg-[#1E1B4B] px-5 py-2 text-sm font-bold text-white transition-transform active:scale-95"
          >
            Get in touch →
          </Link>
        </div>
      </Reveal>

      <div className="mt-1">
        <h2 className="text-lg font-extrabold text-[#1E1B4B]">❓ Ask them anything</h2>
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
              tab === t ? "grad-brand text-white" : "text-gray-500"
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
          <p className="mt-2 font-bold text-[#1E1B4B]">
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

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 lg:hidden">
        <div className="mx-auto max-w-[430px] px-5">
          <button
            type="button"
            onClick={() => setShowAsk(true)}
            aria-label="Ask a question"
            className="grad-brand pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold text-white shadow-lg transition-transform active:scale-90"
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
