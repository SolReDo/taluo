'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SingleCardReader } from '@/components/tarot';
import { ParticleField } from '@/components/ui';
import { useSingleCardStore } from '@/store';

export default function SingleCardPage() {
  const router = useRouter();
  const { setUserQuestion } = useSingleCardStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize question from sessionStorage if not already set
    const storedQuestion = sessionStorage.getItem('userQuestion');
    if (storedQuestion) {
      setUserQuestion(storedQuestion);
    }
    setIsReady(true);
  }, [setUserQuestion]);

  // Show loading while initializing
  if (!isReady) {
    return (
      <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 bg-[#0a0a12] z-0" />
        <p className="text-[#8b889b]">加载中...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 bg-[#0a0a12] z-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12] via-[#12121f] to-[#0a0a12] z-1" />
      <div className="absolute inset-0 z-2 pointer-events-none">
        <ParticleField />
      </div>

      {/* Back button */}
      <button
        onClick={() => router.push('/reading')}
        className="absolute top-6 left-6 z-[100] inline-flex items-center gap-2 text-[#8b889b] hover:text-[#e8e6f0] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回选择
      </button>

      {/* SingleCardReader handles all layout internally */}
      <SingleCardReader />
    </main>
  );
}
