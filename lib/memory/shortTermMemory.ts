import redis from '@/lib/redis';

const SHORT_MEMORY_PREFIX = 'memory:short';
const GUEST_SESSION_PREFIX = 'guest:session';
const SHORT_MEMORY_TTL = 86400; // 24小时（正式用户）
const GUEST_SESSION_TTL = 604800; // 7天（游客）

export interface MemoryEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * 获取短期记忆 Key
 */
function getShortMemoryKey(userId: string, sessionId: string): string {
  return `${SHORT_MEMORY_PREFIX}:${userId}:${sessionId}`;
}

/**
 * 获取游客会话 Key
 */
function getGuestSessionKey(guestId: string): string {
  return `${GUEST_SESSION_PREFIX}:${guestId}`;
}

/**
 * 写入短期记忆
 */
export async function pushShortMemory(
  userId: string,
  sessionId: string,
  entry: MemoryEntry,
  isGuest: boolean = false
): Promise<void> {
  const key = getShortMemoryKey(userId, sessionId);
  const ttl = isGuest ? GUEST_SESSION_TTL : SHORT_MEMORY_TTL;

  await redis.rpush(key, JSON.stringify(entry));
  await redis.expire(key, ttl);
}

/**
 * 读取短期记忆（最近 N 条）
 */
export async function getShortMemory(
  userId: string,
  sessionId: string,
  limit: number = 6
): Promise<MemoryEntry[]> {
  const key = getShortMemoryKey(userId, sessionId);
  const entries = await redis.lrange(key, -limit, -1);
  return entries.map((e) => JSON.parse(e) as MemoryEntry);
}

/**
 * 获取短期记忆总数
 */
export async function getShortMemoryCount(
  userId: string,
  sessionId: string
): Promise<number> {
  const key = getShortMemoryKey(userId, sessionId);
  return redis.llen(key);
}

/**
 * 创建或更新游客会话信息
 */
export async function upsertGuestSession(
  guestId: string,
  data: { lastActive?: number; cardHistoryCount?: number }
): Promise<void> {
  const key = getGuestSessionKey(guestId);
  const now = Date.now();

  await redis.hset(key, {
    created_at: redis.hget(key, 'created_at').then((v) => v || now.toString()),
    last_active: (data.lastActive || now).toString(),
    ...(data.cardHistoryCount !== undefined
      ? { card_history_count: data.cardHistoryCount.toString() }
      : {}),
  });
  await redis.expire(key, GUEST_SESSION_TTL);
}

/**
 * 获取游客会话信息
 */
export async function getGuestSession(
  guestId: string
): Promise<{ createdAt: number; lastActive: number; cardHistoryCount: number } | null> {
  const key = getGuestSessionKey(guestId);
  const data = await redis.hgetall(key);

  if (!data || Object.keys(data).length === 0) {
    return null;
  }

  return {
    createdAt: parseInt(data.created_at || '0'),
    lastActive: parseInt(data.last_active || '0'),
    cardHistoryCount: parseInt(data.card_history_count || '0'),
  };
}

/**
 * 删除短期记忆 Key（用于游客合并时）
 */
export async function deleteShortMemory(userId: string, sessionId: string): Promise<void> {
  const key = getShortMemoryKey(userId, sessionId);
  await redis.del(key);
}

/**
 * 重命名短期记忆 Key（用于游客合并到正式账号）
 */
export async function renameShortMemoryKey(
  fromUserId: string,
  toUserId: string,
  sessionId: string
): Promise<void> {
  const fromKey = getShortMemoryKey(fromUserId, sessionId);
  const toKey = getShortMemoryKey(toUserId, sessionId);
  await redis.rename(fromKey, toKey);
}

/**
 * 获取用户所有短期记忆 Key（用于合并时查找所有会话）
 */
export async function getAllShortMemoryKeys(userId: string): Promise<string[]> {
  return redis.keys(`${SHORT_MEMORY_PREFIX}:${userId}:*`);
}
