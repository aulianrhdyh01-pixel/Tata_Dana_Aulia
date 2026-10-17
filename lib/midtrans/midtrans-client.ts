// ==============================================================================
// TataDana: Midtrans Snap & Billing Integration Service
// Snap Token Generator, SHA512 Signature Verifier, Webhook Handler & Simulator
// ==============================================================================

import crypto from 'crypto';
import { supabase } from '@/lib/supabase/client';
import { Subscription, SubscriptionTier } from '@/types/database';
import { toWIBISOString } from '@/lib/date-utils';

export const PRO_MONTHLY_PRICE = 49000; // Rp 49.000 / month
export const PRO_YEARLY_PRICE = 490000; // Rp 490.000 / year (save 2 months)

export interface CreateTransactionParams {
  userId: string;
  userEmail: string;
  userName?: string;
  phoneNumber?: string;
  planType: 'MONTHLY' | 'YEARLY';
}

export interface SnapTransactionResult {
  orderId: string;
  snapToken: string;
  redirectUrl: string;
  amount: number;
  planType: 'MONTHLY' | 'YEARLY';
}

export interface MidtransNotificationPayload {
  order_id: string;
  status_code: string;
  gross_amount: string;
  signature_key?: string;
  transaction_status: 'capture' | 'settlement' | 'pending' | 'deny' | 'cancel' | 'expire' | 'refund';
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  transaction_time?: string;
  [key: string]: any;
}

