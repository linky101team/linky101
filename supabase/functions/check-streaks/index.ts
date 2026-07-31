// Supabase Edge Function (Deno runtime) — deploy with
// `supabase functions deploy check-streaks` and schedule it once daily at
// midnight UTC (Dashboard: Edge Functions > check-streaks > Schedule, or a
// pg_cron job calling net.http_post against its URL). SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are auto-provided by the Supabase platform at
// runtime — no manual secret setup needed for those two.
//
// This mirrors lib/streaks.ts's decayInactiveStreaks(): for any user who
// missed the one-day grace period (didn't check in yesterday, and hasn't
// today either), consume a streak shield to bridge the gap if they have
// one, otherwise formally reset current_streak to 0.
//
// NOTE: don't run this alongside app-side calls that duplicate its job —
// it's the batch counterpart to lib/streaks.ts's updateStreak(), which
// handles the increment-on-activity path from within the app itself.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ProfileRow {
  id: string;
  current_streak: number;
  last_active_date: string | null;
  profile_flair: { streak_shields?: number } | null;
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    const { data: atRisk, error } = await supabase
      .from("profiles")
      .select("id, current_streak, last_active_date, profile_flair")
      .gt("current_streak", 0)
      .lte("last_active_date", twoDaysAgo);

    if (error) throw error;

    let shielded = 0;
    let reset = 0;

    for (const profile of (atRisk ?? []) as ProfileRow[]) {
      const shields = profile.profile_flair?.streak_shields ?? 0;

      if (shields > 0) {
        await supabase.rpc("apply_streak_result", {
          p_user_id: profile.id,
          p_new_current_streak: profile.current_streak,
          p_shield_delta: -1,
          p_flair_delta: 0,
          p_last_active_date: yesterday,
        });
        shielded += 1;
      } else {
        await supabase.rpc("apply_streak_result", {
          p_user_id: profile.id,
          p_new_current_streak: 0,
          p_shield_delta: 0,
          p_flair_delta: 0,
          p_last_active_date: null,
        });
        reset += 1;
      }
    }

    return new Response(
      JSON.stringify({ processed: (atRisk ?? []).length, shielded, reset }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
