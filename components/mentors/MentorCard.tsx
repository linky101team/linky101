"use client";

import { Star } from "lucide-react";

export interface Mentor {
  id: string;
  display_name: string;
  bio: string | null;
  expertise: string[];
  is_verified: boolean;
  avatar_url?: string | null;
  rating_avg?: number;
  rating_count?: number;
}

interface MentorCardProps {
  mentor: Mentor;
  answersCount: number;
  isFollowing: boolean;
  canFollow: boolean;
  onToggleFollow: () => void;
  onOpenProfile?: () => void;
}

const TOP_MENTOR_MIN_RATING = 4.5;
const TOP_MENTOR_MIN_COUNT = 10;

export default function MentorCard({
  mentor,
  answersCount,
  isFollowing,
  canFollow,
  onToggleFollow,
  onOpenProfile,
}: MentorCardProps) {
  const isTopMentor = (mentor.rating_avg ?? 0) >= TOP_MENTOR_MIN_RATING && (mentor.rating_count ?? 0) >= TOP_MENTOR_MIN_COUNT;

  return (
    <div
      className={`w-56 shrink-0 rounded-2xl border-2 bg-card p-3 ${
        isTopMentor ? "border-yellow shadow-card" : "border-sky shadow-card"
      }`}
    >
      <button type="button" onClick={onOpenProfile} className="mb-2 flex w-full items-center gap-2 text-left">
        {mentor.avatar_url ? (
          <img
            src={mentor.avatar_url}
            alt={mentor.display_name}
            className="h-10 w-10 shrink-0 rounded-full border-2 border-sky object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-sky grad-brand text-sm font-black text-white">
            {mentor.display_name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-ink">{mentor.display_name}</p>
          <div className="flex items-center gap-1">
            {mentor.is_verified && <span className="text-[10px] font-black uppercase text-sky">✓ Verified</span>}
            {isTopMentor && <span className="text-[10px] font-black uppercase text-yellow">🏆 Top Mentor</span>}
          </div>
        </div>
      </button>

      {mentor.bio && <p className="mb-2 line-clamp-2 text-xs font-bold text-text-muted">{mentor.bio}</p>}

      {mentor.expertise.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {mentor.expertise.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border-2 border-purple px-1.5 py-0.5 text-[9px] font-black uppercase text-purple"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mb-2 flex items-center gap-2 text-[10px] font-bold text-text-muted">
        <span>💬 {answersCount} answers</span>
        {(mentor.rating_count ?? 0) > 0 && (
          <span className="flex items-center gap-0.5 text-yellow">
            <Star className="h-3 w-3 fill-yellow" /> {mentor.rating_avg?.toFixed(1)} ({mentor.rating_count})
          </span>
        )}
      </div>

      {canFollow && (
        <button
          type="button"
          onClick={onToggleFollow}
          className={`w-full rounded-full border-2 py-1 text-[10px] font-black uppercase ${
            isFollowing ? "border-border text-text-muted" : "border-sky grad-brand text-white"
          }`}
        >
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}
    </div>
  );
}
