'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Moon, MessageCircle } from 'lucide-react';
import { getSpreadById, TarotCard as TarotCardType } from '@/lib/tarot-data';
import { useReadingStore } from '@/store';
import { ParticleField } from '@/components/ui';
import MultiCardReader from '@/components/tarot/MultiCardReader';

const PRESET_QUESTIONS = [
  { id: 'today', label: '今日指引', icon: '☀️' },
  { id: 'love', label: '近期感情', icon: '💕' },
  { id: 'career', label: '职业发展', icon: '💼' },
  { id: 'custom', label: '自定义问题', icon: '✨' },
];

function SpreadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const spreadType = searchParams.get('type') || 'single';

  const [spread, setSpread] = useState(getSpreadById(spreadType));
  const [selectedCards, setSelectedCards] = useState<Array<{
    card: TarotCardType;
    position: number;
    isReversed: boolean;
  }>>([]);
  const [isReady, setIsReady] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState('');

  const { setSpreadType, addCard, setPhase, setUserQuestion } = useReadingStore();

  // Check for existing question from homepage
  useEffect(() => {
    const storedQuestion = sessionStorage.getItem('userQuestion');
    const storedQuestionType = sessionStorage.getItem('selectedQuestionType');
    if (storedQuestion) {
      setSelectedQuestion(storedQuestionType || storedQuestion);
      setCustomQuestion(storedQuestionType === '自定义问题' ? storedQuestion : '');
      setUserQuestion(storedQuestion);
      setShowQuestionModal(false);
    }
  }, [setUserQuestion]);

  useEffect(() => {
    if (spread) {
      setSpreadType(spread.id, spread.nameCN, spread.positions);
      setPhase('selecting');
    }
    setTimeout(() => setIsReady(true), 500);
  }, [spread, setSpreadType, setPhase]);

  const handleStartDrawing = () => {
    const question = selectedQuestion === 'custom'
      ? customQuestion
      : selectedQuestion;
    setUserQuestion(question);
    setShowQuestionModal(false);
  };

  const handleGetInterpretation = (cards: typeof selectedCards) => {
    setSelectedCards(cards);
    cards.forEach((c) => addCard(c.card, c.position, c.isReversed));
    setPhase('revealing');
    const cardParams = cards.map(c => ({
      id: c.card.id,
      position: c.position,
      isReversed: c.isReversed,
    }));
    const params = new URLSearchParams({
      type: spreadType,
      cards: JSON.stringify(cardParams),
    });
    router.push(`/reading/result?${params.toString()}`);
  };

  if (!spread) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#8b889b]">未找到牌阵类型</p>
      </div>
    );
  }

  const hasSelectedQuestion = selectedQuestion && (selectedQuestion !== '自定义问题' || customQuestion.trim());
  const hasStartedDrawing = !showQuestionModal && hasStartedCards();

  function hasStartedCards() {
    return selectedCards.length > 0 || isReady;
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Solid background */}
      <div className="fixed inset-0 bg-[#0a0a12] z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#12121f] to-[#0a0a12] z-1" />
      <div className="absolute inset-0 z-2 pointer-events-none">
        <ParticleField />
      </div>

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="absolute inset-0 bg-[#0a0a12]/90 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative bg-[#12121f]/95 border border-[#6b4c9a]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center mb-6">
                <MessageCircle className="w-10 h-10 text-[#9d7cd8] mx-auto mb-3" />
                <h2 className="font-cinzel text-xl text-gradient-gold mb-2">
                  聚焦你的问题
                </h2>
                <p className="text-[#8b889b] text-sm">
                  在抽取牌卡之前，请先静下心来，选择或输入你想要探索的问题
                </p>
              </div>

              {/* Preset questions */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {PRESET_QUESTIONS.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQuestion(q.label)}
                    className={`
                      p-4 rounded-xl border text-left transition-all
                      ${selectedQuestion === q.label
                        ? 'border-[#d4a853] bg-[#d4a853]/10'
                        : 'border-[#6b4c9a]/30 bg-[#0a0a12]/50 hover:border-[#9d7cd8]/50'
                      }
                    `}
                  >
                    <span className="text-xl mb-1 block">{q.icon}</span>
                    <span className={`text-sm ${selectedQuestion === q.label ? 'text-[#f0c674]' : 'text-[#e8e6f0]'}`}>
                      {q.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Custom question input */}
              {selectedQuestion === '自定义问题' && (
                <motion.textarea
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  placeholder="请输入你的问题..."
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  className="w-full bg-[#0a0a12]/80 border border-[#6b4c9a]/30 rounded-xl p-4 text-[#e8e6f0] placeholder-[#8b889b] focus:outline-none focus:border-[#9d7cd8]/50 resize-none"
                  rows={3}
                />
              )}

              {/* Start button */}
              <button
                onClick={handleStartDrawing}
                disabled={!hasSelectedQuestion}
                className={`
                  w-full mt-6 py-4 rounded-full font-cinzel font-medium transition-all
                  ${hasSelectedQuestion
                    ? 'bg-gradient-to-r from-[#d4a853] via-[#f0c674] to-[#d4a853] bg-[length:200%_100%] animate-shimmer text-[#0a0a12] hover:shadow-lg hover:shadow-[#d4a853]/20'
                    : 'bg-[#6b4c9a]/20 text-[#8b889b] cursor-not-allowed'
                  }
                `}
              >
                准备就绪，开始抽牌
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="relative z-10 flex flex-col min-h-screen max-w-4xl mx-auto w-full px-6 py-6">
        {/* Header - always visible */}
        <div className="flex-shrink-0">
          <button
            onClick={() => router.push('/reading')}
            className="inline-flex items-center gap-2 text-[#8b889b] hover:text-[#e8e6f0] transition-colors mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            返回选择
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-cinzel text-2xl md:text-3xl text-gradient-gold mb-1">
              {spread.nameCN}
            </h1>
            {/* Only show description when no cards drawn yet */}
            {!hasStartedCards() && (
              <p className="text-[#8b889b] text-sm">{spread.description}</p>
            )}
          </motion.div>
        </div>

        {/* Question badge - compact, shown after modal */}
        {!showQuestionModal && hasSelectedQuestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-shrink-0 flex justify-center mt-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#6b4c9a]/20 border border-[#6b4c9a]/40 text-xs">
              <span className="text-[#d4a853]">✨</span>
              <span className="text-[#9d7cd8]">正在为你解读：</span>
              <span className="text-[#f0c674] font-medium">
                {selectedQuestion === '自定义问题' ? customQuestion : selectedQuestion}
              </span>
            </div>
          </motion.div>
        )}

        {/* Card deck area - takes remaining space */}
        <div className="flex-1 flex flex-col items-center justify-center my-4">
          <AnimatePresence mode="wait">
            {!showQuestionModal && isReady && spread && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <MultiCardReader
                  cardCount={spread.cardCount}
                  positions={spread.positions}
                  onComplete={handleGetInterpretation}
                  userQuestion={selectedQuestion === '自定义问题' ? customQuestion : selectedQuestion}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}

export default function SpreadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Moon className="w-8 h-8 text-[#6b4c9a] animate-pulse" />
      </div>
    }>
      <SpreadPageContent />
    </Suspense>
  );
}
