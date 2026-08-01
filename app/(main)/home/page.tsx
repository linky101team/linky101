"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Reveal, LiftCard } from "@/components/ui/Reveal";
import { CURRICULUM_CATEGORIES, getCategoryBySlug } from "@/lib/curriculum";
import { BookOpen, Mic, MessageCircleQuestion, Check, ChevronRight, Trophy, Clock } from "lucide-react";

interface ContinueCourse {
  slug: string;
  title: string;
  emoji: string;
  nextLesson: string;
  done: number;
  total: number;
}

interface TodayGoals {
  lesson: boolean;
  podcast: boolean;
  question: boolean;
}

const TASKS = [
  {
    key: "lesson" as const,
    icon: BookOpen,
    color: "#EC4899",
    tint: "bg-[#FCE7F3]",
    label: "Complete a lesson",
    sub: "Any lesson in Learn",
    href: "/learn",
  },
  {
    key: "podcast" as const,
    icon: Mic,
    color: "#06B6D4",
    tint: "bg-[#CFFAFE]",
    label: "Listen to today's podcast",
    sub: "Real founder stories",
    href: "/podcasts",
  },
  {
    key: "question" as const,
    icon: MessageCircleQuestion,
    color: "#F59E0B",
    tint: "bg-[#FEF3C7]",
    label: "Ask a question in Discover",
    sub: "LinkY AI answers instantly",
    href: "/discover",
  },
];

