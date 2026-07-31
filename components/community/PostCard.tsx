"use client";

import ReactionBar from "@/components/ReactionBar";
import ReportButton from "@/components/ReportButton";
import type { CommunityPost, ReactionState } from "./types";

const CATEGORY_STYLE: Record<string, { border: string; glow: string; emoji: string }> = {
  win: { border: "border-green", glow: "shadow-glow-green", emoji: "🏆" },
  question: { border: "border-pink", glow: "shadow-glow-pink", emoji: "❓" },
  idea: { border: "border-orange", glow: "shadow-glow-yellow", emoji: "💡" },
  tip: { border: "border-yellow", glow: "shadow-glow-yellow", emoji: "🛠️" },
  motivation: { border: "border-purple", glow: "shadow-glow-purple", emoji: "🚀" },
  tool_review: { border: "border-sky", glow: "shadow-glow-sky", emoji: "🧰" },
};

interface PostCardProps {
  post: CommunityPost;
  reaction: ReactionState;
  commentCount: number;
  commentsOpen: boolean;
  onToggleComments: () => void;
  onBumpGold?: () => void;
  canBumpGold: boolean;
  children?: React.ReactNode;
}

export default function PostCard({
  post,
  reaction,
  commentCount,
  commentsOpen,
  onToggleComments,
  onBumpGold,
  canBumpGold,
  children,
}: PostCardProps) {
  const style = CATEGORY_STYLE[post.category] ?? CATEGORY_STYLE.tip;
  const isGold = post.is_gold;

  return (
    <div
      className={`rounded-[18px] border-3 bg-card p-4 ${
        isGold ? "border-yellow shadow-glow-yellow" : `${style.border} ${style.glow}`
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-xs font-black text-white">
          {post.author?.first_name?.charAt(0).toUpperCase() ?? "?"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-ink">{post.author?.first_name ?? "Member"}</p>
        </div>
        {isGold ? (
          <span className="shrink-0 rounded-full bg-gradient-yellow-orange px-2 py-0.5 text-[10px] font-black uppercase text-ink">
            ⭐ Gold Post
          </span>
        ) : (
          <span
            className={`shrink-0 rounded-full border-2 ${style.border} px-2 py-0.5 text-[10px] font-black uppercase text-text-muted`}
          >
            {style.emoji} {post.category.replace("_", " ")}
          </span>
        )}
        <ReportButton reportedType="post" reportedId={post.id} className="shrink-0" />
      </div>

      {post.title && <h3 className="heading-game mb-1 text-base">{post.title}</h3>}
      {post.body && <p className="mb-3 line-clamp-3 text-sm font-bold text-text-muted">{post.body}</p>}

      <div className="flex items-center justify-between gap-2">
        <ReactionBar postId={post.id} counts={reaction.counts} active={reaction.active} />
        <button
          type="button"
          onClick={onToggleComments}
          className="flex items-center gap-1 text-xs font-black text-text-muted"
        >
          💬 {commentCount}
        </button>
      </div>

      {!isGold && canBumpGold && (
        <button
          type="button"
          onClick={onBumpGold}
          className="mt-3 w-full rounded-xl border-3 border-yellow bg-navy/40 py-1.5 text-xs font-black uppercase text-yellow"
        >
          ⬆️ Bump to Gold
        </button>
      )}

      {commentsOpen && children}
    </div>
  );
}
