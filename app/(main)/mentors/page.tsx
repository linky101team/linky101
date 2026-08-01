"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lightbulb, X, MapPin, ExternalLink } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { type Ambassador } from "@/lib/ambassadors";
import AmbassadorGrid from "@/components/discover/AmbassadorGrid";
import type { Mentor } from "@/components/mentors/MentorCard";
import QuestionCard, { type MentorQuestion } from "@/components/mentors/QuestionCard";
import AskQuestionModal from "@/components/mentors/AskQuestionModal";
import { Reveal } from "@/components/ui/Reveal";

function AmbassadorModal({ a, onClose }: { a: Ambassador; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 26, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
      >
        <div className="grad-hero relative p-6 text-center">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
          <span
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/30 text-2xl font-extrabold text-white"
            style={{ backgroundColor: a.color }}
          >
            {a.initials}
          </span>
          <p className="mt-3 text-xl font-extrabold text-white">{a.name}</p>
          <p className="text-sm font-semibold text-white/85">{a.role}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-xs text-white/70">
            <MapPin className="h-3 w-3" strokeWidth={2.5} />
            {a.location}
          </p>
        </div>

        <div className="p-5">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-[#EC4899]">About</p>
          {a.bio.map((para, i) => (
            <p key={i} className="mb-2 text-sm leading-relaxed text-gray-600">
              {para}
            </p>
          ))}

          <p className="mb-2 mt-4 text-[10px] font-extrabold uppercase tracking-wider text-[#EC4899]">
            Known for
          </p>
          <div className="flex flex-wrap gap-1.5">
            {a.tags.map((t) => (
              <span key={t} className="rounded-full bg-[#F5F3FF] px-2.5 py-1 text-[11px] font-bold text-[#5B21B6]">
                {t}
              </span>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[#FCD34D] bg-[#FEF3C7] p-4">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#92400E]">
              <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.5} />
              One piece of advice
            </p>
            {a.adviceConfirmed ? (
              <p className="text-sm font-semibold italic leading-relaxed text-[#78350F]">
                &ldquo;{a.advice}&rdquo;
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-[#92400E]/70">
                Coming soon — we&apos;re waiting on {a.name.split(" ")[0]}&apos;s own words for the next
                generation.
              </p>
            )}
          </div>

          {a.linkedin && (
            <a
              href={a.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-gray-200 py-2.5 text-sm font-bold text-gray-600"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2.5} />
              Connect on LinkedIn
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function MentorsPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [questions, setQuestions] = useState<MentorQuestion[]>([]);
  const [ratedQuestionIds, setRatedQuestionIds] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"all" | "mine">("all");
  const [loading, setLoading] = useState(true);
  const [showAsk, setShowAsk] = useState(false);
  const [selected, setSelected] = useState<Ambassador | null>(null);

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

      <AmbassadorGrid onSelect={setSelected} />

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

      <AnimatePresence>
        {selected && <AmbassadorModal a={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>

      <AskQuestionModal
        isOpen={showAsk}
        mentors={mentors}
        onClose={() => setShowAsk(false)}
        onSubmitted={loadQuestions}
      />
    </div>
  );
}
