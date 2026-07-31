"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { checkAchievements } from "@/lib/achievements";

const LISTEN_XP = 10;
const LISTEN_COINS = 5;

interface MarkListenedResult {
  alreadyCompleted: boolean;
  xpEarned: number;
  coinsEarned: number;
  leveledUp: boolean;
  newLevel?: number;
}

/** Called when a podcast episode finishes playing. Only the first completion earns rewards. */
export async function markPodcastListened(podcastId: string): Promise<MarkListenedResult> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("podcast_listens")
    .select("completed")
    .eq("user_id", user.id)
    .eq("podcast_id", podcastId)
    .maybeSingle();

  if (existing?.completed) {
    return { alreadyCompleted: true, xpEarned: 0, coinsEarned: 0, leveledUp: false };
  }

  const { error } = await supabase
    .from("podcast_listens")
    .upsert(
      { user_id: user.id, podcast_id: podcastId, completed: true, listened_at: new Date().toISOString() },
      { onConflict: "user_id,podcast_id" }
    );
  if (error) throw new Error(error.message);

  const { data: xpRows } = await supabase.rpc("increment_xp", { user_id: user.id, amount: LISTEN_XP });
  const xpResult = xpRows?.[0];
  await supabase.rpc("add_coins", { p_user_id: user.id, p_amount: LISTEN_COINS });
  await checkAchievements(supabase, user.id);

  return {
    alreadyCompleted: false,
    xpEarned: LISTEN_XP,
    coinsEarned: LISTEN_COINS,
    leveledUp: xpResult?.leveled_up ?? false,
    newLevel: xpResult?.new_level,
  };
}

/** Fire-and-forget progress ping — starts a listen row without granting rewards yet. */
export async function trackPodcastStart(podcastId: string): Promise<void> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("podcast_listens")
    .upsert(
      { user_id: user.id, podcast_id: podcastId },
      { onConflict: "user_id,podcast_id", ignoreDuplicates: true }
    );
}
