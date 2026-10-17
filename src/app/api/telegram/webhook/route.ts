// ==============================================================================
// TATADANA TELEGRAM WEBHOOK API ROUTE & ENDPOINT
// Route: POST /api/telegram/webhook
// Implements: Part 2 (Idempotency, WIB Timezone), Part 4 (LLM Structured Parsing)
// ==============================================================================

import { TelegramService, TelegramUpdate } from '../../services/telegram';

export async function POST(request: Request) {
  try {
    const update: TelegramUpdate = await request.json();

    if (!update || typeof update.update_id !== 'number') {
      return new Response(JSON.stringify({ error: 'Payload tidak valid' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.error('[TataDana Engine] TELEGRAM_BOT_TOKEN belum dikonfigurasi di environment!');
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), { status: 500 });
    }

    const telegramService = new TelegramService();
    const result = await telegramService.handleWebhookUpdate(update, botToken);

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('[TataDana Webhook Error]:', error);
    // Return 200 to Telegram so it doesn't repeatedly retry failing requests indefinitely
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
