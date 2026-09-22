import { create } from 'zustand';

interface UIState {
  // Shuffle animation
  isShuffling: boolean;
  shuffleCount: number;

  // Reveal animation
  isRevealing: boolean;
  revealedCards: number[];

  // Theme
  isDarkMode: boolean;

  // Particles
  showParticles: boolean;

  // Actions
  setShuffling: (val: boolean) => void;
  incrementShuffleCount: () => void;
  setRevealing: (val: boolean) => void;
  revealCard: (index: number) => void;
  resetRevealed: () => void;
  toggleParticles: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isShuffling: false,
  shuffleCount: 0,
  isRevealing: false,
  revealedCards: [],
  isDarkMode: true,
  showParticles: true,

  setShuffling: (val) => set({ isShuffling: val }),
  incrementShuffleCount: () => set((state) => ({ shuffleCount: state.shuffleCount + 1 })),
  setRevealing: (val) => set({ isRevealing: val }),
  revealCard: (index) =>
    set((state) => ({
      revealedCards: [...state.revealedCards, index],
    })),
  resetRevealed: () => set({ revealedCards: [] }),
  toggleParticles: () => set((state) => ({ showParticles: !state.showParticles })),
}));
