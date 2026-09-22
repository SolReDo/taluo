'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Star, Compass, MessageCircle, Send } from 'lucide-react';

const PRESET_QUESTIONS = [
  { id: 'today', label: '今日指引', icon: '☀️' },
  { id: 'love', label: '近期感情', icon: '💕' },
  { id: 'career', label: '职业发展', icon: '💼' },
  { id: 'custom', label: '自定义问题', icon: '✨' },
];

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<string>('');
  const [customQuestion, setCustomQuestion] = useState('');

  useEffect(() => {
    setIsLoaded(true);
    const timer = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleStartExplore = () => {
    setShowQuestionModal(true);
  };

  const handleQuestionConfirm = () => {
    if (!selectedQuestion) return;

    const question = selectedQuestion === '自定义问题' ? customQuestion : selectedQuestion;

    // Store question in sessionStorage for later use
    sessionStorage.setItem('userQuestion', question);
    sessionStorage.setItem('selectedQuestionType', selectedQuestion);

    // Navigate to reading selection
    window.location.href = '/reading';
  };

  const hasSelectedQuestion = selectedQuestion && (selectedQuestion !== '自定义问题' || customQuestion.trim());

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-[#1a1a2e] via-[#0a0a12] to-[#0a0a12]" />

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-[#d4a853]"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: 0,
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [0, 0.6, 0],
              scale: [0, 1, 0.5],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeOut',
            }}
          />
        ))}
      </div>

      {/* Mystic glow orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#6b4c9a] blur-[100px] opacity-20"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#3d5a80] blur-[120px] opacity-15"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative z-10 text-center px-6"
          >
            {/* Logo / Title */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 mb-4">
                <Moon className="w-8 h-8 text-[#9d7cd8]" />
                <h1 className="font-cinzel text-5xl md:text-6xl font-semibold text-gradient-gold tracking-wider">
                  塔罗灵犀
                </h1>
                <Moon className="w-8 h-8 text-[#9d7cd8]" />
              </div>
              <p className="font-cormorant text-xl md:text-2xl text-[#8b889b] italic tracking-wide">
                探索内心，照见真实的自己
              </p>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-[#e8e6f0]/70 text-lg mb-12 max-w-md mx-auto leading-relaxed"
            >
              不是占卜未来，而是通过塔罗牌，<br />
              帮助你看见内心深处的答案
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.button
                onClick={handleStartExplore}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group px-10 py-4 rounded-full bg-[#d4a853] hover:bg-[#f0c674] transition-colors"
              >
                <span className="flex items-center gap-3 font-cinzel text-[#0a0a12] font-medium text-lg">
                  <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform duration-500" />
                  开始探索
                </span>
              </motion.button>
            </motion.div>

            {/* Features hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.3 }}
              className="mt-16 flex justify-center gap-8 text-[#8b889b]"
            >
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-[#d4a853]" />
                <span className="text-sm">78 张塔罗牌</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9d7cd8]" />
                <span className="text-sm">AI 智能解读</span>
              </div>
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-[#3d5a80]" />
                <span className="text-sm">温暖陪伴</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question Modal */}
      <AnimatePresence>
        {showQuestionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-[#0a0a12]/90 backdrop-blur-sm"
              onClick={() => setShowQuestionModal(false)}
            />

            {/* Modal content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative bg-[#12121f]/95 border border-[#6b4c9a]/30 rounded-2xl p-8 max-w-lg w-full shadow-2xl"
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#6b4c9a]/20 mb-4">
                  <MessageCircle className="w-7 h-7 text-[#9d7cd8]" />
                </div>
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

              {/* Confirm button */}
              <motion.button
                onClick={handleQuestionConfirm}
                disabled={!hasSelectedQuestion}
                whileHover={hasSelectedQuestion ? { scale: 1.02 } : {}}
                whileTap={hasSelectedQuestion ? { scale: 0.98 } : {}}
                className={`
                  w-full mt-6 py-4 rounded-full font-cinzel font-medium transition-all
                  flex items-center justify-center gap-2
                  ${hasSelectedQuestion
                    ? 'bg-[#d4a853] hover:bg-[#f0c674] text-[#0a0a12]'
                    : 'bg-[#6b4c9a]/20 text-[#8b889b] cursor-not-allowed'
                  }
                `}
              >
                <Send className="w-4 h-4" />
                开始解读
              </motion.button>

              {/* Skip button */}
              <button
                onClick={() => setShowQuestionModal(false)}
                className="w-full mt-3 py-2 text-[#8b889b] hover:text-[#e8e6f0] text-sm transition-colors"
              >
                稍后再问
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-[#d4a853]/50"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </main>
  );
}
