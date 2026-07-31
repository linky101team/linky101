"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import GameCard from "@/components/ui/GameCard";

interface MemberWeeklyXP {
  id: string;
  first_name: string;
  weeklyXp: number;
}

/** Monday 00:00 UTC of the current week, as an ISO string. */
function startOfWeekISO(): string {
  const now = new Date();
  const day = now.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  return monday.toISOString();
}

export default function TeamLeaderboard() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [rows, setRows] = useState<MemberWeeklyXP[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    if (!profile.school_id) {
      setLoading(false);
      return;
    }

    async function load() {
      const schoolId = profile!.school_id!;
      const weekStart = startOfWeekISO();
      const weekStartDate = weekStart.slice(0, 10);

      const { data: members } = await supabase
        .from("profiles")
        .select("id, first_name")
        .eq("school_id", schoolId);

      const memberIds = (members ?? []).map((m) => m.id);
      if (memberIds.length === 0) {
        setLoading(false);
        return;
      }

      const tally = new Map<string, number>(memberIds.map((id) => [id, 0]));

      const [{ data: tasks }, { data: attempts }, { data: posts }, { data: spins }] = await Promise.all([
        supabase
          .from("daily_tasks")
          .select("user_id, xp_reward")
          .in("user_id", memberIds)
          .eq("is_completed", true)
          .gte("task_date", weekStartDate),
        supabase
          .from("quiz_attempts")
          .select("user_id, xp_earned")
          .in("user_id", memberIds)
          .gte("completed_at", weekStart),
        supabase
          .from("posts")
          .select("author_id")
          .in("author_id", memberIds)
          .eq("feed_type", "community")
          .eq("moderation_status", "approved")
          .gte("created_at", weekStart),
        supabase
          .from("daily_spins")
          .select("user_id, prize_type, prize_value")
          .in("user_id", memberIds)
          .gte("spin_date", weekStartDate),
      ]);

      for (const t of tasks ?? []) tally.set(t.user_id, (tally.get(t.user_id) ?? 0) + t.xp_reward);
      for (const a of attempts ?? []) tally.set(a.user_id, (tally.get(a.user_id) ?? 0) + a.xp_earned);
      for (const p of posts ?? []) tally.set(p.author_id, (tally.get(p.author_id) ?? 0) + 20);
      for (const s of spins ?? []) {
        if (s.prize_type === "xp") {
          const amount = (s.prize_value as { amount?: number } | null)?.amount ?? 0;
          tally.set(s.user_id, (tally.get(s.user_id) ?? 0) + amount);
        }
      }

      const ranked = (members ?? [])
        .map((m) => ({ id: m.id, first_name: m.first_name, weeklyXp: tally.get(m.id) ?? 0 }))
        .sort((a, b) => b.weeklyXp - a.weeklyXp)
        .slice(0, 10);

      setRows(ranked);
      setLoading(false);
    }

    load();
  }, [profile, supabase]);

  if (!profile?.school_id) return null;

  return (
    <div>
      <p className="mb-3 font-black uppercase tracking-wide text-white">📈 Team Leaderboard (This Week)</p>
      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <GameCard borderColor="green" glowColor="green">
          <div className="flex flex-col gap-2">
            {rows.map((row, i) => {
              const isMe = row.id === profile?.id;
              return (
                <div
                  key={row.id}
                  className={`flex items-center gap-3 rounded-xl border-3 p-2 ${
                    isMe ? "border-green bg-green/10" : "border-border bg-navy/40"
                  }`}
                >
                  <span className="w-5 shrink-0 text-center font-black text-yellow">{i + 1}</span>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-3 border-green bg-gradient-green-sky text-xs font-black text-navy">
                    {row.first_name?.charAt(0).toUpperCase() ?? "?"}
                  </span>
                  <span className="flex-1 truncate text-sm font-bold text-white">
                    {row.first_name} {isMe && <span className="text-green">(You)</span>}
                  </span>
                  <span className="shrink-0 text-xs font-black text-green">{row.weeklyXp} XP</span>
                </div>
              );
            })}
          </div>
        </GameCard>
      )}
    </div>
  );
}
