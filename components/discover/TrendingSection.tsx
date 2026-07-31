"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";

interface TrendingPost {
  id: string;
  title: string | null;
  body: string | null;
  category: string;
  author: { first_name: string } | null;
  reactionCount: number;
}

export default function TrendingSection() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
      const { data: reactions } = await supabase
        .from("reactions")
        .select("post_id")
        .gte("created_at", sevenDaysAgo);

      const tally = new Map<string, number>();
      for (const r of reactions ?? []) {
        tally.set(r.post_id, (tally.get(r.post_id) ?? 0) + 1);
      }
      const topIds = Array.from(tally.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([id]) => id);

      if (topIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: postRows } = await supabase
        .from("posts")
        .select("id, title, body, category, author:profiles(first_name)")
        .in("id", topIds)
        .eq("moderation_status", "approved");

      const merged = ((postRows ?? []) as unknown as Omit<TrendingPost, "reactionCount">[])
        .map((p) => ({ ...p, reactionCount: tally.get(p.id) ?? 0 }))
        .sort((a, b) => b.reactionCount - a.reactionCount);

      setPosts(merged);
      setLoading(false);
    }
    load();
  }, [supabase]);

  if (!loading && posts.length === 0) return null;

  return (
    <div>
      <p className="mb-3 font-black uppercase tracking-wide text-ink">🔥 Trending This Week</p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {loading && <p className="text-sm font-bold text-text-muted">Loading...</p>}
        {posts.map((p) => (
          <div
            key={p.id}
            className="w-52 shrink-0 rounded-2xl border-3 border-pink bg-card p-3 shadow-glow-pink"
          >
            <p className="mb-1 text-xs font-black uppercase text-pink">{p.category}</p>
            {p.title && <p className="mb-1 truncate text-sm font-black text-ink">{p.title}</p>}
            {p.body && <p className="line-clamp-2 text-xs font-bold text-text-muted">{p.body}</p>}
            <p className="mt-2 text-xs font-bold text-text-muted">
              🔥 {p.reactionCount} · by {p.author?.first_name ?? "Member"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
