"use client";

import { useState, useTransition } from "react";
import { votePoll } from "@/lib/actions/polls";
import ReportButton from "@/components/ReportButton";
import type { LearnPost } from "./types";

interface PollCardProps {
  post: LearnPost;
  poll: { counts: number[]; userVoted: number | null };
  onVoted: (optionIndex: number) => void;
}

export default function PollCard({ post, poll, onVoted }: PollCardProps) {
  const options = Array.isArray(post.metadata?.options) ? (post.metadata.options as string[]) : [];
  const question = post.title ?? "Poll";
  const [, startTransition] = useTransition();
  const [voting, setVoting] = useState(false);
  const [localVoted, setLocalVoted] = useState<number | null>(poll.userVoted);

  const totalVotes = poll.counts.reduce((a, b) => a + b, 0);

  function handleVote(index: number) {
    if (localVoted !== null || voting) return;
    setVoting(true);
    setLocalVoted(index);
    onVoted(index);

    startTransition(async () => {
      try {
        await votePoll(post.id, index);
      } finally {
        setVoting(false);
      }
    });
  }

  return (
    <div className="relative rounded-[18px] border-3 border-orange bg-card p-4 shadow-glow-yellow">
      <ReportButton reportedType="post" reportedId={post.id} className="absolute right-3 top-3" />
      <p className="mb-3 pr-6 font-black uppercase text-white">📊 {question}</p>
      <div className="flex flex-col gap-2">
        {options.map((option, i) => {
          const votes = poll.counts[i] ?? 0;
          const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
          const isMine = localVoted === i;
          const showResults = localVoted !== null;

          return (
            <button
              key={i}
              type="button"
              disabled={showResults}
              onClick={() => handleVote(i)}
              className={`relative overflow-hidden rounded-xl border-3 p-3 text-left text-sm font-bold ${
                isMine ? "border-orange text-white" : "border-border text-white"
              }`}
            >
              {showResults && (
                <span className="absolute inset-y-0 left-0 bg-orange/25" style={{ width: `${pct}%` }} />
              )}
              <span className="relative flex items-center justify-between">
                <span>{option}</span>
                {showResults && <span className="font-black text-orange">{pct}%</span>}
              </span>
            </button>
          );
        })}
      </div>
      {localVoted !== null && (
        <p className="mt-2 text-xs font-bold text-text-muted">
          {totalVotes} vote{totalVotes === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
