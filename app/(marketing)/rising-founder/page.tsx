import { redirect } from "next/navigation";

/** See the note in ../young-founder/page.tsx — both lanes now go to /founders. */
export default function RisingFounderRedirect() {
  redirect("/founders");
}
