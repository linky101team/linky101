"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function joinEvent(eventId: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: event } = await supabase
    .from("events")
    .select("max_attendees, xp_reward")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) throw new Error("Event not found");

  if (event.max_attendees !== null) {
    const { count } = await supabase
      .from("event_attendees")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId);
    if ((count ?? 0) >= event.max_attendees) throw new Error("This event is full");
  }

  const { error } = await supabase.from("event_attendees").insert({ event_id: eventId, user_id: user.id });
  if (error) {
    if (error.code === "23505") throw new Error("You're already registered");
    throw new Error(error.message);
  }

  if (event.xp_reward > 0) {
    await supabase.rpc("increment_xp", { user_id: user.id, amount: event.xp_reward });
  }
}

export async function leaveEvent(eventId: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("event_attendees")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
}
