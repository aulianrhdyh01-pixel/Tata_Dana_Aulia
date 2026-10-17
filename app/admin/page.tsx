'use client';

// ==============================================================================
// TataDana: Superadmin Dashboard Overview
// Real-time Platform Metrics: Users, MRR, Transactions, AI Usage, and System Health
// ==============================================================================

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  ArrowUpRight,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Shield,
  ArrowRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { adminService, AdminMetrics } from '@/lib/admin/admin-service';
import { formatRupiah, formatRupiahCompact } from '@/lib/date-utils';
import { supabase } from '@/lib/supabase/client';
import { Transaction, AILog } from '@/types/database';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [recentAiLogs, setRecentAiLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const m = await adminService.getMetrics();
      setMetrics(m);

      // Fetch 5 recent transactions
      const { data: txs = [] } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentTransactions(txs || []);

      // Fetch 5 recent AI logs
      const { data: logs = [] } = await supabase
        .from('ai_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentAiLogs(logs || []);
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Header with Refresh & Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Panel Kendali Superadmin
            </h1>
            <span className="bg-orange-50 text-orange-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-200">
              Live Monitor
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Metrik agregat platform SaaS TataDana, rasio langganan, performa Multi-Provider AI, dan transaksi real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Perbarui Data
          </button>
          <Link
            href="/admin/users"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition shadow-md shadow-orange-500/20 active:scale-95"
          >
            <Users className="w-3.5 h-3.5" />
            Kelola Pengguna
          </Link>
        </div>
      </div>

      {/* 2. Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Users */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pengguna</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics?.totalUsers ?? '...'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            <span className="text-emerald-600 font-bold">{metrics?.proCount ?? 0} Pro</span> •{' '}
            <span className="text-slate-500">{metrics?.starterCount ?? 0} Starter</span>
          </p>
        </div>

        {/* Card 2: Starter vs Pro Ratio */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rasio Pro vs Starter</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics ? `${metrics.proRatioPercentage}%` : '...'}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${metrics?.proRatioPercentage || 0}%` }}
            />
          </div>
        </div>

        {/* Card 3: MRR */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">MRR (Monthly Revenue)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics ? formatRupiahCompact(metrics.mrr) : '...'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {metrics ? formatRupiah(metrics.mrr) : '...'}
          </p>
        </div>

        {/* Card 4: Total Processed Transactions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Transaksi Diproses</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics?.totalTransactions ?? '...'}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            Vol: {metrics ? formatRupiahCompact(metrics.totalTransactionVolume) : '...'}
          </p>
        </div>

        {/* Card 5: AI Engine Calls */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:border-orange-300 transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Panggilan AI</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {metrics?.totalAiCalls ?? '...'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Avg Latency: <span className="text-emerald-600 font-bold">{metrics?.avgAiLatencyMs ?? 0}ms</span>
          </p>
        </div>
      </div>

      {/* 3. AI Provider Health & Multi-Provider Architecture Status */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <h2 className="text-base font-bold text-slate-900">Status Mesin Multi-Provider AI TataDana</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Aktif
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Mode saat ini:{' '}
            <strong className="text-slate-800">
              {metrics?.activeAiMode === 'FAILOVER' ? 'Otomatis Failover (Fallback)' : 'Single Provider'}
            </strong>{' '}
            • Provider Utama: <strong className="text-orange-600">{metrics?.primaryAiProvider || 'GEMINI'}</strong> •
            Tingkat Keberhasilan: <strong className="text-emerald-600">{metrics?.aiSuccessRate ?? 100}%</strong>
          </p>
        </div>

        {/* Provider Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-800">Google Gemini</span>
            <span className="text-[10px] text-slate-400">flash-1.5</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">OpenAI</span>
            <span className="text-[10px] text-slate-400">gpt-4o-mini</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-slate-800">DeepSeek</span>
            <span className="text-[10px] text-slate-400">deepseek-chat</span>
          </div>

          <Link
            href="/admin/ai-settings"
            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold flex items-center gap-1 transition"
          >
            Pengaturan AI <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4. Quick Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Module 1: User Impersonation */}
        <Link
          href="/admin/users"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-orange-600 transition">
              Pengguna & Impersonasi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Lihat seluruh daftar pengguna terdaftar, nomor WhatsApp/Telegram, status paket PRO, dan masuk langsung
              ke tampilan akun tanpa kata sandi via Impersonation Banner.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-orange-600 gap-1">
            Buka Direktori Pengguna <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        {/* Module 2: Midtrans Subscriptions & Manual Transfers */}
        <Link
          href="/admin/subscriptions"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md transition group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition">
              Langganan & Midtrans
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Pantau transaksi upgrade paket Pro Rp 49.000/bln via Midtrans Snap, simulasi pembayaran sandbox, serta
              approval/rejection manual bukti transfer bank.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-emerald-600 gap-1">
            Kelola Langganan <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </Link>

        {/* Module 3: Financial Privacy Audit Trail */}
        <Link
          href="/admin/audit-logs"
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cyan-300 hover:shadow-md transition group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-cyan-600 transition">
              Audit Trail Privasi Data
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Jejak audit tidak dapat dihapus yang mencatat setiap inspeksi data keuangan pengguna oleh Superadmin demi
              menjaga privasi finansial sesuai standar regulasi.
            </p>
          </div>
          <div className="pt-4 flex items-center text-xs font-bold text-cyan-600 gap-1">
            Lihat Jejak Audit <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </div>
        </Link>
      </div>

      {/* 5. Tables: Recent Transactions & Recent AI Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Transactions Across Users */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" /> Transaksi Terbaru (Live Platform)
            </h3>
            <span className="text-[11px] text-slate-400">5 Terakhir</span>
          </div>
          <div className="divide-y divide-slate-100">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada transaksi tercatat</p>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800 truncate max-w-[200px]">{tx.description}</p>
                    <p className="text-[10px] text-slate-400">
                      {tx.source} • {tx.transaction_date.slice(0, 10)} (WIB)
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : tx.type === 'EXPENSE' ? 'text-rose-600' : 'text-blue-600'
                      }`}
                    >
                      {tx.type === 'EXPENSE' ? '-' : '+'}
                      {formatRupiah(tx.amount)}
                    </p>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-semibold">{tx.type}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent AI Logs */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-500" /> Eksekusi AI Terbaru
            </h3>
            <Link href="/admin/ai-logs" className="text-xs font-bold text-orange-600 hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentAiLogs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">Belum ada log AI tercatat</p>
            ) : (
              recentAiLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800">{log.provider}</span>
                      <span className="text-[10px] text-slate-400">({log.model})</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Tugas: <strong>{log.task}</strong> • {log.latency_ms}ms • {log.total_tokens} token
                    </p>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'FALLBACK'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
