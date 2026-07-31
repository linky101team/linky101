"use server";

import { createServerSupabase } from "@/lib/supabase/server";

interface CompleteLessonResult {
  success: boolean;
  firstCompletion: boolean;
  xpEarned: number;
  coinsEarned: number;
  leveledUp: boolean;
  newLevel: number | null;
}

/** Records a lesson completion via complete_curriculum_lesson(); only the first completion earns XP/coins. */
export async function completeCurriculumLesson(
  lessonId: string,
  quizScore: number
): Promise<CompleteLessonResult> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("complete_curriculum_lesson", {
    p_user_id: user.id,
    p_lesson_id: lessonId,
    p_quiz_score: quizScore,
  });
  if (error) throw new Error(error.message);

  return {
    success: data?.success ?? false,
    firstCompletion: data?.firstCompletion ?? false,
    xpEarned: data?.xpEarned ?? 0,
    coinsEarned: data?.coinsEarned ?? 0,
    leveledUp: data?.leveledUp ?? false,
    newLevel: data?.newLevel ?? null,
  };
}
