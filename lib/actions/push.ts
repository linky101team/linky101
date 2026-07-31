"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export interface NotificationSettings {
  push_enabled: boolean;
  daily_reminder: boolean;
  streak_risk: boolean;
  mentor_answers: boolean;
  community: boolean;
}

export interface PushSubscriptionInput {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export async function savePushSubscription(subscription: PushSubscriptionInput) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "user_id,endpoint" }
  );
  if (error) throw new Error(error.message);

  await updateNotificationSettings({ push_enabled: true });
}

export async function removePushSubscription(endpoint: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  await supabase.from("push_subscriptions").delete().eq("user_id", user.id).eq("endpoint", endpoint);
  await updateNotificationSettings({ push_enabled: false });
}

export async function updateNotificationSettings(settings: Partial<NotificationSettings>) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("profiles")
    .select("notification_settings")
    .eq("id", user.id)
    .maybeSingle();

  const merged = { ...(profile?.notification_settings ?? {}), ...settings };

  const { error } = await supabase.from("profiles").update({ notification_settings: merged }).eq("id", user.id);
  if (error) throw new Error(error.message);
}
