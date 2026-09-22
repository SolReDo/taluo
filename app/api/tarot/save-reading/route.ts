import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/mysql';
import { v4 as uuidv4 } from 'uuid';

interface SaveReadingBody {
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
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveReadingBody = await request.json();
    const { userId, sessionId, spreadType, cardArray, userQuestion, aiInterpretation } = body;

    // 验证必填字段
    if (!userId || !sessionId || !spreadType || !cardArray || !userQuestion) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const id = uuidv4();

    // 保存到 MySQL
    await query(
      `INSERT INTO archived_tarot_logs
       (id, user_id, session_id, spread_type, card_array, user_question, ai_interpretation, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, userId, sessionId, spreadType, JSON.stringify(cardArray), userQuestion, aiInterpretation]
    );

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('Save reading error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save reading' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    const logs = await query<Array<{
      id: string;
      session_id: string;
      spread_type: string;
      card_array: string;
      user_question: string;
      ai_interpretation: string;
      created_at: Date;
    }>>(
      `SELECT id, session_id, spread_type, card_array, user_question, ai_interpretation, created_at
       FROM archived_tarot_logs
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    // 解析 card_array JSON
    const parsedLogs = logs.map((log) => ({
      ...log,
      card_array: JSON.parse(log.card_array as unknown as string),
    }));

    return NextResponse.json({
      success: true,
      data: parsedLogs,
    });
  } catch (error) {
    console.error('Get readings error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get readings' },
      { status: 500 }
    );
  }
}
