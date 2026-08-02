import { redirect } from "next/navigation";

/**
 * The public "put yourself forward" page is for ambassadors, not mentors —
 * mentors are hand-picked and invited directly, so there's no application
 * route for them. Kept as a redirect so any link already shared still lands
 * somewhere useful.
 */
export default function ForMentorsRedirect() {
  redirect("/become-an-ambassador");
}
