import { create } from "zustand";
import type { Tank } from "../types";

interface TankState {
  tanks: Tank[];
  selectedTank: Tank | null;
  setTanks: (tanks: Tank[]) => void;
  updateTank: (updated: Tank) => void;
  selectTank: (tank: Tank | null) => void;
}

export const useTankStore = create<TankState>((set) => ({
  tanks: [],
  selectedTank: null,
  setTanks: (tanks) => set({ tanks }),
  updateTank: (updated) =>
    set((state) => ({
      tanks: state.tanks.map((t) => (t.id === updated.id ? updated : t)),
    })),
  selectTank: (tank) => set({ selectedTank: tank }),
}));
