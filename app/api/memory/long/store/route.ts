import { NextRequest, NextResponse } from 'next/server';
import { storeLongTermMemory } from '@/lib/memory/longTermMemory';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, category, memoryFact, sourceSessionId } = body;

    if (!userId || !category || !memoryFact || !sourceSessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const validCategories = ['relationship', 'career', 'personality', 'life'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    const id = await storeLongTermMemory(
      userId,
      category,
      memoryFact,
      sourceSessionId
    );

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error) {
    console.error('Store long memory error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to store long memory' },
      { status: 500 }
    );
  }
}
