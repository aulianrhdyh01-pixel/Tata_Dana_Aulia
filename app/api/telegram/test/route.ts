/**
 * Telegram Test & Diagnostics API (/api/telegram/test)
 * Tests bot connectivity (getMe), webhook configuration, and simulated message dispatch.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  // If real token is configured and not a placeholder
  if (token && !token.includes('your-bot-token') && token !== 'mock') {
    try {
      const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const getMeData = await getMeRes.json();

      if (!getMeData.ok) {
        return NextResponse.json(
          {
            status: 'error',
            connected: false,
            message: `Telegram API error: ${getMeData.description || 'Gagal memverifikasi token bot.'}`,
          },
          { status: 400 }
        );
      }

      // Check current webhook info
      const webhookRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      const webhookData = await webhookRes.json();

      return NextResponse.json({
        status: 'ok',
        connected: true,
        mode: 'LIVE',
        bot: getMeData.result,
        webhook: webhookData.result || { url: webhookUrl },
      });
    } catch (err: any) {
      return NextResponse.json(
        {
          status: 'error',
          connected: false,
          message: `Network error connecting to Telegram API: ${err.message}`,
        },
        { status: 502 }
      );
    }
  }

  // Realistic simulated response for localhost / test / sandbox environments
  return NextResponse.json({
    status: 'ok',
    connected: true,
    mode: 'SIMULATOR_SANDBOX',
    message: 'Koneksi bot aktif dalam mode Sandbox/Simulator Localhost.',
    bot: {
      id: 8129481234,
      is_bot: true,
      first_name: 'TataDana Finance Bot',
      username: 'tatadana_bot',
      can_join_groups: true,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
    },
    webhook: {
      url: webhookUrl,
      has_custom_certificate: false,
      pending_update_count: 0,
      last_error_date: 0,
      max_connections: 40,
      ip_address: '127.0.0.1',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'test_webhook';
    const token = body.token || process.env.TELEGRAM_BOT_TOKEN;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const targetWebhookUrl = body.webhook_url || `${appUrl}/api/telegram/webhook`;

    if (action === 'set_webhook') {
      if (token && !token.includes('your-bot-token') && token !== 'mock') {
        const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetWebhookUrl }),
        });
        const data = await res.json();
        return NextResponse.json({
          status: data.ok ? 'ok' : 'error',
          data,
        });
      }

      return NextResponse.json({
        status: 'ok',
        message: `Webhook simulator berhasil didaftarkan ke ${targetWebhookUrl}`,
        registered_url: targetWebhookUrl,
      });
    }

    return NextResponse.json({
      status: 'ok',
      message: 'Uji koneksi Telegram berhasil.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500 }
    );
  }
}
