import { create } from 'zustand';
import { TarotCard } from '@/lib/tarot-data';

// Phase types for single card reading
export type SingleCardPhase =
  | 'idle'
  | 'shuffling'
  | 'contemplating'
  | 'gathering'
  | 'spreading'
  | 'selecting'
  | 'revealing'
  | 'displaying';

export interface SingleCardContext {
  // Current phase
  phase: SingleCardPhase;

  // Card data
  shuffledCards: TarotCard[];
  selectedCard: TarotCard | null;
  selectedCardIndex: number | null;
  isReversed: boolean;

  // User question
  userQuestion: string;

  // Interpretation result
  interpretation: string;
  isLoadingInterpretation: boolean;

  // Animation progress (0-1)
  animationProgress: number;
}

interface SingleCardStore extends SingleCardContext {
  // Actions
  setPhase: (phase: SingleCardPhase) => void;
  setShuffledCards: (cards: TarotCard[]) => void;
  setSelectedCard: (card: TarotCard, index: number) => void;
  setIsReversed: (reversed: boolean) => void;
  setUserQuestion: (question: string) => void;
  setInterpretation: (interpretation: string) => void;
  setLoadingInterpretation: (loading: boolean) => void;
  setAnimationProgress: (progress: number) => void;
  reset: () => void;
}

const initialState: SingleCardContext = {
  phase: 'idle',
  shuffledCards: [],
  selectedCard: null,
  selectedCardIndex: null,
  isReversed: false,
  userQuestion: '',
  interpretation: '',
  isLoadingInterpretation: false,
  animationProgress: 0,
};

export const useSingleCardStore = create<SingleCardStore>((set) => ({
  ...initialState,

  setPhase: (phase) => set({ phase }),

  setShuffledCards: (cards) => set({ shuffledCards: cards }),

  setSelectedCard: (card, index) => set({
    selectedCard: card,
    selectedCardIndex: index
  }),

  setIsReversed: (reversed) => set({ isReversed: reversed }),

  setUserQuestion: (question) => set({ userQuestion: question }),

  setInterpretation: (interpretation) => set({ interpretation }),

  setLoadingInterpretation: (loading) => set({ isLoadingInterpretation: loading }),

  setAnimationProgress: (progress) => set({ animationProgress: progress }),

  reset: () => set(initialState),
}));
