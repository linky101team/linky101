"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getLevelTitle } from "@/lib/levels";
import Confetti from "@/components/Confetti";
import LevelBadge from "@/components/ui/LevelBadge";
import GradientButton from "@/components/ui/GradientButton";
import ShareCard from "@/components/ShareCard";

interface LevelUpModalProps {
  isOpen: boolean;
  newLevel: number;
  onClose: () => void;
}

export default function LevelUpModal({ isOpen, newLevel, onClose }: LevelUpModalProps) {
  const [showShare, setShowShare] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Confetti />

          <motion.div
            className="relative flex w-full max-w-[360px] flex-col items-center gap-5 rounded-[18px] border-3 border-pink bg-card p-8 text-center shadow-glow-pink"
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {showShare ? (
              <ShareCard
                emoji="🎉"
                title="Level Up!"
                subtitle={`Now a ${getLevelTitle(newLevel)} on LinkY101`}
                stat={`LV ${newLevel}`}
                accent="pink"
                filename={`linky101-level-${newLevel}`}
              />
            ) : (
              <>
                <span className="text-4xl">🎉</span>
                <h2 className="bg-gradient-pink-purple bg-clip-text text-3xl font-black uppercase tracking-wide text-transparent">
                  Level Up!
                </h2>
                <LevelBadge level={newLevel} size="lg" />
                <p className="text-sm font-bold text-text-muted">
                  You&apos;re now a <span className="text-ink">{getLevelTitle(newLevel)}</span>
                </p>
              </>
            )}

            <div className="flex w-full gap-2">
              <button
                type="button"
                onClick={() => setShowShare((v) => !v)}
                className="flex-1 rounded-xl border-3 border-border py-3 text-xs font-black uppercase text-text-muted"
              >
                {showShare ? "Back" : "Share 📤"}
              </button>
              <GradientButton variant="pink" size="lg" className="flex-1" onClick={onClose}>
                Let&apos;s Go!
              </GradientButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
