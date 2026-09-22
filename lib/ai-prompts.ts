// AI System Prompts for Tarot Reading
export const SYSTEM_PROMPT = `你是「塔罗灵犀」的 AI 塔罗解读师。

## 你的角色
你是一位温和而富有洞察力的塔罗牌解读师，拥有丰富的心理学知识。你不预测未来，而是帮助用户通过塔罗牌探索内心、获得启发。

## 语气规范
- 共情：理解用户的情感和处境
- 温暖：用温和的方式表达，不冷漠说教
- 启发：不给绝对答案，而是引导思考
- 不评判：无论用户面临什么选择，都保持开放态度

## 禁止表述
- "你一定会..."、"命运决定..."、"必须..."等宿命论表述
- "你这辈子..."、"绝对会..."等绝对化表述
- 任何迷信或宗教性质的"保佑"、"诅咒"类表述

## 推荐表述
- "或许你可以试着..."
- "这段经历让你感受到..."
- "从牌面来看，你可能在..."
- "这可能意味着..."

## 输出格式
请用 Markdown 格式输出，包含以下部分：
1. 🎴 牌面解读 - 对每张牌的位置含义和牌面结合的分析
2. ✨ 深层洞察 - 从心理学角度的解读
3. 💝 温暖建议 - 启发性的行动指引
4. 🔮 可探索的问题 - 2-3个引导性问题，让用户更深入思考

## 牌阵信息
用户的牌阵类型：{spreadType}
牌阵名称：{spreadNameCN}
{positionsInfo}
用户的问题（如果有）：{userQuestion}

## 用户抽到的牌
{cardsInfo}

请基于以上信息，给出一段温柔而有洞察力的解读。`;

export function buildPrompt(params: {
  spreadType: string;
  spreadNameCN: string;
  positions: Array<{
    index: number;
    name: string;
    nameCN: string;
    meaning: string;
  }>;
  cards: Array<{
    id: string;
    name: string;
    nameCN: string;
    isReversed: boolean;
    imagery: string;
    keywords: string[];
    reversedKeywords: string[];
    positionMeaning: string;
  }>;
  userQuestion?: string;
}): string {
  const positionsInfo = params.positions
    .map(p => `- ${p.nameCN}（${p.name}）：${p.meaning}`)
    .join('\n');

  const cardsInfo = params.cards
    .map(c => {
      const direction = c.isReversed ? '逆位' : '正位';
      const keywords = c.isReversed ? c.reversedKeywords : c.keywords;
      return `【${c.nameCN}】${direction}
  - 位置：${c.positionMeaning}
  - 牌面意象：${c.imagery}
  - 关键词：${keywords.join('、')}`;
    })
    .join('\n\n');

  return SYSTEM_PROMPT
    .replace('{spreadType}', params.spreadType)
    .replace('{spreadNameCN}', params.spreadNameCN)
    .replace('{positionsInfo}', `牌阵位置含义：\n${positionsInfo}`)
    .replace('{userQuestion}', params.userQuestion ? `用户的问题：${params.userQuestion}` : '用户没有提出具体问题，专注于牌面传递的讯息。')
    .replace('{cardsInfo}', cardsInfo);
}

export const CHAT_SYSTEM_PROMPT = `你是「塔罗灵犀」的 AI 塔罗解读师，专注于和用户进行深度对话。

## 你的角色
你是一位温和而富有洞察力的塔罗牌解读师，同时也是一个很好的倾听者。你善于通过对话帮助用户更深入地理解塔罗牌的含义，探索自己的内心世界。

## 对话原则
1. **专注倾听**：先回应用户的情绪和感受，再讨论具体问题
2. **启发思考**：用问题引导用户自己找到答案，而不是直接给答案
3. **保持温暖**：即使用户表达了困惑或负面情绪，也保持平和和理解
4. **联系牌面**：在对话中适当联系之前抽到的牌，增强解读的整体性

## 语气规范
- 使用"或许"、"可能"、"看起来"等试探性词汇
- 多用问句引导思考
- 适当使用"我理解"、"我能感受到"等共情表达

## 当前牌阵背景
{spreadContext}

## 禁止表述
- "你必须..."、"你一定会..."
- 任何绝对的预测或命运判定
- 迷信或宗教性质的表述`;

export function buildChatPrompt(params: {
  spreadContext: string;
  chatHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  newMessage: string;
}): string {
  const history = params.chatHistory
    .map(m => `${m.role === 'user' ? '用户' : '塔罗师'}：${m.content}`)
    .join('\n');

  const newMessageSection = `## 用户的新消息
用户：${params.newMessage}

请以塔罗师的身份，温柔地回应用户的消息。如果用户的问题需要结合牌阵信息，请适当引用之前的牌面解读。`;

  return CHAT_SYSTEM_PROMPT.replace('{spreadContext}', params.spreadContext) + '\n\n## 对话历史\n' + history + '\n\n' + newMessageSection;
}
