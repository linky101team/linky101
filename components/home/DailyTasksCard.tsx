"use client";

import Card from "@/components/ui/GameCard";

interface DailyTasksCardProps {
  hasActivity?: boolean;
}

export default function DailyTasksCard({ hasActivity = false }: DailyTasksCardProps) {
  return (
    <Card>
      <p className="font-semibold text-gray-900">Today&apos;s Activity</p>
      {hasActivity ? (
        <p className="mt-1 text-sm text-gray-500">You&apos;ve been active today!</p>
      ) : (
        <p className="mt-1 text-sm text-gray-500">
          Start your day — complete a lesson or post an idea
        </p>
      )}
    </Card>
  );
}