function nextMondayNineAm(): string {
  const now = new Date();
  const target = new Date(now);
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  target.setDate(now.getDate() + daysUntilMonday);
  target.setHours(9, 0, 0, 0);
  const diffMs = target.getTime() - now.getTime();
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export default function HomePage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [today, setToday] = useState<TodayGoals>({ lesson: false, podcast: false, question: false });
  const [course, setCourse] = useState<ContinueCourse | null>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    setCountdown(nextMondayNineAm());
  }, []);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const todayIso = startOfDay.toISOString();

      const [
        { count: lessonsToday },
        { count: podcastsToday },
        { count: questionsToday },
        { data: lessonRows },
        { data: progressRows },
      ] = await Promise.all([
        supabase
          .from("curriculum_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile!.id)
          .eq("completed", true)
          .gte("completed_at", todayIso),
        supabase
          .from("podcast_listens")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile!.id)
          .gte("listened_at", todayIso),
        supabase
          .from("mentor_questions")
          .select("id", { count: "exact", head: true })
          .eq("asked_by", profile!.id)
          .gte("created_at", todayIso),
        supabase.from("curriculum_lessons").select("id, category, title, order_index").order("order_index"),
        supabase.from("curriculum_progress").select("lesson_id, completed").eq("user_id", profile!.id),
      ]);

      setToday({
        lesson: (lessonsToday ?? 0) > 0,
        podcast: (podcastsToday ?? 0) > 0,
        question: (questionsToday ?? 0) > 0,
      });

      const doneIds = new Set((progressRows ?? []).filter((p) => p.completed).map((p) => p.lesson_id));

      for (const cat of CURRICULUM_CATEGORIES) {
        const catLessons = (lessonRows ?? []).filter((l) => l.category === cat.slug);
        if (catLessons.length === 0) continue;
        const next = catLessons.find((l) => !doneIds.has(l.id));
        if (next) {
          const meta = getCategoryBySlug(cat.slug);
          setCourse({
            slug: cat.slug,
            title: meta?.title ?? cat.title,
            emoji: meta?.emoji ?? cat.emoji,
            nextLesson: next.title,
            done: catLessons.filter((l) => doneIds.has(l.id)).length,
            total: catLessons.length,
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
        <div className="skeleton-shimmer h-24 rounded-2xl" />
        <div className="skeleton-shimmer h-40 rounded-2xl" />
        <div className="skeleton-shimmer h-32 rounded-2xl" />
      </div>
    );
  }

  const doneCount = Object.values(today).filter(Boolean).length;
  const pct = course && course.total > 0 ? Math.round((course.done / course.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-5 pb-8">
      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Hey {profile.first_name}! 👋</h1>
          <p className="text-sm text-gray-500">Let&apos;s build something today</p>
        </div>
      </Reveal>

      {/* Today's tasks */}
      <Reveal index={1}>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-extrabold text-[#1E1B4B]">Today&apos;s tasks</p>
              <p className="text-xs text-gray-400">Ticks itself when you actually do it — no cheating 😉</p>
            </div>
            <span className="grad-brand shrink-0 rounded-full px-3 py-1 text-xs font-extrabold text-white">
              {doneCount}/3
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {TASKS.map((task) => {
              const done = today[task.key];
              const Icon = task.icon;
              return (
                <Link
                  key={task.key}
                  href={task.href}
                  className={`flex items-center gap-3 rounded-2xl border p-3 transition-all ${
                    done ? "border-[#D1FAE5] bg-[#F0FDF4]" : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${task.tint}`}>
                    <Icon className="h-5 w-5" style={{ color: task.color }} strokeWidth={2.25} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-bold ${done ? "text-gray-400 line-through" : "text-[#1E1B4B]"}`}
                    >
                      {task.label}
                    </span>
                    <span className="block text-xs text-gray-400">{task.sub}</span>
                  </span>
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                      done ? "bg-[#10B981]" : "border-2 border-gray-200"
                    }`}
                  >
                    {done && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </Reveal>

      {/* Continue where you left off */}
      <Reveal index={2}>
        <LiftCard>
          <Link
            href="/learn"
            className="block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Continue where you left off
            </p>
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F3E8FF] text-3xl">
                {course?.emoji ?? "📚"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-extrabold text-[#1E1B4B]">
                  {course?.title ?? "Start your first course"}
                </p>
                <p className="truncate text-sm text-gray-500">
                  {course ? `Next: ${course.nextLesson}` : "7 courses, all unlocked"}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-300" />
            </div>

            {course && (
              <div className="mt-4">
                <div className="mb-1.5 flex justify-between text-xs font-semibold">
                  <span className="text-gray-400">
                    {course.done}/{course.total} lessons
                  </span>
                  <span className="text-[#7C3AED]">{pct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div className="grad-brand h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
          </Link>
        </LiftCard>
      </Reveal>

      {/* Top 50 ideas incentive */}
      <Reveal index={3}>
        <LiftCard>
          <Link href="/dreams" className="grad-gold block rounded-2xl border-2 border-[#F59E0B] p-5">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#B45309]" strokeWidth={2.5} />
              <p className="text-base font-extrabold text-[#92400E]">Top 50 Ideas win an Ambassador event</p>
            </div>
            <p className="text-sm leading-relaxed text-[#92400E]">
              Every month the 50 most-loved ideas on the Dream Wall get an exclusive live event or Zoom with one
              of our ambassadors. Post yours and get voted up.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#F59E0B] px-3 py-1 text-xs font-bold text-white">
                Next event: 15 Sept
              </span>
              <span className="rounded-full border border-[#F59E0B] bg-white px-3 py-1 text-xs font-bold text-[#B45309]">
                Post your idea →
              </span>
            </div>
          </Link>
        </LiftCard>
      </Reveal>

      {/* Weekly Q&A drop */}
      <Reveal index={4}>
        <LiftCard>
          <Link href="/discover" className="block rounded-2xl bg-[#F3E8FF] p-5">
            <div className="mb-2 flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#7C3AED]" strokeWidth={2.5} />
              <p className="text-base font-extrabold text-[#5B21B6]">Weekly Q&amp;A — every Monday, 9AM</p>
            </div>
            <p className="text-sm leading-relaxed text-[#5B21B6]">
              The 20 most-voted questions get answered every Monday morning. Ask yours now and get it voted up
              before the drop.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#EC4899]" />
              <span className="text-xs font-bold text-[#7C3AED]">
                {countdown ? `Next drop in ${countdown}` : "Next drop: Monday 9:00 AM"}
              </span>
            </div>
          </Link>
        </LiftCard>
      </Reveal>
    </div>
  );
}
