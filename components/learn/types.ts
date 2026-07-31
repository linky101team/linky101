import type { ReactionType } from "@/lib/actions/reactions";

export interface LearnPost {
  id: string;
  author_id: string;
  category: string;
  template_type: string;
  title: string | null;
  body: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  author: { first_name: string; avatar_url: string | null } | null;
}

export interface ReactionState {
  counts: Partial<Record<ReactionType, number>>;
  active: ReactionType[];
}
