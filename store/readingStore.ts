import { create } from 'zustand';
import { TarotCard, CardPosition } from '@/lib/tarot-data';

export type Phase = 'idle' | 'shuffling' | 'cutting' | 'selecting' | 'revealing';

export interface SelectedCard {
  card: TarotCard;
  position: number;
  isReversed: boolean;
}

export interface ReadingState {
  // Spread
  spreadType: string;
  spreadNameCN: string;
  positions: CardPosition[];

  // Selected cards
  selectedCards: SelectedCard[];

  // Interpretation result
  interpretation: string | null;
  isLoading: boolean;
  error: string | null;

  // UI Phase
  phase: Phase;

  // User question
  userQuestion: string;

  // Actions
  setSpreadType: (type: string, nameCN: string, positions: CardPosition[]) => void;
  addCard: (card: TarotCard, position: number, isReversed: boolean) => void;
  removeCard: (position: number) => void;
  setInterpretation: (result: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPhase: (phase: Phase) => void;
  setUserQuestion: (question: string) => void;
  reset: () => void;
}

const initialState = {
  spreadType: '',
  spreadNameCN: '',
  positions: [],
  selectedCards: [],
  interpretation: null,
  isLoading: false,
  error: null,
  phase: 'idle' as Phase,
  userQuestion: '',
};

export const useReadingStore = create<ReadingState>((set) => ({
  ...initialState,

  setSpreadType: (type, nameCN, positions) =>
    set({ spreadType: type, spreadNameCN: nameCN, positions }),

  addCard: (card, position, isReversed) =>
    set((state) => {
      const newCards = state.selectedCards.filter(c => c.position !== position);
      return {
        selectedCards: [...newCards, { card, position, isReversed }]
          .sort((a, b) => a.position - b.position)
      };
    }),

  removeCard: (position) =>
    set((state) => ({
      selectedCards: state.selectedCards.filter(c => c.position !== position),
    })),

  setInterpretation: (result) => set({ interpretation: result }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setPhase: (phase) => set({ phase }),
  setUserQuestion: (question) => set({ userQuestion: question }),

  reset: () => set(initialState),
}));
