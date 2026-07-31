"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Play } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import LockedFeature from "@/components/ui/LockedFeature";
import GameCard from "@/components/ui/GameCard";
import PodcastPlayer, { type PlayerPodcast } from "@/components/PodcastPlayer";

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
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [activePodcast, setActivePodcast] = useState<Podcast | null>(null);

  const unlocked = (profile?.level ?? 0) >= PODCAST_LEVEL_GATE;

  useEffect(() => {
    if (!profile || !unlocked) {
      setLoading(false);
      return;
    }

    async function load() {
      const [{ data: rows }, { data: listens }] = await Promise.all([
        supabase
          .from("podcasts")
          .select("id, title, description, episode_number, audio_url, duration_seconds, category")
          .eq("is_published", true)
          .order("episode_number"),
        supabase.from("podcast_listens").select("podcast_id").eq("user_id", profile!.id).eq("completed", true),
      ]);
      setPodcasts((rows as Podcast[]) ?? []);
      setListenedIds(new Set((listens ?? []).map((l) => l.podcast_id)));
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, unlocked]);

  const content = (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Headphones className="h-4 w-4 text-pink" strokeWidth={3} />
        <p className="text-xs font-black uppercase tracking-wide text-text-muted">
          {podcasts.length} episode{podcasts.length === 1 ? "" : "s"}
        </p>
      </div>

      {loading && <p className="text-sm font-bold text-text-muted">Loading episodes...</p>}
      {!loading && podcasts.length === 0 && (
        <p className="text-sm font-bold text-text-muted">No episodes yet — check back soon!</p>
      )}

      <div className="flex flex-col gap-3 pb-24">
        {podcasts.map((podcast) => {
          const style = CATEGORY_STYLE[podcast.category] ?? CATEGORY_STYLE.general;
          const listened = listenedIds.has(podcast.id);
          const isActive = activePodcast?.id === podcast.id;

          return (
            <GameCard
              key={podcast.id}
              borderColor={isActive ? "pink" : "border"}
              glowColor={isActive ? "pink" : undefined}
              className="flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => setActivePodcast(podcast)}
                aria-label={`Play ${podcast.title}`}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-white shadow-glow-pink"
              >
                <Play className="h-5 w-5" fill="currentColor" />
              </button>

              <button type="button" onClick={() => setActivePodcast(podcast)} className="flex-1 text-left">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-full border-2 px-2 py-0.5 text-[9px] font-black uppercase ${style.border} ${style.text}`}
                  >
                    {style.label}
                  </span>
                  {listened && <span className="text-[10px] font-black text-green">✓ Listened</span>}
                </div>
                <p className="truncate text-sm font-black text-white">
                  {podcast.episode_number ? `Ep. ${podcast.episode_number} · ` : ""}
                  {podcast.title}
                </p>
                <p className="text-[10px] font-bold text-text-muted">{formatDuration(podcast.duration_seconds)}</p>
              </button>
            </GameCard>
          );
        })}
      </div>

      {activePodcast && (
        <PodcastPlayer
          podcast={activePodcast}
          onClose={() => setActivePodcast(null)}
          onCompleted={(id) => setListenedIds((prev) => new Set(prev).add(id))}
        />
      )}
    </div>
  );

  if (!unlocked) {
    return <LockedFeature level={PODCAST_LEVEL_GATE}>{content}</LockedFeature>;
  }

  return content;
}
