import ReactionBar from "@/components/ReactionBar";
import ReportButton from "@/components/ReportButton";
import type { LearnPost, ReactionState } from "./types";

interface QuoteCardProps {
  post: LearnPost;
  reaction: ReactionState;
}

export default function QuoteCard({ post, reaction }: QuoteCardProps) {
  const attribution =
    typeof post.metadata?.attribution === "string"
      ? post.metadata.attribution
      : (post.author?.first_name ?? "Unknown");

  return (
    <div className="relative rounded-[18px] border-3 border-yellow bg-card p-5 shadow-glow-yellow">
      <ReportButton reportedType="post" reportedId={post.id} className="absolute right-3 top-3" />
      <p className="text-3xl leading-none text-yellow">&ldquo;</p>
      <p className="-mt-2 text-base font-bold italic text-ink">{post.body}</p>
      <p className="mt-3 text-right text-xs font-black uppercase tracking-wide text-yellow">
        — {attribution}
      </p>
      <div className="mt-3">
        <ReactionBar postId={post.id} counts={reaction.counts} active={reaction.active} />
      </div>
    </div>
  );
}
