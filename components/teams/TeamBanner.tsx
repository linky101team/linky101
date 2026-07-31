"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import GameCard from "@/components/ui/GameCard";

interface TeamInfo {
  name: string;
  team_xp: number;
  rank: number;
  memberCount: number;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-lg font-black text-sky">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-text-muted">{label}</p>
    </div>
  );
}

export default function TeamBanner() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [team, setTeam] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    if (profile.school_type !== "school" || !profile.school_id) {
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
        setTeam({ name: mySchool.name, team_xp: mySchool.team_xp, rank, memberCount: memberCount ?? 0 });
      }
      setLoading(false);
    }

    load();
  }, [profile, supabase]);

  const displayName =
    profile?.school_type === "homeschool"
      ? "Homeschool Founders"
      : profile?.school_type === "no_school_yet"
        ? "Solo Founders"
        : (team?.name ?? "Your Team");

  return (
    <GameCard borderColor="sky" glowColor="sky" className="text-center">
      <p className="heading-game text-2xl">{displayName}</p>
      {loading ? (
        <p className="mt-2 text-sm font-bold text-text-muted">Loading team stats...</p>
      ) : team ? (
        <div className="mt-3 flex justify-center gap-6">
          <Stat label="Members" value={team.memberCount} />
          <Stat label="Team XP" value={team.team_xp} />
          <Stat label="Rank" value={`#${team.rank}`} />
        </div>
      ) : (
        <p className="mt-2 text-sm font-bold text-text-muted">
          {profile?.school_type === "school"
            ? "Team stats will appear here once your school is set up."
            : "You build at your own pace — but challenges and rankings are still open to you!"}
        </p>
      )}
    </GameCard>
  );
}
