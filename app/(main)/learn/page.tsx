"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import type { ReactionType } from "@/lib/actions/reactions";
import SectionTitle from "@/components/ui/SectionTitle";
import LessonCard from "@/components/learn/LessonCard";
import QuickTipCard from "@/components/learn/QuickTipCard";
import PollCard from "@/components/learn/PollCard";
import QuoteCard from "@/components/learn/QuoteCard";
import SubmitLessonModal from "@/components/learn/SubmitLessonModal";
import PodcastsTab from "@/components/learn/PodcastsTab";
import TutorialPrompt from "@/components/TutorialPrompt";
import type { LearnPost, ReactionState } from "@/components/learn/types";

const PAGE_SIZE = 10;
const SUBMIT_LEVEL = 10;

function LearnFeed() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic");
  const tab = searchParams.get("tab") === "podcasts" ? "podcasts" : "feed";

  const [posts, setPosts] = useState<LearnPost[]>([]);
  const [reactionsByPost, setReactionsByPost] = useState<Record<string, ReactionState>>({});
  const [pollData, setPollData] = useState<
    Record<string, { counts: number[]; userVoted: number | null }>
  >({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showSubmit, setShowSubmit] = useState(false);

  const loadPage = useCallback(
    async (pageIndex: number) => {
      setLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("posts")
        .select(
          "id, author_id, category, template_type, title, body, metadata, created_at, author:profiles(first_name, avatar_url)"
        )
        .eq("feed_type", "learn")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (topic) {
        query = query.ilike("metadata->>topic", topic);
      }

      const { data } = await query;

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

  const canSubmit = (profile?.level ?? 0) >= SUBMIT_LEVEL;

  return (
    <div className="flex flex-col gap-6 pb-16">
      <SectionTitle emoji="📚" title="Learn" />

      <div data-tour="learn-tabs" className="flex gap-2">
        <button
          type="button"
          onClick={() => router.push("/learn")}
          className={`flex-1 rounded-xl border-3 py-2 text-xs font-black uppercase tracking-wide ${
            tab === "feed" ? "border-pink bg-pink text-white shadow-glow-pink" : "border-border text-text-muted"
          }`}
        >
          📚 Feed
        </button>
        <button
          type="button"
          onClick={() => router.push("/learn?tab=podcasts")}
          className={`flex-1 rounded-xl border-3 py-2 text-xs font-black uppercase tracking-wide ${
            tab === "podcasts" ? "border-pink bg-pink text-white shadow-glow-pink" : "border-border text-text-muted"
          }`}
        >
          🎧 Podcasts
        </button>
      </div>

      {tab === "podcasts" ? (
        <PodcastsTab />
      ) : (
        <>
      {topic && (
        <div className="flex items-center gap-2 rounded-xl border-3 border-pink bg-navy/40 px-3 py-2">
          <span className="text-xs font-black uppercase tracking-wide text-pink">
            Topic: {topic}
          </span>
          <button
            type="button"
            onClick={() => router.push("/learn")}
            className="ml-auto text-xs font-black uppercase text-text-muted"
          >
            Clear ✕
          </button>
        </div>
      )}

      {posts.length === 0 && !loading && (
        <p className="text-sm font-bold text-text-muted">No lessons yet — check back soon!</p>
      )}

      <div data-tour="learn-feed" className="flex flex-col gap-4">
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

      {canSubmit && (
        <div data-tour="learn-fab" className="pointer-events-none fixed inset-x-0 bottom-24 z-30">
          <div className="mx-auto max-w-[430px] px-4">
            <button
              type="button"
              onClick={() => setShowSubmit(true)}
              aria-label="Submit a lesson"
              className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-2xl font-black text-white shadow-glow-pink"
            >
              +
            </button>
          </div>
        </div>
      )}

      <SubmitLessonModal
        isOpen={showSubmit}
        onClose={() => setShowSubmit(false)}
        onSubmitted={() => loadPage(0)}
      />
        </>
      )}

      <TutorialPrompt tourId="learn" />
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<p className="text-sm font-bold text-text-muted">Loading...</p>}>
      <LearnFeed />
    </Suspense>
  );
}
