import { redirect } from "next/navigation";

// The social posts feed has been removed from the product. Idea-sharing now
// lives on the Dream Wall, which is a deliberately different thing: aspirational
// ideas that get voted up, not a running status feed.
export default function CommunityPage() {
  redirect("/dreams");
}
