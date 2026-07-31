"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClientSupabase } from "@/lib/supabase/client";

const TOPICS = [
  { key: "Pitch Decks", emoji: "🎯", color: "border-pink", bg: "bg-pink/10" },
  { key: "Marketing", emoji: "📣", color: "border-sky", bg: "bg-sky/10" },
  { key: "Finance", emoji: "💰", color: "border-green", bg: "bg-green/10" },
  { key: "Tools", emoji: "🛠️", color: "border-purple", bg: "bg-purple/10" },
  { key: "Branding", emoji: "🎨", color: "border-orange", bg: "bg-orange/10" },
  { key: "Start Up", emoji: "🚀", color: "border-border", bg: "bg-navy/60" },
];

export default function TopicsGrid() {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function loadCounts() {
      const entries = await Promise.all(
        TOPICS.map(async (t) => {
          const { count } = await supabase
            .from("posts")
            .select("id", { count: "exact", head: true })
            .eq("moderation_status", "approved")
            .ilike("metadata->>topic", t.key);
          return [t.key, count ?? 0] as const;
        })
      );
      setCounts(Object.fromEntries(entries));
    }
    loadCounts();
  }, [supabase]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {TOPICS.map((t) => (
        <Link
          key={t.key}
          href={`/learn/topic/${encodeURIComponent(t.key)}`}
          className={`flex flex-col items-center gap-1 rounded-2xl border-3 ${t.color} ${t.bg} p-3 text-center`}
        >
          <span className="text-2xl">{t.emoji}</span>
          <span className="text-[11px] font-black uppercase leading-tight text-ink">{t.key}</span>
          <span className="text-[10px] font-bold text-text-muted">{counts[t.key] ?? 0} posts</span>
        </Link>
      ))}
    </div>
  );
}
