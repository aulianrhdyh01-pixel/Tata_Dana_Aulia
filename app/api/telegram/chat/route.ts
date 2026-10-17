/**
 * In-App Interactive Telegram Chat Endpoint (/api/telegram/chat)
 * Allows users to simulate interacting with TataDana Bot directly from the web dashboard.
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramUpdate } from '@/lib/telegram/bot-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = (body.message || '').trim();
    const userName = body.user_name || 'Budi Pratama';
    const chatId = body.chat_id || 8129481234;

    const update = {
      update_id: Math.floor(Date.now() / 1000),
      message: {
        message_id: Math.floor(Math.random() * 100000),
        chat: {
          id: chatId,
          type: 'private',
          first_name: userName,
        },
        from: {
          id: chatId,
          first_name: userName,
          is_bot: false,
        },
        date: Math.floor(Date.now() / 1000),
        text: text,
      },
    };

    const res = await handleTelegramUpdate(update as any);

    return NextResponse.json({
      ok: true,
      reply: res.replyText,
      paired: text.toLowerCase().startsWith('/start') || text.toLowerCase().includes('token_td_'),
      action: res.commandHandled || 'chat',
      transactionCreated: res.transactionCreated,
      transactionId: res.transactionId,
    });
  } catch (error: any) {
    console.error('Error in /api/telegram/chat:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal chat handler error' },
      { status: 500 }
    );
  }
}
