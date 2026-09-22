'use client';

import { motion } from 'framer-motion';
import { useSingleCardStore } from '@/store/singleCardStore';
import TarotCardBack from './CardBack';

interface CardPileProps {
  onClick: () => void;
  disabled?: boolean;
}

export default function CardPile({ onClick, disabled = false }: CardPileProps) {
  const { phase } = useSingleCardStore();

  const isShuffling = phase === 'shuffling';
  const isContemplating = phase === 'contemplating';

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      className={`
        relative group cursor-pointer flex flex-col items-center pointer-events-auto
        ${disabled ? 'cursor-not-allowed opacity-70' : ''}
      `}
    >
      {/* Container with overflow-visible for wide card spread */}
      <div className="relative w-36 h-52 overflow-visible">
        {isShuffling ? (
          <RiffleShuffleAnimation />
        ) : (
          <StaticCardStack />
        )}
      </div>

      {/* Glow effect - shown when idle */}
      {phase === 'idle' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute -inset-4 rounded-2xl bg-[#6b4c9a]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        />
      )}

      {/* Breathing glow effect - contemplation phase */}
      {isContemplating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -inset-6 rounded-3xl bg-gradient-to-r from-[#d4a853]/20 via-[#f0c674]/20 to-[#d4a853]/20 blur-2xl"
        />
      )}

      {/* Hint text below pile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-16 w-full text-center"
      >
        {phase === 'idle' && (
          <p className="text-[#6b4c9a] text-sm whitespace-nowrap">将你的意识沉浸于牌卡之中</p>
        )}
        {isShuffling && (
          <p className="text-[#8b889b] text-sm whitespace-nowrap text-center">牌卡正在感应你的气息，请在心中默念你的问题</p>
        )}
        {isContemplating && (
          <p className="text-[#f0c674] text-sm animate-pulse whitespace-nowrap">
            请在心中默念你的问题
          </p>
        )}
      </motion.div>
    </motion.button>
  );
}

// Static stacked cards when not shuffling
function StaticCardStack() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div
          key={`static-${i}`}
          className="absolute w-full h-full"
          style={{
            transform: `translateY(${-i * 3}px) rotate(${(i - 1.5) * 1.2}deg)`,
            zIndex: 4 - i,
          }}
        >
          <TarotCardBack className="border border-[#6b4c9a]/20 shadow-lg" />
        </div>
      ))}
      {/* Top card with click prompt */}
      <div className="absolute inset-0 z-10">
        <TarotCardBack />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-[#0a0a12]/70 px-4 py-2 rounded-full border border-[#9d7cd8]/30">
            <p className="font-cinzel text-[#9d7cd8] text-sm">点击洗牌</p>
          </div>
        </div>
      </div>
    </>
  );
}

