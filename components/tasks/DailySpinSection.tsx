"use client";

import { useEffect, useState, useTransition } from "react";
import { performSpin, getSpinStatus, type SpinResult as SpinResultType } from "@/lib/actions/spin";
import { PRIZE_TABLE } from "@/lib/spinPrizes";
import { useProfileStore } from "@/hooks/useProfile";
import GameCard from "@/components/ui/GameCard";
import GradientButton from "@/components/ui/GradientButton";
import SpinWheel from "@/components/SpinWheel";
import SpinResult from "@/components/SpinResult";

interface DailySpinSectionProps {
  onLevelUp?: (level: number) => void;
  refreshKey?: number;
}

const PRIZE_SEGMENT: Record<string, number> = {
  xp_25: 3,
  xp_50: 3,
  coins_50: 5,
  coins_200: 5,
  streak_shield: 5,
  bonus_task: 4,
  flair: 2,
  team_boost: 1,
  level_skip: 0,
  mystery_box: 0,
};

function computeRotation(segmentIndex: number): number {
  const spins = 5;
  const segmentAngle = 60;
  const target = 360 - (segmentIndex * segmentAngle + segmentAngle / 2);
  return spins * 360 + target;
}

type SpinStatus = Awaited<ReturnType<typeof getSpinStatus>>;

export default function DailySpinSection({ onLevelUp, refreshKey }: DailySpinSectionProps) {
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const [status, setStatus] = useState<SpinStatus | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResultType | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    getSpinStatus()
      .then(setStatus)
      .catch(() => setStatus(null));
  }, [refreshKey]);

  function handleSpin() {
    if (!status?.eligible || spinning) return;
    setErrorMsg(null);
    setSpinning(true);

    startTransition(async () => {
      try {
        const prizeResult = await performSpin();
        const segment = PRIZE_SEGMENT[prizeResult.type] ?? 0;
        setRotation((prev) => prev + computeRotation(segment));

        setTimeout(() => {
          setSpinning(false);
          setResult(prizeResult);
          refreshProfile();
          getSpinStatus()
            .then(setStatus)
            .catch(() => {});
          if (prizeResult.leveledUp && prizeResult.newLevel && onLevelUp) {
            onLevelUp(prizeResult.newLevel);
          }
        }, 2500);
      } catch (err) {
        setSpinning(false);
        setErrorMsg(err instanceof Error ? err.message : "Couldn't spin right now");
      }
    });
  }

  const tasksLeft = status ? Math.max(0, status.tasksRequired - status.tasksCompleted) : 0;

  return (
    <GameCard borderColor="purple" glowColor="purple">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-black uppercase tracking-wide text-ink">🎡 Daily Spin</span>
        {status && (
          <span className="text-xs font-black text-text-muted">
            {status.spinsRemaining} spin{status.spinsRemaining === 1 ? "" : "s"} left
          </span>
        )}
      </div>

      <SpinWheel rotation={rotation} spinning={spinning} />

      <div className="mt-4 grid grid-cols-4 gap-1.5">
        {PRIZE_TABLE.map((p) => (
          <div key={p.type + p.label} className="rounded-lg border-2 border-border bg-navy/40 p-1.5 text-center">
            <p className="truncate text-[9px] font-black text-ink">{p.label}</p>
            <p className="text-[9px] font-bold text-text-muted">{p.weight}%</p>
          </div>
        ))}
      </div>

      {status && !status.eligible && tasksLeft > 0 && (
        <p className="mt-3 text-center text-xs font-bold text-text-muted">
          Complete {tasksLeft} more task{tasksLeft === 1 ? "" : "s"} to unlock your spin.
        </p>
      )}

      {status && !status.eligible && tasksLeft === 0 && (
        <p className="mt-3 text-center text-xs font-bold text-text-muted">
          You&apos;ve used today&apos;s spin{status.maxSpins > 1 ? "s" : ""} — come back tomorrow!
        </p>
      )}

      {errorMsg && <p className="mt-2 text-center text-xs font-bold text-orange">{errorMsg}</p>}

      <GradientButton
        variant="purple"
        size="lg"
        className="mt-4 w-full"
        disabled={!status?.eligible || spinning}
        onClick={handleSpin}
      >
        {spinning ? "Spinning..." : "Spin!"}
      </GradientButton>

      <SpinResult result={result} onClaim={() => setResult(null)} />
    </GameCard>
  );
}
