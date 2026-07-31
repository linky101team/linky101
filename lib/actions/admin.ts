"use server";

import { createServerSupabase } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) throw new Error("Admins only");

  return { supabase, adminId: user.id };
}

/** Admin-granted premium has no expiry (premium_until stays null) until manually revoked. */
export async function setUserPremium(userId: string, isPremium: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({ is_premium: isPremium, premium_until: null })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function setUserAdmin(userId: string, isAdmin: boolean) {
  const { supabase, adminId } = await requireAdmin();
  if (userId === adminId && !isAdmin) throw new Error("You can't remove your own admin access");
  const { error } = await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", userId);
  if (error) throw new Error(error.message);
}
