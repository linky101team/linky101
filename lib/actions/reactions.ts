"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export type ReactionType = "fire" | "lightbulb" | "rocket" | "heart" | "clap";

/** Toggles a reaction on/off for the signed-in user; returns the new state. */
export async function toggleReaction(postId: string, reactionType: ReactionType) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .eq("reaction_type", reactionType)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("reactions").delete().eq("id", existing.id);
    if (error) throw new Error(error.message);
    return { active: false };
  }

  const { error } = await supabase
    .from("reactions")
    .insert({ post_id: postId, user_id: user.id, reaction_type: reactionType });
  if (error) throw new Error(error.message);
  return { active: true };
}
