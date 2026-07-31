import { redirect } from "next/navigation";

// Daily tasks are now tracked automatically from real activity —
// the "Today's Activity" card on Home replaces this page.
export default function TasksPage() {
  redirect("/home");
}
