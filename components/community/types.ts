import type { ReactionType } from "@/lib/actions/reactions";

export interface CommunityPost {
  id: string;
  author_id: string;
  category: string;
  title: string | null;
  body: string | null;
  is_gold: boolean;
  created_at: string;
  author: { first_name: string; avatar_url: string | null } | null;
}

export interface ReactionState {
  counts: Partial<Record<ReactionType, number>>;
  active: ReactionType[];
}
