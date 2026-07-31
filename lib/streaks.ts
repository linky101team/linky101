import type { SupabaseClient } from "@supabase/supabase-js";
import { checkAchievements } from "@/lib/achievements";

export interface StreakMilestone {
  days: number;
  bonusXp: number;
  bonusCoins: number;
  shieldDelta: number;
  flairDelta: number;
  label: string;
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  { days: 3, bonusXp: 20, bonusCoins: 0, shieldDelta: 0, flairDelta: 0, label: "3-Day Streak" },
  { days: 7, bonusXp: 50, bonusCoins: 25, shieldDelta: 1, flairDelta: 0, label: "7-Day Streak" },
  { days: 14, bonusXp: 75, bonusCoins: 50, shieldDelta: 0, flairDelta: 1, label: "14-Day Streak" },
  { days: 30, bonusXp: 100, bonusCoins: 100, shieldDelta: 0, flairDelta: 0, label: "30-Day Streak" },
  { days: 50, bonusXp: 200, bonusCoins: 150, shieldDelta: 0, flairDelta: 0, label: "50-Day Legendary Streak" },
];

interface StreakResult {
  changed: boolean;
  newStreak: number;
  milestone?: StreakMilestone;
  shieldConsumed: boolean;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayUTC(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
}

/**
 * Called on a user's first qualifying activity of the day (e.g. task
 * completion). today = no-op, yesterday = increment, older = check a
 * streak shield (consume + preserve) or reset to 1.
 */
export async function updateStreak(supabase: SupabaseClient, userId: string): Promise<StreakResult> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, last_active_date, profile_flair")
    .eq("id", userId)
    .maybeSingle();

  if (!profile) return { changed: false, newStreak: 0, shieldConsumed: false };

  const today = todayUTC();
  if (profile.last_active_date === today) {
    return { changed: false, newStreak: profile.current_streak, shieldConsumed: false };
  }

  const yesterday = yesterdayUTC();
  let newStreak: number;
  let shieldDelta = 0;
  let shieldConsumed = false;

  if (profile.last_active_date === yesterday) {
    newStreak = profile.current_streak + 1;
  } else {
    const shields = (profile.profile_flair as { streak_shields?: number } | null)?.streak_shields ?? 0;
    if (profile.last_active_date && shields > 0) {
      newStreak = profile.current_streak + 1;
      shieldDelta = -1;
      shieldConsumed = true;
    } else {
      newStreak = 1;
    }
  }

  const milestone = STREAK_MILESTONES.find((m) => m.days === newStreak);
  if (milestone) shieldDelta += milestone.shieldDelta;
  const flairDelta = milestone?.flairDelta ?? 0;

  await supabase.rpc("apply_streak_result", {
    p_user_id: userId,
    p_new_current_streak: newStreak,
    p_shield_delta: shieldDelta,
    p_flair_delta: flairDelta,
    p_last_active_date: today,
  });

  if (milestone) {
    await supabase.rpc("increment_xp", { user_id: userId, amount: milestone.bonusXp });
    if (milestone.bonusCoins > 0) {
      await supabase.rpc("add_coins", { p_user_id: userId, p_amount: milestone.bonusCoins });
    }
  }

  await checkAchievements(supabase, userId);

  return { changed: true, newStreak, milestone, shieldConsumed };
}

/**
 * Midnight decay pass over every user who did NOT trigger updateStreak
 * themselves (they didn't act yesterday, and haven't today either — so
 * the one-day grace period has now fully lapsed). Meant to run once daily
 * from the check-streaks Edge Function, not from a user session.
 */
export async function decayInactiveStreaks(
  supabase: SupabaseClient
): Promise<{ processed: number; shielded: number; reset: number }> {
  const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0, 10);
  const yesterday = yesterdayUTC();

  const { data: atRisk } = await supabase
    .from("profiles")
    .select("id, current_streak, last_active_date, profile_flair")
    .gt("current_streak", 0)
    .lte("last_active_date", twoDaysAgo);

  let shielded = 0;
  let reset = 0;

  for (const profile of atRisk ?? []) {
    const shields = (profile.profile_flair as { streak_shields?: number } | null)?.streak_shields ?? 0;

    if (shields > 0) {
      // Bridge the missed day: advance last_active_date to "yesterday" so
      // the streak count itself is untouched and their next real check-in
      // reads as a normal continuation, not another gap.
      await supabase.rpc("apply_streak_result", {
        p_user_id: profile.id,
        p_new_current_streak: profile.current_streak,
        p_shield_delta: -1,
        p_flair_delta: 0,
        p_last_active_date: yesterday,
      });
      shielded += 1;
    } else {
      await supabase.rpc("apply_streak_result", {
        p_user_id: profile.id,
        p_new_current_streak: 0,
        p_shield_delta: 0,
        p_flair_delta: 0,
        p_last_active_date: null,
      });
      reset += 1;
    }
  }

  return { processed: (atRisk ?? []).length, shielded, reset };
}
