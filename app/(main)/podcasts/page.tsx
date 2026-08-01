"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Play, Check } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import PodcastPlayer, { type PlayerPodcast } from "@/components/PodcastPlayer";
import { Reveal, LiftCard } from "@/components/ui/Reveal";

const CATEGORY_STYLE: Record<string, { label: string; tile: string; chipBg: string; chipText: string }> = {
  starting_a_business: { label: "Starting a Business", tile: "bg-[#FCE7F3]", chipBg: "bg-[#FCE7F3]", chipText: "text-[#DB2777]" },
  marketing_branding: { label: "Marketing & Branding", tile: "bg-[#F3E8FF]", chipBg: "bg-[#F3E8FF]", chipText: "text-[#7C3AED]" },
  money_finance: { label: "Money & Finance", tile: "bg-[#D1FAE5]", chipBg: "bg-[#D1FAE5]", chipText: "text-[#059669]" },
  leadership_teams: { label: "Leadership & Teams", tile: "bg-[#CFFAFE]", chipBg: "bg-[#CFFAFE]", chipText: "text-[#0891B2]" },
  founder_stories: { label: "Founder Stories", tile: "bg-[#FEF3C7]", chipBg: "bg-[#FEF3C7]", chipText: "text-[#B45309]" },
  digital_tech: { label: "Digital & Tech", tile: "bg-[#E0E7FF]", chipBg: "bg-[#E0E7FF]", chipText: "text-[#4F46E5]" },
  general: { label: "General", tile: "bg-gray-100", chipBg: "bg-gray-100", chipText: "text-gray-500" },
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

interface Podcast extends PlayerPodcast {
  description: string | null;
}

export default function PodcastsPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<Podcast | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const [{ data: rows }, { data: listens }] = await Promise.all([
        supabase
          .from("podcasts")
          .select("id, title, description, episode_number, audio_url, duration_seconds, category")
          .eq("is_published", true)
          .order("episode_number", { ascending: false }),
        supabase.from("podcast_listens").select("podcast_id").eq("user_id", profile!.id),
      ]);
      setPodcasts((rows as Podcast[]) ?? []);
      setListenedIds(new Set((listens ?? []).map((l) => l.podcast_id)));
      setLoading(false);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton-shimmer h-40 rounded-2xl" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-shimmer h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  const categories = ["all", ...Array.from(new Set(podcasts.map((p) => p.category)))];
  const visible = filter === "all" ? podcasts : podcasts.filter((p) => p.category === filter);
  const featured = podcasts[0];
  const rest = visible.filter((p) => p.id !== featured?.id);

  return (
    <div className="flex flex-col gap-5 pb-28">
      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Podcasts 🎙️</h1>
          <p className="text-sm text-gray-500">Real young founders. Real stories. Listen on the way to school.</p>
        </div>
      </Reveal>

      {podcasts.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Headphones className="mx-auto h-10 w-10 text-[#7C3AED]" strokeWidth={1.75} />
          <p className="mt-3 text-lg font-extrabold text-[#1E1B4B]">First episodes dropping soon</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">
            Interviews with teen founders who are already making money. Check back shortly.
          </p>
        </div>
      )}

      {/* Featured / today's episode */}
      {featured && (
        <Reveal index={1}>
          <LiftCard>
            <button
              type="button"
              onClick={() => featured.audio_url && setNowPlaying(featured)}
              className="grad-hero w-full rounded-3xl p-6 text-left"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">Today&apos;s episode</p>
              <p className="mt-2 text-xl font-extrabold leading-tight text-white">{featured.title}</p>
              {featured.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/80">{featured.description}</p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <Play className="h-5 w-5 fill-[#7C3AED] text-[#7C3AED]" />
                </span>
                <span className="text-sm font-bold text-white">
                  {formatDuration(featured.duration_seconds) || "Play now"}
                </span>
              </div>
            </button>
          </LiftCard>
        </Reveal>
      )}

      {/* Category filter */}
      {categories.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => {
            const style = CATEGORY_STYLE[c] ?? CATEGORY_STYLE.general;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  filter === c ? "grad-brand text-white" : "border border-gray-200 bg-white text-gray-500"
                }`}
              >
                {c === "all" ? "All episodes" : style.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Episode list */}
      <div className="flex flex-col gap-3">
        {rest.map((podcast, i) => {
          const style = CATEGORY_STYLE[podcast.category] ?? CATEGORY_STYLE.general;
          const heard = listenedIds.has(podcast.id);
          return (
            <Reveal key={podcast.id} index={i}>
              <LiftCard>
                <button
                  type="button"
                  onClick={() => podcast.audio_url && setNowPlaying(podcast)}
                  className={`flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm ${
                    nowPlaying?.id === podcast.id ? "border-[#7C3AED]" : "border-gray-200"
                  }`}
                >
                  <div
                    className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${style.tile}`}
                  >
                    <Headphones className="h-6 w-6 text-[#1E1B4B]" strokeWidth={2} />
                    {podcast.episode_number != null && (
                      <span className="absolute -bottom-1.5 rounded-full bg-[#1E1B4B] px-1.5 py-0.5 text-[9px] font-bold text-white">
                        EP {podcast.episode_number}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${style.chipBg} ${style.chipText}`}
                    >
                      {style.label}
                    </span>
                    <p className="mt-1 truncate font-bold text-[#1E1B4B]">{podcast.title}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] font-semibold text-gray-400">
                      {formatDuration(podcast.duration_seconds)}
                      {heard && (
                        <span className="flex items-center gap-0.5 text-[#10B981]">
                          <Check className="h-3 w-3" strokeWidth={3} /> Played
                        </span>
                      )}
                    </p>
                  </div>

                  <span className="grad-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <Play className="h-4 w-4 fill-white text-white" />
                  </span>
                </button>
              </LiftCard>
            </Reveal>
          );
        })}
      </div>

      {nowPlaying && <PodcastPlayer podcast={nowPlaying} onClose={() => setNowPlaying(null)} />}
    </div>
  );
}
