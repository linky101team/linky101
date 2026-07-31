"use client";

import { useCallback, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { TOURS } from "@/lib/tutorials";

export function useTutorial(tourId: string) {
  const { profile, updateProfile } = useProfile();
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const tour = TOURS.find((t) => t.id === tourId) ?? null;
  const completedTours = profile?.completed_tours ?? [];
  const completed = completedTours.includes(tourId);

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
  }, []);

  const markComplete = useCallback(async () => {
    setActive(false);
    if (profile && !profile.completed_tours.includes(tourId)) {
      await updateProfile({ completed_tours: [...profile.completed_tours, tourId] });
    }
  }, [profile, tourId, updateProfile]);

  const next = useCallback(() => {
    if (!tour) return;
    if (stepIndex + 1 >= tour.steps.length) {
      markComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  }, [tour, stepIndex, markComplete]);

  const skip = useCallback(() => {
    markComplete();
  }, [markComplete]);

  return { tour, active, stepIndex, completed, profileLoaded: !!profile, start, next, skip };
}
