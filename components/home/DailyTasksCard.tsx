"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfileStore } from "@/hooks/useProfile";
import { generateDailyTasks, completeTask } from "@/lib/actions/tasks";
import GameCard from "@/components/ui/GameCard";

interface DailyTask {
  id: string;
  description: string;
  xp_reward: number;
  is_completed: boolean;
}

interface DailyTasksCardProps {
  onLevelUp?: (level: number) => void;
}

function timeUntilMidnightUTC(): string {
  const now = new Date();
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0);
  const diffMs = midnight - now.getTime();
  const hours = Math.floor(diffMs / 3_600_000);
  const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

export default function DailyTasksCard({ onLevelUp }: DailyTasksCardProps) {
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
        <span className="font-black uppercase tracking-wide text-white">🔥 Daily Tasks</span>
        <span className="text-xs font-black text-text-muted">Resets in {countdown}</span>
      </div>
      <Link
        href="/tasks"
        className="mb-3 block text-right text-xs font-black uppercase tracking-wide text-sky"
      >
        See All →
      </Link>

      <div className="mb-3 flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={`h-2 flex-1 rounded-full ${
              i < completedCount ? "bg-green shadow-glow-green" : "bg-border"
            }`}
          />
        ))}
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
                {task.is_completed && <Check className="h-3.5 w-3.5 text-navy" strokeWidth={4} />}
              </span>
              <span
                className={`flex-1 text-sm font-bold ${
                  task.is_completed ? "text-text-muted line-through" : "text-white"
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
