'use client';

import { useCallback, useEffect } from 'react';
import { useMemoryStore, generateSessionId } from '@/store/memoryStore';
import { useSingleCardStore } from '@/store/singleCardStore';

const API_BASE = '/api';

/**
 * 初始化游客身份
 */
export async function initGuest(): Promise<{
  guestId: string;
  isNewGuest: boolean;
}> {
  const res = await fetch(`${API_BASE}/auth/guest-init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

/**
 * 保存占卜记录
 */
export async function saveReading(data: {
  userId: string;
  sessionId: string;
  spreadType: string;
  cardArray: Array<{
    cardId: string;
    cardName: string;
    isReversed: boolean;
    position: number;
  }>;
  userQuestion: string;
  aiInterpretation: string;
}): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/tarot/save-reading`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

/**
 * 保存短期记忆
 */
export async function pushShortMemory(
  userId: string,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  isGuest: boolean = false
): Promise<void> {
  await fetch(`${API_BASE}/memory/short`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, sessionId, role, content, isGuest }),
  });
}

/**
 * 获取短期记忆
 */
export async function getShortMemory(
  userId: string,
  sessionId: string
): Promise<Array<{ role: string; content: string; timestamp: number }>> {
  const res = await fetch(
    `${API_BASE}/memory/short?userId=${userId}&sessionId=${sessionId}`
  );
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

/**
 * 搜索长期记忆
 */
export async function searchLongMemory(
  userId: string,
  query: string
): Promise<
  Array<{
    id: string;
    category: string;
    memoryFact: string;
    sourceSessionId: string;
  }>
> {
  const res = await fetch(`${API_BASE}/memory/long/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, query }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data;
}

/**
 * useMemory Hook - 管理记忆生命周期
 */
export function useMemory() {
  const { userId, sessionId, isGuest, isInitialized, setUser } = useMemoryStore();
  const { userQuestion } = useSingleCardStore();

  // 初始化游客身份
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    try {
      const storedUserId = localStorage.getItem('taluo_user_id');
      const storedSessionId = localStorage.getItem('taluo_session_id');

      if (storedUserId && storedSessionId) {
        // 恢复已有会话
        setUser(storedUserId, storedSessionId, true);
      } else {
        // 创建新游客
        const { guestId } = await initGuest();
        const newSessionId = generateSessionId();
        setUser(guestId, newSessionId, true);

        // 持久化
        localStorage.setItem('taluo_user_id', guestId);
        localStorage.setItem('taluo_session_id', newSessionId);
      }
    } catch (error) {
      console.error('Failed to initialize memory:', error);
    }
  }, [isInitialized, setUser]);

  // 组件挂载时初始化
  useEffect(() => {
    initialize();
  }, [initialize]);

  // 会话开始时记录用户问题
  const recordQuestion = useCallback(
    async (question: string) => {
      if (!userId || !sessionId) return;

      await pushShortMemory(userId, sessionId, 'user', question, isGuest);
    },
    [userId, sessionId, isGuest]
  );

  // 解读完成后记录 AI 回复
  const recordInterpretation = useCallback(
    async (interpretation: string) => {
      if (!userId || !sessionId) return;

      await pushShortMemory(userId, sessionId, 'assistant', interpretation, isGuest);
    },
    [userId, sessionId, isGuest]
  );

  return {
    userId,
    sessionId,
    isGuest,
    isInitialized,
    recordQuestion,
    recordInterpretation,
  };
}
