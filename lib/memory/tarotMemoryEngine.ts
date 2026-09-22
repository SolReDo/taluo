import { chatCompletion } from '@/lib/minimax';
import { getShortMemory } from '@/lib/memory/shortTermMemory';
import { searchLongTermMemory } from '@/lib/memory/longTermMemory';
import { MemoryEntry } from '@/lib/memory/shortTermMemory';

interface CardResult {
  cardId: string;
  cardName: string;
  cardNameCN: string;
  keywords: string[];
  reversedKeywords: string[];
  imagery: string;
  isReversed: boolean;
  position: number;
}

interface GenerateInterpretationParams {
  userId: string;
  sessionId: string;
  userQuestion: string;
  cardArray: CardResult[];
  isGuest: boolean;
}

/**
 * 生成塔罗解读（带记忆注入）
 */
export async function generateTarotInterpretation({
  userId,
  sessionId,
  userQuestion,
  cardArray,
  isGuest,
}: GenerateInterpretationParams): Promise<string> {
  // 1. 获取短期记忆（近 6 轮对话）
  const shortMemory = isGuest
    ? []
    : await getShortMemory(userId, sessionId, 6);

  // 2. 获取长期记忆（仅正式用户）
  const longTermFacts = isGuest
    ? []
    : await searchLongTermMemory(userId, userQuestion, 3);

  // 3. 构建 System Prompt
  const systemPrompt = buildSystemPrompt(shortMemory, longTermFacts);

  // 4. 构建用户消息
  const userMessage = buildUserMessage(userQuestion, cardArray);

  // 5. 调用 LLM
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...shortMemory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];

  // Use default model from minimax.ts
  const interpretation = await chatCompletion(messages, undefined, 0.7);

  return interpretation;
}

/**
 * 构建 System Prompt
 */
function buildSystemPrompt(
  shortMemory: MemoryEntry[],
  longTermFacts: Array<{ category: string; memoryFact: string }>
): string {
  const longTermSection =
    longTermFacts.length > 0
      ? `【关于求问者的长期了解】：\n${longTermFacts.map((f) => `- ${f.memoryFact}`).join('\n')}`
      : '【关于求问者的长期了解】：暂无相关信息';

  const shortTermSection =
    shortMemory.length > 0
      ? `【近期对话上下文】：\n${shortMemory.map((m) => `${m.role === 'user' ? '用户' : '占卜师'}：${m.content}`).join('\n')}`
      : '';

  return `你是一位专业且富有共情力的塔罗占卜师，擅长通过塔罗牌帮助求问者探索内心、获得指引。

${longTermSection}
${shortTermSection ? '\n\n' + shortTermSection : ''}

请结合以上对求问者的了解（如果有），以及本次抽出的牌阵，用温暖、专业且富有洞察力的语言回答求问者的疑问。
解读时注意：
1. 先解读牌面含义，再结合问者的具体情况给出建议
2. 正位和逆位要有区分，逆位通常表示能量受阻或需要关注的课题
3. 语言要温暖但不失专业，给求问者力量而非宿命论
4. 牌阵中的位置关系也很重要，反映问题的时间维度或因果关系`;
}

/**
 * 构建用户消息
 */
function buildUserMessage(
  userQuestion: string,
  cardArray: CardResult[]
): string {
  const cardsDescription = cardArray
    .map((c) => {
      const position = c.position === 0 ? '核心位置' : `位置 ${c.position + 1}`;
      const reverserMark = c.isReversed ? '（逆位）' : '（正位）';
      return `${position}：${c.cardNameCN} ${c.cardName}${reverserMark}\n  关键词：${c.isReversed ? c.reversedKeywords.join('、') : c.keywords.join('、')}\n  牌面意象：${c.imagery}`;
    })
    .join('\n\n');

  return `【求问者的问题】：${userQuestion}

【本次抽出的牌阵】：
${cardsDescription}

请根据以上信息，给出详细的塔罗解读。`;
}
