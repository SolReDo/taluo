import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/ui/Header';

export const metadata: Metadata = {
  title: '塔罗灵犀 - 探索内心，照见未来',
  description: '一款基于 AI 的塔罗牌心理探索与情绪陪伴产品',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-[#0a0a12] text-[#e8e6f0] antialiased">
        <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a12] via-[#12121f] to-[#0a0a12]" />
        <div className="relative z-10">
          <Header />
          {children}
        </div>
      </body>
    </html>
  );
}
