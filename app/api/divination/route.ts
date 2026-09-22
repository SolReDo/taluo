import { buildPrompt } from '@/lib/ai-prompts';
import { getSpreadById, getCardById } from '@/lib/tarot-data';

// Request body type
interface DivinationRequest {
  spreadType: string;
  cards: Array<{
    id: string;
    isReversed: boolean;
    position: number;
  }>;
  userQuestion?: string;
}

// POST /api/divination - AI 解牌 (Streaming)
export async function POST(req: Request) {
  try {
    const body: DivinationRequest = await req.json();
    const { spreadType, cards, userQuestion } = body;

    console.log('=== Divination Request ===');
    console.log('spreadType:', spreadType);
    console.log('cards:', cards);

    // Validate
    if (!spreadType || !cards || cards.length === 0) {
      return new Response(JSON.stringify({ error: '缺少必要的解牌参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get spread definition
    const spread = getSpreadById(spreadType);
    if (!spread) {
      return new Response(JSON.stringify({ error: '未知的牌阵类型' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build cards info with full card data
    const cardsInfo = cards.map(c => {
      const card = getCardById(c.id);
      const position = spread.positions.find(p => p.index === c.position);
      return {
        id: c.id,
        name: card?.name || c.id,
        nameCN: card?.nameCN || c.id,
        isReversed: c.isReversed,
        imagery: card?.imagery || '',
        keywords: c.isReversed ? (card?.reversedKeywords || []) : (card?.keywords || []),
        reversedKeywords: card?.reversedKeywords || [],
        positionMeaning: position?.meaning || position?.nameCN || `位置 ${c.position}`,
      };
    });

    // Build prompt
    const prompt = buildPrompt({
      spreadType,
      spreadNameCN: spread.nameCN,
      positions: spread.positions,
      cards: cardsInfo,
      userQuestion,
    });

    // Direct fetch to MiniMax API (OpenAI-compatible)
    const apiKey = process.env.MINIMAX_API_KEY;
    const apiUrl = process.env.MINIMAX_API_URL || 'https://api.minimaxi.com/v1/text/chatcompletion_v2';
    const model = process.env.MINIMAX_MODEL || 'MiniMax-M2.7';

    console.log('=== Calling MiniMax API (Streaming) ===');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API returned ${response.status}`);
    }

    // Create a ReadableStream to stream the response
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
                    // Skip invalid JSON
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
    console.error('=== Divination Error ===');
    console.error('Error:', error?.message || error);

    return new Response(JSON.stringify({ error: '解牌服务暂时不可用，请稍后重试' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
