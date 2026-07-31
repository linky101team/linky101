import { create } from "zustand";

interface LevelModalState {
  open: boolean;
  show: () => void;
  hide: () => void;
}

export const useLevelModalStore = create<LevelModalState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
