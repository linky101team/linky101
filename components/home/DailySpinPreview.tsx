"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile, useProfileStore } from "@/hooks/useProfile";
import { performSpin } from "@/lib/actions/spin";
import { floatXP, floatCoins } from "@/lib/floatingRewards";
import GameCard from "@/components/ui/GameCard";

interface DailySpinPreviewProps {
  onLevelUp?: (level: number) => void;
}

type ChestPhase = "idle" | "shaking" | "opened";

export default function DailySpinPreview({ onLevelUp }: DailySpinPreviewProps) {
  const { profile } = useProfile();
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const supabase = useMemo(() => createClientSupabase(), []);
  const [alreadySpun, setAlreadySpun] = useState<boolean | null>(null);
  const [prizeLabel, setPrizeLabel] = useState<string | null>(null);
  const [phase, setPhase] = useState<ChestPhase>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!profile) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("daily_spins")
      .select("prize_value")
      .eq("user_id", profile.id)
      .eq("spin_date", today)
      .maybeSingle()
      .then(({ data }) => {
        setAlreadySpun(!!data);
        if (data?.prize_value && typeof data.prize_value === "object") {
          setPrizeLabel((data.prize_value as { label?: string }).label ?? null);
        }
        if (data) setPhase("opened");
      });
  }, [profile, supabase]);

  function handleOpenChest() {
    if (phase !== "idle") return;
    setErrorMsg(null);
    setPhase("shaking");

    startTransition(async () => {
      try {
        const result = await performSpin();
        // Let the shake animation play for a beat before the chest "opens".
        setTimeout(() => {
          setPhase("opened");
          setPrizeLabel(result.label);
          setAlreadySpun(true);
          if (result.amount) floatXP(result.amount);
          if (result.coins) floatCoins(result.coins);
          refreshProfile();
          if (result.leveledUp && result.newLevel && onLevelUp) {
            onLevelUp(result.newLevel);
          }
        }, 500);
      } catch (err) {
        setPhase("idle");
        setErrorMsg(err instanceof Error ? err.message : "Couldn't open the chest right now");
      }
    });
  }

  return (
    <GameCard borderColor="purple" glowColor="purple">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-black uppercase tracking-wide text-ink">🎁 Daily Chest</span>
        <Link href="/tasks" className="text-xs font-black uppercase tracking-wide text-sky">
          See All →
        </Link>
      </div>

      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <div className="relative">
          <motion.span
            animate={
              phase === "shaking"
                ? { rotate: [0, -8, 8, -6, 6, -3, 3, 0] }
                : phase === "opened"
                  ? { scale: [1, 1.2, 1] }
                  : { y: [0, -4, 0] }
            }
            transition={
              phase === "shaking"
                ? { duration: 0.5 }
                : phase === "opened"
                  ? { duration: 0.4 }
                  : { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
            }
            className="block text-6xl"
          >
            {phase === "opened" ? "📦" : "🎁"}
          </motion.span>
          <AnimatePresence>
            {phase === "opened" && alreadySpun && (
              <motion.span
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center text-yellow"
              >
                <Sparkles className="h-10 w-10" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {alreadySpun === null ? (
          <p className="text-sm font-bold text-text-muted">Loading...</p>
        ) : alreadySpun ? (
          <>
            <p className="font-black uppercase text-green">Opened for today!</p>
            {prizeLabel && <p className="text-xs font-bold text-text-muted">You won {prizeLabel}</p>}
            <p className="text-xs font-bold text-text-muted">Come back tomorrow for another.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-bold text-text-muted">Complete 2+ tasks to unlock your free daily chest!</p>
            <button
              type="button"
              disabled={phase === "shaking"}
              onClick={handleOpenChest}
              className="glow-pulse w-full rounded-2xl border-3 border-sky bg-gradient-primary py-3 text-sm font-black uppercase tracking-wide text-white shadow-glow-sky transition-transform active:scale-95 disabled:opacity-60"
            >
              {phase === "shaking" ? "Opening..." : "Open Daily Chest 🎁"}
            </button>
          </>
        )}
        {errorMsg && <p className="text-xs font-bold text-orange">{errorMsg}</p>}
      </div>
    </GameCard>
  );
}
