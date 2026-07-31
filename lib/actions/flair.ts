"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export async function setActiveFlair(border: string, color: string, badge: string, nameGradient: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.rpc("set_active_flair", {
    p_border: border,
    p_color: color,
    p_badge: badge,
    p_name_gradient: nameGradient,
  });
  if (error) throw new Error(error.message);
}
