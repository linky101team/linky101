"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";

interface Mentor {
  id: string;
  display_name: string;
  bio: string | null;
  expertise: string[];
  is_verified: boolean;
}

export default function CreatorsRow() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("mentors")
      .select("id, display_name, bio, expertise, is_verified")
      .eq("is_active", true)
      .limit(10)
      .then(({ data }) => {
        setMentors(data ?? []);
        setLoading(false);
      });
  }, [supabase]);

  if (!loading && mentors.length === 0) return null;

  return (
    <div>
      <p className="mb-3 font-black uppercase tracking-wide text-white">🎓 Creators &amp; Ambassadors</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {loading && <p className="text-sm font-bold text-text-muted">Loading...</p>}
        {mentors.map((m) => (
          <div
            key={m.id}
            className="w-40 shrink-0 rounded-2xl border-3 border-sky bg-card p-3 text-center shadow-glow-sky"
          >
            <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border-3 border-sky bg-gradient-sky-purple text-lg font-black text-white">
              {m.display_name.charAt(0).toUpperCase()}
            </span>
            <p className="truncate text-sm font-black text-white">{m.display_name}</p>
            <span className="mt-1 inline-block rounded-full border-2 border-sky px-2 py-0.5 text-[9px] font-black uppercase text-sky">
              {m.is_verified ? "✓ Verified Mentor" : "Mentor"}
            </span>
            {m.expertise?.length > 0 && (
              <p className="mt-1 truncate text-[10px] font-bold text-text-muted">
                {m.expertise.slice(0, 2).join(", ")}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
