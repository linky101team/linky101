"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClientSupabase } from "@/lib/supabase/client";
import { addComment, PRESET_COMMENTS } from "@/lib/actions/comments";
import ReportButton from "@/components/ReportButton";

interface Comment {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
  author: { first_name: string } | null;
}

interface CommentSectionProps {
  postId: string;
  isOpen: boolean;
  canCustomComment: boolean;
  authorName: string;
  onCommentAdded: () => void;
}

export default function CommentSection({
  postId,
  isOpen,
  canCustomComment,
  authorName,
  onCommentAdded,
}: CommentSectionProps) {
  const supabase = useMemo(() => createClientSupabase(), []);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [customText, setCustomText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    supabase
      .from("comments")
      .select("id, body, author_id, created_at, author:profiles(first_name)")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setComments((data ?? []) as unknown as Comment[]);
        setLoading(false);
      });
  }, [isOpen, postId, supabase]);

  function submitComment(body: string, isPreset: boolean) {
    if (submitting || !body.trim()) return;
    setSubmitting(true);
    startTransition(async () => {
      try {
        const comment = await addComment(postId, body, isPreset);
        setComments((prev) => [...prev, { ...comment, author: { first_name: authorName } }]);
        setCustomText("");
        onCommentAdded();
      } finally {
        setSubmitting(false);
      }
    });
  }

  if (!isOpen) return null;

  return (
    <div className="mt-3 border-t-3 border-border pt-3">
      {loading ? (
        <p className="text-xs font-bold text-text-muted">Loading comments...</p>
      ) : (
        <div className="mb-3 flex flex-col gap-2">
          {comments.length === 0 && (
            <p className="text-xs font-bold text-text-muted">No comments yet.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2 rounded-xl bg-navy/40 p-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-pink">{c.author?.first_name ?? "Member"}</p>
                <p className="text-sm font-bold text-white">{c.body}</p>
              </div>
              <ReportButton reportedType="comment" reportedId={c.id} className="shrink-0" />
            </div>
          ))}
        </div>
      )}

      <div className="mb-2 flex flex-wrap gap-1.5">
        {PRESET_COMMENTS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={submitting}
            onClick={() => submitComment(preset, true)}
            className="rounded-full border-2 border-border px-2 py-1 text-[11px] font-bold text-text-muted"
          >
            {preset}
          </button>
        ))}
      </div>

      {canCustomComment && (
        <div className="flex gap-2">
          <input
            value={customText}
            onChange={(e) => setCustomText(e.target.value.slice(0, 500))}
            placeholder="Write a comment..."
            className="flex-1 rounded-xl border-3 border-border bg-navy/60 px-3 py-2 text-sm font-bold text-white placeholder:text-text-muted focus:border-pink focus:outline-none"
          />
          <button
            type="button"
            disabled={!customText.trim() || submitting}
            onClick={() => submitComment(customText, false)}
            className="rounded-xl border-3 border-pink bg-gradient-pink-purple px-3 text-sm font-black text-white disabled:opacity-40"
          >
            Post
          </button>
        </div>
      )}
    </div>
  );
}
