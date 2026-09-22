'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { spreads, SpreadDefinition } from '@/lib/tarot-data';

export default function ReadingPage() {
  const router = useRouter();
  const [selectedSpread, setSelectedSpread] = useState<SpreadDefinition | null>(null);

  const handleSelectSpread = (spread: SpreadDefinition) => {
    setSelectedSpread(spread);
    // Navigate based on spread type - single uses new state machine
    if (spread.id === 'single') {
      router.push('/reading/single');
    } else {
      router.push(`/reading/spread?type=${spread.id}`);
    }
  };

  return (
    <main className="min-h-screen px-6 py-12">
      {/* Back button - fixed position */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-6 left-6 z-[100] inline-flex items-center gap-2 text-[#8b889b] hover:text-[#e8e6f0] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </button>

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-12 mt-12">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="font-cinzel text-3xl md:text-4xl font-semibold text-gradient-gold mb-4">
            选择你的牌阵
          </h1>
          <p className="text-[#8b889b] text-lg">
            每一种牌阵都像一面镜子，映照不同的内心角落
          </p>
        </motion.div>
      </div>

      {/* Spread grid */}
      <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2">
        {spreads.map((spread, index) => (
          <motion.div
            key={spread.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <button
              onClick={() => handleSelectSpread(spread)}
              className="w-full text-left p-6 rounded-2xl bg-[#12121f]/80 border border-[#6b4c9a]/20 hover:border-[#9d7cd8]/50 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-cinzel text-xl text-[#e8e6f0] group-hover:text-gradient-gold transition-all mb-1">
                    {spread.nameCN}
                  </h2>
                  <p className="text-[#8b889b] text-sm">{spread.name}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#6b4c9a]/20 flex items-center justify-center group-hover:bg-[#6b4c9a]/40 transition-colors">
                  <Sparkles className="w-5 h-5 text-[#9d7cd8]" />
                </div>
              </div>

              <p className="text-[#e8e6f0]/70 mb-4 leading-relaxed">
                {spread.description}
              </p>

              <div className="flex items-center gap-2 text-[#d4a853] text-sm">
                <span className="w-6 h-px bg-[#d4a853]/50" />
                {spread.cardCount} 张牌
              </div>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Bottom tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-2xl mx-auto mt-16 text-center"
      >
        <p className="text-[#8b889b] text-sm italic">
          「不必紧张，没有所谓的错误选择。跟随你的直觉，牌会指引你到需要的地方。」
        </p>
      </motion.div>
    </main>
  );
}
