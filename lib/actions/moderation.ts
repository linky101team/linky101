"use server";

import { createServerSupabase } from "@/lib/supabase/server";

export type WarningType = "content_removed" | "posting_restriction" | "suspension" | "ban";

export async function approvePost(postId: string) {
  const supabase = createServerSupabase();
  const { data: post, error } = await supabase
    .from("posts")
    .update({ moderation_status: "approved" })
    .eq("id", postId)
    .select("author_id, feed_type")
    .single();
  if (error) throw new Error(error.message);

  await supabase.rpc("create_notification", {
    p_user_id: post.author_id,
    p_type: "post_approved",
    p_title: "Post approved!",
    p_body: "Your post is now live.",
    p_link: post.feed_type === "learn" ? "/learn" : "/community",
  });
}

export async function rejectPost(postId: string) {
  const supabase = createServerSupabase();
  const { data: post, error } = await supabase
    .from("posts")
    .update({ moderation_status: "rejected" })
    .eq("id", postId)
    .select("author_id")
    .single();
  if (error) throw new Error(error.message);

  await supabase.rpc("create_notification", {
    p_user_id: post.author_id,
    p_type: "post_rejected",
    p_title: "Post not approved",
    p_body: "Your post didn't meet our community guidelines.",
    p_link: null,
  });
}

/** Actions a report: hides/rejects the underlying content, then marks it actioned (the DB trigger handles auto-escalating warnings). */
export async function actionReport(reportId: string) {
  const supabase = createServerSupabase();

  const { data: report, error: fetchError } = await supabase
    .from("reports")
    .select("reported_type, reported_id")
    .eq("id", reportId)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  if (report.reported_type === "post") {
    await supabase.from("posts").update({ is_hidden: true }).eq("id", report.reported_id);
  } else if (report.reported_type === "comment") {
    await supabase.from("comments").update({ moderation_status: "rejected" }).eq("id", report.reported_id);
  }

  const { error } = await supabase
    .from("reports")
    .update({ status: "actioned", reviewed_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) throw new Error(error.message);
}

export async function dismissReport(reportId: string) {
  const supabase = createServerSupabase();
  const { error } = await supabase
    .from("reports")
    .update({ status: "dismissed", reviewed_at: new Date().toISOString() })
    .eq("id", reportId);
  if (error) throw new Error(error.message);
}

export async function issueWarning(
  userId: string,
  warningType: WarningType,
  reason: string,
  durationHours: number | null
) {
  const supabase = createServerSupabase();
  const expiresAt = durationHours ? new Date(Date.now() + durationHours * 3_600_000).toISOString() : null;

  const { error } = await supabase.from("user_warnings").insert({
    user_id: userId,
    warning_type: warningType,
    reason,
    duration_hours: durationHours,
    expires_at: expiresAt,
  });
  if (error) throw new Error(error.message);

  await supabase.rpc("create_notification", {
    p_user_id: userId,
    p_type: "warning",
    p_title: "Account Warning",
    p_body: reason,
    p_link: null,
  });
}
