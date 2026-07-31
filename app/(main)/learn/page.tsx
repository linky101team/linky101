"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import SectionTitle from "@/components/ui/SectionTitle";
import LessonPath from "@/components/learn/LessonPath";
import PodcastsTab from "@/components/learn/PodcastsTab";
import QuizzesTab from "@/components/learn/QuizzesTab";
import SubmitLessonModal from "@/components/learn/SubmitLessonModal";
import TutorialPrompt from "@/components/TutorialPrompt";

type Tab = "lessons" | "podcasts" | "quizzes";
const SUBMIT_LEVEL = 10;

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "lessons", label: "Lessons", emoji: "📚" },
  { key: "podcasts", label: "Podcasts", emoji: "🎧" },
  { key: "quizzes", label: "Quizzes", emoji: "🧠" },
];

function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useProfile();
  const [showSubmit, setShowSubmit] = useState(false);
  const rawTab = searchParams.get("tab");
  const tab: Tab = rawTab === "podcasts" || rawTab === "quizzes" ? rawTab : "lessons";
  const canSubmit = (profile?.level ?? 0) >= SUBMIT_LEVEL;

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="📚" title="Learn" />

      <div data-tour="learn-tabs" className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => router.push(t.key === "lessons" ? "/learn" : `/learn?tab=${t.key}`)}
            className={`flex-1 rounded-xl border-3 py-2 text-xs font-black uppercase tracking-wide ${
              tab === t.key ? "border-pink bg-pink text-white shadow-glow-pink" : "border-border text-text-muted"
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div data-tour="learn-feed">
        {tab === "lessons" && <LessonPath />}
        {tab === "podcasts" && <PodcastsTab />}
        {tab === "quizzes" && <QuizzesTab />}
      </div>

      {canSubmit && (
        <div data-tour="learn-fab" className="pointer-events-none fixed inset-x-0 bottom-40 z-30">
          <div className="mx-auto max-w-[430px] px-4">
            <button
              type="button"
              onClick={() => setShowSubmit(true)}
              aria-label="Submit a lesson"
              className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-2xl font-black text-white shadow-glow-pink"
            >
              +
            </button>
          </div>
        </div>
      )}

      <SubmitLessonModal isOpen={showSubmit} onClose={() => setShowSubmit(false)} onSubmitted={() => setShowSubmit(false)} />

      <TutorialPrompt tourId="learn" />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<p className="text-sm font-bold text-text-muted">Loading...</p>}>
      <LearnContent />
    </Suspense>
  );
}
