"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import SectionTitle from "@/components/ui/SectionTitle";
import GameCard from "@/components/ui/GameCard";

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  activeToday: number;
  pendingPosts: number;
  openReports: number;
  pendingFeedback: number;
  totalPosts: number;
  totalMentorQuestions: number;
  unansweredQuestions: number;
}

function StatCard({ label, value, emoji, href }: { label: string; value: number; emoji: string; href?: string }) {
  const content = (
    <GameCard borderColor="border" className="text-center">
      <p className="text-2xl">{emoji}</p>
      <p className="text-2xl font-black text-white">{value.toLocaleString()}</p>
      <p className="text-[10px] font-bold uppercase text-text-muted">{label}</p>
    </GameCard>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminOverviewPage() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      const today = new Date().toISOString().slice(0, 10);
      const [
        { count: totalUsers },
        { count: premiumUsers },
        { count: activeToday },
        { count: pendingPosts },
        { count: openReports },
        { count: pendingFeedback },
        { count: totalPosts },
        { count: totalMentorQuestions },
        { count: unansweredQuestions },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_premium", true),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("last_active_date", today),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("moderation_status", "pending"),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("feedback").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("mentor_questions").select("id", { count: "exact", head: true }),
        supabase.from("mentor_questions").select("id", { count: "exact", head: true }).is("answer_text", null),
      ]);

      setStats({
        totalUsers: totalUsers ?? 0,
        premiumUsers: premiumUsers ?? 0,
        activeToday: activeToday ?? 0,
        pendingPosts: pendingPosts ?? 0,
        openReports: openReports ?? 0,
        pendingFeedback: pendingFeedback ?? 0,
        totalPosts: totalPosts ?? 0,
        totalMentorQuestions: totalMentorQuestions ?? 0,
        unansweredQuestions: unansweredQuestions ?? 0,
      });
    }
    load();
  }, [supabase]);

  if (!stats) return <p className="text-sm font-bold text-text-muted">Loading overview...</p>;

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="📊" title="Overview" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard emoji="👥" label="Total Users" value={stats.totalUsers} href="/admin/users" />
        <StatCard emoji="✨" label="Premium Members" value={stats.premiumUsers} href="/admin/users" />
        <StatCard emoji="🔥" label="Active Today" value={stats.activeToday} />
        <StatCard emoji="📝" label="Total Posts" value={stats.totalPosts} />
        <StatCard emoji="⏳" label="Pending Posts" value={stats.pendingPosts} href="/admin/moderation" />
        <StatCard emoji="🚨" label="Open Reports" value={stats.openReports} href="/admin/moderation" />
        <StatCard emoji="💬" label="Pending Feedback" value={stats.pendingFeedback} href="/admin/feedback" />
        <StatCard emoji="🤝" label="Mentor Questions" value={stats.totalMentorQuestions} href="/admin/mentors" />
        <StatCard emoji="❓" label="Unanswered Qs" value={stats.unansweredQuestions} href="/admin/mentors" />
      </div>

      <p className="text-center text-xs font-bold text-text-muted">
        For deeper trends, see <Link href="/admin/analytics" className="text-sky">Analytics →</Link>
      </p>
    </div>
  );
}
