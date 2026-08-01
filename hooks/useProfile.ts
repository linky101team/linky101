import { useEffect } from "react";
import { create } from "zustand";
import { createClientSupabase } from "@/lib/supabase/client";

export interface Profile {
  id: string;
  first_name: string;
  age: number;
  school_type: "school" | "homeschool" | "no_school_yet" | null;
  school_id: string | null;
  dream: string | null;
  headline: string | null;
  level: number;
  xp: number;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  is_premium: boolean;
  premium_until: string | null;
  avatar_url: string | null;
  profile_flair: Record<string, unknown>;
  interests: string[];
  /** UK region, e.g. "Yorkshire". Null until onboarding collects it. */
  region: string | null;
  /**
   * Self-selected role. "Mentor" is deliberately NOT an option — mentors are
   * hand-picked, DBS-checked adults and live in the separate `mentors` table.
   */
  role: "founder" | "ambassador";
  /** Ambassadors must pass an over-18 check before being publicly listed. */
  ambassador_verified: boolean;
  onboarding_completed: boolean;
  completed_tours: string[];
  is_admin: boolean;
  link_coins: number;
  privacy_settings: {
    hide_activity?: boolean;
    hide_posts?: boolean;
    hide_dream?: boolean;
  };
  notification_settings: {
    push_enabled?: boolean;
    daily_reminder?: boolean;
    streak_risk?: boolean;
    mentor_answers?: boolean;
    community?: boolean;
  };
  created_at: string;
  updated_at: string;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    const supabase = createClientSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ profile: null, loading: false });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      set({ error: error.message, loading: false });
      return;
    }

    set({ profile: data as Profile | null, loading: false });
  },

  refreshProfile: async () => {
    await get().fetchProfile();
  },

  updateProfile: async (updates) => {
    const current = get().profile;
    if (!current) return;

    const supabase = createClientSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", current.id)
      .select()
      .maybeSingle();

    if (error) {
      set({ error: error.message });
      return;
    }

    if (data) set({ profile: data as Profile });
  },

  clearProfile: () => set({ profile: null, error: null, loading: false }),
}));

/**
 * Ensures the profile is loaded, then returns the store's state. Safe to
 * call from multiple components — fetch only fires once per empty store.
 */
export function useProfile() {
  const state = useProfileStore();

  useEffect(() => {
    if (!state.profile && !state.loading) {
      state.fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
