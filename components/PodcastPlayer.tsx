"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pause, Play, X, ChevronDown } from "lucide-react";
import { markPodcastListened } from "@/lib/actions/podcasts";
import { useProfileStore } from "@/hooks/useProfile";

export interface PlayerPodcast {
  id: string;
  title: string;
  episode_number: number | null;
  audio_url: string;
  duration_seconds: number | null;
  category: string;
}

interface PodcastPlayerProps {
  podcast: PlayerPodcast;
  onClose: () => void;
  onCompleted?: (podcastId: string) => void;
}

const SPEEDS = [1, 1.25, 1.5, 2];
const BAR_COUNT = 28;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PodcastPlayer({ podcast, onClose, onCompleted }: PodcastPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const [minimized, setMinimized] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(podcast.duration_seconds ?? 0);
  const [speed, setSpeed] = useState(1);
  const [rewardToast, setRewardToast] = useState<string | null>(null);
  const hasCompletedRef = useRef(false);

  const barHeights = useMemo(
    () => Array.from({ length: BAR_COUNT }, () => 20 + Math.random() * 80),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- regenerate only when switching episodes
    [podcast.id]
  );

  useEffect(() => {
    hasCompletedRef.current = false;
    setCurrentTime(0);
    setPlaying(false);
    const audio = audioRef.current;
    if (audio) {
      audio.playbackRate = speed;
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podcast.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed;
  }, [speed]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  async function handleEnded() {
    setPlaying(false);
    if (hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    try {
      const result = await markPodcastListened(podcast.id);
      if (!result.alreadyCompleted) {
        setRewardToast(`+${result.xpEarned} XP · +${result.coinsEarned} 🪙`);
        await refreshProfile();
        setTimeout(() => setRewardToast(null), 2500);
      }
      onCompleted?.(podcast.id);
    } catch {
      // reward grant failure shouldn't block playback UX
    }
  }

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 mx-auto max-w-[430px] px-3">
      <audio
        ref={audioRef}
        src={podcast.audio_url}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || podcast.duration_seconds || 0)}
        onEnded={handleEnded}
      />

      <AnimatePresence mode="wait">
        {minimized ? (
          <motion.button
            key="mini"
            type="button"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            onClick={() => setMinimized(false)}
            className="flex w-full items-center gap-3 rounded-full border-3 border-pink bg-card px-3 py-2 shadow-glow-pink"
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-pink-purple text-white"
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </span>
            <span className="flex-1 truncate text-left text-xs font-black text-ink">{podcast.title}</span>
            <span className="text-[10px] font-bold text-text-muted">{formatTime(currentTime)}</span>
          </motion.button>
        ) : (
          <motion.div
            key="full"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 200, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="rounded-[22px] border-3 border-pink bg-card p-4 shadow-glow-pink"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMinimized(true)}
                className="text-text-muted"
                aria-label="Minimize player"
              >
                <ChevronDown className="h-5 w-5" strokeWidth={3} />
              </button>
              <span className="rounded-full border-2 border-pink px-2 py-0.5 text-[9px] font-black uppercase text-pink">
                {podcast.category.replace(/_/g, " ")}
              </span>
              <button type="button" onClick={onClose} className="text-text-muted" aria-label="Close player">
                <X className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>

            <p className="mb-3 truncate text-sm font-black text-ink">
              {podcast.episode_number ? `Ep. ${podcast.episode_number} · ` : ""}
              {podcast.title}
            </p>

            <div className="mb-2 flex h-12 items-end gap-[3px]">
              {barHeights.map((h, i) => {
                const barPct = (i / BAR_COUNT) * 100;
                const isPast = barPct <= progressPct;
                return (
                  <span
                    key={i}
                    className={`flex-1 rounded-full transition-colors ${isPast ? "bg-pink" : "bg-border"} ${
                      playing && isPast ? "animate-pulse" : ""
                    }`}
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>

            <div className="mb-3 flex justify-between text-[10px] font-bold text-text-muted">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-1">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={`rounded-full border-2 px-2 py-1 text-[9px] font-black ${
                      speed === s ? "border-pink bg-pink text-white" : "border-border text-text-muted"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-full border-3 border-pink bg-gradient-pink-purple text-white shadow-glow-pink"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </button>
            </div>

            {rewardToast && (
              <div className="mt-3 rounded-xl border-3 border-green bg-green/10 py-1.5 text-center text-xs font-black text-green">
                🎉 {rewardToast}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
