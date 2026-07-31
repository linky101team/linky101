import type { SupabaseClient } from "@supabase/supabase-js";
import { updateStreak } from "@/lib/streaks";
import { checkAchievements } from "@/lib/achievements";

/**
 * Pure logic module — no "use server", no session assumptions. Callable
 * from a user's own session (lib/actions/tasks.ts) or a service-role
 * context with an explicit userId (Edge Functions, admin tools).
 */

interface TaskTemplate {
  task_type: string;
  description: string;
  xp_reward: number;
  relatedInterests: string[];
}

export const TASK_POOL: TaskTemplate[] = [
  {
    task_type: "read_and_react",
    description: "Read a lesson in the Learn feed and react to it",
    xp_reward: 15,
    relatedInterests: ["Content Creation", "Tech"],
  },
  {
    task_type: "quiz_time",
    description: "Complete a quiz",
    xp_reward: 15,
    relatedInterests: ["Tech", "Finance"],
  },
  {
    task_type: "share_story",
    description: "Share a win, question, or idea in the community",
    xp_reward: 15,
    relatedInterests: ["Content Creation", "Social Media"],
  },
  {
    task_type: "help_founder",
    description: "Leave a helpful comment on someone else's post",
    xp_reward: 15,
    relatedInterests: ["Community"],
  },
  {
    task_type: "explore_follow",
    description: "Discover and follow a new founder",
    xp_reward: 15,
    relatedInterests: ["Community", "Social Media"],
  },
  {
    task_type: "team_spirit",
    description: "Check in on your team's challenge progress",
    xp_reward: 15,
    relatedInterests: ["Sport", "Community"],
  },
  {
    task_type: "dream_check",
    description: "Reflect on your dream — update it if it's changed",
    xp_reward: 15,
    relatedInterests: ["Art & Design"],
  },
  {
    task_type: "watch_learn",
    description: "Listen to a podcast episode in Learn",
    xp_reward: 15,
    relatedInterests: ["Content Creation", "Music"],
  },
  {
    task_type: "poll_power",
    description: "Vote in a Community poll",
    xp_reward: 15,
    relatedInterests: ["Community", "Social Media"],
  },
  {
    task_type: "discovery_quest",
    description: "Visit Discover and save an opportunity",
    xp_reward: 15,
    relatedInterests: ["Finance", "Tech"],
  },
];

const COINS_PER_TASK = 5;

/** 2 tasks unlocks the daily spin (see lib/spin.ts eligibility check); 5 is full completion. */
export const TIER_THRESHOLDS: Record<number, number> = { 2: 15, 4: 30, 5: 50 };
export const TIER_COIN_BONUSES: Record<number, number> = { 2: 10, 4: 20, 5: 50 };

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Weighted random pick without replacement — 3x weight for tasks matching a declared interest. */
function weightedPickTasks(interests: string[], count: number): TaskTemplate[] {
  const pool = TASK_POOL.map((task) => ({
    task,
    weight: task.relatedInterests.some((i) => interests.includes(i)) ? 3 : 1,
  }));

  const picked: TaskTemplate[] = [];
  while (picked.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
    let roll = Math.random() * totalWeight;
    let index = 0;
    for (; index < pool.length - 1; index++) {
      if (roll < pool[index].weight) break;
      roll -= pool[index].weight;
    }
    picked.push(pool[index].task);
    pool.splice(index, 1);
  }
  return picked;
}

export async function generateDailyTasks(supabase: SupabaseClient, userId: string): Promise<void> {
  const task_date = todayUTC();

  const { data: existing } = await supabase
    .from("daily_tasks")
    .select("id")
    .eq("user_id", userId)
    .eq("task_date", task_date);
  if (existing && existing.length > 0) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("interests")
    .eq("id", userId)
    .maybeSingle();

  const picks = weightedPickTasks(profile?.interests ?? [], 5);

  const { error } = await supabase.from("daily_tasks").insert(
    picks.map((t) => ({
      user_id: userId,
      task_type: t.task_type,
      description: t.description,
      xp_reward: t.xp_reward,
      task_date,
    }))
  );
  if (error) throw new Error(error.message);
}

export interface CompleteTaskResult {
  alreadyCompleted: boolean;
  xpAwarded?: number;
  coinsAwarded?: number;
  completedCount?: number;
  bonusXp?: number;
  bonusCoins?: number;
  tierReached?: number | null;
  leveledUp?: boolean;
  newLevel?: number;
  streakChanged?: boolean;
  newStreak?: number;
}

export async function completeTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string
): Promise<CompleteTaskResult> {
  const { data: task, error: taskError } = await supabase
    .from("daily_tasks")
    .select("id, xp_reward, is_completed, task_date, user_id")
    .eq("id", taskId)
    .maybeSingle();
  if (taskError) throw new Error(taskError.message);
  if (!task || task.user_id !== userId) throw new Error("Task not found");
  if (task.is_completed) return { alreadyCompleted: true };

  const { error: updateError } = await supabase
    .from("daily_tasks")
    .update({ is_completed: true })
    .eq("id", taskId);
  if (updateError) throw new Error(updateError.message);

  const { data: xpRows, error: xpError } = await supabase.rpc("increment_xp", {
    user_id: userId,
    amount: task.xp_reward,
  });
  if (xpError) throw new Error(xpError.message);
  const xpResult = xpRows?.[0];

  await supabase.rpc("add_coins", { p_user_id: userId, p_amount: COINS_PER_TASK });

  const { data: todaysTasks } = await supabase
    .from("daily_tasks")
    .select("is_completed")
    .eq("user_id", userId)
    .eq("task_date", task.task_date);

  const completedCount = todaysTasks?.filter((t) => t.is_completed).length ?? 0;
  const bonusXp = TIER_THRESHOLDS[completedCount] ?? 0;
  const bonusCoins = TIER_COIN_BONUSES[completedCount] ?? 0;
  const tierReached = bonusXp > 0 ? Object.keys(TIER_THRESHOLDS).indexOf(String(completedCount)) + 1 : null;

  let leveledUp = xpResult?.leveled_up ?? false;
  let newLevel = xpResult?.new_level;

  if (bonusXp > 0) {
    const { data: bonusRows, error: bonusError } = await supabase.rpc("increment_xp", {
      user_id: userId,
      amount: bonusXp,
    });
    if (bonusError) throw new Error(bonusError.message);
    const bonusResult = bonusRows?.[0];
    leveledUp = leveledUp || (bonusResult?.leveled_up ?? false);
    newLevel = bonusResult?.new_level ?? newLevel;
  }
  if (bonusCoins > 0) {
    await supabase.rpc("add_coins", { p_user_id: userId, p_amount: bonusCoins });
  }

  const streakResult = await updateStreak(supabase, userId);
  await checkAchievements(supabase, userId);

  return {
    alreadyCompleted: false,
    xpAwarded: task.xp_reward,
    coinsAwarded: COINS_PER_TASK,
    completedCount,
    bonusXp,
    bonusCoins,
    tierReached,
    leveledUp,
    newLevel,
    streakChanged: streakResult.changed,
    newStreak: streakResult.newStreak,
  };
}
