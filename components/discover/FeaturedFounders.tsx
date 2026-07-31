"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { toggleFollow } from "@/lib/actions/follows";
import { getLevelTitle } from "@/lib/levels";

interface Founder {
  id: string;
  first_name: string;
  level: number;
  xp: number;
  headline: string | null;
}

export default function FeaturedFounders() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [founders, setFounders] = useState<Founder[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, level, xp, headline")
        .gte("last_active_date", sevenDaysAgo)
        .neq("id", profile!.id)
        .order("xp", { ascending: false })
        .limit(8);

      setFounders(data ?? []);

      if (data && data.length > 0) {
        const { data: follows } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", profile!.id)
          .in(
            "following_id",
            data.map((d) => d.id)
          );
        setFollowing(new Set((follows ?? []).map((f) => f.following_id)));
      }
      setLoading(false);
    }
    load();
  }, [profile, supabase]);

  function handleToggleFollow(id: string) {
    const isFollowing = following.has(id);
    setFollowing((prev) => {
      const next = new Set(prev);
      if (isFollowing) next.delete(id);
      else next.add(id);
      return next;
    });
    startTransition(async () => {
      try {
        await toggleFollow(id);
      } catch {
        setFollowing((prev) => {
          const next = new Set(prev);
          if (isFollowing) next.add(id);
          else next.delete(id);
          return next;
        });
      }
    });
  }

  if (!loading && founders.length === 0) return null;

  return (
    <div>
      <p className="mb-3 font-black uppercase tracking-wide text-white">⭐ Featured Founders</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {loading && <p className="text-sm font-bold text-text-muted">Loading...</p>}
        {founders.map((f) => {
          const isFollowing = following.has(f.id);
          return (
            <div
              key={f.id}
              className="w-36 shrink-0 rounded-2xl border-3 border-purple bg-card p-3 text-center shadow-glow-purple"
            >
              <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-lg font-black text-white">
                {f.first_name.charAt(0).toUpperCase()}
              </span>
              <p className="truncate text-sm font-black text-white">{f.first_name}</p>
              <p className="mb-2 truncate text-[10px] font-bold text-text-muted">
                Lv {f.level} · {getLevelTitle(f.level)}
              </p>
              <button
                type="button"
                onClick={() => handleToggleFollow(f.id)}
                className={`w-full rounded-full border-3 py-1 text-[10px] font-black uppercase ${
                  isFollowing
                    ? "border-border text-text-muted"
                    : "border-pink bg-gradient-pink-purple text-white"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
