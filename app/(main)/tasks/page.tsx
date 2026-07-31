"use client";

import { useState } from "react";
import SectionTitle from "@/components/ui/SectionTitle";
import LevelUpModal from "@/components/LevelUpModal";
import DailyChallengeSection from "@/components/tasks/DailyChallengeSection";
import DailySpinSection from "@/components/tasks/DailySpinSection";
import WeeklyQuizCard from "@/components/tasks/WeeklyQuizCard";
import EventsSection from "@/components/tasks/EventsSection";

export default function TasksPage() {
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [spinRefreshKey, setSpinRefreshKey] = useState(0);

  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="🔥" title="Tasks & Spin" />

      <DailyChallengeSection
        onLevelUp={setLevelUp}
        onTasksChanged={() => setSpinRefreshKey((k) => k + 1)}
      />
      <DailySpinSection onLevelUp={setLevelUp} refreshKey={spinRefreshKey} />
      <WeeklyQuizCard />
      <EventsSection />

      <LevelUpModal
        isOpen={levelUp !== null}
        newLevel={levelUp ?? 1}
        onClose={() => setLevelUp(null)}
      />
    </div>
  );
}
