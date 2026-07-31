"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Play } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import LockedFeature from "@/components/ui/LockedFeature";
import GameCard from "@/components/ui/GameCard";
import type { PlayerPodcast } from "@/components/PodcastPlayer";

const PODCAST_LEVEL_GATE = 3;

const CATEGORY_STYLE: Record<string, { label: string; border: string; text: string }> = {
  starting_a_business: { label: "Starting a Business", border: "border-pink", text: "text-pink" },
  marketing_branding: { label: "Marketing & Branding", border: "border-sky", text: "text-sky" },
  money_finance: { label: "Money & Finance", border: "border-green", text: "text-green" },
  leadership_teams: { label: "Leadership & Teams", border: "border-purple", text: "text-purple" },
  founder_stories: { label: "Founder Stories", border: "border-orange", text: "text-orange" },
  digital_tech: { label: "Digital & Tech", border: "border-yellow", text: "text-yellow" },
  general: { label: "General", border: "border-border", text: "text-text-muted" },
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  return `${m} min`;
}

interface Podcast extends PlayerPodcast {
  description: string | null;
}

export default function PodcastsTab() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(false);

  const unlocked = (profile?.level ?? 0) >= PODCAST_LEVEL_GATE;

  useEffect(() => {
    if (!profile || !unlocked) {
      setLoading(false);
      return;
    }

    async function load() {
      const { data: rows } = await supabase
        .from("podcasts")
        .select("id, title, description, episode_number, audio_url, duration_seconds, category")
        .eq("is_published", true)
        .order("episode_number");
      setPodcasts((rows as Podcast[]) ?? []);
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, unlocked]);

  function handlePlay() {
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  }

  const content = (
    <div className="relative flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Headphones className="h-4 w-4 text-pink" strokeWidth={3} />
        <p className="text-xs font-black uppercase tracking-wide text-text-muted">
          {podcasts.length} episode{podcasts.length === 1 ? "" : "s"}
        </p>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-shimmer h-20 rounded-[18px]" />
          ))}
        </div>
      )}
      {!loading && podcasts.length === 0 && (
        <p className="text-sm font-bold text-text-muted">No episodes yet — check back soon!</p>
      )}

      <div className="flex flex-col gap-3 pb-24">
        {podcasts.map((podcast) => {
          const style = CATEGORY_STYLE[podcast.category] ?? CATEGORY_STYLE.general;

          return (
            <GameCard key={podcast.id} borderColor="border" className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePlay}
                aria-label={`Play ${podcast.title}`}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-3 border-sky bg-gradient-primary text-white shadow-glow-sky transition-transform active:scale-95"
              >
                <Play className="h-5 w-5" fill="currentColor" />
              </button>

              <button type="button" onClick={handlePlay} className="flex-1 text-left">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-full border-2 px-2 py-0.5 text-[9px] font-black uppercase ${style.border} ${style.text}`}
                  >
                    {style.label}
                  </span>
                </div>
                <p className="truncate text-sm font-black text-ink">
                  {podcast.episode_number ? `Ep. ${podcast.episode_number} · ` : ""}
                  {podcast.title}
                </p>
                {podcast.description && (
                  <p className="line-clamp-1 text-[10px] font-bold text-text-muted">{podcast.description}</p>
                )}
                <p className="text-[10px] font-bold text-text-muted">{formatDuration(podcast.duration_seconds)}</p>
              </button>
            </GameCard>
          );
        })}
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-[70] mx-auto w-fit max-w-[90%] rounded-full border-3 border-sky bg-card px-4 py-2 text-sm font-black text-ink shadow-glow-sky">
          🎧 Episode coming soon — check back!
        </div>
      )}
    </div>
  );

  if (!unlocked) {
    return <LockedFeature level={PODCAST_LEVEL_GATE}>{content}</LockedFeature>;
  }

  return content;
}
