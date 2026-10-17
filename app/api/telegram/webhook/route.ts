/**
 * Telegram Webhook Route Handler (/api/telegram/webhook)
 * Enforces strict update_id idempotency to prevent duplicate transactions.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAndRecordUpdateId } from '@/lib/telegram/idempotency';
import { handleTelegramUpdate, TelegramUpdate } from '@/lib/telegram/bot-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object' || body.update_id === undefined) {
      return NextResponse.json(
        { status: 'error', message: 'Payload tidak valid: update_id diperlukan.' },
        { status: 400 }
      );
    }

    const updateId = body.update_id;

    // 1. Strict Idempotency Check
    const idempotency = await checkAndRecordUpdateId(updateId, 'telegram_webhook', body);

    if (idempotency.isDuplicate) {
      // Return 200 OK immediately without processing or creating duplicate transaction
      return NextResponse.json(
        {
          status: 'ok',
          processed: false,
          duplicate: true,
          message: `Update ${updateId} telah diproses sebelumnya. Diabaikan untuk mencegah duplikasi.`,
        },
        { status: 200 }
      );
    }

    // 2. Process Telegram Update
    const result = await handleTelegramUpdate(body as TelegramUpdate);

    return NextResponse.json(
      {
        status: 'ok',
        processed: true,
        duplicate: false,
        result,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error handling telegram webhook:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Internal server error processing webhook update.',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'tatadana-telegram-webhook',
      timezone: 'Asia/Jakarta (WIB)',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
