'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { TarotCard } from '@/lib/tarot-data';
import TarotCardComponent from './TarotCard';

interface SpreadCardsProps {
  cards: TarotCard[];
  onCardClick: (card: TarotCard, index: number) => void;
  cardCount?: number;
}

export default function SpreadCards({
  cards,
  onCardClick,
  cardCount = 15,
}: SpreadCardsProps) {
  const [spreadState, setSpreadState] = useState<'gathered' | 'spreading' | 'spread'>('gathered');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [displayedCards, setDisplayedCards] = useState<TarotCard[]>([]);

  // Initialize displayed cards when cards prop changes
  useEffect(() => {
    setDisplayedCards(cards.slice(0, cardCount));
    setSpreadState('gathered');
    setSelectedIndex(null);
  }, [cards, cardCount]);

  // Trigger spreading animation when component mounts
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSpreadState('spreading');
    }, 100);

    const completeTimeout = setTimeout(() => {
      setSpreadState('spread');
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearCompleteTimeout(completeTimeout);
    };
  }, []);

  const clearCompleteTimeout = (timeout: NodeJS.Timeout) => clearTimeout(timeout);

  // Handle card click
  const handleCardClick = (card: TarotCard, index: number) => {
    if (spreadState !== 'spread') return;
    setSelectedIndex(index);
    onCardClick(card, index);
  };

  // Calculate positions with reduced arc for better fit
  const getCardPosition = (index: number, total: number) => {
    // Reduced arc span from 180 to 140 degrees for tighter fan
    const arcSpan = 140;
    const startAngle = -arcSpan / 2;
    // Smaller angle step to reduce spread
    const angleStep = arcSpan / (total - 1);
    const angle = startAngle + index * angleStep;
    const radians = (angle * Math.PI) / 180;

    // Reduced radius to keep cards closer together
    const radius = Math.min(240, 160 + total * 6);
    const x = Math.sin(radians) * radius;
    const y = -Math.cos(radians) * radius * 0.5; // Reduced vertical component

    return { x, y, rotate: angle };
  };

  const totalCards = displayedCards.length;

  return (
    <div className="relative w-full h-[420px] flex items-center justify-center overflow-visible">
      {/* Container with proper transform origin for arc rotation */}
      <div
        className="relative z-0 pointer-events-auto flex items-center justify-center"
        style={{
          perspective: 1200,
          perspectiveOrigin: 'center 60%',
          overflow: 'visible',
        }}
      >
        {displayedCards.map((card, index) => {
          const pos = getCardPosition(index, totalCards);
          const isSelected = selectedIndex === index;
          const isOther = selectedIndex !== null && !isSelected;

          const isGathered = spreadState === 'gathered';
          const isSpreading = spreadState === 'spreading';
          const isSpread = spreadState === 'spread';

          // Slightly reduced stagger for smoother flow
          const staggerDelay = index * 0.04;

          return (
            <motion.div
              key={`${card.id}-${index}`}
              className="absolute pointer-events-auto"
              style={{
                transformOrigin: '50% 130%', // Rotate from bottom center
              }}
              initial={{
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 0,
                scale: 0.4,
              }}
              animate={
                isSelected
                  ? {
                      x: 0,
                      y: 0,
                      rotate: 0,
                      opacity: 1,
                      scale: 1.35,
                    }
                  : isOther
                  ? {
                      x: pos.x * 0.3,
                      y: pos.y - 80,
                      opacity: 0,
                      scale: 0.5,
                    }
                  : isSpreading || isSpread
                  ? {
                      x: pos.x,
                      y: pos.y,
                      rotate: pos.rotate,
                      opacity: 1,
                      scale: 0.85, // Slightly reduced scale for better fit
                    }
                  : {
                      x: 0,
                      y: 0,
                      opacity: 0,
                      scale: 0.4,
                    }
              }
              transition={
                isSelected
                  ? {
                      type: 'spring',
                      stiffness: 100,
                      damping: 12,
                      duration: 0.4,
                    }
                  : isOther
                  ? {
                      duration: 0.3,
                      ease: 'easeOut',
                    }
                  : isSpreading
                  ? {
                      type: 'spring',
                      stiffness: 35,
                      damping: 16,
                      delay: staggerDelay,
                    }
                  : { duration: 0 }
              }
              whileHover={
                isSpread && !isSelected
                  ? {
                      scale: 1.05,
                      y: pos.y - 10,
                      transition: { duration: 0.15 },
                    }
                  : {}
              }
              onClick={() => isSpread && handleCardClick(card, index)}
            >
              <TarotCardComponent
                card={card}
                isRevealed={isSelected}
                isSelected={isSelected}
                size={isSelected ? 'lg' : 'sm'}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Instruction hint - pushed further down for better spacing */}
      {spreadState === 'spread' && !selectedIndex && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-[#9d7cd8] text-sm">
            跟随你的直觉，点击任意一张牌
          </p>
        </motion.div>
      )}
    </div>
  );
}
