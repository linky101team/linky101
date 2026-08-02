"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { questionsLeftThisWeek } from "@/lib/actions/mentors";
import { WEEKLY_QUESTION_LIMIT } from "@/lib/mentorLimits";
import AskQuestionModal from "@/components/mentors/AskQuestionModal";
import QuestionList from "@/components/mentors/QuestionList";
import type { MentorQuestion } from "@/components/mentors/QuestionCard";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Everything about asking, in one place.
 *
 * This used to live at the bottom of the Mentors page, which meant mentors,
 * your questions and the weekly feed were one endless scroll. Splitting it out
 * keeps Mentors about the people and this page about the conversation.
 */
export default function AskPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [mine, setMine] = useState<MentorQuestion[]>([]);
  const [feed, setFeed] = useState<MentorQuestion[]>([]);
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());
  const [questionsLeft, setQuestionsLeft] = useState(0);
  const [tab, setTab] = useState<"mine" | "week">("mine");
  const [showAsk, setShowAsk] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;

    // The weekly feed is queried WITHOUT joining the asker, so there is
    // nothing on the client that could identify who asked what.
    const [minen, published, rated, left] = await Promise.all([
      supabase
        .from("mentor_questions")
        .select(
          "id, question_text, answer_text, asked_by, mentor_id, answered_by, created_at, answerer:mentors!mentor_questions_answered_by_fkey(display_name)"
        )
        .eq("asked_by", profile.id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("mentor_questions")
        .select(
          "id, question_text, answer_text, mentor_id, answered_by, created_at, answerer:mentors!mentor_questions_answered_by_fkey(display_name)"
        )
        .eq("is_published", true)
        .not("answer_text", "is", null)
        .order("published_at", { ascending: false })
        .limit(20),
      supabase.from("mentor_ratings").select("question_id").eq("user_id", profile.id),
      questionsLeftThisWeek(),
    ]);

    setMine((minen.data ?? []) as unknown as MentorQuestion[]);
    setFeed((published.data ?? []) as unknown as MentorQuestion[]);
    setRatedIds(new Set((rated.data ?? []).map((r) => r.question_id)));
    setQuestionsLeft(left);
    setLoading(false);
  }, [profile, supabase]);

  useEffect(() => {
    load();
  }, [load]);

  if (!profile) {
    return <p className="text-sm font-semibold text-gray-400">Loading...</p>;
  }

  const answeredCount = mine.filter((q) => q.answer_text).length;
  const waitingCount = mine.length - answeredCount;

  return (
    <div className="flex flex-col gap-5 pb-24">
      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Ask ❓</h1>
          <p className="text-sm text-gray-500">
            Put a question to five DBS-checked adults. Answers come back to you.
          </p>
        </div>
      </Reveal>

      <Reveal index={1}>
        <button
          type="button"
          onClick={() => setShowAsk(true)}
          className="grad-brand w-full rounded-2xl p-5 text-left transition-transform active:scale-[0.99]"
        >
          <p className="text-lg font-extrabold text-white">Ask all our mentors</p>
          <p className="mt-0.5 text-sm text-white/80">
            {questionsLeft > 90
              ? "Unlimited questions"
              : `${questionsLeft} of ${WEEKLY_QUESTION_LIMIT} left this week`}
            {waitingCount > 0 && ` · ${waitingCount} waiting`}
          </p>
        </button>
      </Reveal>

      <div className="flex gap-2 rounded-full border border-gray-200 bg-white p-1 shadow-sm">
        {(
          [
            ["mine", `Your questions${mine.length ? ` (${mine.length})` : ""}`],
            ["week", "This week's answers"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 rounded-full py-2 text-xs font-bold transition-all ${
              tab === key ? "grad-brand text-white" : "text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton-shimmer h-40 rounded-2xl" />
      ) : tab === "mine" ? (
        <>
          <p className="-mt-2 text-xs text-gray-400">
            Only you, the mentors and the LinkY101 team can see these.
          </p>
          <QuestionList
            questions={mine}
            currentUserId={profile.id}
            ratedIds={ratedIds}
            emptyTitle="You haven't asked anything yet"
            emptyBody={`You get ${WEEKLY_QUESTION_LIMIT} a week. Ask the thing you'd actually want to know from someone who has done it.`}
          />
        </>
      ) : (
        <>
          <p className="-mt-2 text-xs text-gray-400">
            The best questions members asked — names removed.
          </p>
          <QuestionList
            questions={feed}
            anonymous
            emptyTitle="Nothing published yet"
            emptyBody="The first answers go up this week."
          />
        </>
      )}

      <Reveal index={2}>
        <Link
          href="/mentors"
          className="flex items-center gap-3 rounded-2xl border border-[#10B981]/40 bg-[#D1FAE5] p-4 transition-transform active:scale-[0.99]"
        >
          <ShieldCheck className="h-5 w-5 shrink-0 text-[#047857]" strokeWidth={2.5} />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-[#065F46]">
              Who answers these?
            </span>
            <span className="block text-xs text-[#047857]">
              Meet the five verified mentors →
            </span>
          </span>
        </Link>
      </Reveal>

      <AskQuestionModal
        isOpen={showAsk}
        questionsLeft={questionsLeft}
        onClose={() => setShowAsk(false)}
        onSubmitted={load}
      />
    </div>
  );
}
