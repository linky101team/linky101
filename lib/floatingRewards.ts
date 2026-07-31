import { create } from "zustand";

export interface FloatingRewardItem {
  id: number;
  text: string;
  color: string;
}

interface FloatingRewardsState {
  items: FloatingRewardItem[];
  push: (text: string, color?: string) => void;
}

export const useFloatingRewards = create<FloatingRewardsState>((set) => ({
  items: [],
  push: (text, color = "text-sky") => {
    const id = Date.now() + Math.random();
    set((s) => ({ items: [...s.items, { id, text, color }] }));
    setTimeout(() => {
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    }, 1100);
  },
}));

/** Convenience helper — floats "+25 XP" style text upward from wherever it's called. */
export function floatXP(amount: number) {
  if (amount <= 0) return;
  useFloatingRewards.getState().push(`+${amount} XP`, "text-sky");
}

export function floatCoins(amount: number) {
  if (amount <= 0) return;
  useFloatingRewards.getState().push(`+${amount} 🪙`, "text-yellow");
}
