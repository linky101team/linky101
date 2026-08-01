"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Sparkles, Trophy } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { Reveal } from "@/components/ui/Reveal";
import ReportButton from "@/components/ReportButton";

const CARD_COLORS = ["#7C3AED", "#EC4899", "#06B6D4", "#10B981", "#F59E0B", "#F97316"];

function colorFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

interface Dream {
  id: string;
  body: string;
  author_id: string;
  created_at: string;
  author: { first_name: string; region: string | null } | null;
}

export default function DreamsPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data: rows, error: dreamErr } = await supabase
      .from("dream_wall_posts")
      .select("id, body, author_id, created_at, author:profiles(first_name, region)")
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .limit(60);

    if (dreamErr) {
      setError("Couldn't load the Dream Wall. Pull down to retry.");
      setLoading(false);
      return;
    }

    const list = (rows ?? []) as unknown as Dream[];
    setDreams(list);

    const ids = list.map((d) => d.id);
    if (ids.length > 0) {
      const { data: likes } = await supabase.from("dream_wall_likes").select("post_id, user_id").in("post_id", ids);
      const counts: Record<string, number> = {};
      const mine = new Set<string>();
      for (const l of likes ?? []) {
        counts[l.post_id] = (counts[l.post_id] ?? 0) + 1;
        if (l.user_id === profile?.id) mine.add(l.post_id);
      }
      setLikeCounts(counts);
      setMyLikes(mine);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (!profile) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  async function postDream() {
    const body = draft.trim();
    if (!body || !profile || posting) return;
    setPosting(true);
    setError(null);

    const { error: insertErr } = await supabase.from("dream_wall_posts").insert({
      author_id: profile.id,
      body,
      region: profile.region ?? null,
    });

    setPosting(false);

    if (insertErr) {
      setError("Couldn't post that — give it another go.");
      return;
    }

    setDraft("");
    setConfetti(true);
    setTimeout(() => setConfetti(false), 2000);
    load();
  }

  async function toggleLike(dreamId: string) {
    if (!profile) return;
    const liked = myLikes.has(dreamId);

    // Optimistic — the wall should feel instant, and a failed like is harmless.
    setMyLikes((prev) => {
      const next = new Set(prev);
      if (liked) next.delete(dreamId);
      else next.add(dreamId);
      return next;
    });
    setLikeCounts((prev) => ({ ...prev, [dreamId]: (prev[dreamId] ?? 0) + (liked ? -1 : 1) }));

    if (liked) {
      await supabase.from("dream_wall_likes").delete().eq("post_id", dreamId).eq("user_id", profile.id);
    } else {
      await supabase.from("dream_wall_likes").insert({ post_id: dreamId, user_id: profile.id });
    }
  }

  return (
    <div className="relative flex flex-col gap-5 pb-8">
      {confetti && (
        <div className="confetti-burst pointer-events-none fixed inset-x-0 top-24 z-[80] text-center text-4xl">
          🎉✨🚀💫⭐
        </div>
      )}

      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Dream Wall ✨</h1>
          <p className="text-sm text-gray-500">
            Post your biggest business dream. No judgement, no small ideas.
          </p>
        </div>
      </Reveal>

      <Reveal index={1}>
        <div className="grad-gold flex items-start gap-3 rounded-2xl border-2 border-[#F59E0B] p-4">
          <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-[#B45309]" strokeWidth={2.5} />
          <p className="text-sm leading-relaxed text-[#92400E]">
            The <strong>top 50 most-loved dreams</strong> each month win a live event or Zoom with one of our
            ambassadors. Post yours and get voted up.
          </p>
        </div>
      </Reveal>

      <Reveal index={2}>
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={500}
            placeholder="What's your dream business idea? Dream BIG 🌟"
            className="h-24 w-full resize-none rounded-xl border-2 border-[#EDE9FE] p-3 text-sm text-[#1E1B4B] outline-none focus:border-[#7C3AED]"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-gray-400">{draft.length}/500</span>
            <button
              type="button"
              onClick={postDream}
              disabled={!draft.trim() || posting}
              className="grad-brand flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-transform active:scale-95 disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
              {posting ? "Posting..." : "Post my dream"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs font-semibold text-[#EC4899]">{error}</p>}
        </div>
      </Reveal>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton-shimmer h-32 rounded-2xl" />
          ))}
        </div>
      ) : dreams.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Sparkles className="mx-auto h-10 w-10 text-[#7C3AED]" strokeWidth={1.75} />
          <p className="mt-3 text-lg font-extrabold text-[#1E1B4B]">The wall is empty — start it</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">
            Be the first to post a dream. Someone has to go first, might as well be you.
          </p>
        </div>
      ) : (
        <div className="[column-gap:0.75rem] columns-2">
          {dreams.map((d) => {
            const color = colorFor(d.id);
            const liked = myLikes.has(d.id);
            return (
              <div
                key={d.id}
                className="mb-3 break-inside-avoid rounded-2xl bg-white p-4 shadow-sm"
                style={{ borderTop: `4px solid ${color}` }}
              >
                <div className="mb-1.5 flex items-start justify-between gap-2">
                  <span className="text-sm font-bold" style={{ color }}>
                    {d.author?.first_name ?? "Someone"}
                  </span>
                  <ReportButton reportedType="post" reportedId={d.id} className="shrink-0" />
                </div>
                {d.author?.region && (
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    {d.author.region}
                  </p>
                )}
                <p className="text-sm leading-relaxed text-gray-700">{d.body}</p>
                <button
                  type="button"
                  onClick={() => toggleLike(d.id)}
                  className={`mt-3 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition-all active:scale-90 ${
                    liked ? "border-[#EC4899] text-[#EC4899]" : "border-gray-200 text-gray-500"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${liked ? "fill-[#EC4899]" : ""}`} strokeWidth={2.5} />
                  {likeCounts[d.id] ?? 0}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
