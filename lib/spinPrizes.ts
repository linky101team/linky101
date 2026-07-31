export type PrizeType =
  | "xp_25"
  | "xp_50"
  | "coins_50"
  | "streak_shield"
  | "bonus_task"
  | "flair"
  | "team_boost"
  | "coins_200"
  | "level_skip"
  | "mystery_box";

export type Rarity = "common" | "uncommon" | "rare" | "very_rare" | "legendary";

export interface Prize {
  type: PrizeType;
  amount: number;
  coins: number;
  label: string;
  rarity: Rarity;
}

export interface WeightedPrize extends Prize {
  weight: number;
}

/** Shared by the spin server action (weighted pick) and the UI (prize preview tiles). */
export const PRIZE_TABLE: WeightedPrize[] = [
  { type: "xp_25", amount: 25, coins: 10, label: "+25 XP + 10 Coins", rarity: "common", weight: 25 },
  { type: "xp_50", amount: 50, coins: 20, label: "+50 XP + 20 Coins", rarity: "uncommon", weight: 20 },
  { type: "coins_50", amount: 0, coins: 50, label: "50 LinkCoins!", rarity: "uncommon", weight: 13 },
  { type: "streak_shield", amount: 0, coins: 0, label: "Streak Shield", rarity: "uncommon", weight: 12 },
  { type: "bonus_task", amount: 0, coins: 0, label: "Bonus Task (2x XP)", rarity: "uncommon", weight: 10 },
  { type: "flair", amount: 0, coins: 0, label: "Profile Flair", rarity: "rare", weight: 8 },
  { type: "team_boost", amount: 50, coins: 0, label: "Team Boost +50 XP", rarity: "rare", weight: 5 },
  { type: "coins_200", amount: 0, coins: 200, label: "200 LinkCoins!", rarity: "very_rare", weight: 4 },
  { type: "level_skip", amount: 100, coins: 0, label: "Level Skip! (+100 XP)", rarity: "very_rare", weight: 2 },
  { type: "mystery_box", amount: 0, coins: 500, label: "MYSTERY BOX — 500 Coins!", rarity: "legendary", weight: 1 },
];

export function pickWeighted(pool: WeightedPrize[]): WeightedPrize {
  const total = pool.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * total;
  for (const p of pool) {
    if (roll < p.weight) return p;
    roll -= p.weight;
  }
  return pool[pool.length - 1];
}
