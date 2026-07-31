"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { createClientSupabase } from "@/lib/supabase/client";
import { useProfileStore } from "@/hooks/useProfile";
import { generateDailyTasks, completeTask } from "@/lib/actions/tasks";
import { floatXP, floatCoins } from "@/lib/floatingRewards";
import GameCard from "@/components/ui/GameCard";

interface DailyTask {
  id: string;
  description: string;
  xp_reward: number;
  is_completed: boolean;
  task_type: string;
}

interface DailyTasksCardProps {
  onLevelUp?: (level: number) => void;
}

const TASK_ICON: Record<string, string> = {
  read_and_react: "📚",
  quiz_time: "🧠",
  share_story: "✍️",
  help_founder: "🤝",
  explore_follow: "🔍",
  team_spirit: "🏫",
  dream_check: "💭",
  watch_learn: "🎧",
  poll_power: "📊",
  discovery_quest: "🧭",
};

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
  const [sparkleId, setSparkleId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const loadTasks = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("daily_tasks")
      .select("id, description, xp_reward, is_completed, task_type")
      .eq("task_date", today)
      .order("created_at");

    if (!data || data.length === 0) {
      await generateDailyTasks();
      const { data: fresh } = await supabase
        .from("daily_tasks")
        .select("id, description, xp_reward, is_completed, task_type")
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

  function handleComplete(taskId: string, xpReward: number) {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, is_completed: true } : t)));
    setSparkleId(taskId);
    setTimeout(() => setSparkleId(null), 700);
    floatXP(xpReward);
    floatCoins(5);

    startTransition(async () => {
      try {
        const result = await completeTask(taskId);
        if (result.alreadyCompleted) return;
        refreshProfile();
        if (result.tierReached) {
          setToast(`🏆 Tier ${result.tierReached} reward! +${result.bonusXp} XP`);
          if (result.bonusCoins) floatCoins(result.bonusCoins);
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
        <span className="font-black uppercase tracking-wide text-ink">🎯 Today&apos;s Quests</span>
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
          <motion.span
            key={i}
            initial={false}
            animate={{ scale: i < completedCount ? [1, 1.3, 1] : 1 }}
            transition={{ duration: 0.4 }}
            className={`h-2 flex-1 rounded-full ${
              i < completedCount ? "bg-gradient-primary shadow-glow-sky" : "bg-border"
            }`}
          />
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-shimmer h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              disabled={task.is_completed}
              onClick={() => handleComplete(task.id, task.xp_reward)}
              className="flex items-center gap-3 rounded-xl border-3 border-border bg-white p-2.5 text-left shadow-card transition-transform active:scale-[0.98] disabled:opacity-70"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/40 text-base">
                {TASK_ICON[task.task_type] ?? "🎯"}
              </span>
              <span
                className={`flex-1 text-sm font-bold ${
                  task.is_completed ? "text-text-muted line-through" : "text-ink"
                }`}
              >
                {task.description}
              </span>
              <span className="relative shrink-0">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-3 transition-colors ${
                    task.is_completed ? "border-sky bg-gradient-primary" : "border-border"
                  }`}
                >
                  {task.is_completed && <Check className="h-4 w-4 text-white" strokeWidth={4} />}
                </span>
                <AnimatePresence>
                  {sparkleId === task.id && (
                    <motion.span
                      initial={{ scale: 0.3, opacity: 1, rotate: 0 }}
                      animate={{ scale: 1.8, opacity: 0, rotate: 90 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="pointer-events-none absolute inset-0 flex items-center justify-center text-yellow"
                    >
                      <Sparkles className="h-7 w-7" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              <span className="shrink-0 rounded-full border-2 border-yellow bg-yellow/15 px-2 py-0.5 text-[10px] font-black text-[#B8860B]">
                +{task.xp_reward} XP
              </span>
            </button>
          ))}
        </div>
      )}

      {toast && (
        <div className="mt-3 rounded-xl border-3 border-yellow bg-yellow/15 p-2 text-center text-xs font-black text-[#B8860B] shadow-glow-yellow">
          {toast}
        </div>
      )}
    </GameCard>
  );
}
