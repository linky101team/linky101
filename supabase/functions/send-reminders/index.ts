// Supabase Edge Function (Deno runtime) — deploy with
// `supabase functions deploy send-reminders` and schedule it once daily at
// 6pm UTC. Covers both reminder types from the spec (daily_tasks_reminder,
// streak_at_risk) in one run rather than two separate schedules.
//
// IMPORTANT: 007_notification_triggers.sql already schedules equivalent
// logic via pg_cron (send_daily_tasks_reminders at 18:00 UTC,
// send_streak_risk_reminders at 20:00 UTC). Use ONE approach, not both —
// running this Edge Function's cron schedule *and* leaving those pg_cron
// jobs active will double-send reminders. If you deploy this function,
// unschedule the two pg_cron jobs first:
//   select cron.unschedule('linky101-daily-tasks-reminder');
//   select cron.unschedule('linky101-streak-risk-reminder');

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface ProfileRow {
  id: string;
  current_streak: number;
  last_active_date: string | null;
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    const [{ data: allProfiles }, { data: completedToday }] = await Promise.all([
      supabase.from("profiles").select("id, current_streak, last_active_date"),
      supabase.from("daily_tasks").select("user_id").eq("task_date", today).eq("is_completed", true),
    ]);

    const completedIds = new Set((completedToday ?? []).map((t) => t.user_id as string));

    let taskReminders = 0;
    let streakReminders = 0;

    for (const p of (allProfiles ?? []) as ProfileRow[]) {
      if (!completedIds.has(p.id)) {
        await supabase.rpc("create_notification", {
          p_user_id: p.id,
          p_type: "daily_tasks_reminder",
          p_title: "Daily tasks waiting!",
          p_body: "You haven't completed any tasks today — jump back in for XP!",
          p_link: "/tasks",
        });
        taskReminders += 1;
      }

      if (p.current_streak > 0 && p.last_active_date === yesterday) {
        await supabase.rpc("create_notification", {
          p_user_id: p.id,
          p_type: "streak_at_risk",
          p_title: "Your streak is at risk!",
          p_body: `Log in today to keep your ${p.current_streak}-day streak alive.`,
          p_link: "/home",
        });
        streakReminders += 1;
      }
    }

    return new Response(JSON.stringify({ taskReminders, streakReminders }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
