"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useLevelModalStore } from "@/lib/levelModalStore";
import { createClientSupabase } from "@/lib/supabase/client";
import {
  getLevelProgress,
  getLevelTitle,
  getNextLevelXP,
  getXPForLevel,
  getFeatureForLevel,
} from "@/lib/levels";

interface XPEvent {
  id: string;
  label: string;
  amount: number;
  at: string;
}

function useCountUp(target: number, active: boolean, durationMs = 900) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let raf: number;
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, active]);
  return value;
}

export default function LevelProgressModal() {
  const open = useLevelModalStore((s) => s.open);
  const hide = useLevelModalStore((s) => s.hide);
  const { profile } = useProfile();
  const supabase = useMemo(() => createClientSupabase(), []);
  const [history, setHistory] = useState<XPEvent[]>([]);

  useEffect(() => {
    if (!open || !profile) return;

    async function loadHistory() {
      const [{ data: tasks }, { data: quizzes }] = await Promise.all([
        supabase
          .from("daily_tasks")
          .select("id, description, xp_reward, task_date, updated_at:created_at")
          .eq("user_id", profile!.id)
          .eq("is_completed", true)
          .order("task_date", { ascending: false })
          .limit(5),
        supabase
          .from("quiz_attempts")
          .select("id, xp_earned, completed_at, quizzes(title)")
          .eq("user_id", profile!.id)
          .gt("xp_earned", 0)
          .order("completed_at", { ascending: false })
          .limit(5),
      ]);

      const taskEvents: XPEvent[] = (tasks ?? []).map((t) => ({
        id: `task-${t.id}`,
        label: t.description ?? "Daily task",
        amount: t.xp_reward,
        at: t.task_date,
      }));
      const quizEvents: XPEvent[] = (quizzes ?? []).map((q) => ({
        id: `quiz-${q.id}`,
        label: (q.quizzes as unknown as { title?: string } | null)?.title ?? "Quiz completed",
        amount: q.xp_earned,
        at: q.completed_at,
      }));

      const merged = [...taskEvents, ...quizEvents]
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 5);
      setHistory(merged);
    }

    loadHistory();
  }, [open, profile, supabase]);

  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const floor = getXPForLevel(level);
  const ceiling = getNextLevelXP(level);
  const progressPct = getLevelProgress(level, xp);
  const nextFeature = ceiling !== null ? getFeatureForLevel(level + 1) : null;
  const animatedXp = useCountUp(xp - floor, open && !!profile);
  const xpSpan = ceiling !== null ? ceiling - floor : 0;

  if (!profile) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-end justify-center bg-black/60 sm:items-center"
          onClick={hide}
        >
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[430px] rounded-t-[28px] border-3 border-b-0 border-sky bg-card p-6 shadow-glow-sky sm:rounded-[28px] sm:border-b-3"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-text-muted">
                Level Progress
              </span>
              <button type="button" onClick={hide} aria-label="Close" className="text-text-muted">
                <X className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center">
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="glow-pulse mb-3 flex h-20 w-20 items-center justify-center rounded-full border-3 border-sky bg-gradient-primary text-2xl font-black text-white shadow-glow-sky"
              >
                {level}
              </motion.span>
              <h2 className="heading-game text-xl text-ink">{getLevelTitle(level)}</h2>

              <div className="mt-5 w-full">
                <div className="h-4 w-full overflow-hidden rounded-full border-2 border-border bg-navy/50">
                  <motion.div
                    className="h-full rounded-full bg-gradient-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-2 text-sm font-black text-ink">
                  {ceiling === null ? (
                    <span>Max Level Reached! 🎉</span>
                  ) : (
                    <span>
                      {animatedXp} / {xpSpan} XP
                    </span>
                  )}
                </p>
              </div>

              {nextFeature && (
                <div className="mt-4 w-full rounded-2xl border-3 border-purple bg-purple/10 p-3 text-left">
                  <p className="text-[10px] font-black uppercase tracking-wide text-purple">Next Up</p>
                  <p className="text-sm font-bold text-ink">
                    Level {level + 1} unlocks:{" "}
                    <span className="text-purple">{nextFeature} 🔓</span>
                  </p>
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-black uppercase tracking-wide text-text-muted">
                  Recent XP
                </p>
                <div className="flex flex-col gap-1.5">
                  {history.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-navy/30 px-3 py-2"
                    >
                      <span className="truncate text-xs font-bold text-ink">{h.label}</span>
                      <span className="shrink-0 text-xs font-black text-sky">+{h.amount} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
