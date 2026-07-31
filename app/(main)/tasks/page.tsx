"use client";

import SectionTitle from "@/components/ui/SectionTitle";
import DailyChallengeSection from "@/components/tasks/DailyChallengeSection";
import WeeklyQuizCard from "@/components/tasks/WeeklyQuizCard";
import EventsSection from "@/components/tasks/EventsSection";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6">
      <SectionTitle emoji="🔥" title="Today's Tasks" />
      <DailyChallengeSection />
      <WeeklyQuizCard />
      <EventsSection />
    </div>
  );
}
