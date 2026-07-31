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
          className="flex h-9 w-9 items-center justify-center rounded-full border-3 border-border bg-card text-text-muted"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={3} />
        </button>
        <span className="text-sm font-black uppercase tracking-wide text-pink">Topic: {topic}</span>
      </div>

      {posts.length === 0 && !loading && (
        <p className="text-sm font-bold text-text-muted">No posts on this topic yet — check back soon!</p>
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

      {loading && <p className="text-center text-sm font-bold text-text-muted">Loading...</p>}

      {hasMore && !loading && posts.length > 0 && (
        <button
          type="button"
          onClick={handleLoadMore}
          className="rounded-xl border-3 border-border bg-card py-2 text-sm font-black uppercase text-text-muted"
        >
          Load More
        </button>
      )}
    </div>
  );
}
