"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { moderateContent } from "@/lib/moderation";

export const PRESET_COMMENTS = [
  "Love this!",
  "Great idea!",
  "Keep going!",
  "This helped me!",
  "Can you explain more?",
];

const MAX_COMMENT_LENGTH = 500;

export async function addComment(postId: string, body: string, isPreset: boolean) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmed = body.trim().slice(0, MAX_COMMENT_LENGTH);
  if (!trimmed) throw new Error("Comment cannot be empty");

  if (!isPreset) {
    const moderation = moderateContent(trimmed);
    if (!moderation.approved) {
      throw new Error(moderation.reason ?? "This comment isn't allowed.");
    }
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, author_id: user.id, body: trimmed, is_preset: isPreset })
    .select("id, post_id, author_id, body, is_preset, created_at")
    .single();

  if (error) throw new Error(error.message);
  return data;
}
