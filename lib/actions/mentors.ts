"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { moderateContent } from "@/lib/moderation";

const QUESTION_MAX = 500;
const ANSWER_MAX = 2000;

export async function askQuestion(questionText: string, mentorId: string | null) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = questionText.trim().slice(0, QUESTION_MAX);
  if (!trimmed) throw new Error("Question cannot be empty");

  const moderation = moderateContent(trimmed);
  if (!moderation.approved) throw new Error(moderation.reason ?? "This question isn't allowed.");

  const { data, error } = await supabase
    .from("mentor_questions")
    .insert({ asked_by: user.id, mentor_id: mentorId, question_text: trimmed, is_public: true })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function rateMentor(questionId: string, mentorId: string, rating: number) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const clamped = Math.min(5, Math.max(1, Math.round(rating)));

  const { error } = await supabase
    .from("mentor_ratings")
    .insert({ user_id: user.id, mentor_id: mentorId, question_id: questionId, rating: clamped });

  if (error) {
    if (error.code === "23505") throw new Error("You've already rated this answer");
    throw new Error(error.message);
  }
}

export async function updateMentorProfile(updates: { bio?: string; expertise?: string[]; avatar_url?: string }) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("mentors").update(updates).eq("id", user.id);
  if (error) throw new Error(error.message);
}

export async function answerQuestion(questionId: string, answerText: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = answerText.trim().slice(0, ANSWER_MAX);
  if (!trimmed) throw new Error("Answer cannot be empty");

  const moderation = moderateContent(trimmed);
  if (!moderation.approved) throw new Error(moderation.reason ?? "This answer isn't allowed.");

  const { error } = await supabase
    .from("mentor_questions")
    .update({ answer_text: trimmed, answered_by: user.id, answered_at: new Date().toISOString() })
    .eq("id", questionId);

  if (error) throw new Error(error.message);
}
