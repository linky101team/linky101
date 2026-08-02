"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { moderateContent } from "@/lib/moderation";
import { WEEKLY_QUESTION_LIMIT } from "@/lib/mentorLimits";

const QUESTION_MAX = 500;
const ANSWER_MAX = 2000;

/**
 * Questions go to the whole mentor pool, never to one named person.
 *
 * Two reasons. Practically, whoever knows the answer takes it, so a question
 * doesn't die because one volunteer is on holiday. And structurally, there is
 * no "my mentor" relationship for an under-18 to form with a specific adult —
 * everything asked here is answered in the open.
 */
export async function askQuestion(questionText: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = questionText.trim().slice(0, QUESTION_MAX);
  if (!trimmed) throw new Error("Question cannot be empty");

  const moderation = moderateContent(trimmed);
  if (!moderation.approved) throw new Error(moderation.reason ?? "This question isn't allowed.");

  // Admins aren't capped. They're running the thing — testing the flow,
  // seeding the first questions, answering as the team — and a two-a-week
  // limit on the person who has to keep the queue alive makes no sense.
  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = !!me?.is_admin;

  const { data: used } = await supabase.rpc("questions_asked_this_week", { p_user_id: user.id });
  if (!isAdmin && (used ?? 0) >= WEEKLY_QUESTION_LIMIT) {
    throw new Error(
      `You've used both your questions this week. They reset seven days after you asked — worth saving the next one for something you really want to know.`
    );
  }

  // Private by default. is_published stays false until someone picks this
  // answer for the weekly feed, and even then the asker's name is stripped.
  const { data, error } = await supabase
    .from("mentor_questions")
    .insert({
      asked_by: user.id,
      mentor_id: null,
      question_text: trimmed,
      is_public: false,
      is_published: false,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** How many questions this member has left this week, for the UI. */
export async function questionsLeftThisWeek(): Promise<number> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: me } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  // Big number rather than Infinity so the counter still renders as a number.
  if (me?.is_admin) return 99;

  const { data } = await supabase.rpc("questions_asked_this_week", { p_user_id: user.id });
  return Math.max(0, WEEKLY_QUESTION_LIMIT - (data ?? 0));
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

// ---------------------------------------------------------------------------
// Admin: posting a mentor's answer
//
// Mentors have no accounts, so their answers arrive by email or message and a
// named adult puts them up under the right mentor's name. That keeps a human
// reading everything before it is published, and means no mentor ever has a
// direct line to a member.
// ---------------------------------------------------------------------------

async function requireAdminSupabase() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.is_admin) throw new Error("Admins only");

  return supabase;
}

export async function postMentorAnswer(
  questionId: string,
  mentorId: string,
  answerText: string,
  publishToFeed: boolean
) {
  const supabase = await requireAdminSupabase();

  const trimmed = answerText.trim().slice(0, ANSWER_MAX);
  if (!trimmed) throw new Error("Answer cannot be empty");

  const moderation = moderateContent(trimmed);
  if (!moderation.approved) throw new Error(moderation.reason ?? "This answer isn't allowed.");

  const { data: question, error } = await supabase
    .from("mentor_questions")
    .update({
      answer_text: trimmed,
      answered_by: mentorId,
      answered_at: new Date().toISOString(),
      is_published: publishToFeed,
      published_at: publishToFeed ? new Date().toISOString() : null,
    })
    .eq("id", questionId)
    .select("asked_by")
    .single();

  if (error) throw new Error(error.message);

  // Tell the person who asked. Failing to notify shouldn't undo the answer,
  // so this is deliberately not allowed to throw.
  try {
    const { data: mentor } = await supabase
      .from("mentors")
      .select("display_name")
      .eq("id", mentorId)
      .maybeSingle();

    await supabase.from("notifications").insert({
      user_id: question.asked_by,
      type: "mentor_answer",
      title: "Your question was answered",
      body: `${mentor?.display_name ?? "A mentor"} has replied — tap to read it.`,
      link: "/mentors",
    });
  } catch {
    // notification is best-effort
  }
}

/** Add or remove an already-answered question from the weekly public feed. */
export async function setAnswerPublished(questionId: string, published: boolean) {
  const supabase = await requireAdminSupabase();
  const { error } = await supabase
    .from("mentor_questions")
    .update({
      is_published: published,
      published_at: published ? new Date().toISOString() : null,
    })
    .eq("id", questionId);
  if (error) throw new Error(error.message);
}
