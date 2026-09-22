'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MemoryState {
  // 用户身份
  userId: string | null;
  sessionId: string | null;
  isGuest: boolean;
  isInitialized: boolean;

  // 设置用户身份
  setUser: (userId: string, sessionId: string, isGuest: boolean) => void;

  // 重置
  reset: () => void;
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set) => ({
      userId: null,
      sessionId: null,
      isGuest: true,
      isInitialized: false,

      setUser: (userId, sessionId, isGuest) =>
        set({
          userId,
          sessionId,
          isGuest,
          isInitialized: true,
        }),

      reset: () =>
        set({
          userId: null,
          sessionId: null,
          isGuest: true,
          isInitialized: false,
        }),
    }),
    {
      name: 'taluo-memory-storage',
      partialize: (state) => ({
        userId: state.userId,
        sessionId: state.sessionId,
        isGuest: state.isGuest,
        isInitialized: state.isInitialized,
      }),
    }
  )
);

// 工具函数：生成 sessionId
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
