"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LessonPath from "@/components/learn/LessonPath";
import QuizzesTab from "@/components/learn/QuizzesTab";
import { Reveal } from "@/components/ui/Reveal";

type Tab = "lessons" | "quizzes";

// Podcasts used to be a third tab here. It's now a top-level page of its own
// (/podcasts) because it's a headline feature, not a sub-tab.
const TABS: { key: Tab; label: string }[] = [
  { key: "lessons", label: "Courses" },
  { key: "quizzes", label: "Quizzes" },
];

function LearnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab: Tab = searchParams.get("tab") === "quizzes" ? "quizzes" : "lessons";

  return (
    <div className="flex flex-col gap-5 pb-8">
      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Learn 📚</h1>
          <p className="text-sm text-gray-500">Real business skills, in bite-sized lessons</p>
        </div>
      </Reveal>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => router.push(t.key === "lessons" ? "/learn" : `/learn?tab=${t.key}`)}
            className={`flex-1 rounded-full py-2.5 text-sm font-bold transition-all active:scale-95 ${
              tab === t.key
                ? "grad-brand text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div>
        {tab === "lessons" && <LessonPath />}
        {tab === "quizzes" && <QuizzesTab />}
      </div>
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="skeleton-shimmer h-64 rounded-2xl" />}>
      <LearnContent />
    </Suspense>
  );
}
