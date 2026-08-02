"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Crown, Flame } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import type { Profile } from "@/hooks/useProfile";
import { AMBASSADORS } from "@/lib/ambassadors";
import { Reveal } from "@/components/ui/Reveal";

interface RightRailProps {
  profile: Profile | null;
}

interface Stats {
  lessons: number;
  quizzes: number;
}

/**
 * Desktop-only right-hand dashboard column — hidden below `lg`. Shows the
 * kind of persistent "at a glance" widgets a real dashboard has: streak,
 * quick stats, an opportunity to check out, an ambassador spotlight, and a
 * Pro upsell. Present on every main page, not just Home.
 */
export default function RightRail({ profile }: RightRailProps) {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [stats, setStats] = useState<Stats>({ lessons: 0, quizzes: 0 });

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const [{ count: lessons }, { count: quizzes }] = await Promise.all([
        supabase
          .from("curriculum_progress")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile!.id)
          .eq("completed", true),
        supabase
          .from("quiz_attempts")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile!.id),
      ]);
      setStats({ lessons: lessons ?? 0, quizzes: quizzes ?? 0 });
    }
    load();
  }, [profile, supabase]);

  if (!profile) return null;

  const streak = profile.current_streak || 0;
  const spotlightAmbassador = AMBASSADORS[0];

  return (
    <aside className="hidden w-80 shrink-0 flex-col gap-4 lg:flex">
      <Reveal>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FFF3CC]">
              <Flame className="h-5 w-5 text-[#F5A623]" strokeWidth={2.25} />
            </span>
            <div>
              <p className="font-bold text-gray-900">{streak} day streak</p>
              <p className="text-xs text-gray-500">Keep it going today</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.lessons}</p>
              <p className="text-xs text-gray-500">Lessons done</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.quizzes}</p>
              <p className="text-xs text-gray-500">Quizzes taken</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal index={1}>
        <Link
          href="/opportunities"
          className="flex items-center gap-3 rounded-2xl bg-[#1A1A2E] p-4 transition-transform hover:-translate-y-0.5"
        >
          <span className="text-2xl">🚀</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#FFD93D]">Opportunity</p>
            <p className="truncate text-sm font-bold text-white">Tycoon Enterprise Competition</p>
            <p className="text-xs text-white/60">Closes September</p>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-white/50" />
        </Link>
      </Reveal>

      <Reveal index={2}>
        <Link
          href="/ambassadors"
          className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-transform hover:-translate-y-0.5"
        >
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">Ambassador spotlight</p>
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: spotlightAmbassador.color }}
            >
              {spotlightAmbassador.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900">{spotlightAmbassador.name}</p>
              <p className="truncate text-xs text-gray-500">{spotlightAmbassador.role}</p>
            </div>
          </div>
        </Link>
      </Reveal>

      {!profile.is_premium && (
        <Reveal index={3}>
          <Link
            href="/premium"
            className="flex flex-col gap-2 rounded-2xl border border-[#FFE9A8] bg-[#FFF7DB] p-4 transition-transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-1.5 text-sm font-bold text-[#B8860B]">
              <Crown className="h-4 w-4" strokeWidth={2.5} />
              Go Pro
            </span>
            <p className="text-xs leading-relaxed text-[#8A6D1F]">
              1-on-1 mentor messaging, AI coach, pitch deck reviews and more.
            </p>
          </Link>
        </Reveal>
      )}
    </aside>
  );
}
