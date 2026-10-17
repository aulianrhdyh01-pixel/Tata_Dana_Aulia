// ==============================================================================
// TataDana: Admin Dashboard Service
// Metrics, User Management, Privacy Audit Logging, and Subscription Control
// ==============================================================================

import { supabase } from '@/lib/supabase/client';
import { mockSupabaseClient } from '@/lib/supabase/mock-client';
import {
  User,
  Subscription,
  AILog,
  AuditLog,
  Transaction,
  SubscriptionTier,
} from '@/types/database';
import { toWIBISOString, formatRupiah } from '@/lib/date-utils';

export interface AdminMetrics {
  totalUsers: number;
  starterCount: number;
  proCount: number;
  proRatioPercentage: number;
  mrr: number; // Monthly Recurring Revenue in IDR
  totalTransactions: number;
  totalTransactionVolume: number;
  totalAiCalls: number;
  avgAiLatencyMs: number;
  totalAiTokens: number;
  aiSuccessRate: number;
  activeAiMode: 'SINGLE' | 'FAILOVER';
  primaryAiProvider: string;
}

export interface AdminUserListItem extends User {
  walletCount?: number;
  totalBalance?: number;
  activeSubscription?: Subscription | null;
}

export const adminService = {
  /**
   * Fetch aggregate platform metrics for Superadmin dashboard
   */
  async getMetrics(): Promise<AdminMetrics> {
    // 1. Get Users
    const { data: users = [] } = await supabase.from('users').select('*');
    const allUsers: User[] = users || [];

    const totalUsers = allUsers.length;
    const proUsers = allUsers.filter((u) => u.subscription_tier === 'PRO');
    const starterUsers = allUsers.filter((u) => u.subscription_tier === 'STARTER');
    const proCount = proUsers.length;
    const starterCount = starterUsers.length;
    const proRatioPercentage = totalUsers > 0 ? Math.round((proCount / totalUsers) * 100) : 0;

    // 2. Subscriptions & MRR
    const { data: subs = [] } = await supabase.from('subscriptions').select('*');
    const activeSubs: Subscription[] = (subs || []).filter((s: Subscription) => s.status === 'ACTIVE');
    // Calculate MRR from active subscriptions (monthly fee Rp 49.000 or yearly normalized)
    const mrr = activeSubs.reduce((acc: number, curr: Subscription) => {
      const amount = Number(curr.amount) || 49000;
      return acc + (amount >= 200000 ? Math.round(amount / 12) : amount);
    }, 0);

    // 3. Transactions & Volume
    const { data: txs = [] } = await supabase.from('transactions').select('*');
    const allTxs: Transaction[] = txs || [];
    const totalTransactions = allTxs.length;
    const totalTransactionVolume = allTxs.reduce((acc: number, curr: Transaction) => acc + (Number(curr.amount) || 0), 0);

    // 4. AI Calls & Token Analytics
    const { data: aiLogs = [] } = await supabase.from('ai_logs').select('*');
    const allAiLogs: AILog[] = aiLogs || [];
    const totalAiCalls = allAiLogs.length;
    const totalAiTokens = allAiLogs.reduce((acc: number, curr: AILog) => acc + (Number(curr.total_tokens) || 0), 0);
    const avgAiLatencyMs =
      totalAiCalls > 0
        ? Math.round(allAiLogs.reduce((acc: number, curr: AILog) => acc + (Number(curr.latency_ms) || 0), 0) / totalAiCalls)
        : 0;
    const successfulAiCalls = allAiLogs.filter((l) => l.status === 'SUCCESS' || l.status === 'FALLBACK').length;
    const aiSuccessRate = totalAiCalls > 0 ? Math.round((successfulAiCalls / totalAiCalls) * 100) : 100;

    // 5. Active AI Settings (Read from config or memory)
    let activeAiMode: 'SINGLE' | 'FAILOVER' = 'FAILOVER';
    let primaryAiProvider = 'GEMINI';

    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('tatadana_ai_mode');
      if (savedMode === 'SINGLE' || savedMode === 'FAILOVER') {
        activeAiMode = savedMode;
      }
      const savedPrimary = localStorage.getItem('tatadana_primary_ai');
      if (savedPrimary) {
        primaryAiProvider = savedPrimary;
      }
    }

    return {
      totalUsers,
      starterCount,
      proCount,
      proRatioPercentage,
      mrr,
      totalTransactions,
      totalTransactionVolume,
      totalAiCalls,
      avgAiLatencyMs,
      totalAiTokens,
      aiSuccessRate,
      activeAiMode,
      primaryAiProvider,
    };
  },

  /**
   * Get all registered users with extra metadata for administration
   */
  async getUsers(searchQuery?: string, tierFilter?: SubscriptionTier | 'ALL'): Promise<AdminUserListItem[]> {
    const { data: users = [] } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    const { data: wallets = [] } = await supabase.from('wallets').select('*');
    const { data: subs = [] } = await supabase.from('subscriptions').select('*');

    let result: AdminUserListItem[] = (users || []).map((u: User) => {
      const userWallets = (wallets || []).filter((w: any) => w.user_id === u.id);
      const totalBalance = userWallets.reduce((acc: number, w: any) => acc + Number(w.balance || 0), 0);
      const activeSub = (subs || []).find((s: Subscription) => s.user_id === u.id && s.status === 'ACTIVE') || null;

      return {
        ...u,
        walletCount: userWallets.length,
        totalBalance,
        activeSubscription: activeSub,
      };
    });

    if (tierFilter && tierFilter !== 'ALL') {
      result = result.filter((u) => u.subscription_tier === tierFilter);
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.full_name && u.full_name.toLowerCase().includes(q)) ||
          (u.phone_number && u.phone_number.includes(q)) ||
          (u.telegram_username && u.telegram_username.toLowerCase().includes(q))
      );
    }

    return result;
  },

  /**
   * Fetch single user details along with recent transactions and audit log write
   */
  async getUserDetails(adminId: string, targetUserId: string): Promise<{ user: User; transactions: Transaction[] } | null> {
    const { data: user } = await supabase.from('users').select('*').eq('id', targetUserId).single();
    if (!user) return null;

    const { data: transactions = [] } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', targetUserId)
      .order('transaction_date', { ascending: false })
      .limit(20);

    // Log Privacy Audit Trail for accessing user financial transactions
    await this.logAudit({
      adminId,
      targetUserId,
      action: 'VIEW_TRANSACTIONS',
      details: {
        reason: 'Superadmin transaction inspection',
        transactionCount: transactions?.length || 0,
      },
    });

    return {
      user,
      transactions: transactions || [],
    };
  },

  /**
   * Log action to Privacy Audit Trail (Financial compliance)
   */
  async logAudit({
    adminId,
    targetUserId,
    action,
    details = {},
    ipAddress = '127.0.0.1',
  }: {
    adminId?: string | null;
    targetUserId?: string | null;
    action: string;
    details?: Record<string, any>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    const newLog: Partial<AuditLog> = {
      admin_id: adminId || null,
      target_user_id: targetUserId || null,
      action,
      details,
      ip_address: ipAddress,
      created_at: toWIBISOString(),
    };

    const { data } = await supabase.from('audit_logs').insert(newLog);
    return (Array.isArray(data) ? data[0] : data) as AuditLog;
  },

  /**
   * Fetch Privacy Audit Logs
   */
  async getAuditLogs(limitCount = 50, filterAction?: string): Promise<AuditLog[]> {
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(limitCount);
    if (filterAction && filterAction !== 'ALL') {
      query = query.eq('action', filterAction);
    }
    const { data = [] } = await query;
    return data || [];
  },

  /**
   * Fetch AI Execution Logs
   */
  async getAiLogs(limitCount = 50, providerFilter?: string, statusFilter?: string): Promise<AILog[]> {
    let query = supabase.from('ai_logs').select('*').order('created_at', { ascending: false }).limit(limitCount);
    if (providerFilter && providerFilter !== 'ALL') {
      query = query.eq('provider', providerFilter);
    }
    if (statusFilter && statusFilter !== 'ALL') {
      query = query.eq('status', statusFilter);
    }
    const { data = [] } = await query;
    return data || [];
  },

  /**
   * Fetch Subscriptions list for Midtrans & manual payment administration
   */
  async getSubscriptions(): Promise<Subscription[]> {
    const { data = [] } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
    return data || [];
  },

  /**
   * Manual Payment Approval: upgrades user to PRO tier immediately
   */
  async approveSubscription(subscriptionId: string, adminId?: string): Promise<Subscription> {
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('id', subscriptionId).single();
    if (!sub) {
      throw new Error(`Subscription with ID ${subscriptionId} not found.`);
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 86400000); // +30 days

    // 1. Update subscription status to ACTIVE
    const { data: updatedSub } = await supabase
      .from('subscriptions')
      .update({
        status: 'ACTIVE',
        starts_at: toWIBISOString(now),
        expires_at: toWIBISOString(expiresAt),
      })
      .eq('id', subscriptionId);

    // 2. Upgrade user tier to PRO
    await supabase
      .from('users')
      .update({
        subscription_tier: 'PRO',
        subscription_expires_at: toWIBISOString(expiresAt),
      })
      .eq('id', sub.user_id);

    // 3. Log Audit Trail
    await this.logAudit({
      adminId,
      targetUserId: sub.user_id,
      action: 'APPROVE_SUBSCRIPTION',
      details: {
        subscriptionId,
        orderId: sub.order_id,
        amount: sub.amount,
        upgradedTier: 'PRO',
      },
    });

    return (Array.isArray(updatedSub) ? updatedSub[0] : updatedSub) || sub;
  },

  /**
   * Manual Payment Rejection
   */
  async rejectSubscription(subscriptionId: string, adminId?: string, reason = 'Bukti transfer tidak valid'): Promise<Subscription> {
    const { data: sub } = await supabase.from('subscriptions').select('*').eq('id', subscriptionId).single();
    if (!sub) {
      throw new Error(`Subscription with ID ${subscriptionId} not found.`);
    }

    // Update status to REJECTED
    const { data: updatedSub } = await supabase
      .from('subscriptions')
      .update({
        status: 'REJECTED',
        metadata: { ...(sub.metadata || {}), rejection_reason: reason },
      })
      .eq('id', subscriptionId);

    // Log Audit Trail
    await this.logAudit({
      adminId,
      targetUserId: sub.user_id,
      action: 'REJECT_SUBSCRIPTION',
      details: {
        subscriptionId,
        orderId: sub.order_id,
        reason,
      },
    });

    return (Array.isArray(updatedSub) ? updatedSub[0] : updatedSub) || sub;
  },
};
