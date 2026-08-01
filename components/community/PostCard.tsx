"use client";

import ReactionBar from "@/components/ReactionBar";
import ReportButton from "@/components/ReportButton";
import type { CommunityPost, ReactionState } from "./types";

const CATEGORY_STYLE: Record<string, { chipBg: string; chipText: string; emoji: string; label: string }> = {
  win: { chipBg: "bg-[#E8F5E9]", chipText: "text-[#2ECC71]", emoji: "🏆", label: "Win" },
  question: { chipBg: "bg-[#E3F2FD]", chipText: "text-[#039BE5]", emoji: "❓", label: "Question" },
  idea: { chipBg: "bg-[#FFF8E1]", chipText: "text-[#B8860B]", emoji: "💡", label: "Idea" },
  tip: { chipBg: "bg-[#FFF0F0]", chipText: "text-[#FF6B6B]", emoji: "🛠️", label: "Tip" },
  motivation: { chipBg: "bg-[#F3E8FF]", chipText: "text-[#7C3AED]", emoji: "🚀", label: "Motivation" },
  tool_review: { chipBg: "bg-gray-100", chipText: "text-gray-600", emoji: "🧰", label: "Tool Review" },
};

const AVATAR_COLORS = ["#FF6B6B", "#FFC107", "#2ECC71", "#039BE5", "#A78BFA", "#F5A623"];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface PostCardProps {
  post: CommunityPost;
  reaction: ReactionState;
  commentCount: number;
  commentsOpen: boolean;
  onToggleComments: () => void;
  children?: React.ReactNode;
}

export default function PostCard({
  post,
  reaction,
  commentCount,
  commentsOpen,
  onToggleComments,
  children,
}: PostCardProps) {
  const style = CATEGORY_STYLE[post.category] ?? CATEGORY_STYLE.tip;
  const name = post.author?.first_name ?? "Member";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="mb-2.5 flex items-center gap-2.5">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: avatarColor(name) }}
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-gray-900">{name}</p>
        </div>
        {post.is_gold && (
          <span className="shrink-0 rounded-full bg-[#FFF8E1] px-2 py-0.5 text-[10px] font-bold text-[#B8860B]">
            ⭐ Featured
          </span>
        )}
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${style.chipBg} ${style.chipText}`}>
          {style.emoji} {style.label}
        </span>
        <ReportButton reportedType="post" reportedId={post.id} className="shrink-0" />
      </div>

      {post.title && <h3 className="mb-1 font-bold leading-snug text-gray-900">{post.title}</h3>}
      {post.body && <p className="mb-3 line-clamp-4 text-sm leading-relaxed text-gray-600">{post.body}</p>}

      <div className="flex items-center justify-between gap-2">
        <ReactionBar postId={post.id} counts={reaction.counts} active={reaction.active} />
        <button
          type="button"
          onClick={onToggleComments}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 transition-transform active:scale-95"
        >
          💬 {commentCount}
        </button>
      </div>

      {commentsOpen && children}
    </div>
  );
}
