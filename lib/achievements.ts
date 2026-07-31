import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Pure logic module — no "use server", no session assumptions. Takes an
 * explicit userId and an already-constructed Supabase client so it can run
 * from a user's own session (via lib/actions/*.ts wrappers) or from a
 * trusted service-role context with no session at all (Edge Functions).
 */

interface UserStats {
  posts_created: number;
  longest_streak: number;
  quizzes_completed: number;
  has_dream: number;
  following_count: number;
  followers_count: number;
  mentor_answers: number;
  has_gold_post: number;
  rare_spin: number;
  level: number;
  team_challenges_participated: number;
}

interface SpinPrizeValue {
  rarity?: string;
}

async function computeUserStats(supabase: SupabaseClient, userId: string): Promise<UserStats> {
  const [
    { data: profile },
    { count: posts },
    { count: quizzes },
    { count: following },
    { count: followers },
    { count: mentorAnswers },
    { count: goldPosts },
    { data: spins },
  ] = await Promise.all([
    supabase.from("profiles").select("level, longest_streak, dream, school_id").eq("id", userId).maybeSingle(),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", userId),
    supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("follower_id", userId),
    supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("following_id", userId),
    supabase.from("mentor_questions").select("id", { count: "exact", head: true }).eq("answered_by", userId),
    supabase
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userId)
      .eq("is_gold", true),
    supabase.from("daily_spins").select("prize_value").eq("user_id", userId),
  ]);

  const rareSpin = (spins ?? []).some((s) => {
    const rarity = (s.prize_value as SpinPrizeValue | null)?.rarity;
    return rarity === "rare" || rarity === "epic";
  });

  let teamChallengesParticipated = 0;
  if (profile?.school_id) {
    const { count } = await supabase
      .from("team_challenge_progress")
      .select("challenge_id, team_challenges!inner(ends_at)", { count: "exact", head: true })
      .eq("school_id", profile.school_id)
      .lt("team_challenges.ends_at", new Date().toISOString());
    teamChallengesParticipated = count ?? 0;
  }

  return {
    posts_created: posts ?? 0,
    longest_streak: profile?.longest_streak ?? 0,
    quizzes_completed: quizzes ?? 0,
    has_dream: profile?.dream ? 1 : 0,
    following_count: following ?? 0,
    followers_count: followers ?? 0,
    mentor_answers: mentorAnswers ?? 0,
    has_gold_post: (goldPosts ?? 0) > 0 ? 1 : 0,
    rare_spin: rareSpin ? 1 : 0,
    level: profile?.level ?? 1,
    team_challenges_participated: teamChallengesParticipated,
  };
}

/** Compares the user's current stats against unearned achievements and awards any newly met. */
export async function checkAchievements(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const [{ data: allAchievements }, { data: earned }] = await Promise.all([
    supabase.from("achievements").select("id, requirement_type, requirement_value"),
    supabase.from("user_achievements").select("achievement_id").eq("user_id", userId),
  ]);

  const earnedIds = new Set((earned ?? []).map((e) => e.achievement_id));
  const unearned = (allAchievements ?? []).filter((a) => !earnedIds.has(a.id));
  if (unearned.length === 0) return [];

  const stats = await computeUserStats(supabase, userId);
  const newlyEarned: string[] = [];

  for (const a of unearned) {
    if (!a.requirement_type || a.requirement_value === null) continue;
    const value = stats[a.requirement_type as keyof UserStats] ?? 0;
    if (value >= a.requirement_value) {
      const { data: awarded } = await supabase.rpc("award_achievement", {
        p_user_id: userId,
        p_achievement_id: a.id,
      });
      if (awarded) newlyEarned.push(a.id);
    }
  }

  return newlyEarned;
}
