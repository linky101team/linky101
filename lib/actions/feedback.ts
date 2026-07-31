"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { moderateContent } from "@/lib/moderation";

const SUBJECT_MAX = 100;
const MESSAGE_MAX = 1000;

export async function submitFeedback(category: string, subject: string, message: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const trimmedSubject = subject.trim().slice(0, SUBJECT_MAX);
  const trimmedMessage = message.trim().slice(0, MESSAGE_MAX);
  if (!trimmedSubject || !trimmedMessage) throw new Error("Please fill in both a subject and a message");

  const moderation = moderateContent(`${trimmedSubject} ${trimmedMessage}`);
  if (!moderation.approved) throw new Error(moderation.reason ?? "This message isn't allowed.");

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    category,
    subject: trimmedSubject,
    message: trimmedMessage,
  });
  if (error) throw new Error(error.message);
}
