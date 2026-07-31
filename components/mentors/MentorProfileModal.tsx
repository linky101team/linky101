"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Star, X } from "lucide-react";
import type { Mentor } from "./MentorCard";
import GameCard from "@/components/ui/GameCard";

interface MentorProfileModalProps {
  mentor: Mentor | null;
  answersCount: number;
  onClose: () => void;
}

const TOP_MENTOR_MIN_RATING = 4.5;
const TOP_MENTOR_MIN_COUNT = 10;

export default function MentorProfileModal({ mentor, answersCount, onClose }: MentorProfileModalProps) {
  if (!mentor) return null;
  const isTopMentor =
    (mentor.rating_avg ?? 0) >= TOP_MENTOR_MIN_RATING && (mentor.rating_count ?? 0) >= TOP_MENTOR_MIN_COUNT;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-sm"
        >
          <GameCard borderColor="sky" glowColor="sky" className="relative text-center">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 text-text-muted"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={3} />
            </button>

            {mentor.avatar_url ? (
              <img
                src={mentor.avatar_url}
                alt={mentor.display_name}
                className="mx-auto mb-3 h-20 w-20 rounded-full border-4 border-sky object-cover shadow-glow-sky"
              />
            ) : (
              <span className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-sky bg-gradient-sky-purple text-2xl font-black text-white shadow-glow-sky">
                {mentor.display_name.charAt(0).toUpperCase()}
              </span>
            )}

            <h2 className="heading-game text-xl">{mentor.display_name}</h2>
            <div className="mb-3 flex items-center justify-center gap-2">
              {mentor.is_verified && (
                <span className="text-xs font-black uppercase text-sky">✓ Verified Mentor</span>
              )}
              {isTopMentor && <span className="text-xs font-black uppercase text-yellow">🏆 Top Mentor</span>}
            </div>

            {mentor.bio && <p className="mb-4 text-sm font-bold text-text-muted">{mentor.bio}</p>}

            {mentor.expertise.length > 0 && (
              <div className="mb-4 flex flex-wrap justify-center gap-1.5">
                {mentor.expertise.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border-2 border-purple px-2 py-0.5 text-[10px] font-black uppercase text-purple"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 border-t-3 border-border pt-3">
              <div>
                <p className="text-lg font-black text-ink">{answersCount}</p>
                <p className="text-[9px] font-bold uppercase text-text-muted">Answers Given</p>
              </div>
              <div>
                {(mentor.rating_count ?? 0) > 0 ? (
                  <p className="flex items-center justify-center gap-1 text-lg font-black text-yellow">
                    <Star className="h-4 w-4 fill-yellow" /> {mentor.rating_avg?.toFixed(1)}
                  </p>
                ) : (
                  <p className="text-lg font-black text-text-muted">—</p>
                )}
                <p className="text-[9px] font-bold uppercase text-text-muted">
                  {mentor.rating_count ?? 0} rating{mentor.rating_count === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </GameCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
