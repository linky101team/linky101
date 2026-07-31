"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import type { ReactionType } from "@/lib/actions/reactions";
import LessonCard from "@/components/learn/LessonCard";
import QuickTipCard from "@/components/learn/QuickTipCard";
import PollCard from "@/components/learn/PollCard";
import QuoteCard from "@/components/learn/QuoteCard";
import type { LearnPost, ReactionState } from "@/components/learn/types";

const PAGE_SIZE = 10;

export default function LearnTopicPage() {
  const params = useParams<{ topic: string }>();
  const router = useRouter();
  const topic = decodeURIComponent(params.topic);
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);

  const [posts, setPosts] = useState<LearnPost[]>([]);
  const [reactionsByPost, setReactionsByPost] = useState<Record<string, ReactionState>>({});
  const [pollData, setPollData] = useState<Record<string, { counts: number[]; userVoted: number | null }>>({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(
    async (pageIndex: number) => {
      setLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data } = await supabase
        .from("posts")
        .select(
          "id, author_id, category, template_type, title, body, metadata, created_at, author:profiles(first_name, avatar_url)"
        )
        .eq("feed_type", "learn")
        .eq("moderation_status", "approved")
        .ilike("metadata->>topic", topic)
        .order("created_at", { ascending: false })
        .range(from, to);

      const newPosts = (data ?? []) as unknown as LearnPost[];
      setHasMore(newPosts.length === PAGE_SIZE);
      setPosts((prev) => (pageIndex === 0 ? newPosts : [...prev, ...newPosts]));

      const postIds = newPosts.map((p) => p.id);
      if (postIds.length > 0) {
        const { data: reactions } = await supabase
          .from("reactions")
          .select("post_id, user_id, reaction_type")
          .in("post_id", postIds);

        setReactionsByPost((prev) => {
          const next = { ...prev };
          for (const postId of postIds) {
            const rows = reactions?.filter((r) => r.post_id === postId) ?? [];
            const counts: Partial<Record<ReactionType, number>> = {};
            const active: ReactionType[] = [];
            for (const r of rows) {
              const type = r.reaction_type as ReactionType;
              counts[type] = (counts[type] ?? 0) + 1;
              if (r.user_id === profile?.id) active.push(type);
            }
            next[postId] = { counts, active };
          }
          return next;
        });

        const pollPostIds = newPosts.filter((p) => p.template_type === "poll").map((p) => p.id);
        if (pollPostIds.length > 0) {
          const { data: votes } = await supabase
            .from("poll_votes")
            .select("post_id, user_id, option_index")
            .in("post_id", pollPostIds);

          setPollData((prev) => {
            const next = { ...prev };
            for (const postId of pollPostIds) {
              const rows = votes?.filter((v) => v.post_id === postId) ?? [];
              const post = newPosts.find((p) => p.id === postId);
              const optionCount = Array.isArray(post?.metadata?.options)
                ? (post!.metadata.options as string[]).length
                : 0;
              const counts = Array(optionCount).fill(0);
              let userVoted: number | null = null;
              for (const v of rows) {
                if (v.option_index < counts.length) counts[v.option_index]++;
                if (v.user_id === profile?.id) userVoted = v.option_index;
              }
              next[postId] = { counts, userVoted };
            }
            return next;
          });
        }
      }

      setLoading(false);
    },
    [supabase, profile?.id, topic]
  );

  useEffect(() => {
    if (!profile) return;
    setPage(0);
    loadPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, topic]);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    loadPage(next);
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/discover")}
          aria-label="Back to Discover"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-transform active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.5} />
        </button>
        <span className="font-bold text-gray-900">{topic}</span>
      </div>

      {posts.length === 0 && !loading && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <span className="text-4xl">💡</span>
          <p className="mt-2 font-bold text-gray-900">Nothing on {topic} yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Be the first — share a tip or question about {topic.toLowerCase()} on the Feed.
          </p>
          <button
            type="button"
            onClick={() => router.push("/community")}
            className="mt-4 rounded-full bg-[#1A1A2E] px-5 py-2 text-sm font-bold text-white transition-transform active:scale-95"
          >
            Go to Feed →
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {posts.map((post) => {
          const reaction = reactionsByPost[post.id] ?? { counts: {}, active: [] };
          switch (post.template_type) {
            case "quick_tip":
              return <QuickTipCard key={post.id} post={post} reaction={reaction} />;
            case "poll":
              return (
                <PollCard
                  key={post.id}
                  post={post}
                  poll={pollData[post.id] ?? { counts: [], userVoted: null }}
                  onVoted={(optionIndex) => {
                    setPollData((prev) => {
                      const current = prev[post.id] ?? { counts: [], userVoted: null };
                      const counts = [...current.counts];
                      counts[optionIndex] = (counts[optionIndex] ?? 0) + 1;
                      return { ...prev, [post.id]: { counts, userVoted: optionIndex } };
                    });
                  }}
                />
              );
            case "quote":
              return <QuoteCard key={post.id} post={post} reaction={reaction} />;
            default:
              return <LessonCard key={post.id} post={post} reaction={reaction} />;
          }
        })}
      </div>

      {loading && <p className="text-center text-sm font-semibold text-gray-400">Loading...</p>}

      {hasMore && !loading && posts.length > 0 && (
        <button
          type="button"
          onClick={handleLoadMore}
          className="rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-transform active:scale-[0.98]"
        >
          Load more
        </button>
      )}
    </div>
  );
}
