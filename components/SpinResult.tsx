"use client";

import { AnimatePresence, motion } from "framer-motion";
import Confetti from "@/components/Confetti";
import GradientButton from "@/components/ui/GradientButton";
import type { SpinResult as SpinResultType } from "@/lib/spin";

interface SpinResultProps {
  result: SpinResultType | null;
  onClaim: () => void;
}

// common/uncommon read as a normal prize card; rare gets a glow;
// very_rare/legendary get the full confetti celebration.
const RARITY_VISUAL: Record<string, { border: string; glow: string; confetti: boolean; label: string }> = {
  common: { border: "border-sky", glow: "", confetti: false, label: "Prize!" },
  uncommon: { border: "border-purple", glow: "", confetti: false, label: "Nice Find!" },
  rare: { border: "border-yellow", glow: "shadow-glow-yellow", confetti: false, label: "Rare Prize!" },
  very_rare: { border: "border-pink", glow: "shadow-glow-pink", confetti: true, label: "Very Rare!!" },
  legendary: { border: "border-yellow", glow: "shadow-glow-yellow", confetti: true, label: "LEGENDARY!!!" },
};

export default function SpinResult({ result, onClaim }: SpinResultProps) {
  const visual = result ? (RARITY_VISUAL[result.rarity] ?? RARITY_VISUAL.common) : null;

  return (
    <AnimatePresence>
      {result && visual && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/90 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {visual.confetti && <Confetti />}

          <motion.div
            className={`relative flex w-full max-w-[360px] flex-col items-center gap-4 rounded-[18px] border-3 bg-card p-8 text-center ${visual.border} ${visual.glow}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <span className="text-4xl">{visual.confetti ? "🎉" : "🎁"}</span>
            <p className="text-xs font-black uppercase tracking-widest text-text-muted">{visual.label}</p>
            <h2 className="heading-game text-2xl text-white">{result.label}</h2>
            <GradientButton variant="pink" size="lg" className="w-full" onClick={onClaim}>
              Claim!
            </GradientButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
