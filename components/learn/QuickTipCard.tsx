import ReactionBar from "@/components/ReactionBar";
import ReportButton from "@/components/ReportButton";
import type { LearnPost, ReactionState } from "./types";

interface QuickTipCardProps {
  post: LearnPost;
  reaction: ReactionState;
}

export default function QuickTipCard({ post, reaction }: QuickTipCardProps) {
  const emoji = typeof post.metadata?.emoji === "string" ? post.metadata.emoji : "💡";

  return (
    <div className="relative rounded-[18px] border-3 border-purple bg-card p-4 text-center shadow-glow-purple">
      <ReportButton reportedType="post" reportedId={post.id} className="absolute right-3 top-3" />
      <span className="text-4xl">{emoji}</span>
      <p className="my-3 text-base font-black text-ink">{post.body}</p>
      <p className="mb-3 text-xs font-bold text-text-muted">
        Shared by {post.author?.first_name ?? "a member"}
      </p>
      <div className="flex justify-center">
        <ReactionBar postId={post.id} counts={reaction.counts} active={reaction.active} />
      </div>
    </div>
  );
}
