import { chatCompletion } from '@/lib/minimax';
import { pushShortMemory, getShortMemory, MemoryEntry } from './shortTermMemory';
import { storeLongTermMemory, LongTermMemory } from './longTermMemory';

const EXTRACTION_PROMPT = `你是一个严谨的数据提取助手。请分析以下塔罗牌占卜对话，提炼出关于用户的"长期有效个人事实"。

提取规则：
1. 只提取用户主动透露的客观事实（如：感情状态、工作岗位、星座、性格倾向、核心困扰）。
2. 不要提取任何关于塔罗牌解读的推测性结论。
3. 如果没有提取到新的有效个人事实，请输出 EMPTY。
4. 每条事实输出为独立的简短单句，JSON 数组格式。

对话内容：
{DIALOGUE}

输出格式示例：
[
  "用户目前处于失业求职状态，重点关注互联网行业",
  "用户与对象异地恋 2 年，目前处于感情冷淡期"
]`;

/**
 * 判断是否需要提炼长期记忆
 * 每积累 3 轮对话触发一次
 */
export async function shouldExtractLongTermMemory(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const count = await getShortMemoryCount(userId, sessionId);
  // 每 3 轮对话触发一次（奇数轮时触发：3, 6, 9...）
  return count > 0 && count % 3 === 0;
}

function getShortMemoryCount(
  userId: string,
  sessionId: string
): Promise<number> {
  // 动态导入避免循环依赖
  const { getShortMemoryCount: getCount } = require('./shortTermMemory');
  return getCount(userId, sessionId);
}

/**
 * 提炼对话中的长期记忆
 */
export async function extractLongTermMemory(
  userId: string,
  sessionId: string
): Promise<LongTermMemory[]> {
  // 1. 获取近 6 轮对话
  const memory = await getShortMemory(userId, sessionId, 6);

  if (memory.length === 0) {
    return [];
  }

  // 2. 构建对话文本
  const dialogueText = memory
    .map((m) => `${m.role === 'user' ? '用户' : '占卜师'}：${m.content}`)
    .join('\n');

  // 3. 调用 LLM 提炼
  const prompt = EXTRACTION_PROMPT.replace('{DIALOGUE}', dialogueText);

  try {
    const result = await chatCompletion(
      [{ role: 'user', content: prompt }],
      'abab6.5s',
      0.3 // 低温度，保持事实提取的确定性
    );

    // 4. 解析结果
    const trimmed = result.trim();

    if (trimmed === 'EMPTY' || !trimmed.startsWith('[')) {
      return [];
    }

    let facts: string[];
    try {
      facts = JSON.parse(trimmed);
    } catch {
      return [];
    }

    if (!Array.isArray(facts) || facts.length === 0) {
      return [];
    }

    // 5. 存储到 Qdrant
    const stored: LongTermMemory[] = [];

    for (const fact of facts) {
      if (typeof fact !== 'string' || fact.trim().length < 5) {
        continue;
      }

      // 判断类别（简单规则，后续可优化）
      let category: LongTermMemory['category'] = 'life';
      const lowerFact = fact.toLowerCase();
      if (lowerFact.includes('恋爱') || lowerFact.includes('分手') || lowerFact.includes('前任') || lowerFact.includes('感情')) {
        category = 'relationship';
      } else if (lowerFact.includes('工作') || lowerFact.includes('职业') || lowerFact.includes('面试') || lowerFact.includes('辞职')) {
        category = 'career';
      } else if (lowerFact.includes('性格') || lowerFact.includes('星座') || lowerFact.includes('MBTI')) {
        category = 'personality';
      }

      const id = await storeLongTermMemory(userId, category, fact.trim(), sessionId);
      stored.push({
        id,
        userId,
        category,
        memoryFact: fact.trim(),
        sourceSessionId: sessionId,
        createdAt: Date.now(),
      });
    }

    return stored;
  } catch (error) {
    console.error('Failed to extract long term memory:', error);
    return [];
  }
}

/**
 * 异步触发长期记忆提炼（不阻塞主流程）
 */
export async function triggerMemoryExtraction(
  userId: string,
  sessionId: string
): Promise<void> {
  // 延迟执行，避免阻塞响应
  setTimeout(async () => {
    try {
      const should = await shouldExtractLongTermMemory(userId, sessionId);
      if (should) {
        await extractLongTermMemory(userId, sessionId);
      }
    } catch (error) {
      console.error('Memory extraction failed:', error);
    }
  }, 1000);
}
