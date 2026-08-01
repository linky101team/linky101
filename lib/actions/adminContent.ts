"use server";

import { createServerSupabase } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) throw new Error("Admins only");

  return supabase;
}

export async function respondToFeedback(feedbackId: string, adminResponse: string, status: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("feedback")
    .update({ admin_response: adminResponse, status })
    .eq("id", feedbackId);
  if (error) throw new Error(error.message);
}

export async function setFeedbackStatus(feedbackId: string, status: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("feedback").update({ status }).eq("id", feedbackId);
  if (error) throw new Error(error.message);
}

export async function toggleQuizActive(quizId: string, isActive: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("quizzes").update({ is_active: isActive }).eq("id", quizId);
  if (error) throw new Error(error.message);
}

export async function toggleOpportunityActive(opportunityId: string, isActive: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("opportunities").update({ is_active: isActive }).eq("id", opportunityId);
  if (error) throw new Error(error.message);
}

export async function createOpportunity(input: {
  title: string;
  description: string;
  category: string;
  link: string;
  location: string;
  deadline: string | null;
}) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("opportunities").insert(input);
  if (error) throw new Error(error.message);
}

export async function toggleMentorVerified(mentorId: string, isVerified: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("mentors").update({ is_verified: isVerified }).eq("id", mentorId);
  if (error) throw new Error(error.message);
}

export async function toggleMentorActive(mentorId: string, isActive: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("mentors").update({ is_active: isActive }).eq("id", mentorId);
  if (error) throw new Error(error.message);
}

export async function toggleShopItemActive(itemId: string, isActive: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("shop_items").update({ is_active: isActive }).eq("id", itemId);
  if (error) throw new Error(error.message);
}

export async function togglePodcastPublished(podcastId: string, isPublished: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("podcasts").update({ is_published: isPublished }).eq("id", podcastId);
  if (error) throw new Error(error.message);
}

// Columns match the LIVE `podcasts` table: duration_minutes and guest_name,
// with no category or is_published.
export async function createPodcast(input: {
  title: string;
  description: string;
  episode_number: number | null;
  audio_url: string;
  duration_minutes: number | null;
  guest_name: string | null;
}) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("podcasts").insert(input);
  if (error) throw new Error(error.message);
}

export async function toggleFaqPublished(faqId: string, isPublished: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("faq_items").update({ is_published: isPublished }).eq("id", faqId);
  if (error) throw new Error(error.message);
}

export async function createFaqItem(input: {
  question: string;
  answer: string;
  category: string;
  order_index: number;
}) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("faq_items").insert({ ...input, is_published: true });
  if (error) throw new Error(error.message);
}

export async function togglePostHidden(postId: string, isHidden: boolean) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("posts").update({ is_hidden: isHidden }).eq("id", postId);
  if (error) throw new Error(error.message);
}

export async function createLesson(input: { title: string; body: string; category: string }) {
  const supabase = await requireAdmin();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("posts").insert({
    author_id: user!.id,
    feed_type: "learn",
    template_type: "lesson",
    category: input.category,
    title: input.title,
    body: input.body,
    metadata: {},
    moderation_status: "approved",
  });
  if (error) throw new Error(error.message);
}
