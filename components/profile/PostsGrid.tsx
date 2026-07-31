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
  win: { emoji: "🏆", gradient: "bg-[#E8F5E9]" },
  question: { emoji: "❓", gradient: "bg-[#E3F2FD]" },
  idea: { emoji: "💡", gradient: "bg-[#FFF8E1]" },
  tip: { emoji: "🛠️", gradient: "bg-[#FFF0F0]" },
  motivation: { emoji: "🚀", gradient: "bg-[#F3E8FF]" },
  tool_review: { emoji: "🧰", gradient: "bg-gray-100" },
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
      <p className="mb-3 font-bold text-gray-900">Posts</p>
      {posts.length === 0 ? (
        <p className="text-sm text-gray-500">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {posts.map((p) => {
            const style = CATEGORY_STYLE[p.category] ?? CATEGORY_STYLE.tip;
            return (
              <div
                key={p.id}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl p-2 text-center shadow-sm ${style.gradient}`}
              >
                <span className="text-xl">{style.emoji}</span>
                <span className="line-clamp-2 text-[10px] font-semibold text-gray-700">
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
