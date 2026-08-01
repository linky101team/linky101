"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase/client";
import { completeCurriculumLesson } from "@/lib/actions/curriculum";
import { useProfileStore } from "@/hooks/useProfile";
import { buildCards, type Card, type LessonContent } from "@/lib/lessonCards";
import LessonPlayer from "@/components/learn/LessonPlayer";

interface LessonData {
  id: string;
  category: string;
  title: string;
  emoji: string;
  content: LessonContent;
}

export default function LessonDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createClientSupabase(), []);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: row } = await supabase
        .from("curriculum_lessons")
        .select("id, category, title, emoji, content")
        .eq("id", params.id)
        .maybeSingle();

      const data = row as unknown as LessonData | null;
      setLesson(data);
      if (data?.content) {
        setCards(buildCards(data.content, data.title, data.emoji));
      }
      setLoading(false);
    }
    load();
  }, [params.id, supabase]);

  async function handleComplete(score: number) {
    if (!lesson) return;
    try {
      await completeCurriculumLesson(lesson.id, score);
      refreshProfile();
    } catch {
      // Completion tracking failing shouldn't block the celebration screen —
      // the learner still did the work.
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg">
        <p className="font-semibold text-gray-500">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson || cards.length === 0) {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
        <p className="text-lg font-extrabold text-[#1E1B4B]">Lesson not found</p>
        <button
          type="button"
          onClick={() => router.push("/learn")}
          className="grad-brand rounded-full px-6 py-3 text-sm font-bold text-white"
        >
          Back to Learn
        </button>
      </div>
    );
  }

  return (
    <LessonPlayer
      cards={cards}
      title={lesson.title}
      onExit={() => router.push("/learn")}
      onComplete={handleComplete}
    />
  );
}
