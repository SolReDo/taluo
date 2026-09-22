import { NextRequest, NextResponse } from 'next/server';
import { generateTarotInterpretation } from '@/lib/memory/tarotMemoryEngine';

interface InterpretBody {
  userId: string;
  sessionId: string;
  userQuestion: string;
  cardArray: Array<{
    cardId: string;
    cardName: string;
    cardNameCN: string;
    keywords: string[];
    reversedKeywords: string[];
    imagery: string;
    isReversed: boolean;
    position: number;
  }>;
  isGuest: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: InterpretBody = await request.json();
    const { userId, sessionId, userQuestion, cardArray, isGuest } = body;

    if (!userId || !sessionId || !userQuestion || !cardArray) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 生成解读（带记忆注入）
    const interpretation = await generateTarotInterpretation({
      userId,
      sessionId,
      userQuestion,
      cardArray,
      isGuest,
    });

    return NextResponse.json({
      success: true,
      data: { interpretation },
    });
  } catch (error) {
    console.error('Interpret error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate interpretation' },
      { status: 500 }
    );
  }
}
