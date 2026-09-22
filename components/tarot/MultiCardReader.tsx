'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSingleCardStore } from '@/store/singleCardStore';
import { TarotCard, allTarotCards, CardPosition } from '@/lib/tarot-data';
import TarotCardComponent from './TarotCard';

type Phase = 'idle' | 'shuffling' | 'spreading' | 'selecting' | 'displaying';
type ShuffleSubPhase = 'idle' | 'split' | 'scatter' | 'interleave' | 'gather';

interface SelectedCardInfo {
  card: TarotCard;
  position: number;
  isReversed: boolean;
}

interface MultiCardReaderProps {
  cardCount: number;
  positions: CardPosition[];
  onComplete: (cards: SelectedCardInfo[]) => void;
  userQuestion?: string;
}

const CARD_COUNT = 30;

export default function MultiCardReader({
  cardCount,
  positions,
  onComplete,
  userQuestion: propUserQuestion,
}: MultiCardReaderProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [shuffleSubPhase, setShuffleSubPhase] = useState<ShuffleSubPhase>('idle');
  const [displayCards, setDisplayCards] = useState<TarotCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<SelectedCardInfo[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [userQuestion, setUserQuestion] = useState<string>('');

  const storeUserQuestion = useSingleCardStore((s) => s.userQuestion);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Pre-computed random offsets for shuffle animation
  const cardRandomOffsets = useRef<{ scatterX: number; scatterY: number; scatterRotate: number }[]>([]);

  // Get question from props or sessionStorage
  useEffect(() => {
    const storedQuestion = sessionStorage.getItem('userQuestion');
    if (storedQuestion) {
      setUserQuestion(storedQuestion);
    } else if (propUserQuestion) {
      setUserQuestion(propUserQuestion);
    }
  }, [propUserQuestion, storeUserQuestion]);

  // Initialize cards on mount
  useEffect(() => {
    const shuffled = [...allTarotCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const cards = shuffled.slice(0, CARD_COUNT);
    setDisplayCards(cards);

    cardRandomOffsets.current = cards.map(() => ({
      scatterX: (Math.random() - 0.5) * 80,
      scatterY: (Math.random() - 0.5) * 40,
      scatterRotate: (Math.random() - 0.5) * 20,
    }));
  }, []);

  // Shuffle animation - cycle through sub-phases
  useEffect(() => {
    if (phase === 'shuffling') {
      setShuffleSubPhase('split');

      const phases: ShuffleSubPhase[] = ['split', 'scatter', 'interleave', 'gather'];
      let currentIndex = 0;

      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % phases.length;
        setShuffleSubPhase(phases[currentIndex]);
      }, 600);

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
    if (revealedIndices.includes(index)) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    // 50% 正位，50% 逆位
    const reversed = Math.random() < 0.5;
    const nextPosition = selectedCards.length;

    const newCard: SelectedCardInfo = {
      card,
      position: nextPosition,
      isReversed: reversed,
    };

    setSelectedCards(prev => [...prev, newCard]);
    setRevealedIndices(prev => [...prev, index]);

    if (nextPosition + 1 >= cardCount) {
      // All cards selected, move to displaying phase
      setTimeout(() => {
        setPhase('displaying');
      }, 300);
    }
  }, [phase, selectedCards, revealedIndices, cardCount]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
    setShuffleSubPhase('idle');
    setSelectedCards([]);
    setRevealedIndices([]);
    // Regenerate random offsets
    cardRandomOffsets.current = displayCards.map(() => ({
      scatterX: (Math.random() - 0.5) * 80,
      scatterY: (Math.random() - 0.5) * 40,
      scatterRotate: (Math.random() - 0.5) * 20,
    }));
  }, [displayCards]);

  const handleGetInterpretation = useCallback(() => {
    onComplete(selectedCards);
  }, [selectedCards, onComplete]);

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
        scale: 1,
        zIndex: 15 - Math.abs(delta),
        transition: { duration: 0.3 },
      };
    }

    // Shuffling state
    if (phase === 'shuffling') {
      const cardPos = index - mid;
      const direction = isLeft ? -1 : 1;
      const rand = cardRandomOffsets.current[index] || { scatterX: 0, scatterY: 0, scatterRotate: 0 };

      if (shuffleSubPhase === 'split') {
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
        const gatherZ = 15 + Math.floor((rand.scatterX + 40) / 80 * 10);
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

    // Spreading state
    if (phase === 'spreading') {
      const spreadX = delta * 12;
      const spreadY = Math.abs(delta) * 4 - 40;
      const spreadRotate = delta * 4;
      const isRevealed = revealedIndices.includes(index);

      return {
        x: spreadX,
        y: spreadY,
        rotate: spreadRotate,
        opacity: isRevealed ? 0.3 : 1,
        scale: isRevealed ? 0.8 : 1,
        zIndex: index,
        transition: { duration: 0.5, ease: 'easeOut' },
      };
    }

    return {};
  };

  const canGetInterpretation = selectedCards.length === cardCount;

  // Displaying phase - show all selected cards in a row
  if (phase === 'displaying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-serif text-[#e6c687] mb-2">解读完成</h2>
          <p className="text-[#8b889b]">已选择 {cardCount} 张牌</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap justify-center gap-4 mb-8"
        >
          {selectedCards.map((sc, i) => (
            <div key={`${sc.card.id}-${i}`} className="relative">
              <TarotCardComponent
                card={sc.card}
                isRevealed={true}
                isReversed={sc.isReversed}
                size="md"
              />
              {positions[i] && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                  <p className="text-xs text-[#d4a853]">{positions[i].nameCN}</p>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="px-6 py-3 rounded-full border border-[#6b4c9a]/40 text-[#9d7cd8] hover:bg-[#6b4c9a]/20 transition-colors"
          >
            重新开始
          </button>
          <button
            onClick={handleGetInterpretation}
            className="px-8 py-3 rounded-full bg-[#d4a853] hover:bg-[#f0c674] text-[#0a0a12] font-medium transition-colors"
          >
            查看解读
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-between min-h-[500px] w-full">
      {/* Top title */}
      <div className="flex flex-col items-center text-center mb-4">
        <h2 className="text-xl font-serif text-[#e6c687]">
          {phase === 'spreading' ? '请选择你的牌' : '准备就绪'}
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          {phase === 'spreading'
            ? `还需选择 ${cardCount - selectedCards.length} 张牌`
            : (userQuestion || '聚焦问题')}
        </p>
      </div>

      {/* Card stage */}
      <div className="relative w-full h-[400px] flex items-center justify-center">
        {/* Click handler for idle phase */}
        {phase === 'idle' && (
          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
            onClick={handleDeckClick}
          >
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
          const isRevealed = revealedIndices.includes(index);
          const { zIndex, ...animProps } = anim;

          return (
            <motion.div
              key={`card-${index}`}
              initial={false}
              animate={animProps}
              style={{ transformOrigin: '50% 160%', zIndex: zIndex as number }}
              className={`absolute will-change-transform ${phase === 'spreading' && !isRevealed ? 'cursor-pointer' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (phase === 'spreading' && !isRevealed) {
                  handleCardSelect(card, index);
                }
              }}
            >
              <TarotCardComponent
                card={card}
                isRevealed={isRevealed}
                isReversed={false}
                isClickable={phase === 'spreading' && !isRevealed}
                size="sm"
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

      {/* Selected cards preview */}
      {selectedCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap justify-center gap-2 mt-4"
        >
          {selectedCards.map((sc, i) => (
            <div
              key={`preview-${sc.card.id}-${i}`}
              className={`px-3 py-1 rounded-full text-xs border ${
                sc.isReversed
                  ? 'border-[#6b4c9a] bg-[#6b4c9a]/20 text-[#9d7cd8]'
                  : 'border-[#d4a853] bg-[#d4a853]/20 text-[#f0c674]'
              }`}
            >
              {sc.card.nameCN} {sc.isReversed ? '逆' : '正'}
            </div>
          ))}
        </motion.div>
      )}

      {/* Hint text */}
      {phase === 'spreading' && selectedCards.length < cardCount && (
        <p className="text-[#6b4c9a] text-sm italic mt-4">
          「跟随你的直觉，选择一张牌」
        </p>
      )}
    </div>
  );
}
