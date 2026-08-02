"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import type { Mentor } from "@/components/mentors/MentorCard";
import MentorGrid from "@/components/mentors/MentorGrid";
import QuestionCard, { type MentorQuestion } from "@/components/mentors/QuestionCard";
import AskQuestionModal from "@/components/mentors/AskQuestionModal";
import { questionsLeftThisWeek } from "@/lib/actions/mentors";
import { WEEKLY_QUESTION_LIMIT } from "@/lib/mentorLimits";
import { Reveal } from "@/components/ui/Reveal";

export default function MentorsPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [questions, setQuestions] = useState<MentorQuestion[]>([]);
  const [feed, setFeed] = useState<MentorQuestion[]>([]);
  const [ratedQuestionIds, setRatedQuestionIds] = useState<Set<string>>(new Set());
  const [questionsLeft, setQuestionsLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAsk, setShowAsk] = useState(false);

  // Two separate loads, because they are two different things now.
  //
  // `questions` is yours — every question you have asked, answered or not.
  // `feed` is the handful of answers picked for the week, read by everyone,
  // and deliberately selected WITHOUT joining the asker, so there is no way
  // for the client to work out who asked what.
  async function loadQuestions() {
    if (!profile) return;

    const [mine, published, left] = await Promise.all([
      supabase
        .from("mentor_questions")
        .select(
          "id, question_text, answer_text, asked_by, mentor_id, answered_by, created_at, answerer:mentors!mentor_questions_answered_by_fkey(display_name)"
        )
        .eq("asked_by", profile.id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("mentor_questions")
        .select(
          "id, question_text, answer_text, mentor_id, answered_by, created_at, answerer:mentors!mentor_questions_answered_by_fkey(display_name)"
        )
        .eq("is_published", true)
        .not("answer_text", "is", null)
        .order("published_at", { ascending: false })
        .limit(20),
      questionsLeftThisWeek(),
    ]);

    setQuestions((mine.data ?? []) as unknown as MentorQuestion[]);
    setFeed((published.data ?? []) as unknown as MentorQuestion[]);
    setQuestionsLeft(left);
  }

  useEffect(() => {
    if (!profile) return;

    async function load() {
      // select("*") on purpose: a hand-written column list makes Supabase
      // reject the whole query with a 400 the moment one name is missing,
      // which renders as a silent "no mentors" instead of an error.
      const { data: mentorRows } = await supabase
        .from("mentors")
        .select("*")
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

  return (
    <div className="flex flex-col gap-5 pb-16">
      <Reveal>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Mentors 🛡️</h1>
            <p className="text-sm text-gray-500">
              DBS-checked adults. Ask anything — answers go up publicly.
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

      <MentorGrid mentors={mentors} />

      <Reveal>
        <Link
          href="/ambassadors"
          className="block rounded-2xl border border-[#F59E0B]/40 bg-[#FEF3C7] p-5 transition-transform active:scale-[0.99]"
        >
          <p className="font-extrabold text-[#92400E]">⭐ Meet the ambassadors</p>
          <p className="mt-1 text-sm leading-relaxed text-[#92400E]">
            Founders from across the UK sharing how they actually got started.
          </p>
          <span className="mt-3 inline-block text-sm font-bold text-[#92400E]">
            Browse ambassadors →
          </span>
        </Link>
      </Reveal>

      <div className="mt-1">
        <h2 className="text-lg font-extrabold text-[#1E1B4B]">❓ Your questions</h2>
        <p className="text-sm text-gray-500">
          Only you, the mentors and the LinkY101 team can see these
        </p>
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-gray-400">Loading...</p>
      ) : questions.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <span className="text-4xl">❓</span>
          <p className="mt-2 font-bold text-[#1E1B4B]">You haven&apos;t asked anything yet</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">
            You get {WEEKLY_QUESTION_LIMIT} a week. Ask the thing you&apos;d actually want to
            know from someone who has done it.
          </p>
          <button
            type="button"
            onClick={() => setShowAsk(true)}
            className="grad-brand mt-4 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-transform active:scale-95"
          >
            Ask all our mentors
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              currentUserId={profile.id}
              alreadyRated={ratedQuestionIds.has(q.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-2">
        <h2 className="text-lg font-extrabold text-[#1E1B4B]">🏆 This week&apos;s answers</h2>
        <p className="text-sm text-gray-500">
          The best questions members asked — names removed
        </p>
      </div>

      {feed.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="font-bold text-[#1E1B4B]">Nothing published yet</p>
          <p className="text-sm text-gray-500">The first answers go up this week.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feed.map((q) => (
            <QuestionCard key={q.id} question={q} anonymous />
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
        questionsLeft={questionsLeft}
        onClose={() => setShowAsk(false)}
        onSubmitted={loadQuestions}
      />
    </div>
  );
}