// Realistic Riffle Shuffle Animation
// Cards interleave based on return order: later arriving cards have higher z-index
function RiffleShuffleAnimation() {
  const cardCount = 8;
  const halfCount = cardCount / 2;

  // Pre-compute random offsets for final resting position
  const cardOffsets = Array.from({ length: cardCount }, (_, i) => ({
    x: Math.sin(i * 17.3) * 3,
    y: Math.sin(i * 23.7) * 2.5,
    rotate: Math.sin(i * 31.1) * 1.5,
  }));

  // Animation timing (seconds)
  const totalDuration = 3.2;
  const splitDuration = 0.7;
  const holdDuration = 0.6;
  const gatherDuration = 0.9;
  const settleDuration = 0.25;
  const repeatDelay = 0.5;

  // Stagger interval for alternating L-R-L-R return pattern
  const staggerInterval = 0.1;

  // Build interleaved card data: L0, R0, L1, R1, L2, R2, L3, R3
  // Each card has: pileIndex (0=left, 1=right), cardIndex (0-3), orderIndex (0-7)
  const interleavedCards = [];

  for (let i = 0; i < halfCount; i++) {
    // Left card first
    interleavedCards.push({
      pile: 'left' as const,
      cardIndex: i,
      orderIndex: i * 2,           // 0, 2, 4, 6
      offset: cardOffsets[i],
    });
    // Then right card
    interleavedCards.push({
      pile: 'right' as const,
      cardIndex: i,
      orderIndex: i * 2 + 1,       // 1, 3, 5, 7
      offset: cardOffsets[halfCount + i],
    });
  }

  return (
    <div
      className="relative w-full h-full pointer-events-none"
      style={{
        perspective: 1400,
        perspectiveOrigin: 'center center',
        overflow: 'visible',
      }}
    >
      {interleavedCards.map(({ pile, cardIndex, orderIndex, offset }) => {
        const isLeft = pile === 'left';
        const splitX = isLeft ? -150 : 150;
        const splitRotate = isLeft ? -15 : 15;

        // delay and z-index both derived from orderIndex
        // L0 returns first (delay=0, z=1), R0 returns second (delay=0.1, z=2), etc.
        const delay = orderIndex * staggerInterval;
        // z-index: higher order = higher z-index (later arriving card on top)
        const zIndex = orderIndex + 1;

        return (
          <ShuffleCard
            key={`shuffle-${pile}-${cardIndex}`}
            splitX={splitX}
            splitRotate={splitRotate}
            finalX={offset.x}
            finalY={offset.y}
            finalRotate={offset.rotate}
            totalDuration={totalDuration}
            splitDuration={splitDuration}
            holdDuration={holdDuration}
            gatherDuration={gatherDuration}
            settleDuration={settleDuration}
            delay={delay}
            repeatDelay={repeatDelay}
            zIndex={zIndex}
          />
        );
      })}
    </div>
  );
}

// Individual card animation
interface ShuffleCardProps {
  splitX: number;
  splitRotate: number;
  finalX: number;
  finalY: number;
  finalRotate: number;
  totalDuration: number;
  splitDuration: number;
  holdDuration: number;
  gatherDuration: number;
  settleDuration: number;
  delay: number;
  repeatDelay: number;
  zIndex: number;
}

function ShuffleCard({
  splitX,
  splitRotate,
  finalX,
  finalY,
  finalRotate,
  totalDuration,
  splitDuration,
  holdDuration,
  gatherDuration,
  settleDuration,
  delay,
  repeatDelay,
  zIndex,
}: ShuffleCardProps) {
  // Time boundaries as ratios
  const splitEnd = splitDuration / totalDuration;
  const holdEnd = (splitDuration + holdDuration) / totalDuration;
  const gatherEnd = (splitDuration + holdDuration + gatherDuration) / totalDuration;
  const settleStart = (totalDuration - settleDuration) / totalDuration;

  // Keyframe values (all numeric)
  const xKeyframes = [0, splitX, splitX, 0, finalX, 0];
  const yKeyframes = [0, 0, 0, -40, finalY + 5, finalY];
  const rotateKeyframes = [0, splitRotate, splitRotate, 0, finalRotate, 0];
  const scaleKeyframes = [1, 0.88, 0.88, 1.03, 0.96, 1];
  const keyframeTimes = [0, splitEnd, holdEnd, gatherEnd, settleStart, 1];

  return (
    <motion.div
      className="absolute w-full h-full"
      initial={{
        x: 0,
        y: 0,
        rotate: 0,
        scale: 1,
        opacity: 1,
      }}
      animate={{
        x: xKeyframes,
        y: yKeyframes,
        rotate: rotateKeyframes,
        scale: scaleKeyframes,
        opacity: [1, 1, 1, 1, 1, 1],
      }}
      transition={{
        duration: totalDuration,
        ease: [0.4, 0.05, 0.2, 1],
        times: keyframeTimes,
        delay,
        repeat: Infinity,
        repeatDelay,
        repeatType: 'loop',
      }}
      style={{ zIndex }}
    >
      <TarotCardBack className="border border-[#6b4c9a]/20 shadow-lg" />
    </motion.div>
  );
}
