"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { getSpinStatus as getSpinStatusLogic, performSpin as performSpinLogic } from "@/lib/spin";

export type { SpinResult } from "@/lib/spin";

export async function getSpinStatus() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return getSpinStatusLogic(supabase, user.id);
}

export async function performSpin() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return performSpinLogic(supabase, user.id);
}
