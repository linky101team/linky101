// Supabase Edge Function (Deno runtime) — sends a Web Push notification for
// every unsent in-app notification, to every push_subscriptions row owned
// by that notification's user (respecting their notification_settings).
//
// PREREQUISITES (not yet configured in this project):
//   1. Generate VAPID keys: `npx web-push generate-vapid-keys`
//   2. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY in the Next.js app's env (used by
//      lib/pushClient.ts to subscribe browsers).
//   3. Set VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY, VAPID_SUBJECT as secrets on
//      this function: `supabase secrets set VAPID_PRIVATE_KEY=... VAPID_PUBLIC_KEY=... VAPID_SUBJECT=mailto:you@example.com`
//   4. Deploy: `supabase functions deploy send-push`
//   5. Wire it up to actually run — either:
//      a) A Postgres database webhook on `notifications` INSERT that calls
//         this function per-row, or
//      b) A `pg_cron` schedule (e.g. every 2 minutes) that has this
//         function query notifications created since its last run.
//      Neither is wired up yet — this function is a working scaffold, not
//      an active trigger, since that requires deploying and configuring
//      real infra this environment doesn't have.
//
// Without the above, in-app notifications (bell icon) still work fully —
// this function only adds the OS-level push notification on top.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
}

const SETTINGS_KEY_BY_TYPE: Record<string, string> = {
  daily_tasks_reminder: "daily_reminder",
  streak_at_risk: "streak_risk",
  mentor_answer: "mentor_answers",
  new_comment: "community",
  new_reaction: "community",
  new_follower: "community",
};

Deno.serve(async (req) => {
  try {
    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidSubject = Deno.env.get("VAPID_SUBJECT");
    if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
      return new Response(JSON.stringify({ error: "VAPID keys not configured" }), { status: 500 });
    }
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Webhook payload shape when wired to a database webhook (option 5a above).
    const body = await req.json().catch(() => null);
    const notification: NotificationRow | null = body?.record ?? null;

    const notifications: NotificationRow[] = notification
      ? [notification]
      : ((
          await supabase
            .from("notifications")
            .select("id, user_id, type, title, body, link")
            .eq("is_read", false)
            .gt("created_at", new Date(Date.now() - 5 * 60_000).toISOString())
        ).data as NotificationRow[] | null) ?? [];

    let sent = 0;

    for (const notif of notifications) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("notification_settings")
        .eq("id", notif.user_id)
        .maybeSingle();

      const settings = profile?.notification_settings ?? {};
      if (!settings.push_enabled) continue;

      const settingKey = SETTINGS_KEY_BY_TYPE[notif.type];
      if (settingKey && settings[settingKey] === false) continue;

      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth")
        .eq("user_id", notif.user_id);

      for (const sub of subs ?? []) {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            JSON.stringify({ title: notif.title, body: notif.body ?? "", url: notif.link ?? "/home" })
          );
          sent += 1;
        } catch (err) {
          // Expired/invalid subscriptions return 404/410 — clean them up.
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      }
    }

    return new Response(JSON.stringify({ sent }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
