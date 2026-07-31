"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import Card from "@/components/ui/GameCard";
import SectionTitle from "@/components/ui/SectionTitle";
import { CURRICULUM_CATEGORIES, getCategoryBySlug } from "@/lib/curriculum";
import { BookOpen, MessageCircle, Compass, ChevronRight } from "lucide-react";

interface NextLesson {
  categoryTitle: string;
  categoryEmoji: string;
  lessonTitle: string;
}

interface TodayGoals {
  lesson: boolean;
  post: boolean;
  quiz: boolean;
}

function streakMessage(streak: number): string {
  if (streak === 0) return "Complete a lesson today to start your streak";
  if (streak === 1) return "Keep learning to grow your streak";
  if (streak < 7) return "You're on a roll — don't break it now";
  return "Seriously consistent. That's founder energy";
}

export default function HomePage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [stats, setStats] = useState({ lessons: 0, quizzes: 0 });
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [today, setToday] = useState<TodayGoals>({ lesson: false, post: false, quiz: false });

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayIso = startOfDay.toISOString();

      const [
        { count: lessonsDone },
        { count: quizzesPassed },
        { data: lessonRows },
        { data: progressRows },
        { count: lessonsToday },
        { count: postsToday },
        { count: quizzesToday },
      ] = await Promise.all([
        supabase
          .from("curriculum_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile!.id)
          .eq("completed", true),
        supabase
          .from("quiz_attempts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile!.id),
        supabase.from("curriculum_lessons").select("id, category, title, order_index").order("order_index"),
        supabase.from("curriculum_progress").select("lesson_id, completed").eq("user_id", profile!.id),
        supabase
          .from("curriculum_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile!.id)
          .eq("completed", true)
          .gte("completed_at", todayIso),
        supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("author_id", profile!.id)
          .gte("created_at", todayIso),
        supabase
          .from("quiz_attempts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile!.id)
          .gte("completed_at", todayIso),
      ]);

      setStats({ lessons: lessonsDone ?? 0, quizzes: quizzesPassed ?? 0 });
      setToday({
        lesson: (lessonsToday ?? 0) > 0,
        post: (postsToday ?? 0) > 0,
        quiz: (quizzesToday ?? 0) > 0,
      });

      const doneIds = new Set(
        (progressRows ?? []).filter((p) => p.completed).map((p) => p.lesson_id)
      );
      for (const cat of CURRICULUM_CATEGORIES) {
        const catLessons = (lessonRows ?? []).filter((l) => l.category === cat.slug);
        const firstIncomplete = catLessons.find((l) => !doneIds.has(l.id));
        if (firstIncomplete) {
          const category = getCategoryBySlug(cat.slug);
          setNextLesson({
            categoryTitle: category?.title ?? cat.title,
            categoryEmoji: category?.emoji ?? cat.emoji,
            lessonTitle: firstIncomplete.title,
          });
          break;
        }
      }
    }
    load();
  }, [profile, supabase]);

  if (!profile) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton-shimmer h-20 rounded-xl" />
        <div className="skeleton-shimmer h-32 rounded-xl" />
        <div className="skeleton-shimmer h-32 rounded-xl" />
      </div>
    );
  }

  const streak = profile.current_streak || 0;

  return (
    <div className="flex flex-col gap-5 pb-16">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Hey {profile.first_name}! 👋</h1>
        <p className="text-sm text-gray-500">Let&apos;s build something today</p>
      </div>

      {/* Streak card */}
      <Card className="flex items-center gap-3 bg-gradient-to-r from-[#FFF9E6] to-[#FFF3CC]">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="font-bold text-gray-900">
            {streak} day streak
          </p>
          <p className="text-xs text-gray-500">{streakMessage(streak)}</p>
        </div>
      </Card>

      {/* Today's goals — auto-tracked, no self-ticking */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-bold text-gray-900">Today&apos;s goals</p>
          <span className="text-[11px] font-semibold text-gray-400">Ticks itself — no cheating 😉</span>
        </div>
        <div className="flex flex-col gap-2.5">
          {[
            { done: today.lesson, label: "Complete a lesson", href: "/learn", emoji: "📖" },
            { done: today.post, label: "Share something on the Feed", href: "/community", emoji: "💬" },
            { done: today.quiz, label: "Take a quiz", href: "/learn?tab=quizzes", emoji: "🧠" },
          ].map((goal) => (
            <Link key={goal.label} href={goal.href} className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold transition-colors ${
                  goal.done ? "bg-[#2ECC71] text-white" : "border-2 border-gray-200 bg-white"
                }`}
              >
                {goal.done ? "✓" : ""}
              </span>
              <span
                className={`text-sm ${goal.done ? "text-gray-400 line-through" : "font-medium text-gray-800"}`}
              >
                {goal.emoji} {goal.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Link
          href="/learn"
          className="card flex flex-col items-center gap-2 py-4 text-center transition-transform active:scale-[0.96]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F5E9]">
            <BookOpen className="h-5 w-5 text-[#2ECC71]" />
          </div>
          <span className="text-xs font-bold text-gray-700">Learn</span>
        </Link>
        <Link
          href="/community"
          className="card flex flex-col items-center gap-2 py-4 text-center transition-transform active:scale-[0.96]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF0F0]">
            <MessageCircle className="h-5 w-5 text-[#FF6B6B]" />
          </div>
          <span className="text-xs font-bold text-gray-700">Post an Idea</span>
        </Link>
        <Link
          href="/discover"
          className="card flex flex-col items-center gap-2 py-4 text-center transition-transform active:scale-[0.96]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E3F2FD]">
            <Compass className="h-5 w-5 text-[#039BE5]" />
          </div>
          <span className="text-xs font-bold text-gray-700">Discover</span>
        </Link>
      </div>

      {/* Continue Learning */}
      <div>
        <SectionTitle emoji="📚" title="Continue Learning" actionLabel="See all" actionHref="/learn" />
        <Link href="/learn" className="mt-2 block">
          <Card className="flex items-center gap-3 transition-transform active:scale-[0.98]">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#E3F2FD] text-2xl">
              {nextLesson?.categoryEmoji ?? "📖"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900">
                {nextLesson?.lessonTitle ?? "Start your first lesson"}
              </p>
              <p className="truncate text-xs text-gray-500">
                {nextLesson ? nextLesson.categoryTitle : "7 topics, 28 lessons — all unlocked"}
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
          </Card>
        </Link>
      </div>

      {/* Opportunity of the week */}
      <Link
        href="/opportunities"
        className="flex items-center gap-3 rounded-2xl bg-[#1A1A2E] p-4 transition-transform active:scale-[0.98]"
      >
        <span className="text-3xl">🚀</span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#FFD93D]">
            Opportunity of the week
          </p>
          <p className="truncate font-bold text-white">Tycoon Enterprise Competition</p>
          <p className="text-xs text-white/60">Real startup loan · keep the profit · closes Sept</p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-white/50" />
      </Link>

      {/* Your Progress */}
      <div>
        <SectionTitle emoji="📊" title="Your Progress" />
        <Card className="mt-2">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.lessons}</p>
              <p className="text-xs text-gray-500">Lessons Done</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.quizzes}</p>
              <p className="text-xs text-gray-500">Quizzes Taken</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{streak}</p>
              <p className="text-xs text-gray-500">Day Streak</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Feed teaser */}
      <div>
        <SectionTitle emoji="🔥" title="On the Feed" actionLabel="See all" actionHref="/community" />
        <Card className="mt-2">
          <p className="text-sm text-gray-600">
            Maya just hit 50 Etsy orders. Theo needs pricing advice. What are you building?
          </p>
          <Link href="/community" className="mt-2 inline-block text-sm font-bold text-[#039BE5]">
            Join the conversation →
          </Link>
        </Card>
      </div>
    </div>
  );
}
