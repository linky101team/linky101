"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import {
  generateDailyTasks as generateDailyTasksLogic,
  completeTask as completeTaskLogic,
} from "@/lib/tasks";

export async function generateDailyTasks() {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await generateDailyTasksLogic(supabase, user.id);
}

export async function completeTask(taskId: string) {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return completeTaskLogic(supabase, user.id, taskId);
}
