import type { Profile } from "@/hooks/useProfile";

type PremiumFields = Pick<Profile, "is_premium" | "premium_until">;

/** True if the profile currently has an active premium subscription. */
export function isPremium(profile: PremiumFields | null | undefined): boolean {
  if (!profile?.is_premium) return false;
  if (profile.premium_until && new Date(profile.premium_until).getTime() < Date.now()) return false;
  return true;
}

/** Throws if the profile doesn't have active premium — use to gate server-side logic. */
export function requirePremium(profile: PremiumFields | null | undefined): void {
  if (!isPremium(profile)) {
    throw new Error("This feature requires LinkY101 Premium.");
  }
}
