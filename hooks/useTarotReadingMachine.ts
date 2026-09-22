'use client';

import { useCallback, useRef } from 'react';
import { useSingleCardStore, SingleCardPhase } from '@/store/singleCardStore';
import { drawCards, TarotCard } from '@/lib/tarot-data';

// State transition table
const stateTransition: Record<SingleCardPhase, Partial<Record<SingleCardPhase, boolean>>> = {
  idle: {
    shuffling: true,
  },
  shuffling: {
    // User click goes to gathering (finish current loop), then spreading
    gathering: true,
    idle: true,
  },
  contemplating: {
    gathering: true,
    idle: true,
  },
  gathering: {
    spreading: true,
    idle: true,
  },
  spreading: {
    selecting: true,
    idle: true,
  },
  selecting: {
    revealing: true,
    idle: true,
  },
  revealing: {
    displaying: true,
    idle: true,
  },
  displaying: {
    idle: true,
  },
};

export function useTarotReadingMachine() {
  const {
    phase,
    shuffledCards,
    selectedCard,
    selectedCardIndex,
    isReversed,
    userQuestion,
    setPhase,
    setShuffledCards,
    setSelectedCard,
    setIsReversed,
    setUserQuestion,
    setInterpretation,
    setLoadingInterpretation,
    reset,
  } = useSingleCardStore();

  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const addTimer = useCallback((callback: () => void, ms: number) => {
    const timer = setTimeout(callback, ms);
    timersRef.current.push(timer);
    return timer;
  }, []);

  const getCurrentPhase = useCallback(() => {
    return useSingleCardStore.getState().phase;
  }, []);

  const transitionTo = useCallback(
    (nextPhase: SingleCardPhase) => {
      const currentPhase = getCurrentPhase();
      const isValid = stateTransition[currentPhase]?.[nextPhase];
      if (!isValid) {
        console.warn(`[StateMachine] Invalid transition: ${currentPhase} -> ${nextPhase}`);
        return false;
      }
      console.log(`[StateMachine] ${currentPhase} -> ${nextPhase}`);
      setPhase(nextPhase);
      return true;
    },
    [getCurrentPhase, setPhase]
  );

  // Start shuffle - enters shuffling phase with infinite loop animation
  const handleStartShuffle = useCallback(() => {
    const currentPhase = getCurrentPhase();
    if (currentPhase !== 'idle') return;

    console.log('[StateMachine] Starting shuffle...');

    // Generate cards
    const cards = drawCards(78);
    setShuffledCards(cards);

    // Enter shuffling phase
    transitionTo('shuffling');
  }, [getCurrentPhase, setShuffledCards, transitionTo]);

  // User clicks during shuffle - complete current loop then gather
  const handleStopShuffleAndGather = useCallback(() => {
    const currentPhase = getCurrentPhase();
    if (currentPhase !== 'shuffling') return;

    console.log('[StateMachine] User clicked, finishing shuffle loop...');

    // Go to gathering phase - cards will animate to gathered position
    transitionTo('gathering');

    // After gather animation, proceed to spreading -> selecting
    addTimer(() => {
      transitionTo('spreading');
      addTimer(() => {
        transitionTo('selecting');
      }, 800);
    }, 400); // Wait for gather animation
  }, [getCurrentPhase, transitionTo, addTimer]);

  const handleContemplateClick = useCallback(() => {
    const currentPhase = getCurrentPhase();
    if (currentPhase !== 'contemplating') return;

    console.log('[StateMachine] Starting contemplation...');
    transitionTo('gathering');

    addTimer(() => {
      transitionTo('spreading');
      addTimer(() => {
        transitionTo('selecting');
      }, 800);
    }, 500);
  }, [getCurrentPhase, transitionTo, addTimer]);

  const handleCardSelect = useCallback(
    async (card: TarotCard, index: number) => {
      const currentPhase = getCurrentPhase();
      if (currentPhase !== 'selecting') return;

      console.log('[StateMachine] Card selected:', card.nameCN);

      const reversed = Math.random() < 0.125;
      setSelectedCard(card, index);
      setIsReversed(reversed);
      transitionTo('revealing');

      addTimer(async () => {
        setLoadingInterpretation(true);
        try {
          const sessionId = `session_${Date.now()}`;
          const res = await fetch('/api/tarot/interpret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: localStorage.getItem('taluo_user_id') || 'guest',
              sessionId,
              userQuestion: userQuestion || '请解读这张牌',
              cardArray: [{
                cardId: card.id,
                cardName: card.name,
                cardNameCN: card.nameCN,
                keywords: card.keywords,
                reversedKeywords: card.reversedKeywords,
                imagery: card.imagery,
                isReversed: reversed,
                position: 0,
              }],
              isGuest: true,
            }),
          });
          const json = await res.json();
          if (json.success && json.data?.interpretation) {
            setInterpretation(json.data.interpretation);
          } else {
            setInterpretation('解读生成中...');
          }
        } catch (err) {
          console.error('[StateMachine] Failed to generate interpretation:', err);
          setInterpretation('抱歉，解读生成失败');
        } finally {
          setLoadingInterpretation(false);
        }
        transitionTo('displaying');
      }, 800);
    },
    [getCurrentPhase, setSelectedCard, setIsReversed, setInterpretation, setLoadingInterpretation, transitionTo, addTimer, userQuestion]
  );

  const handleReset = useCallback(() => {
    console.log('[StateMachine] Resetting');
    clearAllTimers();
    reset();
  }, [clearAllTimers, reset]);

  // Derived state
  const isIdle = phase === 'idle';
  const isShuffling = phase === 'shuffling';
  const isContemplating = phase === 'contemplating';
  const isGathering = phase === 'gathering';
  const isSpreading = phase === 'spreading';
  const isSelecting = phase === 'selecting';
  const isRevealing = phase === 'revealing';
  const isDisplaying = phase === 'displaying';

  return {
    phase,
    shuffledCards,
    selectedCard,
    selectedCardIndex,
    isReversed,
    userQuestion,
    isIdle,
    isShuffling,
    isContemplating,
    isGathering,
    isSpreading,
    isSelecting,
    isRevealing,
    isDisplaying,
    startShuffle: handleStartShuffle,
    stopShuffleAndGather: handleStopShuffleAndGather,
    handleContemplateClick,
    selectCard: handleCardSelect,
    reset: handleReset,
    setUserQuestion,
  };
}
