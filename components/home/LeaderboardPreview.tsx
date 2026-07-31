"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import GameCard from "@/components/ui/GameCard";

interface LeaderRow {
  id: string;
  first_name: string;
  level: number;
  xp: number;
}

export default function LeaderboardPreview() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, first_name, level, xp")
      .order("xp", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setRows(data ?? []);
        setLoading(false);
      });
  }, [supabase]);

  return (
    <GameCard borderColor="pink" glowColor="pink">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-black uppercase tracking-wide text-ink">🏆 Leaderboard</span>
        <Link href="/leaderboard" className="text-xs font-black uppercase tracking-wide text-sky">
          See Full Rankings →
        </Link>
      </div>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => {
            const isMe = row.id === profile?.id;
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 rounded-xl border-3 p-2 ${
                  isMe ? "border-pink bg-pink/10" : "border-border bg-navy/40"
                }`}
              >
                <span className="w-5 shrink-0 text-center font-black text-yellow">{i + 1}</span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-xs font-black text-white">
                  {row.first_name?.charAt(0).toUpperCase() ?? "?"}
                </span>
                <span className="flex-1 truncate text-sm font-bold text-ink">
                  {row.first_name} {isMe && <span className="text-pink">(You)</span>}
                </span>
                <span className="shrink-0 text-xs font-black text-yellow">{row.xp} XP</span>
              </div>
            );
          })}
        </div>
      )}
    </GameCard>
  );
}
