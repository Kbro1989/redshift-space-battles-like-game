import { create } from 'zustand';

export type Screen = 'login' | 'command_center' | 'base' | 'fleet' | 'missions' | 'battle';

export interface Player {
  id: string;
  username: string;
  level: number;
  xp: number;
  resources: Record<string, number>;
}

export interface GameState {
  player: Player | null;
  currentScreen: Screen;
  setPlayer: (p: Player) => void;
  navigate: (screen: Screen) => void;
  updateResources: (resources: Record<string, number>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  player: null,
  currentScreen: 'login',
  setPlayer: (player) => set({ player, currentScreen: 'command_center' }),
  navigate: (currentScreen) => set({ currentScreen }),
  updateResources: (resources) =>
    set((state) => ({ player: state.player ? { ...state.player, resources } : null })),
}));
