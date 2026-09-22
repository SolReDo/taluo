'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { TarotCard } from '@/lib/tarot-data';

interface SelectedCardDisplayProps {
  card: TarotCard;
  isReversed: boolean;
  interpretation?: string;
  onReset?: () => void;
  userQuestion?: string;
}

export default function SelectedCardDisplay({
  card,
  isReversed,
  interpretation,
  onReset,
  userQuestion: propUserQuestion,
}: SelectedCardDisplayProps) {
  const router = useRouter();
  const [isFlipped, setIsFlipped] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFlipped(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get question from props or sessionStorage
  useEffect(() => {
    if (propUserQuestion) {
      setUserQuestion(propUserQuestion);
    } else {
      const stored = sessionStorage.getItem('userQuestion');
      if (stored) {
        setUserQuestion(stored);
      }
    }
  }, [propUserQuestion]);

  const handleAInterpret = () => {
    const params = new URLSearchParams({
      type: 'single',
      cards: JSON.stringify([{
        id: card.id,
        position: 0,
        isReversed: isReversed,
      }]),
    });
    // Pass user question if available
    if (userQuestion) {
      params.set('question', userQuestion);
    }
    router.push(`/reading/result?${params.toString()}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center"
    >
      {/* 3D Flip Card Container */}
      <motion.div
        className="relative mb-8"
        style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 0 : 180 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Card front (shown when flipped) */}
        <div
          className="w-40 h-60 rounded-xl overflow-hidden shadow-xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
        >
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
                <div className={`w-14 h-20 rounded-lg flex items-center justify-center ${isReversed ? 'bg-[#6b4c9a]/30' : 'bg-[#d4a853]/20'}`}>
                  <span className="text-3xl">{isReversed ? '🌙' : '☀️'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card back (shown before flip) */}
        <div
          className="absolute inset-0 w-40 h-60 rounded-xl bg-gradient-to-br from-[#2a1a3e] to-[#12121f] border-2 border-[#6b4c9a]/50 shadow-xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#d4a853]/60 flex items-center justify-center bg-[#0a0a12]/50">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10"
              >
                <svg viewBox="0 0 40 40" className="w-full h-full text-[#d4a853]/70">
                  <circle cx="20" cy="20" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
                  <circle cx="20" cy="20" r="3" fill="currentColor" />
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <line
                      key={i}
                      x1="20"
                      y1="20"
                      x2={20 + 16 * Math.cos((angle * Math.PI) / 180)}
                      y2={20 + 16 * Math.sin((angle * Math.PI) / 180)}
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  ))}
                </svg>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Card Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 20 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6b4c9a]/20 border border-[#6b4c9a]/40 mb-6">
          <span className={`text-lg ${isReversed ? 'rotate-180' : ''}`}>
            {isReversed ? '🌙' : '☀️'}
          </span>
          <span className={`text-sm font-medium ${isReversed ? 'text-[#9d7cd8]' : 'text-[#f0c674]'}`}>
            {isReversed ? '逆位' : '正位'}
          </span>
        </div>

        <div className="mb-6">
          <p className="text-[#8b889b] text-xs mb-2">
            {isReversed ? '逆位关键词' : '正位关键词'}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {(isReversed ? card.reversedKeywords : card.keywords).slice(0, 5).map((keyword, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-full text-xs ${
                  isReversed
                    ? 'bg-[#6b4c9a]/20 text-[#9d7cd8] border border-[#6b4c9a]/30'
                    : 'bg-[#d4a853]/15 text-[#f0c674] border border-[#d4a853]/30'
                }`}
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[#8b889b] text-xs mb-2">卡牌意象</p>
          <p className="text-[#e8e6f0]/70 text-sm leading-relaxed italic">
            &quot;{card.imagery}&quot;
          </p>
        </div>

        {/* AI 解读按钮 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: isFlipped ? 1 : 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          onClick={handleAInterpret}
          className="relative z-10 group mb-4 px-8 py-3 rounded-full bg-[#d4a853] hover:bg-[#f0c674] transition-colors cursor-pointer"
        >
          <span className="flex items-center justify-center gap-2 font-cinzel text-[#0a0a12] font-medium">
            <Sparkles className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
            AI 深度解读
          </span>
        </motion.button>

        {onReset && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isFlipped ? 1 : 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={onReset}
            className="relative z-10 mt-2 px-6 py-2 rounded-full border border-[#6b4c9a]/40 text-[#9d7cd8] text-sm hover:bg-[#6b4c9a]/20 hover:border-[#9d7cd8]/60 transition-colors cursor-pointer"
          >
            重新开始
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
