import ReactionBar from "@/components/ReactionBar";
import ReportButton from "@/components/ReportButton";
import type { LearnPost, ReactionState } from "./types";

interface LessonCardProps {
  post: LearnPost;
  reaction: ReactionState;
}

export default function LessonCard({ post, reaction }: LessonCardProps) {
  const topic = typeof post.metadata?.topic === "string" ? post.metadata.topic : null;

  return (
    <div className="rounded-[18px] border-3 border-pink bg-card p-4 shadow-glow-pink">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-xs font-black text-white">
          {post.author?.first_name?.charAt(0).toUpperCase() ?? "?"}
        </span>
        <span className="text-sm font-black text-white">{post.author?.first_name ?? "LinkY101"}</span>
        <span className="ml-auto rounded-full border-2 border-pink px-2 py-0.5 text-[10px] font-black uppercase text-pink">
          Creator
        </span>
        <ReportButton reportedType="post" reportedId={post.id} />
      </div>

      {topic && (
        <span className="mb-2 inline-block rounded-full bg-navy/60 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-pink">
          #{topic}
        </span>
      )}

      {post.title && <h3 className="heading-game mb-1 text-lg">{post.title}</h3>}
      {post.body && <p className="mb-3 text-sm font-bold text-text-muted">{post.body}</p>}

      <ReactionBar postId={post.id} counts={reaction.counts} active={reaction.active} />
    </div>
  );
}
