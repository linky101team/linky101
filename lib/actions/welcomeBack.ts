"use server";

import { createServerSupabase } from "@/lib/supabase/server";

const ABSENCE_THRESHOLD_DAYS = 2;

export interface WelcomeBackSummary {
  show: boolean;
  daysAway: number;
  newPosts: number;
  unreadNotifications: number;
  currentStreak: number;
}

function daysBetween(from: string, to: string): number {
  const fromDate = new Date(`${from}T00:00:00Z`).getTime();
  const toDate = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((toDate - fromDate) / 86_400_000);
}

/** Read-only — safe to call on every mount. Does not update last_active_date. */
export async function getWelcomeBackSummary(): Promise<WelcomeBackSummary> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { show: false, daysAway: 0, newPosts: 0, unreadNotifications: 0, currentStreak: 0 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("last_active_date, current_streak, profile_flair")
    .eq("id", user.id)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);
  const lastActive = profile?.last_active_date;
  const daysAway = lastActive ? daysBetween(lastActive, today) : 0;

  if (!lastActive || daysAway < ABSENCE_THRESHOLD_DAYS) {
    return { show: false, daysAway, newPosts: 0, unreadNotifications: 0, currentStreak: profile?.current_streak ?? 0 };
  }

  const [{ count: newPosts }, { count: unread }] = await Promise.all([
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("moderation_status", "approved")
      .gt("created_at", `${lastActive}T00:00:00Z`),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false),
  ]);

  return {
    show: true,
    daysAway,
    newPosts: newPosts ?? 0,
    unreadNotifications: unread ?? 0,
    currentStreak: profile?.current_streak ?? 0,
  };
}

/** Marks today as the user's active day so Welcome Back won't show again until the next real gap. */
export async function dismissWelcomeBack(): Promise<void> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ last_active_date: new Date().toISOString().slice(0, 10) })
    .eq("id", user.id);
}
