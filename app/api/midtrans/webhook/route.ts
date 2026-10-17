// ==============================================================================
// TataDana: Midtrans Notification Webhook Endpoint
// Handles payment updates, upgrades user tier to PRO, and logs idempotency
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { midtransClient } from '@/lib/midtrans/midtrans-client';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload?.order_id || !payload?.transaction_status) {
      return NextResponse.json({ error: 'Payload tidak valid: order_id dan transaction_status wajib ada.' }, { status: 400 });
    }

    // Verify signature key if provided
    if (payload.signature_key && !midtransClient.verifySignature(payload)) {
      console.warn('[Midtrans Webhook] Signature verification failed for order:', payload.order_id);
      return NextResponse.json({ error: 'Signature key invalid.' }, { status: 403 });
    }

    // Process notification & update subscription and user tier
    const result = await midtransClient.handleWebhookNotification(payload);

    return NextResponse.json({
      status: 'ok',
      message: 'Notification processed successfully',
      ...result,
    });
  } catch (error: any) {
    console.error('Midtrans webhook handler error:', error);
    return NextResponse.json({ error: error?.message || 'Internal webhook error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'TataDana Midtrans Webhook Gateway',
    environment: midtransClient.isProduction() ? 'production' : 'sandbox',
  });
}
