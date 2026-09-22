'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ParticleField } from '@/components/ui';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [chatContext, setChatContext] = useState<{
    spreadNameCN: string;
    cards: Array<{ nameCN: string; isReversed: boolean; positionMeaning: string }>;
    interpretation: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedContext = sessionStorage.getItem('chatContext');
    if (storedContext) {
      const context = JSON.parse(storedContext);
      setChatContext(context);
      const cardDescriptions = context.cards
        .map(c => `${c.nameCN}${c.isReversed ? '（逆位）' : ''} - ${c.positionMeaning}`)
        .join('、');
      const introMessage: Message = {
        id: 'init',
        role: 'assistant',
        content: `你好，我是塔罗灵犀的解读师。\n\n我看到你刚刚进行了「${context.spreadNameCN}」，抽到了：${cardDescriptions}。\n\n${context.interpretation.slice(0, 200)}${context.interpretation.length > 200 ? '...' : ''}\n\n这给你带来了什么思考？有什么想要深入探讨的，我都在这里静静倾听。`,
      };
      setMessages([introMessage]);
    } else {
      setMessages([{
        id: 'init',
        role: 'assistant',
        content: '你好，我是塔罗灵犀的解读师。\n\n刚才的牌阵是否给你带来了一些启发？有什么想要深入探讨的，或者任何困惑想要倾诉，我都在这里静静倾听。',
      }]);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const assistantId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStreamingId(assistantId);

    setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadContext: chatContext ? {
            spreadNameCN: chatContext.spreadNameCN,
            cards: chatContext.cards,
          } : null,
          history: messages,
          message: userMessage.content,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedContent += parsed.content;
                setMessages(prevMessages =>
                  prevMessages.map(msg =>
                    msg.id === assistantId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat Stream Error:', error);
      setMessages(prevMessages =>
        prevMessages.map(msg =>
          msg.id === assistantId
            ? { ...msg, content: '感应受阻，请稍后再试...' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      setStreamingId(null);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#12121f] to-[#0a0a12] z-0 pointer-events-none" />
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <ParticleField />
      </div>

      <header className="relative z-50 px-6 py-4 border-b border-[#6b4c9a]/20 bg-[#0a0a12]/90">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="relative z-50 inline-flex items-center gap-2 text-[#8b889b] hover:text-[#e8e6f0] transition-colors p-2 -ml-2 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-cinzel text-lg text-gradient-gold">塔罗对话</h1>
          <div className="w-8" />
        </div>
      </header>

      <div className="relative z-10 flex-1 max-w-3xl mx-auto w-full px-6 py-4 overflow-y-auto">
        <AnimatePresence>
          {messages.map((msg) => {
            const isAssistant = msg.role === 'assistant';
            const isStreaming = msg.id === streamingId && !msg.content;

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 mb-4 ${isAssistant ? 'justify-start' : 'justify-end'}`}
              >
                {isAssistant && (
                  <div className="w-8 h-8 rounded-full bg-[#6b4c9a]/30 flex items-center justify-center flex-shrink-0 border border-[#6b4c9a]/50">
                    <Sparkles className="w-4 h-4 text-[#9d7cd8]" />
                  </div>
                )}

                <div
                  className={`
                    max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${isAssistant
                      ? 'bg-[#12121f]/80 border border-[#6b4c9a]/30 text-[#e8e6f0]/90'
                      : 'bg-[#d4a853]/20 border border-[#d4a853]/30 text-[#e8e6f0]'
                    }
                  `}
                >
                  {isStreaming ? (
                    <div className="flex items-center gap-2 text-[#9d7cd8] text-sm py-1">
                      <span className="text-[#8b889b]">正捕捉命运的微光...</span>
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9d7cd8] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9d7cd8] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9d7cd8] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  ) : (
                    <>
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => <p className="leading-relaxed my-1">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-[#f0c674]">{children}</strong>,
                          em: ({ children }) => <em className="italic text-[#e8e6f0]/80">{children}</em>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-3 border-[#9d7cd8]/50 pl-3 my-2 text-[#e8e6f0]/80 italic">
                              {children}
                            </blockquote>
                          ),
                          ul: ({ children }) => <ul className="list-disc ml-4 my-1 text-[#e8e6f0]/85">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 my-1 text-[#e8e6f0]/85">{children}</ol>,
                          li: ({ children }) => <li className="my-0.5">{children}</li>,
                        }}
                      >
                        {msg.content || ''}
                      </ReactMarkdown>
                      {msg.id === streamingId && (
                        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#d4a853] animate-pulse align-middle" />
                      )}
                    </>
                  )}
                </div>

                {!isAssistant && (
                  <div className="w-8 h-8 rounded-full bg-[#d4a853]/20 flex items-center justify-center flex-shrink-0 border border-[#d4a853]/30">
                    <User className="w-4 h-4 text-[#d4a853]" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isLoading && !streamingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 mb-4"
          >
            <div className="w-8 h-8 rounded-full bg-[#6b4c9a]/30 flex items-center justify-center border border-[#6b4c9a]/50">
              <Sparkles className="w-4 h-4 text-[#9d7cd8]" />
            </div>
            <div className="bg-[#12121f]/80 border border-[#6b4c9a]/30 px-4 py-3 rounded-2xl">
              <div className="flex gap-1">
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="w-2 h-2 rounded-full bg-[#9d7cd8]"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  className="w-2 h-2 rounded-full bg-[#9d7cd8]"
                />
                <motion.div
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  className="w-2 h-2 rounded-full bg-[#9d7cd8]"
                />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="relative z-20 px-6 py-4 border-t border-[#6b4c9a]/20 bg-[#0a0a12]/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="分享你的想法或疑问..."
              disabled={isLoading}
              className="flex-1 bg-[#12121f]/80 border border-[#6b4c9a]/30 rounded-full px-5 py-3 text-[#e8e6f0] placeholder-[#8b889b] focus:outline-none focus:border-[#9d7cd8]/50 transition-colors"
            />
            <motion.button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-[#d4a853] to-[#f0c674]'
                  : 'bg-[#6b4c9a]/30'
                }
                transition-colors
              `}
            >
              <Send className={`w-5 h-5 ${input.trim() ? 'text-[#0a0a12]' : 'text-[#8b889b]'}`} />
            </motion.button>
          </div>
        </div>
      </div>
    </main>
  );
}
