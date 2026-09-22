'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Sparkles, MessageCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getSpreadById, getCardById, TarotCard } from '@/lib/tarot-data';
import { ParticleField } from '@/components/ui';

interface CardResult {
  id: string;
  position: number;
  isReversed: boolean;
}

// Streaming Reader Component with react-markdown
function StreamingReader({ text, isStreaming }: { text: string; isStreaming: boolean }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrollEnabled = useRef(true);
  const isAtBottomRef = useRef(true);

  // Handle user scroll - detect if at bottom
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    isAtBottomRef.current = distanceFromBottom <= 20;
    isAutoScrollEnabled.current = isAtBottomRef.current;
  };

  // Auto-scroll using requestAnimationFrame with 'auto' behavior
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isAutoScrollEnabled.current) return;

    const frameId = requestAnimationFrame(() => {
      if (container && isAtBottomRef.current) {
        container.scrollTop = container.scrollHeight;
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [text]);

  return (
    <div
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="h-[400px] max-h-[50vh] overflow-y-scroll p-6 rounded-2xl bg-[#0a0a12]/90 border border-[#6b4c9a]/30 transform-gpu"
      style={{
        scrollBehavior: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(107, 76, 154, 0.5) transparent',
      }}
    >
      <div className="text-[#e8e6f0]/90 text-sm leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="font-cinzel text-xl text-[#f0c674] mt-5 mb-3 font-semibold">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-cinzel text-lg text-[#f0c674] mt-5 mb-2 font-semibold">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-cinzel text-base text-[#9d7cd8] mt-4 mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-[#e8e6f0]/85 leading-relaxed my-2">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-[#f0c674]">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-[#e8e6f0]/90">{children}</em>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#9d7cd8]/50 pl-4 my-3 text-[#e8e6f0]/80 italic">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc ml-4 my-2 text-[#e8e6f0]/85">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal ml-4 my-2 text-[#e8e6f0]/85">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="my-1">{children}</li>
            ),
          }}
        >
          {text}
        </ReactMarkdown>
        {isStreaming && (
          <span className="inline-block w-2 h-4 ml-1 bg-[#d4a853] animate-pulse align-middle" />
        )}
      </div>
    </div>
  );
}

function ResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [interpretation, setInterpretation] = useState<string>('');
  const [streamContent, setStreamContent] = useState<string>('');
  const [spread, setSpread] = useState(getSpreadById(searchParams.get('type') || 'single'));
  const [cards, setCards] = useState<Array<{
    card: TarotCard;
    position: number;
    isReversed: boolean;
    positionMeaning: string;
  }>>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Refs for streaming
  const streamRef = useRef(false);
  const fullContentRef = useRef('');
  const lastUpdateRef = useRef(0);

  // Batched state update - updates every 50ms max
  useEffect(() => {
    const interval = setInterval(() => {
      if (fullContentRef.current !== streamContent) {
        setStreamContent(fullContentRef.current);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [streamContent]);

  useEffect(() => {
    const fetchInterpretation = async () => {
      try {
        const cardsParam = searchParams.get('cards');
        if (!cardsParam) throw new Error('No cards data');

        const cardsData: CardResult[] = JSON.parse(cardsParam);
        const spreadData = getSpreadById(searchParams.get('type') || 'single');

        if (!spreadData) throw new Error('Invalid spread');

        setSpread(spreadData);

        // Build cards info
        const cardsInfo = cardsData.map(c => {
          const card = getCardById(c.id);
          const position = spreadData.positions.find(p => p.index === c.position);
          return {
            card: card!,
            position: c.position,
            isReversed: c.isReversed,
            positionMeaning: position?.meaning || '',
          };
        });
        setCards(cardsInfo);

        // Start streaming
        setIsStreaming(true);
        streamRef.current = true;
        fullContentRef.current = '';
        lastUpdateRef.current = Date.now();

        const response = await fetch('/api/divination', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            spreadType: spreadData.id,
            cards: cardsData,
            userQuestion: searchParams.get('question') || undefined,
          }),
        });

        if (!response.ok) throw new Error('Failed to get interpretation');

        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No response body');

        while (true) {
          const { done, value } = await reader.read();
          if (done || !streamRef.current) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  fullContentRef.current += parsed.content;
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        // Final update
        setInterpretation(fullContentRef.current);
        setStreamContent(fullContentRef.current);
      } catch (error) {
        console.error('Error:', error);
        const errorMsg = '抱歉，暂时无法获取解读，请稍后重试。';
        setInterpretation(errorMsg);
        fullContentRef.current = errorMsg;
        setStreamContent(errorMsg);
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        streamRef.current = false;
      }
    };

    fetchInterpretation();

    return () => {
      streamRef.current = false;
    };
  }, [searchParams]);

  const handleRetry = () => {
    router.push(`/reading/spread?type=${searchParams.get('type') || 'single'}`);
  };

  const handleNewReading = () => {
    router.push('/reading');
  };

  const handleChat = () => {
    // Save reading context for chat page
    const chatContext = {
      spreadNameCN: spread?.nameCN || '单牌解读',
      cards: cards.map(c => ({
        nameCN: c.card.nameCN,
        isReversed: c.isReversed,
        positionMeaning: c.positionMeaning,
      })),
      interpretation: interpretation || streamContent,
    };
    sessionStorage.setItem('chatContext', JSON.stringify(chatContext));
    router.push('/chat');
  };

  const displayContent = interpretation || streamContent;

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[#0a0a12] z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#12121f] to-[#0a0a12] z-1" />
      <div className="absolute inset-0 z-2 pointer-events-none">
        <ParticleField />
      </div>

      {/* Back button - fixed position */}
      <button
        onClick={() => router.push('/reading')}
        className="absolute top-6 left-6 z-[100] inline-flex items-center gap-2 text-[#8b889b] hover:text-[#e8e6f0] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        返回选择
      </button>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="font-cinzel text-2xl md:text-3xl text-gradient-gold mb-2">
              {spread?.nameCN}
            </h1>
            <p className="text-[#8b889b]">塔罗牌已揭示它的智慧</p>
          </motion.div>
        </div>

        {/* Cards display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {cards.map((c, i) => (
              <motion.div
                key={`${c.card.id}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`
                  px-5 py-3 rounded-xl border text-center
                  ${c.isReversed
                    ? 'border-[#6b4c9a] bg-[#6b4c9a]/10'
                    : 'border-[#d4a853] bg-[#d4a853]/10'
                  }
                `}
              >
                <p className={`font-cinzel text-base mb-0.5 ${c.isReversed ? 'text-[#9d7cd8]' : 'text-[#f0c674]'}`}>
                  {c.card.nameCN}
                </p>
                <p className="text-xs text-[#8b889b]">
                  {spread?.positions[c.position]?.nameCN} · {c.isReversed ? '逆位' : '正位'}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interpretation Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#12121f]/80 rounded-2xl border border-[#6b4c9a]/30 p-1"
        >
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-8 h-8 text-[#9d7cd8]" />
              </motion.div>
              <p className="text-[#8b889b] mt-4">塔罗师正在连接...</p>
              <p className="text-[#6b4c9a] text-sm mt-2 italic">
                「宇宙的智慧正在流向你」
              </p>
            </div>
          )}

          {/* Streaming Reader */}
          {displayContent && (
            <StreamingReader
              text={displayContent}
              isStreaming={isStreaming}
            />
          )}
        </motion.div>

        {/* Status hint during streaming */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-3"
          >
            <p className="text-[#6b4c9a]/60 text-xs italic">
              正在解读中，请稍候...
            </p>
          </motion.div>
        )}

        {/* Actions */}
        {!isLoading && !isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-6 py-3 rounded-full border border-[#6b4c9a]/50 text-[#e8e6f0] hover:border-[#9d7cd8]/50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              重新抽取
            </button>

            <button
              onClick={handleChat}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#6b4c9a]/20 border border-[#6b4c9a]/50 text-[#9d7cd8] hover:bg-[#6b4c9a]/30 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              继续对话
            </button>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-[#6b4c9a] text-xs italic leading-relaxed max-w-md mx-auto">
            「塔罗牌并非预测命运，而是帮助你看见内心深处的想法与感受。
            真正的答案，始终在你心中。」
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-[#9d7cd8] animate-pulse" />
      </div>
    }>
      <ResultPageContent />
    </Suspense>
  );
}
