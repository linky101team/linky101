"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";

interface DayCount {
  date: string;
  count: number;
}

interface QuizStat {
  title: string;
  attempts: number;
}

interface CategoryStat {
  category: string;
  count: number;
}

const DAYS_BACK = 14;

function lastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.now() - (n - 1 - i) * 86_400_000);
    return d.toISOString().slice(0, 10);
  });
}

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-[10px] font-bold text-text-muted">{label}</span>
      <div className="h-4 flex-1 overflow-hidden rounded-full bg-navy/60">
        <div className="h-full rounded-full bg-gradient-pink-purple" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 shrink-0 text-right text-[10px] font-black text-white">{value}</span>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [signups, setSignups] = useState<DayCount[]>([]);
  const [topQuizzes, setTopQuizzes] = useState<QuizStat[]>([]);
  const [postCategories, setPostCategories] = useState<CategoryStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const days = lastNDays(DAYS_BACK);
      const since = `${days[0]}T00:00:00Z`;

      const [{ data: profileRows }, { data: attempts }, { data: quizzes }, { data: posts }] = await Promise.all([
        supabase.from("profiles").select("created_at").gte("created_at", since),
        supabase.from("quiz_attempts").select("quiz_id"),
        supabase.from("quizzes").select("id, title"),
        supabase.from("posts").select("category").eq("moderation_status", "approved"),
      ]);

      const signupCounts = new Map(days.map((d) => [d, 0]));
      for (const p of profileRows ?? []) {
        const day = p.created_at.slice(0, 10);
        if (signupCounts.has(day)) signupCounts.set(day, (signupCounts.get(day) ?? 0) + 1);
      }
      setSignups(days.map((d) => ({ date: d, count: signupCounts.get(d) ?? 0 })));

      const quizTitleById = new Map((quizzes ?? []).map((q) => [q.id, q.title]));
      const attemptCounts = new Map<string, number>();
      for (const a of attempts ?? []) {
        attemptCounts.set(a.quiz_id, (attemptCounts.get(a.quiz_id) ?? 0) + 1);
      }
      const rankedQuizzes = Array.from(attemptCounts.entries())
        .map(([quizId, count]) => ({ title: quizTitleById.get(quizId) ?? "Unknown", attempts: count }))
        .sort((a, b) => b.attempts - a.attempts)
        .slice(0, 6);
      setTopQuizzes(rankedQuizzes);

      const categoryCounts = new Map<string, number>();
      for (const p of posts ?? []) {
        categoryCounts.set(p.category, (categoryCounts.get(p.category) ?? 0) + 1);
      }
      const rankedCategories = Array.from(categoryCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);
      setPostCategories(rankedCategories);

      setLoading(false);
    }
    load();
  }, [supabase]);

  if (loading) return <p className="text-sm font-bold text-text-muted">Loading analytics...</p>;

  const maxSignups = Math.max(1, ...signups.map((s) => s.count));
  const maxQuizAttempts = Math.max(1, ...topQuizzes.map((q) => q.attempts));
  const maxCategoryCount = Math.max(1, ...postCategories.map((c) => c.count));

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="📈" title="Analytics" />

      <GameCard borderColor="pink" glowColor="pink">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-pink">Signups — Last {DAYS_BACK} Days</p>
        <div className="flex flex-col gap-1.5">
          {signups.map((s) => (
            <Bar key={s.date} label={s.date.slice(5)} value={s.count} max={maxSignups} />
          ))}
        </div>
      </GameCard>

      <GameCard borderColor="sky" glowColor="sky">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-sky">Most Attempted Quizzes</p>
        {topQuizzes.length === 0 ? (
          <p className="text-xs font-bold text-text-muted">No quiz attempts yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {topQuizzes.map((q) => (
              <Bar key={q.title} label={q.title.slice(0, 14)} value={q.attempts} max={maxQuizAttempts} />
            ))}
          </div>
        )}
      </GameCard>

      <GameCard borderColor="purple" glowColor="purple">
        <p className="mb-3 text-xs font-black uppercase tracking-wide text-purple">Posts by Category</p>
        {postCategories.length === 0 ? (
          <p className="text-xs font-bold text-text-muted">No posts yet.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {postCategories.map((c) => (
              <Bar key={c.category} label={c.category.slice(0, 14)} value={c.count} max={maxCategoryCount} />
            ))}
          </div>
        )}
      </GameCard>
    </div>
  );
}
