'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard as TarotCardType, drawCards, allTarotCards } from '@/lib/tarot-data';
import TarotCardComponent from './TarotCard';
import TarotCardBack from './CardBack';

interface CardDeckProps {
  onCardSelect?: (card: TarotCardType, isReversed: boolean) => void;
  cardCount?: number;
  disabled?: boolean;
  selectedCardIds?: string[];
}

export default function CardDeck({
  onCardSelect,
  cardCount = 1,
  disabled = false,
  selectedCardIds = [],
}: CardDeckProps) {
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffledCards, setShuffledCards] = useState<TarotCardType[]>([]);
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ card: TarotCardType; isReversed: boolean } | null>(null);

  // Start shuffle animation
  const startShuffle = useCallback(() => {
    setIsShuffling(true);
    setHasStarted(true);
    setSelectedCard(null);
    // Draw a subset of cards from the full 78-card deck
    const cards = drawCards(Math.min(cardCount * 5, allTarotCards.length), []);
    setShuffledCards(cards);

    setTimeout(() => {
      setIsShuffling(false);
    }, 3000);
  }, [cardCount]);

  // Handle card click - single select only
  const handleCardClick = (card: TarotCardType, index: number) => {
    if (selectedCard !== null || disabled) return;
    if (revealedIndices.includes(index)) return;

    const isReversed = Math.random() < 0.125;

    setSelectedCard({ card, isReversed });
    setRevealedIndices(prev => [...prev, index]);
    onCardSelect?.(card, isReversed);
  };

  // Reset deck
  const resetDeck = () => {
    setShuffledCards([]);
    setRevealedIndices([]);
    setHasStarted(false);
    setSelectedCard(null);
    setIsShuffling(false);
  };

  const hasDrawn = selectedCard !== null;

  return (
    <div className="flex flex-col items-center">
      {/* Deck / Cards display */}
      <div className="relative w-full max-w-2xl flex items-center justify-center py-4">
        {!hasStarted ? (
          /* Initial deck prompt - stacked cards with back pattern */
          <motion.button
            onClick={startShuffle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group"
          >
            {/* Stacked cards effect */}
            <div className="relative w-32 h-48">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                    transform: `translateY(${-i * 2}px) rotate(${(i - 2) * 2}deg)`,
                    zIndex: 5 - i,
                  }}
                >
                  <TarotCardBack className="border border-[#6b4c9a]/30" />
                </div>
              ))}
              {/* Top card with text */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                <TarotCardBack />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="font-cinzel text-[#9d7cd8] text-sm bg-[#0a0a12]/80 px-3 py-1 rounded-full">
                    点击洗牌
                  </p>
                </div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-4 rounded-2xl bg-[#6b4c9a]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        ) : (
          /* Shuffled cards grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-5 gap-2 p-2"
          >
            <AnimatePresence>
              {shuffledCards.slice(0, 15).map((card, index) => {
                const isRevealed = revealedIndices.includes(index);
                const isSelected = selectedCard?.card.id === card.id;
                const isOtherDrawn = hasDrawn && !isSelected;

                return (
                  <motion.div
                    key={`${card.id}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={
                      isShuffling
                        ? {
                            opacity: [0.7, 1, 0.7],
                            scale: 1,
                            x: index % 2 === 0 ? -10 : 10,
                            rotate: index % 3 === 0 ? 5 : -5,
                          }
                        : {
                            opacity: isOtherDrawn ? 0.3 : 1,
                            scale: 1,
                            x: 0,
                            rotate: 0,
                          }
                    }
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={
                      isShuffling
                        ? {
                            duration: 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }
                        : { duration: 0.3 }
                    }
                    className={`flex justify-center ${isOtherDrawn ? 'pointer-events-none' : ''}`}
                  >
                    <TarotCardComponent
                      card={card}
                      isRevealed={isRevealed}
                      isSelected={isSelected}
                      isReversed={isSelected ? selectedCard?.isReversed : false}
                      onClick={() => handleCardClick(card, index)}
                      size="sm"
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      {hasStarted && !isShuffling && !hasDrawn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-2"
        >
          <p className="text-[#8b889b] text-sm">
            请选择 {cardCount - revealedIndices.length} 张牌
          </p>
          <p className="text-[#6b4c9a] text-xs mt-1 italic">
            跟随你的直觉，点击任意一张牌
          </p>
        </motion.div>
      )}

      {/* Reset button */}
      {hasStarted && (
        <button
          onClick={resetDeck}
          className="mt-4 text-[#8b889b] hover:text-[#e8e6f0] text-sm underline-offset-4 hover:underline transition-colors"
        >
          重新开始
        </button>
      )}
    </div>
  );
}
