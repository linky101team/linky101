"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getWelcomeBackSummary, dismissWelcomeBack, type WelcomeBackSummary } from "@/lib/actions/welcomeBack";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";
import Confetti from "@/components/Confetti";

interface WelcomeBackProps {
  firstName: string;
}

export default function WelcomeBack({ firstName }: WelcomeBackProps) {
  const [summary, setSummary] = useState<WelcomeBackSummary | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    getWelcomeBackSummary().then(setSummary);
  }, []);

  if (!summary?.show || dismissed) return null;

  function handleDismiss() {
    setDismissed(true);
    dismissWelcomeBack();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/95 p-6"
      >
        <Confetti />
        <motion.div
          initial={{ scale: 0.85, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 260 }}
          className="w-full max-w-sm"
        >
          <GameCard borderColor="pink" glowColor="pink" className="text-center">
            <p className="text-5xl">👋</p>
            <h1 className="heading-game mt-2 text-2xl">Welcome Back, {firstName}!</h1>
            <p className="mt-1 text-sm font-bold text-text-muted">
              You&apos;ve been away for {summary.daysAway} day{summary.daysAway === 1 ? "" : "s"}. Here&apos;s what
              you missed:
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl border-3 border-sky bg-navy/40 p-3">
                <p className="text-xl font-black text-sky">{summary.newPosts}</p>
                <p className="text-[9px] font-bold uppercase text-text-muted">New Posts</p>
              </div>
              <div className="rounded-xl border-3 border-purple bg-navy/40 p-3">
                <p className="text-xl font-black text-purple">{summary.unreadNotifications}</p>
                <p className="text-[9px] font-bold uppercase text-text-muted">Notifications</p>
              </div>
            </div>

            <div className="mt-3 rounded-xl border-3 border-orange bg-orange/10 p-3">
              {summary.currentStreak > 0 ? (
                <p className="text-sm font-black text-orange">
                  🔥 Your {summary.currentStreak}-day streak is still going — nice!
                </p>
              ) : (
                <p className="text-sm font-black text-orange">
                  Your streak reset while you were away. Complete a task today to start a new one!
                </p>
              )}
            </div>

            <GradientButton variant="pink" size="lg" className="mt-5 w-full" onClick={handleDismiss}>
              Let&apos;s Go! 🚀
            </GradientButton>
          </GameCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
