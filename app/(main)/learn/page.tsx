"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SectionTitle from "@/components/ui/SectionTitle";
import LessonPath from "@/components/learn/LessonPath";
import PodcastsTab from "@/components/learn/PodcastsTab";
import QuizzesTab from "@/components/learn/QuizzesTab";

type Tab = "lessons" | "podcasts" | "quizzes";

const TABS: { key: Tab; label: string }[] = [
  { key: "lessons", label: "Lessons" },
  { key: "podcasts", label: "Podcasts" },
  { key: "quizzes", label: "Quizzes" },
];

function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const tab: Tab = rawTab === "podcasts" || rawTab === "quizzes" ? rawTab : "lessons";

  return (
    <div className="flex flex-col gap-5">
      <SectionTitle title="Learn" />

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => router.push(t.key === "lessons" ? "/learn" : `/learn?tab=${t.key}`)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
              tab === t.key
                ? "bg-[#FF6B6B] text-white"
                : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "lessons" && <LessonPath />}
        {tab === "podcasts" && <PodcastsTab />}
        {tab === "quizzes" && <QuizzesTab />}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="skeleton-shimmer h-64 rounded-xl" />}>
      <LearnContent />
    </Suspense>
  );
}
