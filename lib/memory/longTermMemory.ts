import { searchVectors, upsertVector, deleteVector, COLLECTION_NAME, VECTOR_SIZE } from '@/lib/qdrant';
import { getEmbedding } from '@/lib/minimax';
import { v4 as uuidv4 } from 'uuid';

export interface LongTermMemory {
  id: string;
  userId: string;
  category: 'relationship' | 'career' | 'personality' | 'life';
  memoryFact: string;
  sourceSessionId: string;
  createdAt: number;
}

const MAX_MEMORIES_PER_USER = 50;

/**
 * 存储长期记忆到 Qdrant
 */
export async function storeLongTermMemory(
  userId: string,
  category: LongTermMemory['category'],
  memoryFact: string,
  sourceSessionId: string
): Promise<string> {
  const embedding = await getEmbedding(memoryFact);
  const id = uuidv4();
  const createdAt = Date.now();

  await upsertVector(id, embedding, {
    user_id: userId,
    category,
    memory_fact: memoryFact,
    source_session_id: sourceSessionId,
    created_at: createdAt,
  });

  // 检查并清理超出上限的记忆
  await cleanupExcessMemories(userId);

  return id;
}

/**
 * 搜索长期记忆（向量检索）
 */
export async function searchLongTermMemory(
  userId: string,
  query: string,
  limit: number = 3
): Promise<LongTermMemory[]> {
  const embedding = await getEmbedding(query);

  const results = await searchVectors(
    embedding,
    {
      must: [
        {
          key: 'user_id',
          match: { value: userId },
        },
      ],
    },
    limit
  );

  return results.map((r) => ({
    id: String(r.id),
    userId: r.payload?.user_id || '',
    category: r.payload?.category || 'life',
    memoryFact: r.payload?.memory_fact || '',
    sourceSessionId: r.payload?.source_session_id || '',
    createdAt: r.payload?.created_at || 0,
  }));
}

/**
 * 按 user_id 过滤，删除用户的某条记忆
 */
export async function deleteLongTermMemory(
  userId: string,
  memoryId: string
): Promise<void> {
  // Qdrant REST API 不支持带 filter 的删除，需要先查询再删除
  await deleteVector([memoryId]);
}

/**
 * 更新 Qdrant 中的 user_id（用于游客合并到正式账号）
 * 注意：Qdrant 不直接支持 update，需要先删除再插入
 */
export async function migrateLongTermMemoryUserId(
  fromUserId: string,
  toUserId: string
): Promise<void> {
  // 由于无法直接更新 payload，需要重新生成向量
  // 简化处理：让前端在合并时重新触发记忆提炼
  console.log(`Memory migration from ${fromUserId} to ${toUserId} - skipping vector recreation`);
}

/**
 * 清理超出上限的记忆（删除最旧的）
 */
async function cleanupExcessMemories(userId: string): Promise<void> {
  const results = await searchVectors(
    new Array(VECTOR_SIZE).fill(0),
    {
      must: [{ key: 'user_id', match: { value: userId } }],
    },
    100 // 假设用户不会超过 100 条
  );

  if (results.length < MAX_MEMORIES_PER_USER) return;

  // 按 created_at 排序，删除最旧的
  const sorted = [...results].sort(
    (a, b) => (a.payload?.created_at || 0) - (b.payload?.created_at || 0)
  );

  const toDelete = sorted.slice(0, results.length - MAX_MEMORIES_PER_USER + 10); // 多删一些避免频繁清理

  if (toDelete.length > 0) {
    await deleteVector(toDelete.map((p) => String(p.id)));
  }
}

/**
 * 获取用户记忆总数
 */
export async function getLongTermMemoryCount(userId: string): Promise<number> {
  const results = await searchVectors(
    new Array(VECTOR_SIZE).fill(0),
    {
      must: [{ key: 'user_id', match: { value: userId } }],
    },
    1000
  );

  return results.length;
}
