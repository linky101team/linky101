"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function votePoll(postId: string, optionIndex: number) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("poll_votes")
    .insert({ post_id: postId, user_id: user.id, option_index: optionIndex });

  if (error) {
    if (error.code === "23505") throw new Error("You already voted on this poll");
    throw new Error(error.message);
  }
}
