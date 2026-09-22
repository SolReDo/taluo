'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSingleCardStore } from '@/store/singleCardStore';
import { TarotCard, allTarotCards } from '@/lib/tarot-data';
import TarotCardComponent from './TarotCard';
import SelectedCardDisplay from './SelectedCardDisplay';

type Phase = 'idle' | 'shuffling' | 'spreading' | 'displaying';
type ShuffleSubPhase = 'idle' | 'split' | 'scatter' | 'interleave' | 'gather';

// Use 30 cards for a good balance of variety and UI layout
const CARD_COUNT = 30;

export default function SingleCardReader() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [shuffleSubPhase, setShuffleSubPhase] = useState<ShuffleSubPhase>('idle');
  const [displayCards, setDisplayCards] = useState<TarotCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');

  const storeUserQuestion = useSingleCardStore((s) => s.userQuestion);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-computed random offsets for shuffle animation (stable per card)
  const cardRandomOffsets = useRef<{ scatterX: number; scatterY: number; scatterRotate: number }[]>([]);

  // Initialize random offsets when cards are created
  useEffect(() => {
    if (displayCards.length > 0 && cardRandomOffsets.current.length === 0) {
      cardRandomOffsets.current = displayCards.map((_, index) => ({
        scatterX: (Math.random() - 0.5) * 80,
        scatterY: (Math.random() - 0.5) * 40,
        scatterRotate: (Math.random() - 0.5) * 20,
      }));
    }
  }, [displayCards]);

  // Get question from sessionStorage directly or from store
  useEffect(() => {
    const storedQuestion = sessionStorage.getItem('userQuestion');
    if (storedQuestion) {
      setUserQuestion(storedQuestion);
    } else if (storeUserQuestion) {
      setUserQuestion(storeUserQuestion);
    }
  }, [storeUserQuestion]);

  // Initialize cards on mount - shuffle and select a subset
  useEffect(() => {
    const shuffled = [...allTarotCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const cards = shuffled.slice(0, CARD_COUNT);
    setDisplayCards(cards);
  }, []);

  // Shuffle animation - cycle through sub-phases
  useEffect(() => {
    if (phase === 'shuffling') {
      // Start with split
      setShuffleSubPhase('split');

      // Cycle through phases: split -> scatter -> interleave -> gather -> split
      const phases: ShuffleSubPhase[] = ['split', 'scatter', 'interleave', 'gather'];
      let currentIndex = 0;

      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % phases.length;
        setShuffleSubPhase(phases[currentIndex]);
      }, 600); // Change phase every 600ms

      timerRef.current = setTimeout(() => {
        clearInterval(interval);
        setPhase('spreading');
        setShuffleSubPhase('idle');
      }, 3000);

      return () => {
        clearInterval(interval);
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [phase]);

  const handleDeckClick = useCallback(() => {
    // Check if user has selected a question
    if (!userQuestion && phase === 'idle') {
      alert('请先在首页选择你想要探索的问题');
      return;
    }
    if (phase === 'idle') {
      setPhase('shuffling');
    }
  }, [phase, userQuestion]);

  const handleCardSelect = useCallback((card: TarotCard, index: number) => {
    if (phase !== 'spreading') return;

    if (timerRef.current) clearTimeout(timerRef.current);

    // 50% 正位，50% 逆位
    const reversed = Math.random() < 0.5;
    setSelectedCard(card);
    setSelectedIndex(index);
    setIsReversed(reversed);
    setPhase('displaying');
  }, [phase]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
    setShuffleSubPhase('idle');
    setSelectedCard(null);
    setSelectedIndex(null);
    // Regenerate random offsets for next round
    cardRandomOffsets.current = displayCards.map((_, index) => ({
      scatterX: (Math.random() - 0.5) * 80,
      scatterY: (Math.random() - 0.5) * 40,
      scatterRotate: (Math.random() - 0.5) * 20,
    }));
  }, [displayCards]);

  // Calculate card animation values
  const getCardAnimation = (index: number) => {
    const mid = (CARD_COUNT - 1) / 2;
    const delta = index - mid;
    const isLeft = index < CARD_COUNT / 2;

    // Idle state - stacked in center
    if (phase === 'idle') {
      return {
        x: (index % 3 - 1) * 1.5,
        y: (index % 2 - 1) * 2,
        rotate: (index - CARD_COUNT / 2) * 0.3,
        opacity: 1,
        transition: { duration: 0.3 },
      };
    }

    // Shuffling state - based on sub-phase for dynamic animation
    if (phase === 'shuffling') {
      const cardPos = index - mid;
      const direction = isLeft ? -1 : 1;
      const rand = cardRandomOffsets.current[index] || { scatterX: 0, scatterY: 0, scatterRotate: 0 };

      // Different animations for each sub-phase
      if (shuffleSubPhase === 'split') {
        // Split into two halves moving apart - keep stable z-order
        return {
          x: direction * (80 + Math.abs(cardPos) * 5),
          y: cardPos * 0.5,
          rotate: direction * 3,
          opacity: 1,
          scale: 1,
          zIndex: 15 - Math.abs(cardPos),
          transition: { duration: 0.5, ease: 'easeInOut' },
        };
      } else if (shuffleSubPhase === 'scatter') {
        // Cards scatter in different directions - stable z-order from scatter
        return {
          x: direction * (120 + Math.abs(cardPos) * 8) + rand.scatterX,
          y: cardPos * 3 + rand.scatterY,
          rotate: direction * (10 + Math.abs(cardPos) * 2) + rand.scatterRotate,
          opacity: 1,
          scale: 0.95,
          zIndex: 15 - Math.abs(cardPos),
          transition: { duration: 0.5, ease: 'easeInOut' },
        };
      } else if (shuffleSubPhase === 'interleave') {
        // Cards interleave - alternating heights with stable z-index
        const interleavedY = (index % 2 === 0) ? -20 : 20;
        return {
          x: rand.scatterX * 0.6,
          y: interleavedY + cardPos * 0.8 + rand.scatterY * 0.3,
          rotate: rand.scatterRotate * 0.7,
          opacity: 1,
          scale: 1,
          zIndex: index % 2 === 0 ? 20 : 10,
          transition: { duration: 0.5, ease: 'easeInOut' },
        };
      } else if (shuffleSubPhase === 'gather') {
        // Gather back together - randomize z-index for weaving/interleaving effect
        const gatherZ = 15 + Math.floor((rand.scatterX + 40) / 80 * 10); // 15-25 based on scatterX
        return {
          x: direction * 40 + rand.scatterX * 0.3,
          y: cardPos * 1.2 + rand.scatterY * 0.2,
          rotate: direction * 5 + rand.scatterRotate * 0.3,
          opacity: 1,
          scale: 1,
          zIndex: gatherZ,
          transition: { duration: 0.5, ease: 'easeInOut' },
        };
      }
    }

    // Spreading state - fan out (adjusted for 30 cards)
    if (phase === 'spreading') {
      // Reduce spread factor to fit 30 cards on screen
      const spreadX = delta * 12;
      const spreadY = Math.abs(delta) * 4 - 40;
      const spreadRotate = delta * 4;
      // Animate from center (0,0) to spread position
      return {
        x: spreadX,
        y: spreadY,
        rotate: spreadRotate,
        opacity: 1,
        zIndex: index, // Higher index for cards further from center
        transition: {
          duration: 0.5,
          ease: 'easeOut',
        },
      };
    }

    // Displaying state - selected card in center, others completely hidden
    if (phase === 'displaying') {
      const isSelected = selectedIndex === index;
      if (isSelected) {
        return {
          x: 0,
          y: -20,
          rotate: 0,
          scale: 1.4,
          opacity: 1,
          zIndex: 30,
          transition: {
            duration: 0.5,
            ease: 'easeOut',
          },
        };
      } else {
        return {
          x: delta * 2,
          y: 100, // Move down off-screen immediately
          rotate: 0,
          scale: 0,
          opacity: 0,
          zIndex: 1,
          transition: {
            duration: 0.2,
            ease: 'easeOut',
          },
        };
      }
    }

    return {};
  };

  // Determine if card shows front
  const showCardFront = (index: number) => {
    return phase === 'displaying' && selectedIndex === index;
  };

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen w-full overflow-hidden py-12 select-none">
      {/* Top title area */}
      <div className="flex flex-col items-center text-center z-20 mt-12">
        <h1 className="text-3xl font-serif text-[#e6c687] tracking-widest">
          单牌解读
        </h1>
        <p className="text-base text-gray-400 mt-3">
          {phase === 'spreading' ? '请跟随你的直觉，点击抽取一张牌' : (userQuestion || '聚焦问题')}
        </p>
      </div>

      {/* Card stage - hidden in displaying phase, SelectedCardDisplay handles card */}
      {phase !== 'displaying' && (
      <div className="relative w-full h-[480px] flex items-center justify-center z-10">
        {/* Click handler for idle phase - only on the card deck area, not the text below */}
        {phase === 'idle' && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
            onClick={handleDeckClick}
          >
            {/* Click prompt - visible in idle phase */}
            {displayCards.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/70 px-6 py-2 rounded-full border border-[#e6c687]/50 text-sm text-[#e6c687] shadow-lg"
              >
                点击开始洗牌
              </motion.div>
            )}
          </div>
        )}

        {displayCards.map((card, index) => {
          const anim = getCardAnimation(index);
          const isSelected = selectedIndex === index;
          const showFront = showCardFront(index);
          // Extract zIndex from animation and apply via style directly
          const { zIndex, ...animProps } = anim;

          return (
            <motion.div
              key={`card-${index}`}
              initial={false}
              animate={animProps}
              style={{ transformOrigin: '50% 160%', zIndex: zIndex as number }}
              className={`absolute will-change-transform ${phase === 'spreading' ? 'cursor-pointer' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (phase === 'spreading') {
                  handleCardSelect(card, index);
                }
              }}
            >
              <TarotCardComponent
                card={card}
                isRevealed={showFront}
                isSelected={isSelected && phase === 'displaying'}
                isClickable={phase === 'spreading'}
                size={isSelected && phase === 'displaying' ? 'xl' : 'sm'}
              />
            </motion.div>
          );
        })}

        {/* Shuffling hint */}
        {phase === 'shuffling' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute z-30 text-center pointer-events-none"
          >
            <p className="text-[#f0c674] text-sm animate-pulse">
              洗牌中...
            </p>
          </motion.div>
        )}
      </div>
      )}

      {/* Bottom area - use SelectedCardDisplay for interpretation */}
      <div className="z-20 mb-8 text-center px-4">
        {phase === 'displaying' && selectedCard ? (
          <SelectedCardDisplay
            card={selectedCard}
            isReversed={isReversed}
            onReset={handleReset}
            userQuestion={userQuestion}
          />
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-500 tracking-wider"
          >
            {phase === 'spreading'
              ? '跟随你的直觉，选择一张牌'
              : '「当你准备好时，答案自会浮现」'}
          </motion.p>
        )}
      </div>
    </div>
  );
}
