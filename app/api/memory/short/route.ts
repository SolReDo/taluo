import { NextRequest, NextResponse } from 'next/server';
import {
  pushShortMemory,
  getShortMemory,
  MemoryEntry,
} from '@/lib/memory/shortTermMemory';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '6');

    if (!userId || !sessionId) {
      return NextResponse.json(
        { success: false, error: 'userId and sessionId are required' },
        { status: 400 }
      );
    }

    const memory = await getShortMemory(userId, sessionId, limit);

    return NextResponse.json({
      success: true,
      data: memory,
    });
  } catch (error) {
    console.error('Get short memory error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get short memory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, sessionId, role, content, isGuest } = body;

    if (!userId || !sessionId || !role || !content) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role !== 'user' && role !== 'assistant') {
      return NextResponse.json(
        { success: false, error: 'role must be user or assistant' },
        { status: 400 }
      );
    }

    const entry: MemoryEntry = {
      role,
      content,
      timestamp: Date.now(),
    };

    await pushShortMemory(userId, sessionId, entry, isGuest || false);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Push short memory error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to push short memory' },
      { status: 500 }
    );
  }
}
