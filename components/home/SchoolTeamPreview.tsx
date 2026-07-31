"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import GameCard from "@/components/ui/GameCard";

interface SchoolInfo {
  name: string;
  team_xp: number;
  rank: number;
  memberCount: number;
}

export default function SchoolTeamPreview() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [school, setSchool] = useState<SchoolInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    if (!profile.school_id) {
      setLoading(false);
      return;
    }

    async function load() {
      const schoolId = profile!.school_id!;
      const [{ data: allSchools }, { count: memberCount }] = await Promise.all([
        supabase.from("schools").select("id, name, team_xp").order("team_xp", { ascending: false }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("school_id", schoolId),
      ]);

      const mySchool = allSchools?.find((s) => s.id === schoolId);
      const rank = allSchools ? allSchools.findIndex((s) => s.id === schoolId) + 1 : 0;

      if (mySchool) {
        setSchool({ name: mySchool.name, team_xp: mySchool.team_xp, rank, memberCount: memberCount ?? 0 });
      }
      setLoading(false);
    }

    load();
  }, [profile, supabase]);

  if (loading) return null;

  return (
    <GameCard borderColor="sky" glowColor="sky">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-black uppercase tracking-wide text-white">🏫 Your Team</span>
        <Link href="/teams" className="text-xs font-black uppercase tracking-wide text-sky">
          View Team →
        </Link>
      </div>

      {school ? (
        <>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="font-black uppercase text-white">{school.name}</p>
              <p className="text-xs font-bold text-text-muted">{school.memberCount} members</p>
            </div>
            <span className="rounded-full border-3 border-sky bg-navy/60 px-3 py-1 text-xs font-black text-sky">
              Rank #{school.rank}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-gradient-sky-purple shadow-glow-sky"
              style={{ width: `${Math.min(100, (school.team_xp % 1000) / 10)}%` }}
            />
          </div>
          <p className="mt-1 text-right text-xs font-bold text-text-muted">{school.team_xp} Team XP</p>
        </>
      ) : (
        <p className="text-sm font-bold text-text-muted">
          Add your school in your profile to join a team.
        </p>
      )}
    </GameCard>
  );
}
