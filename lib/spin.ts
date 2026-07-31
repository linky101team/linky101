import type { SupabaseClient } from "@supabase/supabase-js";
import { PRIZE_TABLE, pickWeighted, type WeightedPrize, type Prize } from "@/lib/spinPrizes";
import { checkAchievements } from "@/lib/achievements";

/**
 * Pure logic module — no "use server", no session assumptions. In
 * practice the spin is always triggered from the acting user's own
 * session (lib/actions/spin.ts), but taking an explicit userId keeps it
 * consistent with the rest of the engine (tasks/streaks/achievements) and
 * testable/callable outside a request context if ever needed.
 */

export interface SpinResult extends Prize {
  leveledUp: boolean;
  newLevel?: number;
}

const TASKS_REQUIRED_FOR_SPIN = 2;

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getSpinStatus(supabase: SupabaseClient, userId: string) {
  const spin_date = todayUTC();

  const [{ data: profileRow }, { data: spins }, { count: completedCount }] = await Promise.all([
    supabase.from("profiles").select("is_premium").eq("id", userId).maybeSingle(),
    supabase
      .from("daily_spins")
      .select("prize_value, spin_number")
      .eq("user_id", userId)
      .eq("spin_date", spin_date)
      .order("spin_number"),
    supabase
      .from("daily_tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("task_date", spin_date)
      .eq("is_completed", true),
  ]);

  const maxSpins = profileRow?.is_premium ? 2 : 1;
  const spinsUsed = spins?.length ?? 0;
  const tasksCompleted = completedCount ?? 0;

  return {
    maxSpins,
    spinsUsed,
    spinsRemaining: Math.max(0, maxSpins - spinsUsed),
    tasksCompleted,
    tasksRequired: TASKS_REQUIRED_FOR_SPIN,
    eligible: spinsUsed < maxSpins && tasksCompleted >= TASKS_REQUIRED_FOR_SPIN,
    pastPrizes: (spins ?? []).map((s) => s.prize_value as { label?: string; rarity?: string }),
  };
}

export async function performSpin(supabase: SupabaseClient, userId: string): Promise<SpinResult> {
  const { data: profileRow } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", userId)
    .maybeSingle();
  if (!profileRow) throw new Error("Profile not found");

  const spin_date = todayUTC();

  const { data: todaysSpins } = await supabase
    .from("daily_spins")
    .select("spin_number")
    .eq("user_id", userId)
    .eq("spin_date", spin_date);

  const spinsUsed = todaysSpins?.length ?? 0;
  const maxSpins = profileRow.is_premium ? 2 : 1;
  if (spinsUsed >= maxSpins) throw new Error("No spins left today");

  const { count: completedCount } = await supabase
    .from("daily_tasks")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("task_date", spin_date)
    .eq("is_completed", true);

  if ((completedCount ?? 0) < TASKS_REQUIRED_FOR_SPIN) {
    throw new Error(`Complete at least ${TASKS_REQUIRED_FOR_SPIN} daily tasks to unlock your spin`);
  }

  const prize: WeightedPrize = pickWeighted(PRIZE_TABLE);
  const spin_number = spinsUsed + 1;

  const { error } = await supabase.from("daily_spins").insert({
    user_id: userId,
    spin_date,
    spin_number,
    prize_type: prize.type,
    prize_value: { amount: prize.amount, coins: prize.coins, label: prize.label, rarity: prize.rarity },
  });

  if (error) {
    if (error.code === "23505") throw new Error("No spins left today");
    throw new Error(error.message);
  }

  let leveledUp = false;
  let newLevel: number | undefined;

  if (prize.amount > 0 && (prize.type === "xp_25" || prize.type === "xp_50" || prize.type === "level_skip")) {
    const { data: xpRows } = await supabase.rpc("increment_xp", { user_id: userId, amount: prize.amount });
    const result = xpRows?.[0];
    leveledUp = result?.leveled_up ?? false;
    newLevel = result?.new_level;
  } else if (prize.type === "team_boost") {
    await supabase.rpc("apply_spin_prize", {
      p_user_id: userId,
      p_prize_type: "team_boost",
      p_prize_amount: prize.amount,
    });
  } else if (prize.type === "streak_shield") {
    await supabase.rpc("apply_spin_prize", { p_user_id: userId, p_prize_type: "streak_shield", p_prize_amount: 1 });
  } else if (prize.type === "flair") {
    await supabase.rpc("apply_spin_prize", { p_user_id: userId, p_prize_type: "profile_flair", p_prize_amount: 1 });
  } else if (prize.type === "bonus_task") {
    await supabase.from("daily_tasks").insert({
      user_id: userId,
      task_type: "bonus",
      description: "Bonus task: leave a comment on someone's post",
      xp_reward: 30,
      task_date: spin_date,
    });
  }

  if (prize.coins > 0) {
    await supabase.rpc("add_coins", { p_user_id: userId, p_amount: prize.coins });
  }

  await checkAchievements(supabase, userId);

  return {
    type: prize.type,
    amount: prize.amount,
    coins: prize.coins,
    label: prize.label,
    rarity: prize.rarity,
    leveledUp,
    newLevel,
  };
}
