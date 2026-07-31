"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function toggleSaveOpportunity(opportunityId: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("saved_opportunities")
    .select("id")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (existing) {
    await supabase.from("saved_opportunities").delete().eq("id", existing.id);
    return { saved: false };
  }

  const { error } = await supabase
    .from("saved_opportunities")
    .insert({ user_id: user.id, opportunity_id: opportunityId });
  if (error) throw new Error(error.message);
  return { saved: true };
}

export async function toggleAppliedOpportunity(opportunityId: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: existing } = await supabase
    .from("saved_opportunities")
    .select("id, has_applied")
    .eq("user_id", user.id)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();
  if (!existing) throw new Error("Save this opportunity first");

  const { error } = await supabase
    .from("saved_opportunities")
    .update({ has_applied: !existing.has_applied })
    .eq("id", existing.id);
  if (error) throw new Error(error.message);
  return { hasApplied: !existing.has_applied };
}
