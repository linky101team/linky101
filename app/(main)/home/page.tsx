"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import LevelUpModal from "@/components/LevelUpModal";
import LevelRoadmapCard from "@/components/home/LevelRoadmapCard";
import DailyTasksCard from "@/components/home/DailyTasksCard";
import SchoolTeamPreview from "@/components/home/SchoolTeamPreview";
import DailySpinPreview from "@/components/home/DailySpinPreview";
import LeaderboardPreview from "@/components/home/LeaderboardPreview";
import TutorialPrompt from "@/components/TutorialPrompt";

export default function HomePage() {
  const { profile } = useProfile();
  const [levelUp, setLevelUp] = useState<number | null>(null);

  if (!profile) {
    return (
      <div className="flex flex-col gap-4">
        <div className="skeleton-shimmer h-24 rounded-[20px]" />
        <div className="skeleton-shimmer h-40 rounded-[20px]" />
        <div className="skeleton-shimmer h-32 rounded-[20px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center gap-0.5 rounded-2xl border-3 border-orange bg-white p-3 shadow-card">
          <span className="text-xl">🔥</span>
          <span className="text-lg font-black text-ink">{profile.current_streak}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-text-muted">Streak</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-2xl border-3 border-sky bg-white p-3 shadow-card">
          <span className="text-xl">⭐</span>
          <span className="text-lg font-black text-ink">{profile.xp}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-text-muted">Total XP</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-2xl border-3 border-yellow bg-white p-3 shadow-card">
          <span className="text-xl">🪙</span>
          <span className="text-lg font-black text-ink">{profile.link_coins}</span>
          <span className="text-[9px] font-bold uppercase tracking-wide text-text-muted">LinkCoins</span>
        </div>
      </div>

      <div data-tour="home-roadmap">
        <LevelRoadmapCard level={profile.level} xp={profile.xp} />
      </div>
      <div data-tour="home-tasks">
        <DailyTasksCard onLevelUp={setLevelUp} />
      </div>
      <div data-tour="home-team">
        <SchoolTeamPreview />
      </div>
      <div data-tour="home-spin">
        <DailySpinPreview onLevelUp={setLevelUp} />
      </div>
      <div data-tour="home-leaderboard">
        <LeaderboardPreview />
      </div>

      <LevelUpModal
        isOpen={levelUp !== null}
        newLevel={levelUp ?? 1}
        onClose={() => setLevelUp(null)}
      />

      <TutorialPrompt tourId="home" />
    </div>
  );
}
