'use client';

// ==============================================================================
// TataDana: Main Dashboard Overview View
// Modern Orange-White Fintech Theme
// Integrates 4 stats cards, dynamic period filter, Pie/Bar/Trend charts,
// 10 recent transactions, interactive onboarding checklist, and receipt inspector.
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { StatsCards, StatsData } from '@/components/dashboard/stats-cards';
import { ChartsSection } from '@/components/dashboard/charts-section';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { OnboardingChecklist } from '@/components/dashboard/onboarding-checklist';
import { PeriodFilter, PeriodType } from '@/components/dashboard/period-filter';
import { AddTransactionModal } from '@/components/dashboard/add-transaction-modal';
import { Transaction, Category, Wallet } from '@/types/database';
import { formatRupiah, formatWIB } from '@/lib/date-utils';
import { useAuth } from '@/lib/auth/auth-context';
import { supabase } from '@/lib/supabase/client';
import {
  Sparkles,
  RefreshCw,
  Plus,
  Receipt,
  X,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodType>('month');
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
    totalBudget: 0,
    remainingBudget: 0,
    budgetUsedPercentage: 0,
  });

  // Modal states
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);

  // Fetch dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      params.set('period', period);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      params.set('limit', '50');

      const [txRes, bgtRes, wRes] = await Promise.all([
        fetch(`/api/transactions?${params.toString()}`),
        fetch('/api/budgets'),
        fetch('/api/wallets'),
      ]);

      const txJson = await txRes.json();
      const bgtJson = await bgtRes.json();
      const wJson = await wRes.json();

      if (txJson.data) {
        setTransactions(txJson.data);
      }

      if (txJson.stats) {
        setStats(txJson.stats);
      }

      if (bgtJson.categories) {
        setCategories(bgtJson.categories);
      }

      if (wJson.data) {
        setWallets(wJson.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [period, startDate, endDate]);

  useEffect(() => {
    loadDashboardData();

    // Listen to transaction-created global events
    const handleTxCreated = () => {
      loadDashboardData();
    };

    window.addEventListener('tatadana:transaction-created', handleTxCreated);

    // Supabase Realtime subscription for instant transaction updates without reload
    const channel = supabase.channel('public:transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          loadDashboardData();
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('tatadana:transaction-created', handleTxCreated);
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
    };
  }, [loadDashboardData]);

  const handlePeriodChange = (
    newPeriod: PeriodType,
    customStart?: string,
    customEnd?: string
  ) => {
    setPeriod(newPeriod);
    setStartDate(customStart);
    setEndDate(customEnd);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Greeting, Period Selector & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-950/40 text-orange-400 border border-orange-800/60">
              {user?.subscription_tier === 'PRO' ? 'TataDana PRO' : 'Paket Starter'}
            </span>
            <span className="text-xs text-zinc-400">Asia/Jakarta (WIB)</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-zinc-100 tracking-tight">
            Halo, {user?.full_name || 'Budi Pratama'} 👋
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Berikut ringkasan performa finansial & arus kas terpadu Anda.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Filter Switcher */}
          <PeriodFilter
            currentPeriod={period}
            startDate={startDate}
            endDate={endDate}
            onPeriodChange={handlePeriodChange}
          />

          {/* Refresh Button */}
          <button
            onClick={loadDashboardData}
            disabled={refreshing}
            aria-label="Segarkan data transaksi"
            className="p-2.5 text-zinc-400 hover:text-zinc-100 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-700/80 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          {/* Catat Transaksi Button */}
          <button
            onClick={() => setIsAddTxOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Interactive Onboarding Checklist */}
      <OnboardingChecklist
        telegramConnected={Boolean(user?.phone_number || user?.telegram_chat_id)}
        hasWallets={wallets.length > 0}
        hasBudgets={stats.totalBudget > 0}
        hasTransactions={transactions.length > 0}
        onOpenAddTransaction={() => setIsAddTxOpen(true)}
      />

      {/* Analytics Charts Section (Pie Category, 6-Month Bar, Trend Line) */}
      <ChartsSection transactions={transactions} categories={categories} />

      {/* Recent Transactions List & Multi-Item Expansion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions
            transactions={transactions}
            onOpenReceipt={(tx) => setSelectedReceiptTx(tx)}
          />
        </div>

        {/* Quick Wallet Summary Card */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-2">
                <span>Dompet & Saldo</span>
              </h3>
              <Link
                href="/dashboard/wallets"
                className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1"
              >
                <span>Kelola</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-zinc-400 mb-4">
              Status saldo di {wallets.length} dompet aktif:
            </p>

            <div className="space-y-2.5">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-zinc-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: w.color || '#f97316' }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate">{w.name}</p>
                      <p className="text-[10px] text-zinc-400 uppercase font-mono">{w.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold font-mono text-zinc-100">
                      {formatRupiah(Number(w.balance))}
                    </p>
                    {w.is_default && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-950/40 text-orange-400 border border-orange-800/60">
                        Default
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#18181b] border border-orange-900/40">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Tips TataDana</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Kirim foto struk belanjaan atau voice note ke bot Telegram untuk pencatatan otomatis multi-item dalam hitungan detik.
            </p>
          </div>
        </div>
      </div>

      {/* Receipt Item Breakdown Modal */}
      {selectedReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-950/50 border border-purple-800/60 text-purple-400 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Rincian Struk Belanja</h3>
                  <p className="text-xs text-zinc-400">
                    {selectedReceiptTx.description} • {formatWIB(selectedReceiptTx.transaction_date, 'short')} WIB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptTx(null)}
                aria-label="Tutup rincian struk"
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-zinc-800 max-h-64 overflow-y-auto pr-1">
              {selectedReceiptTx.items && selectedReceiptTx.items.length > 0 ? (
                selectedReceiptTx.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-zinc-200">{it.item_name}</p>
                      <p className="text-[11px] text-zinc-400">
                        {it.qty} x {formatRupiah(Number(it.price))}
                      </p>
                    </div>
                    <p className="font-bold font-mono text-zinc-100">{formatRupiah(Number(it.total))}</p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-zinc-400">
                  Tidak ada rincian item individual tersimpan.
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-sm">
              <span className="font-semibold text-zinc-300">Total Transaksi</span>
              <span className="font-black text-orange-400 font-mono">
                {formatRupiah(Number(selectedReceiptTx.amount))}
              </span>
            </div>

            <button
              onClick={() => setSelectedReceiptTx(null)}
              className="w-full py-2 text-xs font-bold text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
            >
              Tutup Rincian
            </button>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
