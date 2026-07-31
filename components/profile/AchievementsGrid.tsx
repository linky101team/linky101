"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  xp_reward: number;
}

interface AchievementsGridProps {
  userId: string;
}

export default function AchievementsGrid({ userId }: AchievementsGridProps) {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedIds, setEarnedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: all }, { data: earned }] = await Promise.all([
        supabase.from("achievements").select("id, name, description, icon, xp_reward").order("xp_reward"),
        supabase.from("user_achievements").select("achievement_id").eq("user_id", userId),
      ]);
      setAchievements(all ?? []);
      setEarnedIds(new Set((earned ?? []).map((e) => e.achievement_id)));
      setLoading(false);
    }
    load();
  }, [userId, supabase]);

  if (loading) return <p className="text-sm font-bold text-text-muted">Loading achievements...</p>;
  if (achievements.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="font-black uppercase tracking-wide text-white">🏅 Achievements</p>
        <span className="text-xs font-black text-text-muted">
          {earnedIds.size}/{achievements.length} earned
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {achievements.map((a) => {
          const earned = earnedIds.has(a.id);
          return (
            <div
              key={a.id}
              title={a.description ?? a.name}
              className={`flex flex-col items-center gap-1 rounded-xl border-3 p-2 text-center ${
                earned ? "border-green bg-navy/40 shadow-glow-green" : "border-border bg-navy/20 opacity-35"
              }`}
            >
              <span className="text-2xl">{a.icon ?? "🏅"}</span>
              <span className="line-clamp-2 text-[9px] font-black uppercase leading-tight text-white">
                {a.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
