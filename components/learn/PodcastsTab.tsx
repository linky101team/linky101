"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Play } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import PodcastPlayer, { type PlayerPodcast } from "@/components/PodcastPlayer";

const CATEGORY_STYLE: Record<string, { label: string; tile: string; chipBg: string; chipText: string }> = {
  starting_a_business: { label: "Starting a Business", tile: "bg-[#FFF0F0]", chipBg: "bg-[#FFF0F0]", chipText: "text-[#FF6B6B]" },
  marketing_branding: { label: "Marketing & Branding", tile: "bg-[#E3F2FD]", chipBg: "bg-[#E3F2FD]", chipText: "text-[#039BE5]" },
  money_finance: { label: "Money & Finance", tile: "bg-[#E8F5E9]", chipBg: "bg-[#E8F5E9]", chipText: "text-[#2ECC71]" },
  leadership_teams: { label: "Leadership & Teams", tile: "bg-[#F3E8FF]", chipBg: "bg-[#F3E8FF]", chipText: "text-[#7C3AED]" },
  founder_stories: { label: "Founder Stories", tile: "bg-[#FFF8E1]", chipBg: "bg-[#FFF8E1]", chipText: "text-[#F5A623]" },
  digital_tech: { label: "Digital & Tech", tile: "bg-[#FFFDE7]", chipBg: "bg-[#FFFDE7]", chipText: "text-[#B8860B]" },
  general: { label: "General", tile: "bg-gray-100", chipBg: "bg-gray-100", chipText: "text-gray-500" },
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
  const [nowPlaying, setNowPlaying] = useState<Podcast | null>(null);

  useEffect(() => {
    if (!profile) return;
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
  }, [profile?.id]);

  function handlePlay(podcast: Podcast) {
    if (podcast.audio_url) {
      setNowPlaying(podcast);
      return;
    }
    setToast(true);
    setTimeout(() => setToast(false), 2200);
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-4 pb-24">
      <div className="rounded-2xl bg-[#1A1A2E] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Headphones className="h-6 w-6 text-[#FFD93D]" strokeWidth={2} />
          </div>
          <div>
            <p className="font-bold text-white">The LinkY101 Podcast</p>
            <p className="text-xs text-white/60">
              Real young founders. Real stories. 10 minutes at a time.
            </p>
          </div>
        </div>
      </div>

      {podcasts.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <span className="text-4xl">🎙️</span>
          <p className="mt-2 font-bold text-gray-900">First episodes dropping soon</p>
          <p className="mx-auto mt-1 max-w-[260px] text-sm text-gray-500">
            Interviews with teen founders who are already making money. Stay tuned.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {podcasts.map((podcast) => {
          const style = CATEGORY_STYLE[podcast.category] ?? CATEGORY_STYLE.general;
          return (
            <button
              key={podcast.id}
              type="button"
              onClick={() => handlePlay(podcast)}
              className={`flex items-center gap-3 rounded-2xl border bg-white p-3.5 text-left shadow-sm transition-transform active:scale-[0.98] ${
                nowPlaying?.id === podcast.id ? "border-[#039BE5]" : "border-gray-200"
              }`}
            >
              <div className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${style.tile}`}>
                <span className="text-2xl">🎙️</span>
                {podcast.episode_number != null && (
                  <span className="absolute -bottom-1.5 rounded-full bg-[#1A1A2E] px-1.5 py-0.5 text-[9px] font-bold text-white">
                    EP {podcast.episode_number}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.chipBg} ${style.chipText}`}>
                  {style.label}
                </span>
                <p className="mt-1 truncate font-bold text-gray-900">{podcast.title}</p>
                {podcast.description && (
                  <p className="line-clamp-1 text-xs text-gray-500">{podcast.description}</p>
                )}
                {podcast.duration_seconds ? (
                  <p className="mt-0.5 text-[11px] font-semibold text-gray-400">
                    {formatDuration(podcast.duration_seconds)}
                  </p>
                ) : null}
              </div>

              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1A1A2E]">
                <Play className="h-4 w-4 fill-white text-white" />
              </span>
            </button>
          );
        })}
      </div>

      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-[70] mx-auto w-fit max-w-[90%] rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-lg">
          🎧 Episode dropping soon — check back!
        </div>
      )}

      {nowPlaying && (
        <PodcastPlayer podcast={nowPlaying} onClose={() => setNowPlaying(null)} />
      )}
    </div>
  );
}
