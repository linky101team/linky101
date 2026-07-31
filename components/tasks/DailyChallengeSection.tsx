"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfileStore } from "@/hooks/useProfile";
import { generateDailyTasks, completeTask } from "@/lib/actions/tasks";
import { TIER_THRESHOLDS } from "@/lib/tasks";
import GameCard from "@/components/ui/GameCard";

interface DailyTask {
  id: string;
  description: string;
  xp_reward: number;
  is_completed: boolean;
}

interface DailyChallengeSectionProps {
  onLevelUp?: (level: number) => void;
  onTasksChanged?: () => void;
}

const TIER_LABELS = [
  { count: 2, xp: TIER_THRESHOLDS[2], label: "Tier 1" },
  { count: 4, xp: TIER_THRESHOLDS[4], label: "Tier 2" },
  { count: 5, xp: TIER_THRESHOLDS[5], label: "Tier 3 + Spin" },
];

function timeUntilMidnightUTC(): string {
  const now = new Date();
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
  const diffMs = midnight - now.getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

export default function DailyChallengeSection({ onLevelUp, onTasksChanged }: DailyChallengeSectionProps) {
  const supabase = useMemo(() => createClientSupabase(), []);
  const refreshProfile = useProfileStore((s) => s.refreshProfile);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const loadTasks = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("daily_tasks")
      .select("id, description, xp_reward, is_completed")
      .eq("task_date", today)
      .order("created_at");

    if (!data || data.length === 0) {
      await generateDailyTasks();
      const { data: fresh } = await supabase
        .from("daily_tasks")
        .select("id, description, xp_reward, is_completed")
        .eq("task_date", today)
        .order("created_at");
      setTasks(fresh ?? []);
    } else {
      setTasks(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    setCountdown(timeUntilMidnightUTC());
    const interval = setInterval(() => setCountdown(timeUntilMidnightUTC()), 60_000);
    return () => clearInterval(interval);
  }, []);

  function handleComplete(taskId: string) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, is_completed: true } : t)));

    startTransition(async () => {
      try {
        const result = await completeTask(taskId);
        if (result.alreadyCompleted) return;
        refreshProfile();
        onTasksChanged?.();
        if (result.tierReached) {
          setToast(`🏆 Tier ${result.tierReached} reward! +${result.bonusXp} XP`);
          setTimeout(() => setToast(null), 3000);
        }
        if (result.leveledUp && result.newLevel && onLevelUp) {
          onLevelUp(result.newLevel);
        }
      } catch {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, is_completed: false } : t)));
      }
    });
  }

  const completedCount = tasks.filter((t) => t.is_completed).length;

  return (
    <GameCard borderColor="pink" glowColor="pink">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-black uppercase tracking-wide text-ink">🔥 Daily Challenge</span>
        <span className="text-xs font-black text-text-muted">Resets in {countdown}</span>
      </div>

      <div className="relative mb-4 flex items-center justify-between">
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          const reached = n <= completedCount;
          return (
            <div key={n} className="flex flex-1 items-center last:flex-none">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-3 text-[10px] font-black ${
                  reached ? "border-green bg-green text-ink" : "border-border bg-navy/60 text-text-muted"
                }`}
              >
                {n}
              </span>
              {n < 5 && (
                <span className={`h-1 flex-1 ${n < completedCount ? "bg-green" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {TIER_LABELS.map((tier) => {
          const reached = completedCount >= tier.count;
          return (
            <div
              key={tier.count}
              className={`rounded-xl border-3 p-2 text-center ${
                reached ? "border-yellow bg-navy/40 shadow-glow-yellow" : "border-border bg-navy/20 opacity-60"
              }`}
            >
              <p className="text-[10px] font-black uppercase text-yellow">{tier.label}</p>
              <p className="text-xs font-bold text-text-muted">{tier.count} tasks</p>
              <p className="text-sm font-black text-ink">+{tier.xp} XP</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <p className="text-sm font-bold text-text-muted">Loading today&apos;s tasks...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              disabled={task.is_completed}
              onClick={() => handleComplete(task.id)}
              className="flex items-center gap-3 rounded-xl border-3 border-border bg-navy/40 p-2 text-left disabled:opacity-70"
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-3 ${
                  task.is_completed ? "border-green bg-green" : "border-border"
                }`}
              >
                {task.is_completed && <Check className="h-3.5 w-3.5 text-ink" strokeWidth={4} />}
              </span>
              <span
                className={`flex-1 text-sm font-bold ${
                  task.is_completed ? "text-text-muted line-through" : "text-ink"
                }`}
              >
                {task.description}
              </span>
              <span className="shrink-0 text-xs font-black text-yellow">+{task.xp_reward} XP</span>
            </button>
          ))}
        </div>
      )}

      {toast && (
        <div className="mt-3 rounded-xl border-3 border-yellow bg-navy/60 p-2 text-center text-xs font-black text-yellow shadow-glow-yellow">
          {toast}
        </div>
      )}
    </GameCard>
  );
}