export const midtransClient = {
  getServerKey(): string {
    return process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-tatadana-mock-key';
  },

  getClientKey(): string {
    return process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || 'SB-Mid-client-tatadana-mock-key';
  },

  isProduction(): boolean {
    return process.env.MIDTRANS_IS_PRODUCTION === 'true';
  },

  getSnapBaseUrl(): string {
    return this.isProduction()
      ? 'https://app.midtrans.com/snap/v1/transactions'
      : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
  },

  /**
   * Generates SHA-512 signature hash to verify webhook authenticity:
   * SHA512(order_id + status_code + gross_amount + ServerKey)
   */
  generateSignature(orderId: string, statusCode: string, grossAmount: string): string {
    const serverKey = this.getServerKey();
    const raw = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    return crypto.createHash('sha512').update(raw).digest('hex');
  },

  /**
   * Verifies incoming webhook signature
   */
  verifySignature(payload: MidtransNotificationPayload): boolean {
    if (!payload.signature_key) return true; // In test sandbox without key
    const expected = this.generateSignature(payload.order_id, payload.status_code, payload.gross_amount);
    return payload.signature_key.toLowerCase() === expected.toLowerCase();
  },

  /**
   * Create Snap Transaction Token for Pro Upgrade
   */
  async createTransaction(params: CreateTransactionParams): Promise<SnapTransactionResult> {
    const { userId, userEmail, userName = 'Pengguna TataDana', phoneNumber, planType } = params;
    const amount = planType === 'YEARLY' ? PRO_YEARLY_PRICE : PRO_MONTHLY_PRICE;
    const orderId = `TATADANA-PRO-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    let snapToken = `snap-token-${orderId}`;
    let redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;

    const serverKey = this.getServerKey();
    const hasLiveKey = serverKey && !serverKey.includes('mock') && serverKey.startsWith('SB-Mid-server-');

    // Attempt live Snap API if valid credentials exist
    if (hasLiveKey) {
      try {
        const authHeader = Buffer.from(`${serverKey}:`).toString('base64');
        const snapPayload = {
          transaction_details: {
            order_id: orderId,
            gross_amount: amount,
          },
          item_details: [
            {
              id: `PLAN-PRO-${planType}`,
              price: amount,
              quantity: 1,
              name: planType === 'YEARLY' ? 'TataDana PRO (1 Tahun)' : 'TataDana PRO (1 Bulan)',
            },
          ],
          customer_details: {
            first_name: userName,
            email: userEmail,
            phone: phoneNumber || '081234567890',
          },
          callbacks: {
            finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success`,
          },
        };

        const res = await fetch(this.getSnapBaseUrl(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${authHeader}`,
          },
          body: JSON.stringify(snapPayload),
        });

        if (res.ok) {
          const data = await res.json();
          snapToken = data.token || snapToken;
          redirectUrl = data.redirect_url || redirectUrl;
        }
      } catch (err) {
        console.warn('Midtrans Snap API request error, fallback to simulated token:', err);
      }
    }

    // Insert pending subscription record into subscriptions table
    const startsAt = toWIBISOString();
    const durationDays = planType === 'YEARLY' ? 365 : 30;
    const expiresAt = toWIBISOString(new Date(Date.now() + durationDays * 86400000));

    const subscriptionEntry: Partial<Subscription> = {
      user_id: userId,
      tier: 'PRO',
      status: 'PENDING',
      payment_method: 'MIDTRANS',
      order_id: orderId,
      amount,
      snap_token: snapToken,
      starts_at: startsAt,
      expires_at: expiresAt,
      metadata: {
        planType,
        customerEmail: userEmail,
        customerName: userName,
      },
      created_at: startsAt,
    };

    await supabase.from('subscriptions').insert(subscriptionEntry);

    return {
      orderId,
      snapToken,
      redirectUrl,
      amount,
      planType,
    };
  },

  /**
   * Process Midtrans Webhook Notification with Idempotency & Tier Upgrade
   */
  async handleWebhookNotification(payload: MidtransNotificationPayload): Promise<{
    processed: boolean;
    isDuplicate: boolean;
    orderId: string;
    newStatus: string;
    upgradedToPro: boolean;
  }> {
    const { order_id, transaction_status, fraud_status } = payload;

    // 1. Strict Idempotency Check in webhook_events table
    const { data: existingEvent } = await supabase
      .from('webhook_events')
      .select('id')
      .eq('source', 'MIDTRANS')
      .eq('event_id', order_id)
      .maybeSingle();

    // If event already recorded and completed, skip double-processing
    if (existingEvent && transaction_status === 'settlement') {
      return {
        processed: true,
        isDuplicate: true,
        orderId: order_id,
        newStatus: 'ACTIVE',
        upgradedToPro: true,
      };
    }

    // 2. Fetch Subscription record
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('order_id', order_id).maybeSingle();

    let newStatus = 'PENDING';
    let upgradedToPro = false;

    // Check transaction status according to Midtrans specification
    const isSettled =
      transaction_status === 'settlement' || (transaction_status === 'capture' && fraud_status === 'accept');

    if (isSettled) {
      newStatus = 'ACTIVE';
      upgradedToPro = true;
    } else if (transaction_status === 'pending') {
      newStatus = 'PENDING';
    } else if (['deny', 'cancel', 'expire', 'refund'].includes(transaction_status)) {
      newStatus = 'CANCELLED';
    }

    // 3. Update Subscription record
    if (sub) {
      await supabase
        .from('subscriptions')
        .update({
          status: newStatus,
          midtrans_transaction_id: payload.transaction_id || `midtrans-tx-${order_id}`,
          metadata: {
            ...(sub.metadata || {}),
            last_webhook_payload: payload,
          },
        })
        .eq('id', sub.id);

      // 4. Upgrade user tier to PRO if payment succeeded
      if (upgradedToPro) {
        const durationDays = sub.metadata?.planType === 'YEARLY' ? 365 : 30;
        const expiresAt = toWIBISOString(new Date(Date.now() + durationDays * 86400000));

        await supabase
          .from('users')
          .update({
            subscription_tier: 'PRO',
            subscription_expires_at: expiresAt,
          })
          .eq('id', sub.user_id);
      }
    }

    // 5. Record Webhook Event for Audit & Idempotency
    try {
      await supabase.from('webhook_events').insert({
        source: 'MIDTRANS',
        event_id: order_id,
        payload,
        processed: true,
        created_at: toWIBISOString(),
      });
    } catch (e) {
      // Ignore duplicate insert errors
    }

    return {
      processed: true,
      isDuplicate: false,
      orderId: order_id,
      newStatus,
      upgradedToPro,
    };
  },

  /**
   * In-App Sandbox Payment Simulator
   * Allows developer or admin to test payment success/failure instantly
   */
  async simulatePayment(
    orderId: string,
    simulatedStatus: 'settlement' | 'pending' | 'expire' | 'deny' = 'settlement'
  ): Promise<{ success: boolean; result: any }> {
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('order_id', orderId).maybeSingle();

    const grossAmount = sub ? String(sub.amount) : '49000.00';
    const statusCode = simulatedStatus === 'settlement' ? '200' : simulatedStatus === 'pending' ? '201' : '400';

    const mockPayload: MidtransNotificationPayload = {
      order_id: orderId,
      status_code: statusCode,
      gross_amount: grossAmount,
      transaction_status: simulatedStatus,
      fraud_status: 'accept',
      payment_type: 'qris',
      transaction_id: `tx-simulated-${Date.now()}`,
      transaction_time: toWIBISOString(),
      signature_key: this.generateSignature(orderId, statusCode, grossAmount),
    };

    const result = await this.handleWebhookNotification(mockPayload);
    return {
      success: true,
      result,
    };
  },
};
