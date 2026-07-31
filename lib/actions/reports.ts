"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export type ReportedType = "post" | "comment" | "profile" | "mentor";
export type ReportCategory =
  | "inappropriate"
  | "bullying"
  | "spam"
  | "personal_info"
  | "uncomfortable"
  | "other";

export async function submitReport(
  reportedType: ReportedType,
  reportedId: string,
  category: ReportCategory,
  description?: string
) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_type: reportedType,
    reported_id: reportedId,
    category,
    description: description?.trim() || null,
  });
  if (error) throw new Error(error.message);
}
