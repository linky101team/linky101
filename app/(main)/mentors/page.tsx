"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { getXPForLevel, getXPToNextLevel } from "@/lib/levels";
import { toggleFollow } from "@/lib/actions/follows";
import SectionTitle from "@/components/ui/SectionTitle";
import MentorCard, { type Mentor } from "@/components/mentors/MentorCard";
import MentorProfileModal from "@/components/mentors/MentorProfileModal";
import QuestionCard, { type MentorQuestion } from "@/components/mentors/QuestionCard";
import AskQuestionModal from "@/components/mentors/AskQuestionModal";

const LEVEL_GATE = 15;

export default function MentorsPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [answerCounts, setAnswerCounts] = useState<Map<string, number>>(new Map());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [questions, setQuestions] = useState<MentorQuestion[]>([]);
  const [ratedQuestionIds, setRatedQuestionIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [loading, setLoading] = useState(true);
  const [showAsk, setShowAsk] = useState(false);
  const [profileMentor, setProfileMentor] = useState<Mentor | null>(null);
  const [, startTransition] = useTransition();

  const level = profile?.level ?? 1;
  const unlocked = level >= LEVEL_GATE;

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
    if (!profile || !unlocked) return;

    async function load() {
      const { data: mentorRows } = await supabase
        .from("mentors")
        .select("id, display_name, bio, expertise, is_verified, avatar_url, rating_avg, rating_count")
        .eq("is_active", true);
      setMentors(mentorRows ?? []);

      if (mentorRows && mentorRows.length > 0) {
        const ids = mentorRows.map((m) => m.id);
        const { data: answered } = await supabase
          .from("mentor_questions")
          .select("answered_by")
          .in("answered_by", ids);

        const counts = new Map<string, number>();
        (answered ?? []).forEach((a) => {
          if (a.answered_by) counts.set(a.answered_by, (counts.get(a.answered_by) ?? 0) + 1);
        });
        setAnswerCounts(counts);

        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", profile!.id)
          .in("following_id", ids);
        setFollowing(new Set((follows ?? []).map((f) => f.following_id)));
      }

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
  }, [profile, unlocked, supabase]);

  function handleToggleFollow(mentorId: string) {
    const wasFollowing = following.has(mentorId);
    setFollowing((prev) => {
      const next = new Set(prev);
      if (wasFollowing) next.delete(mentorId);
      else next.add(mentorId);
      return next;
    });
    startTransition(async () => {
      try {
        await toggleFollow(mentorId);
      } catch {
        setFollowing((prev) => {
          const next = new Set(prev);
          if (wasFollowing) next.add(mentorId);
          else next.delete(mentorId);
          return next;
        });
      }
    });
  }

  if (!profile) {
    return <p className="text-sm font-bold text-text-muted">Loading...</p>;
  }

  if (!unlocked) {
    const xpNeeded = getXPToNextLevel(level, profile.xp) ?? Math.max(0, getXPForLevel(LEVEL_GATE) - profile.xp);
    return (
      <div className="relative min-h-[60vh] overflow-hidden">
        <div className="pointer-events-none select-none space-y-4 opacity-40 blur-sm">
          <div className="h-20 rounded-[18px] border-3 border-sky bg-card" />
          <div className="h-32 rounded-[18px] border-3 border-green bg-card" />
          <div className="h-32 rounded-[18px] border-3 border-border bg-card" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
          <Lock className="h-8 w-8 text-sky" strokeWidth={3} />
          <p className="heading-game text-xl">Mentor Q&amp;A</p>
          <p className="text-sm font-bold text-text-muted">Unlocks at Level {LEVEL_GATE}</p>
          <p className="rounded-full border-3 border-sky bg-card px-4 py-2 text-xs font-black uppercase text-sky shadow-glow-sky">
            You&apos;re Level {level} — {xpNeeded} XP to go!
          </p>
        </div>
      </div>
    );
  }

  const visibleQuestions =
    tab === "mine" ? questions.filter((q) => q.asked_by === profile.id) : questions;

  return (
    <div className="flex flex-col gap-6 pb-16">
      <SectionTitle emoji="🤝" title="Mentors" />

      {mentors.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {mentors.map((m) => (
            <MentorCard
              key={m.id}
              mentor={m}
              answersCount={answerCounts.get(m.id) ?? 0}
              isFollowing={following.has(m.id)}
              canFollow={m.id !== profile.id}
              onToggleFollow={() => handleToggleFollow(m.id)}
              onOpenProfile={() => setProfileMentor(m)}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2 rounded-xl border-3 border-border bg-card p-1">
        {(["all", "mine"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-black uppercase ${
              tab === t ? "bg-gradient-sky-purple text-white" : "text-text-muted"
            }`}
          >
            {t === "all" ? "All Questions" : "My Questions"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : visibleQuestions.length === 0 ? (
        <p className="text-sm font-bold text-text-muted">
          {tab === "mine" ? "You haven't asked anything yet." : "No questions yet — be the first!"}
        </p>
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
        <div className="mx-auto max-w-[430px] px-4">
          <button
            type="button"
            onClick={() => setShowAsk(true)}
            aria-label="Ask a question"
            className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full border-3 border-sky bg-gradient-sky-purple text-2xl font-black text-white shadow-glow-sky"
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

      <MentorProfileModal
        mentor={profileMentor}
        answersCount={profileMentor ? answerCounts.get(profileMentor.id) ?? 0 : 0}
        onClose={() => setProfileMentor(null)}
      />
    </div>
  );
}
