"use client";

import { useEffect, useMemo, useState } from "react";
import { Headphones, Play, Check, Mic } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import PodcastPlayer, { type PlayerPodcast } from "@/components/PodcastPlayer";
import { Reveal, LiftCard } from "@/components/ui/Reveal";

function formatDuration(minutes: number | null): string {
  if (!minutes) return "";
  return `${minutes} min`;
}

interface Podcast extends PlayerPodcast {
  description: string | null;
  external_url?: string | null;
}

export default function PodcastsPage() {
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [listenedIds, setListenedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [nowPlaying, setNowPlaying] = useState<Podcast | null>(null);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      // Deliberately `select("*")`. The live `podcasts` table has drifted from
      // the migration files more than once, and a hand-written column list
      // makes Supabase reject the WHOLE query with a 400 the moment one name
      // is wrong — which renders as a silent "no episodes" empty state.
      // Asking for everything cannot fail that way.
      const [{ data: rows }, { data: listens }] = await Promise.all([
        supabase
          .from("podcasts")
          .select("*")
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

  const featured = podcasts[0];
  const rest = podcasts.filter((p) => p.id !== featured?.id);

  return (
    <div className="flex flex-col gap-5 pb-28">
      <Reveal>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E1B4B]">Podcasts 🎙️</h1>
          <p className="text-sm text-gray-500">
            Real young founders. Real stories. Listen on the way to school.
          </p>
        </div>
      </Reveal>

      {podcasts.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <Headphones className="mx-auto h-10 w-10 text-[#7C3AED]" strokeWidth={1.75} />
          <p className="mt-3 text-lg font-extrabold text-[#1E1B4B]">First episodes dropping soon</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">
            Interviews with founders who are already making money. Check back shortly.
          </p>
        </div>
      )}

      {/* Featured episode */}
      {featured && (
        <Reveal index={1}>
          <LiftCard>
            <button
              type="button"
              onClick={() => featured.audio_url && setNowPlaying(featured)}
              className="grad-hero w-full rounded-3xl p-6 text-left"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
                Today&apos;s episode
              </p>
              <p className="mt-2 text-xl font-extrabold leading-tight text-white">{featured.title}</p>
              {featured.guest_name && (
                <p className="mt-1 text-sm font-semibold text-white/80">with {featured.guest_name}</p>
              )}
              {featured.description && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/80">
                  {featured.description}
                </p>
              )}
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                  <Play className="h-5 w-5 fill-[#7C3AED] text-[#7C3AED]" />
                </span>
                <span className="text-sm font-bold text-white">
                  {formatDuration(featured.duration_minutes) || "Play now"}
                </span>
              </div>
            </button>
          </LiftCard>
        </Reveal>
      )}

      {/* Episode list */}
      <div className="flex flex-col gap-3">
        {rest.map((podcast, i) => {
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
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#F3E8FF]">
                    <Mic className="h-6 w-6 text-[#7C3AED]" strokeWidth={2} />
                    {podcast.episode_number != null && (
                      <span className="absolute -bottom-1.5 rounded-full bg-[#1E1B4B] px-1.5 py-0.5 text-[9px] font-bold text-white">
                        EP {podcast.episode_number}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-[#1E1B4B]">{podcast.title}</p>
                    {podcast.guest_name && (
                      <p className="truncate text-xs text-gray-500">with {podcast.guest_name}</p>
                    )}
                    <p className="mt-0.5 flex items-center gap-2 text-[11px] font-semibold text-gray-400">
                      {formatDuration(podcast.duration_minutes)}
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
