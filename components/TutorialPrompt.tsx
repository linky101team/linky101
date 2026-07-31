"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTutorial } from "@/hooks/useTutorial";
import SpotlightTutorial from "@/components/SpotlightTutorial";

const SHOW_DELAY_MS = 800;

interface TutorialPromptProps {
  tourId: string;
}

export default function TutorialPrompt({ tourId }: TutorialPromptProps) {
  const { tour, active, stepIndex, completed, profileLoaded, start, next, skip } = useTutorial(tourId);
  const [showPrompt, setShowPrompt] = useState(false);
  const [forceStart, setForceStart] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") === tourId) {
      setForceStart(true);
      params.delete("tour");
      const newQuery = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (newQuery ? `?${newQuery}` : ""));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!profileLoaded || active) return;

    if (forceStart) {
      setShowPrompt(false);
      start();
      return;
    }

    if (completed) return;

    const t = setTimeout(() => setShowPrompt(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileLoaded, completed, active, forceStart]);

  function handleStart() {
    setShowPrompt(false);
    start();
  }

  function handleDismiss() {
    setShowPrompt(false);
    skip();
  }

  if (!tour) return null;

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-x-0 bottom-24 z-40 mx-auto max-w-[430px] px-4"
          >
            <div className="flex items-center gap-3 rounded-2xl border-3 border-purple bg-card p-3 shadow-glow-purple">
              <span className="text-2xl">{tour.emoji}</span>
              <p className="flex-1 text-xs font-bold text-ink">
                Want a quick tour of <span className="text-purple">{tour.label}</span>?
              </p>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-full border-3 border-border px-2.5 py-1.5 text-[10px] font-black uppercase text-text-muted"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={handleStart}
                className="rounded-full border-3 border-purple bg-gradient-purple-pink px-3 py-1.5 text-[10px] font-black uppercase text-white"
              >
                Tour
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {active && <SpotlightTutorial tour={tour} stepIndex={stepIndex} onNext={next} onSkip={skip} />}
    </>
  );
}
