"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile, useProfileStore } from "@/hooks/useProfile";
import type { ReactionType } from "@/lib/actions/reactions";
import CategoryFilters from "@/components/community/CategoryFilters";
import PostCard from "@/components/community/PostCard";
import CommentSection from "@/components/community/CommentSection";
import NewPostModal from "@/components/community/NewPostModal";
import TutorialPrompt from "@/components/TutorialPrompt";
import { Reveal } from "@/components/ui/Reveal";
import type { CommunityPost, ReactionState } from "@/components/community/types";

const PAGE_SIZE = 10;

interface StarterPost {
  id: string;
  name: string;
  age: number;
  color: string;
  category: "win" | "question" | "idea";
  title: string;
  body: string;
  likes: number;
  comments: number;
  timeAgo: string;
}

const STARTER_POSTS: StarterPost[] = [
  {
    id: "starter-theo",
    name: "Theo",
    age: 15,
    color: "#2ECC71",
    category: "question",
    title: "How should I price car washing?",
    body: "I'm washing neighbours' cars at £5 but my mate reckons I should charge £10 minimum. I don't want to lose customers though. What would you actually pay?",
    likes: 12,
    comments: 9,
    timeAgo: "5h",
  },
  {
    id: "starter-ella",
    name: "Ella",
    age: 18,
    color: "#039BE5",
    category: "idea",
    title: "Thrift flipping is the easiest way to learn margins",
    body: "Flipped a £4 charity shop jacket for £28 on Vinted this week. Buy low, clean it up, take good photos, sell high. That's literally a whole business lesson in one go.",
    likes: 27,
    comments: 8,
    timeAgo: "6h",
  },
  {
    id: "starter-aisha",
    name: "Aisha",
    age: 16,
    color: "#FFC107",
    category: "idea",
    title: "Revision cards made by students who just sat the exam",
    body: "Idea: flashcards designed by people who literally just took the exam, sold to the year below. Who knows the paper better than us? Would you buy these?",
    likes: 31,
    comments: 11,
    timeAgo: "1d",
  },
  {
    id: "starter-maya",
    name: "Maya",
    age: 17,
    color: "#FF6B6B",
    category: "win",
    title: "50 orders on my Etsy jewellery shop this month 💍",
    body: "Started with £20 of beads in my bedroom in January. This month I hit 50 orders. Biggest lesson so far: good photos matter more than good products. Ask me anything!",
    likes: 23,
    comments: 6,
    timeAgo: "2d",
  },
  {
    id: "starter-sam",
    name: "Sam",
    age: 14,
    color: "#A78BFA",
    category: "win",
    title: "My Roblox game passed 1,000 plays 🎮",
    body: "Took me 3 months of teaching myself to code after school. 1,000 plays this week. Next step is working out how the monetisation side works.",
    likes: 19,
    comments: 4,
    timeAgo: "3d",
  },
];

const STARTER_CHIP: Record<StarterPost["category"], { chipBg: string; chipText: string; label: string }> = {
  win: { chipBg: "bg-[#E8F5E9]", chipText: "text-[#2ECC71]", label: "🏆 Win" },
  question: { chipBg: "bg-[#E3F2FD]", chipText: "text-[#039BE5]", label: "❓ Question" },
  idea: { chipBg: "bg-[#FFF8E1]", chipText: "text-[#B8860B]", label: "💡 Idea" },
};

function StarterPostCard({ post }: { post: StarterPost }) {
  const [liked, setLiked] = useState(false);
  const chip = STARTER_CHIP[post.category];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: post.color }}
        >
          {post.name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">
            {post.name} <span className="font-medium text-gray-400">· {post.age}</span>
          </p>
          <p className="text-[11px] text-gray-400">{post.timeAgo} ago</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${chip.chipBg} ${chip.chipText}`}>
          {chip.label}
        </span>
      </div>

      <h3 className="mb-1 font-bold leading-snug text-gray-900">{post.title}</h3>
      <p className="mb-3 text-sm leading-relaxed text-gray-600">{post.body}</p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setLiked((v) => !v)}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-all active:scale-90 ${
            liked ? "text-[#FF6B6B]" : "text-gray-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? "fill-[#FF6B6B]" : ""}`} strokeWidth={2} />
          {post.likes + (liked ? 1 : 0)}
        </button>
        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">💬 {post.comments}</span>
      </div>
    </div>
  );
}

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

  const starterPosts =
    category === "all" ? STARTER_POSTS : STARTER_POSTS.filter((p) => p.category === category);

  return (
    <div className="flex flex-col gap-5 pb-16">
      <div>
        <h1 className="text-lg font-bold text-gray-900">Feed</h1>
        <p className="text-sm text-gray-500">Wins, questions and ideas from young founders</p>
      </div>

      <div data-tour="community-filters">
        <CategoryFilters active={category} onChange={setCategory} />
      </div>

      {category === "all" && (
        <Reveal>
          <div className="rounded-2xl bg-[#1A1A2E] p-4">
            <p className="font-bold text-white">Welcome to the Feed 👋</p>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              Share a win, ask a question or drop an idea. Everyone here is building something — tap{" "}
              <span className="font-bold text-[#FFD93D]">+</span> to post yours.
            </p>
          </div>
        </Reveal>
      )}

      <div data-tour="community-feed" className="flex flex-col gap-4">
        {posts.map((post, i) => (
          <Reveal key={post.id} index={i}>
            <PostCard
              post={post}
              reaction={reactionsByPost[post.id] ?? { counts: {}, active: [] }}
              commentCount={commentCounts[post.id] ?? 0}
              commentsOpen={openComments.has(post.id)}
              onToggleComments={() => toggleComments(post.id)}
            >
              <CommentSection
                postId={post.id}
                isOpen={openComments.has(post.id)}
                canCustomComment
                authorName={profile?.first_name ?? "You"}
                onCommentAdded={() =>
                  setCommentCounts((prev) => ({ ...prev, [post.id]: (prev[post.id] ?? 0) + 1 }))
                }
              />
            </PostCard>
          </Reveal>
        ))}

        {!loading &&
          starterPosts.map((post, i) => (
            <Reveal key={post.id} index={posts.length + i}>
              <StarterPostCard post={post} />
            </Reveal>
          ))}
      </div>

      {loading && <p className="text-center text-sm font-semibold text-gray-400">Loading...</p>}

      {!loading && posts.length === 0 && starterPosts.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <span className="text-4xl">✍️</span>
          <p className="mt-2 font-bold text-gray-900">Nothing here yet</p>
          <p className="text-sm text-gray-500">Be the first to post in this category.</p>
        </div>
      )}

      {hasMore && !loading && posts.length > 0 && (
        <button
          type="button"
          onClick={handleLoadMore}
          className="rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition-transform active:scale-[0.98]"
        >
          Load more
        </button>
      )}

      <div data-tour="community-fab" className="pointer-events-none fixed inset-x-0 bottom-24 z-30">
        <div className="mx-auto max-w-[430px] px-5">
          <button
            type="button"
            onClick={() => setShowNewPost(true)}
            aria-label="New post"
            className="pointer-events-auto ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1A1A2E] text-2xl font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-xl active:scale-90"
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
