"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfile, useProfileStore } from "@/hooks/useProfile";
import { performSpin } from "@/lib/actions/spin";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";

const WHEEL_SLICES = ["🔥", "⭐", "💎", "🎁", "✨", "🚀"];

interface DailySpinPreviewProps {
  onLevelUp?: (level: number) => void;
}

export default function DailySpinPreview({ onLevelUp }: DailySpinPreviewProps) {
  const { profile } = useProfile();
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const supabase = useMemo(() => createClientSupabase(), []);
  const [alreadySpun, setAlreadySpun] = useState<boolean | null>(null);
  const [prizeLabel, setPrizeLabel] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
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
      });
  }, [profile, supabase]);

  function handleSpin() {
    setSpinning(true);
    setErrorMsg(null);

    startTransition(async () => {
      try {
        const result = await performSpin();
        setPrizeLabel(result.label);
        setAlreadySpun(true);
        refreshProfile();
        if (result.leveledUp && result.newLevel && onLevelUp) {
          onLevelUp(result.newLevel);
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Couldn't spin right now");
      } finally {
        setSpinning(false);
      }
    });
  }

  return (
    <GameCard borderColor="purple" glowColor="purple">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-black uppercase tracking-wide text-white">🎡 Daily Spin</span>
        <Link href="/tasks" className="text-xs font-black uppercase tracking-wide text-sky">
          See All →
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          animate={spinning ? { rotate: 360 * 3 } : { rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="grid h-16 w-16 shrink-0 grid-cols-3 place-items-center gap-0.5 rounded-full border-3 border-purple bg-navy/60 p-1 text-sm shadow-glow-purple"
        >
          {WHEEL_SLICES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </motion.div>

        <div className="flex-1">
          {alreadySpun === null ? (
            <p className="text-sm font-bold text-text-muted">Loading...</p>
          ) : alreadySpun ? (
            <>
              <p className="font-black uppercase text-green">Spun for today!</p>
              {prizeLabel && (
                <p className="text-xs font-bold text-text-muted">You won {prizeLabel}</p>
              )}
              <p className="mt-1 text-xs font-bold text-text-muted">Come back tomorrow.</p>
            </>
          ) : (
            <>
              <p className="mb-2 text-sm font-bold text-text-muted">One free spin a day!</p>
              <GradientButton
                variant="purple"
                size="sm"
                disabled={spinning}
                onClick={handleSpin}
                className="w-full"
              >
                {spinning ? "Spinning..." : "Spin Now!"}
              </GradientButton>
            </>
          )}
          {errorMsg && <p className="mt-1 text-xs font-bold text-orange">{errorMsg}</p>}
        </div>
      </div>
    </GameCard>
  );
}
