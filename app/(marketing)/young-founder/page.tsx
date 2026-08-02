import { redirect } from "next/navigation";

/**
 * Young Founder and Rising Founder were merged into one /founders page —
 * LinkY101 has founders and mentors, not age tiers. This stays as a redirect
 * rather than being deleted so any link already sent to a school, a parent or
 * a mentor still lands somewhere useful.
 */
export default function YoungFounderRedirect() {
  redirect("/founders");
}
