"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile, useProfileStore } from "@/hooks/useProfile";
import { bumpToGold } from "@/lib/actions/posts";
import type { ReactionType } from "@/lib/actions/reactions";
import SectionTitle from "@/components/ui/SectionTitle";
import CategoryFilters from "@/components/community/CategoryFilters";
import PostCard from "@/components/community/PostCard";
import CommentSection from "@/components/community/CommentSection";
import NewPostModal from "@/components/community/NewPostModal";
import TutorialPrompt from "@/components/TutorialPrompt";
import type { CommunityPost, ReactionState } from "@/components/community/types";

const PAGE_SIZE = 10;
const GOLD_BUMP_LEVEL = 5;
const CUSTOM_COMMENT_LEVEL = 10;

export default function CommunityPage() {
  const { profile } = useProfile();
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const supabase = useMemo(() => createClientSupabase(), []);

  const [category, setCategory] = useState("all");
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [reactionsByPost, setReactionsByPost] = useState<Record<string, ReactionState>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showNewPost, setShowNewPost] = useState(false);

  const loadPage = useCallback(
    async (pageIndex: number, activeCategory: string) => {
      setLoading(true);
      const from = pageIndex * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("posts")
        .select(
          "id, author_id, category, title, body, is_gold, created_at, author:profiles(first_name, avatar_url)"
        )
        .eq("feed_type", "community")
        .eq("moderation_status", "approved")
        .order("created_at", { ascending: false })
        .range(from, to);

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }

      const { data } = await query;
      const newPosts = (data ?? []) as unknown as CommunityPost[];
      setHasMore(newPosts.length === PAGE_SIZE);
      setPosts((prev) => (pageIndex === 0 ? newPosts : [...prev, ...newPosts]));

      const postIds = newPosts.map((p) => p.id);
      if (postIds.length > 0) {
        const [{ data: reactions }, { data: comments }] = await Promise.all([
          supabase.from("reactions").select("post_id, user_id, reaction_type").in("post_id", postIds),
          supabase.from("comments").select("post_id").in("post_id", postIds),
        ]);

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

        setCommentCounts((prev) => {
          const next = { ...prev };
          for (const postId of postIds) {
            next[postId] = comments?.filter((c) => c.post_id === postId).length ?? 0;
          }
          return next;
        });
      }

      setLoading(false);
    },
    [supabase, profile?.id]
  );

  useEffect(() => {
    if (!profile) return;
    setPage(0);
    loadPage(0, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, category]);

  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    loadPage(next, category);
  }

  function toggleComments(postId: string) {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  async function handleBumpGold(postId: string) {
    try {
      await bumpToGold(postId);
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, is_gold: true } : p)));
    } catch {
      // Level requirement not met or already gold — silently ignore, button stays visible.
    }
  }

  const canBumpGold = (profile?.level ?? 0) >= GOLD_BUMP_LEVEL;
  const canCustomComment = (profile?.level ?? 0) >= CUSTOM_COMMENT_LEVEL;

  return (
    <div className="flex flex-col gap-6 pb-16">
      <SectionTitle emoji="👥" title="Community" />

      <div data-tour="community-filters">
        <CategoryFilters active={category} onChange={setCategory} />
      </div>

      {posts.length === 0 && !loading && (
        <p className="text-sm font-bold text-text-muted">No posts here yet — be the first!</p>
      )}

      <div data-tour="community-feed" className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            reaction={reactionsByPost[post.id] ?? { counts: {}, active: [] }}
            commentCount={commentCounts[post.id] ?? 0}
            commentsOpen={openComments.has(post.id)}
            onToggleComments={() => toggleComments(post.id)}
            canBumpGold={canBumpGold}
            onBumpGold={() => handleBumpGold(post.id)}
          >
            <CommentSection
              postId={post.id}
              isOpen={openComments.has(post.id)}
              canCustomComment={canCustomComment}
              authorName={profile?.first_name ?? "You"}
              onCommentAdded={() =>
                setCommentCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] ?? 0) + 1 }))
              }
            />
          </PostCard>
        ))}
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

      <div data-tour="community-fab" className="pointer-events-none fixed inset-x-0 bottom-40 z-30">
        <div className="mx-auto max-w-[430px] px-4">
          <button
            type="button"
            onClick={() => setShowNewPost(true)}
            aria-label="New post"
            className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-2xl font-black text-white shadow-glow-pink"
          >
            +
          </button>
        </div>
      </div>

      <NewPostModal
        isOpen={showNewPost}
        onClose={() => setShowNewPost(false)}
        onSubmitted={() => {
          loadPage(0, category);
          refreshProfile();
        }}
      />

      <TutorialPrompt tourId="community" />
    </div>
  );
}
