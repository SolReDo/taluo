import { NextRequest, NextResponse } from 'next/server';
import { initGuestAccount } from '@/lib/memory/guestMerger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { guestId } = body;

    const result = await initGuestAccount(guestId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Guest init error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize guest account' },
      { status: 500 }
    );
  }
}
