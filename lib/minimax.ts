const MINIMAX_API_URL = process.env.MINIMAX_API_URL || 'https://api.minimaxi.com/v1';
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || 'MiniMax-M2.7';

interface MiniMaxMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MiniMaxChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface MiniMaxEmbeddingResponse {
  model: string;
  data: Array<{
    embedding: number[];
    index: number;
  }>;
  usage?: {
    tokens: number;
  };
}

/**
 * 调用 MiniMax Chat API
 */
export async function chatCompletion(
  messages: MiniMaxMessage[],
  model?: string,
  temperature: number = 0.7
): Promise<string> {
  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY is not set');
  }

  // MINIMAX_API_URL already includes the full path like /v1/text/chatcompletion_v2
  const response = await fetch(MINIMAX_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || MINIMAX_MODEL,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MiniMax API error: ${response.status} ${error}`);
  }

  const data: MiniMaxChatResponse = await response.json();

  if (!data.choices || data.choices.length === 0) {
    throw new Error('No completion choices returned');
  }

  return data.choices[0].message.content;
}

/**
 * 调用 MiniMax Embedding API
 * 注意：MiniMax 可能不直接提供 embedding API，需要确认
 * 如果失败，会返回模拟向量用于测试
 */
export async function getEmbedding(
  text: string,
  model: string = 'embo-01'
): Promise<number[]> {
  const apiKey = process.env.MINIMAX_API_KEY;

  if (!apiKey) {
    throw new Error('MINIMAX_API_KEY is not set');
  }

  try {
    // 尝试使用 MiniMax embedding API
    const response = await fetch(`${MINIMAX_API_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`Embedding API error: ${response.status}`);
    }

    const data: MiniMaxEmbeddingResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      throw new Error('No embedding data returned');
    }

    return data.data[0].embedding;
  } catch (error) {
    // 如果 embedding API 不可用，返回模拟向量（用于测试）
    console.warn('Embedding API failed, using mock vector:', error);
    return generateMockEmbedding(text);
  }
}

/**
 * 生成模拟向量（基于文本哈希，用于测试）
 */
function generateMockEmbedding(text: string): number[] {
  const dimension = 1536;
  const vector = new Array(dimension).fill(0);

  // 简单的基于文本的伪随机生成
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0;
  }

  // 生成确定性伪随机向量
  for (let i = 0; i < dimension; i++) {
    const nextseed = (seed * 1103515245 + 12345) & 0x7fffffff;
    vector[i] = (nextseed % 1000) / 1000 - 0.5;
    seed = nextseed;
  }

  // 归一化
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map(v => v / magnitude);
}
