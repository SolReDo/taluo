import { NextRequest, NextResponse } from 'next/server';
import { handleWechatLogin } from '@/lib/memory/guestMerger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guestId, code } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Code is required' },
        { status: 400 }
      );
    }

    const result = await handleWechatLogin(guestId || null, code);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('WeChat login error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process login' },
      { status: 500 }
    );
  }
}
