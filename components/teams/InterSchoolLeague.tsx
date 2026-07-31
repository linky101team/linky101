"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";

interface School {
  id: string;
  name: string;
  region: string | null;
  team_xp: number;
  is_premium_school: boolean;
}

export default function InterSchoolLeague() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [schools, setSchools] = useState<School[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("schools")
      .select("id, name, region, team_xp, is_premium_school")
      .order("team_xp", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setSchools(data ?? []);
        setLoading(false);
      });
  }, [supabase]);

  if (!loading && schools.length === 0) return null;

  return (
    <div>
      <p className="mb-3 font-black uppercase tracking-wide text-white">🏅 Inter-School League</p>
      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {schools.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setExpanded((prev) => (prev === s.id ? null : s.id))}
              className="rounded-xl border-3 border-purple bg-card p-3 text-left shadow-glow-purple"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 shrink-0 text-center font-black text-yellow">{i + 1}</span>
                <span className="flex-1 truncate text-sm font-black text-white">{s.name}</span>
                <span className="shrink-0 text-xs font-black text-purple">{s.team_xp} XP</span>
              </div>
              {expanded === s.id && (
                <div className="mt-2 flex items-center gap-2 border-t-3 border-border pt-2 text-xs font-bold text-text-muted">
                  <span>{s.region ? `📍 ${s.region}` : "Region not set"}</span>
                  {s.is_premium_school && <span className="text-yellow">⭐ Premium School</span>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
