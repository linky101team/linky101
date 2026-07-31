"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { getLevelTitle } from "@/lib/levels";
import SectionTitle from "@/components/ui/SectionTitle";

interface LeaderRow {
  id: string;
  first_name: string;
  level: number;
  xp: number;
}

export default function LeaderboardPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, first_name, level, xp")
      .order("xp", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, [supabase]);

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="🏆" title="Leaderboard" />

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => {
            const isMe = row.id === profile?.id;
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 rounded-xl border-3 p-3 ${
                  isMe ? "border-pink bg-pink/10 shadow-glow-pink" : "border-border bg-card"
                }`}
              >
                <span className="w-6 shrink-0 text-center font-black text-yellow">
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-sm font-black text-white">
                  {row.first_name?.charAt(0).toUpperCase() ?? "?"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">
                    {row.first_name} {isMe && <span className="text-pink">(You)</span>}
                  </p>
                  <p className="text-xs font-bold text-text-muted">
                    Lv {row.level} · {getLevelTitle(row.level)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-black text-yellow">{row.xp} XP</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
