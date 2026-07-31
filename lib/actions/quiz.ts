"use server";

import { createServerSupabase } from "@/lib/supabase/server";

interface SubmitResult {
  xpEarned: number;
  isFirstAttempt: boolean;
  leveledUp: boolean;
  newLevel?: number;
}

/** Records a quiz attempt; only the first attempt on a given quiz earns XP. */
export async function submitQuizAttempt(
  quizId: string,
  score: number,
  totalQuestions: number
): Promise<SubmitResult> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { count: priorAttempts } = await supabase
    .from("quiz_attempts")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("quiz_id", quizId);

  const isFirstAttempt = (priorAttempts ?? 0) === 0;

  let xpEarned = 0;
  if (isFirstAttempt) {
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("xp_reward")
      .eq("id", quizId)
      .maybeSingle();
    const maxXp = quiz?.xp_reward ?? 0;
    xpEarned = totalQuestions > 0 ? Math.round((maxXp * score) / totalQuestions) : 0;
  }

  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    quiz_id: quizId,
    score,
    total_questions: totalQuestions,
    xp_earned: xpEarned,
  });
  if (error) throw new Error(error.message);

  let leveledUp = false;
  let newLevel: number | undefined;

  if (xpEarned > 0) {
    const { data: xpRows } = await supabase.rpc("increment_xp", {
      user_id: user.id,
      amount: xpEarned,
    });
    const result = xpRows?.[0];
    leveledUp = result?.leveled_up ?? false;
    newLevel = result?.new_level;
  }

  return { xpEarned, isFirstAttempt, leveledUp, newLevel };
}
