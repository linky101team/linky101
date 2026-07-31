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
      <div className="flex flex-col gap-6">
        <p className="text-sm font-bold text-text-muted">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
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
