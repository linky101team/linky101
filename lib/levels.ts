// Mirrors the threshold table in supabase/migrations/001_initial_schema.sql (xp_to_level).
export const LEVEL_THRESHOLDS: { level: number; xp: number }[] = [
  { level: 1, xp: 0 },
  { level: 2, xp: 50 },
  { level: 3, xp: 100 },
  { level: 4, xp: 200 },
  { level: 5, xp: 400 },
  { level: 6, xp: 600 },
  { level: 7, xp: 800 },
  { level: 8, xp: 1000 },
  { level: 9, xp: 1100 },
  { level: 10, xp: 1200 },
  { level: 11, xp: 1400 },
  { level: 12, xp: 1600 },
  { level: 13, xp: 1800 },
  { level: 14, xp: 2100 },
  { level: 15, xp: 2500 },
  { level: 16, xp: 3000 },
  { level: 17, xp: 3500 },
  { level: 18, xp: 4000 },
  { level: 19, xp: 4500 },
  { level: 20, xp: 5000 },
  { level: 21, xp: 6000 },
  { level: 22, xp: 7000 },
  { level: 23, xp: 8000 },
  { level: 24, xp: 9000 },
  { level: 25, xp: 10000 },
  { level: 26, xp: 12000 },
  { level: 27, xp: 14000 },
  { level: 28, xp: 16000 },
  { level: 29, xp: 18000 },
  { level: 30, xp: 20000 },
];

export const MAX_LEVEL = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1].level;

interface LevelTier {
  slug: string;
  title: string;
  min: number;
  max: number;
}

const TIERS: LevelTier[] = [
  { slug: "new-starter", title: "New Starter", min: 1, max: 2 },
  { slug: "go-getter", title: "Go-Getter", min: 3, max: 4 },
  { slug: "apprentice", title: "Apprentice", min: 5, max: 6 },
  { slug: "rising-star", title: "Rising Star", min: 7, max: 9 },
  { slug: "young-mogul", title: "Young Mogul", min: 10, max: 12 },
  { slug: "trailblazer", title: "Trailblazer", min: 13, max: 14 },
  { slug: "founder-pro", title: "Founder Pro", min: 15, max: 19 },
  { slug: "industry-leader", title: "Industry Leader", min: 20, max: 24 },
  { slug: "founder-elite", title: "Founder Elite", min: 25, max: 29 },
  { slug: "linky-legend", title: "LinkY Legend", min: 30, max: Infinity },
];

function findTier(level: number): LevelTier {
  return TIERS.find((tier) => level >= tier.min && level <= tier.max) ?? TIERS[0];
}

/** Human-readable title for a level, e.g. "Rising Star". */
export function getLevelTitle(level: number): string {
  return findTier(level).title;
}

/** Short slug for a level's tier, e.g. "rising-star". Useful for styling hooks. */
export function getLevelTier(level: number): string {
  return findTier(level).slug;
}

/** Total XP required to reach (be at) a given level. */
export function getXPForLevel(level: number): number {
  return LEVEL_THRESHOLDS.find((t) => t.level === level)?.xp ?? 0;
}

/** Total XP required to reach the next level, or null if already at MAX_LEVEL. */
export function getNextLevelXP(level: number): number | null {
  return LEVEL_THRESHOLDS.find((t) => t.level === level + 1)?.xp ?? null;
}

/** 0-100 progress through the current level, based on total XP. */
export function getLevelProgress(level: number, xp: number): number {
  const floor = getXPForLevel(level);
  const ceiling = getNextLevelXP(level);
  if (ceiling === null) return 100;
  const span = ceiling - floor;
  if (span <= 0) return 100;
  return Math.min(100, Math.max(0, ((xp - floor) / span) * 100));
}

/** XP still needed to reach the next level, or null if already at MAX_LEVEL. */
export function getXPToNextLevel(level: number, xp: number): number | null {
  const next = getNextLevelXP(level);
  if (next === null) return null;
  return Math.max(0, next - xp);
}

export interface FeatureUnlock {
  level: number;
  feature: string;
}

/** Feature gates shown on the level roadmap. */
export const FEATURE_UNLOCKS: FeatureUnlock[] = [
  { level: 3, feature: "Podcasts" },
  { level: 10, feature: "Opportunities Board" },
  { level: 13, feature: "Submit Lessons" },
  { level: 15, feature: "Mentors" },
  { level: 20, feature: "Gold Reviewer" },
  { level: 25, feature: "Exclusive Events" },
  { level: 30, feature: "LinkY Legend" },
];

/** The feature unlocked at exactly this level, if any. */
export function getFeatureForLevel(level: number): string | null {
  return FEATURE_UNLOCKS.find((f) => f.level === level)?.feature ?? null;
}

/** The most recent feature unlock at or below this level, for roadmap nodes. */
export function getFeatureUpTo(level: number): FeatureUnlock | null {
  const unlocked = FEATURE_UNLOCKS.filter((f) => f.level <= level);
  return unlocked.length ? unlocked[unlocked.length - 1] : null;
}
