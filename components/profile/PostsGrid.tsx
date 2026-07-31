"use client";

import { useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";

interface Post {
  id: string;
  category: string;
  title: string | null;
  body: string | null;
}

const CATEGORY_STYLE: Record<string, { emoji: string; gradient: string }> = {
  win: { emoji: "🏆", gradient: "bg-gradient-green-sky" },
  question: { emoji: "❓", gradient: "bg-gradient-pink-purple" },
  idea: { emoji: "💡", gradient: "bg-gradient-yellow-orange" },
  tip: { emoji: "🛠️", gradient: "bg-gradient-yellow-orange" },
  motivation: { emoji: "🚀", gradient: "bg-gradient-purple-pink" },
  tool_review: { emoji: "🧰", gradient: "bg-gradient-sky-purple" },
};

interface PostsGridProps {
  userId: string;
}

export default function PostsGrid({ userId }: PostsGridProps) {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("posts")
      .select("id, category, title, body")
      .eq("author_id", userId)
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .limit(9)
      .then(({ data }) => {
        setPosts(data ?? []);
        setLoading(false);
      });
  }, [userId, supabase]);

  if (loading) return null;

  return (
    <div>
      <p className="mb-3 font-black uppercase tracking-wide text-ink">🗂️ Posts</p>
      {posts.length === 0 ? (
        <p className="text-sm font-bold text-text-muted">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {posts.map((p) => {
            const style = CATEGORY_STYLE[p.category] ?? CATEGORY_STYLE.tip;
            return (
              <div
                key={p.id}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-3 border-border p-2 text-center ${style.gradient}`}
              >
                <span className="text-xl">{style.emoji}</span>
                <span className="line-clamp-2 text-[10px] font-black text-ink">
                  {p.title ?? p.body?.slice(0, 40) ?? "Post"}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
