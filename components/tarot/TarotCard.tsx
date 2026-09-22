'use client';

import { motion } from 'framer-motion';
import { TarotCard as TarotCardType } from '@/lib/tarot-data';

interface TarotCardProps {
  card: TarotCardType;
  isReversed?: boolean;
  isFlipped?: boolean;
  isSelected?: boolean;
  isRevealed?: boolean;
  isClickable?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function TarotCardComponent({
  card,
  isReversed = false,
  isFlipped = false,
  isSelected = false,
  isRevealed = false,
  isClickable = false,
  onClick,
  size = 'md',
  className = '',
}: TarotCardProps) {
  // Card is face up only when explicitly flipped/revealed
  const isFaceUp = isFlipped || isRevealed;

  // Size classes - increased by ~1.4x for better visibility
  const sizeClasses = {
    sm: 'w-28 h-44',
    md: 'w-40 h-60',
    lg: 'w-56 h-84',
    xl: 'w-64 h-96',
  };

  return (
    <motion.div
      className={`relative ${isClickable ? 'cursor-pointer hover:scale-105 hover:-translate-y-1' : ''} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      whileHover={(isClickable && !isFaceUp) ? { scale: 1.05, y: -5 } : {}}
      whileTap={isClickable ? { scale: isFaceUp ? 1 : 0.95 } : {}}
      style={{
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      {/* Glow effect when selected - removed due to causing visual artifacts */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl border-2 border-[#d4a853]/60 pointer-events-none" />
      )}

      {/* Card container with Framer Motion 3D flip */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          rotateY: isFaceUp ? 0 : 180,
        }}
        transition={{
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: 1200,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* Front of card (face up) */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(0deg)',
          }}
        >
          <div className={`
            w-full h-full rounded-xl overflow-hidden
            ${isSelected ? 'shadow-[0_0_30px_rgba(212,168,83,0.4)]' : 'shadow-lg'}
          `}>
            {/* Card art - SVG image fills entire card */}
            <div className={`w-full h-full ${isReversed ? 'rotate-180' : ''}`}>
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.nameCN}
                  className="w-full h-full"
                  style={{ objectFit: 'fill' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#12121f]">
                  <div className={`
                    w-12 h-16 rounded-lg flex items-center justify-center
                    ${isReversed ? 'bg-[#6b4c9a]/30' : 'bg-[#d4a853]/20'}
                  `}>
                    <span className="text-2xl">{isReversed ? '🌙' : '☀️'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Back of card (face down - shown by default) */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden border-2 border-[#6b4c9a]/50"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <img
            src="/images/TAROT/CARD PACK.png"
            alt="Card Back"
            className="w-full h-full"
            style={{ objectFit: 'fill' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
