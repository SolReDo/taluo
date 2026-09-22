import { buildChatPrompt } from '@/lib/ai-prompts';

// Request body type
interface ChatRequest {
  spreadContext: {
    spreadNameCN: string;
    cards: Array<{
      nameCN: string;
      isReversed: boolean;
      positionMeaning: string;
    }>;
  };
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  message: string;
}

// POST /api/chat - 追问对话 (Streaming)
export async function POST(req: Request) {
  try {
    const body: ChatRequest = await req.json();
    const { spreadContext, history, message } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: '消息内容不能为空' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build context string
    const context = `牌阵：${spreadContext.spreadNameCN}
抽到的牌：${spreadContext.cards
      .map(c => `${c.nameCN}${c.isReversed ? '（逆位）' : ''} - ${c.positionMeaning}`)
      .join('、')}`;

    // Build prompt
    const prompt = buildChatPrompt({
      spreadContext: context,
      chatHistory: history,
      newMessage: message,
    });

    // Direct fetch to MiniMax API (OpenAI-compatible) with streaming
    const apiKey = process.env.MINIMAX_API_KEY;
    const apiUrl = process.env.MINIMAX_API_URL || 'https://api.minimaxi.com/v1/text/chatcompletion_v2';
    const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.7';

    console.log('=== Chat API - Calling MiniMax (Streaming) ===');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 1500,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API returned ${response.status}`);
    }

    // Create a ReadableStream to forward the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.close();
          return;
        }

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(new TextEncoder().encode('data: [DONE]\n'));
                } else {
                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content })}\n`));
                    }
                  } catch (e) {
                    // Skip invalid JSON lines
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error('Stream error:', e);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Chat error:', error);
    return new Response(JSON.stringify({ error: '对话服务暂时不可用，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
