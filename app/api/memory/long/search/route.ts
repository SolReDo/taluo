import { NextRequest, NextResponse } from 'next/server';
import { searchLongTermMemory } from '@/lib/memory/longTermMemory';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, query: searchQuery, limit } = body;

    if (!userId || !searchQuery) {
      return NextResponse.json(
        { success: false, error: 'userId and query are required' },
        { status: 400 }
      );
    }

    const results = await searchLongTermMemory(
      userId,
      searchQuery,
      limit || 3
    );

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Search long memory error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search long memory' },
      { status: 500 }
    );
  }
}
