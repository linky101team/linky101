"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { moderateContent } from "@/lib/moderation";

export type FeedType = "learn" | "community";

interface CreatePostInput {
  category: string;
  templateType: string;
  title?: string;
  body?: string;
  feedType: FeedType;
  metadata?: Record<string, unknown>;
}

const COMMUNITY_POST_XP = 20;

export async function createPost(input: CreatePostInput) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const combinedText = [input.title, input.body].filter(Boolean).join(" ");
  const moderation = moderateContent(combinedText);
  if (!moderation.approved) {
    throw new Error(moderation.reason ?? "This content isn't allowed.");
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      category: input.category,
      template_type: input.templateType,
      title: input.title ?? null,
      body: input.body ?? null,
      feed_type: input.feedType,
      metadata: input.metadata ?? {},
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (input.feedType === "community") {
    await supabase.rpc("increment_xp", { user_id: user.id, amount: COMMUNITY_POST_XP });
  }

  return data;
}

/** Bumps a community post to gold. Server-side enforces the Level 5+ gate. */
export async function bumpToGold(postId: string) {
  const supabase = createServerSupabase();
  const { error } = await supabase.rpc("bump_post_gold", { p_post_id: postId });
  if (error) throw new Error(error.message);
}
