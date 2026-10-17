'use client';

// ==============================================================================
// TataDana: Superadmin Subscription & Midtrans Payment Gateway Management
// Live Midtrans monitoring, manual transfer approvals, and interactive sandbox simulator
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Zap,
  Play,
  FileCheck,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Eye,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { adminService } from '@/lib/admin/admin-service';
import { midtransClient, PRO_MONTHLY_PRICE, PRO_YEARLY_PRICE } from '@/lib/midtrans/midtrans-client';
import { Subscription, SubscriptionStatus } from '@/types/database';
import { formatRupiah, formatRupiahCompact } from '@/lib/date-utils';
import { useAuth } from '@/lib/auth/auth-context';

export default function AdminSubscriptionsPage() {
  const { user: currentAdmin } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Action States
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Manual Rejection Modal State
  const [rejectingSub, setRejectingSub] = useState<Subscription | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Bukti transfer tidak valid atau belum masuk');

  // Sandbox Simulator State
  const [simulatorOrderId, setSimulatorOrderId] = useState<string>('');
  const [simulatorLoading, setSimulatorLoading] = useState(false);
  const [simulatorResult, setSimulatorResult] = useState<any | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSubscriptions();
      setSubscriptions(data);

      // Pre-select first pending order for simulator if none selected
      const firstPending = data.find((s) => s.status === 'PENDING');
      if (firstPending && !simulatorOrderId) {
        setSimulatorOrderId(firstPending.order_id);
      }
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const showNotice = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 5000);
  };

  // 1. Manual Approval
  const handleApprove = async (sub: Subscription) => {
    try {
      setActionLoading(sub.id);
      await adminService.approveSubscription(sub.id, currentAdmin?.id || 'admin-dev-tatadana-01');
      showNotice('success', `Berhasil menyetujui langganan ${sub.order_id}. Pengguna telah di-upgrade ke PRO.`);
      await fetchSubscriptions();
    } catch (err: any) {
      showNotice('error', `Gagal menyetujui langganan: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // 2. Manual Rejection
  const handleRejectConfirm = async () => {
    if (!rejectingSub) return;
    try {
      setActionLoading(rejectingSub.id);
      await adminService.rejectSubscription(
        rejectingSub.id,
        currentAdmin?.id || 'admin-dev-tatadana-01',
        rejectionReason
      );
      showNotice('success', `Langganan ${rejectingSub.order_id} berhasil ditolak.`);
      setRejectingSub(null);
      await fetchSubscriptions();
    } catch (err: any) {
      showNotice('error', `Gagal menolak langganan: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  // 3. Midtrans Simulator Trigger
  const handleSimulatePayment = async (status: 'settlement' | 'pending' | 'expire') => {
    if (!simulatorOrderId.trim()) {
      alert('Pilih atau masukkan Order ID untuk disimulasikan.');
      return;
    }

    try {
      setSimulatorLoading(true);
      const res = await midtransClient.simulatePayment(simulatorOrderId, status);
      setSimulatorResult(res.result);
      showNotice(
        'success',
        `Simulasi pembayaran status '${status}' untuk ${simulatorOrderId} berhasil diproses oleh webhook simulator.`
      );
      await fetchSubscriptions();
    } catch (err: any) {
      showNotice('error', `Gagal mengeksekusi simulasi: ${err.message}`);
    } finally {
      setSimulatorLoading(false);
    }
  };

  // 4. Create New Mock Test Order
  const handleCreateTestOrder = async () => {
    try {
      setSimulatorLoading(true);
      const res = await midtransClient.createTransaction({
        userId: 'user-dev-tatadana-01',
        userEmail: 'user@tatadana.id',
        userName: 'Budi Pratama (Simulasi)',
        planType: 'MONTHLY',
      });
      setSimulatorOrderId(res.orderId);
      showNotice('success', `Order uji coba baru dibuat: ${res.orderId}. Siap untuk disimulasikan.`);
      await fetchSubscriptions();
    } catch (err: any) {
      showNotice('error', `Gagal membuat order uji coba: ${err.message}`);
    } finally {
      setSimulatorLoading(false);
    }
  };

  // Filter Subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
    if (paymentMethodFilter !== 'ALL' && sub.payment_method !== paymentMethodFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchOrder = sub.order_id?.toLowerCase().includes(q);
      const matchUser = sub.user_id?.toLowerCase().includes(q);
      const matchEmail = sub.metadata?.customerEmail?.toLowerCase().includes(q);
      const matchToken = sub.snap_token?.toLowerCase().includes(q);
      return matchOrder || matchUser || matchEmail || matchToken;
    }
    return true;
  });

  // Calculate Metrics
  const activeSubs = subscriptions.filter((s) => s.status === 'ACTIVE');
  const pendingSubs = subscriptions.filter((s) => s.status === 'PENDING');
  const rejectedSubs = subscriptions.filter((s) => s.status === 'REJECTED');
  const totalVolume = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  const mrr = activeSubs.reduce((acc, curr) => {
    const amount = Number(curr.amount) || 49000;
    return acc + (amount >= 200000 ? Math.round(amount / 12) : amount);
  }, 0);

  const getStatusBadge = (status: SubscriptionStatus | string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" /> ACTIVE (PRO)
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" /> REJECTED
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-orange-500" /> Langganan & Midtrans Payment Gateway
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manajemen siklus hidup paket Pro Rp 49.000/bln, eksekusi persetujuan transfer manual, dan uji coba pembayaran
            instan via Midtrans Sandbox Simulator terintegrasi.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchSubscriptions}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Segarkan
          </button>
          <button
            onClick={handleCreateTestOrder}
            disabled={simulatorLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold transition shadow-md shadow-orange-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Buat Order Uji Coba
          </button>
        </div>
      </div>

      {/* Action Notice Alert */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm shadow-xs ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="p-1 hover:text-slate-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Subscriptions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pelanggan Aktif Pro</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{activeSubs.length}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Hak akses AI Advisor & OCR terbuka</p>
        </div>

        {/* MRR */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">MRR (Monthly Recurring)</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatRupiahCompact(mrr)}</div>
          <p className="text-[11px] text-slate-500 mt-1">{formatRupiah(mrr)} / bulan</p>
        </div>

        {/* Pending Approvals */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Menunggu Persetujuan</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">{pendingSubs.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Perlu tindakan verifikasi admin</p>
        </div>

        {/* Total Settled Volume */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Volume Transaksi</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatRupiahCompact(totalVolume)}</div>
          <p className="text-[11px] text-slate-500 mt-1">{subscriptions.length} total tagihan tercatat</p>
        </div>
      </div>

      {/* 3. In-App Midtrans Sandbox Simulator Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50/70 via-white to-white border border-orange-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-500" />
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Simulator Pembayaran Midtrans Snap (Zero-Setup Sandbox)
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 border border-orange-200">
                Interactive Dev Tool
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Uji skenario webhook gateway pembayaran Midtrans tanpa perlu kartu kredit asli atau gateway eksternal.
              Simulator mengeksekusi hashing SHA-512, verifikasi idempotency, dan upgrade paket Pro secara nyata.
            </p>
          </div>
        </div>

        {/* Simulator Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
          {/* Order ID Input / Selector */}
          <div className="md:col-span-6 space-y-1">
            <label className="text-[11px] text-slate-700 font-semibold">Order ID Target Simulasi:</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Pilih atau ketik Order ID (misal: ORDER-TATADANA-202610-002)..."
                value={simulatorOrderId}
                onChange={(e) => setSimulatorOrderId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Quick Simulation Action Buttons */}
          <div className="md:col-span-6 flex flex-wrap items-center gap-2 pt-2 md:pt-5">
            <button
              onClick={() => handleSimulatePayment('settlement')}
              disabled={simulatorLoading}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              title="Simulasi QRIS/Transfer Settlement Sukses -> Upgrade ke PRO"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Simulasi Sukses (Settlement)
            </button>

            <button
              onClick={() => handleSimulatePayment('pending')}
              disabled={simulatorLoading}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
              title="Simulasi Status Menunggu Pembayaran"
            >
              <Clock className="w-3.5 h-3.5" />
              Simulasi Pending
            </button>

            <button
              onClick={() => handleSimulatePayment('expire')}
              disabled={simulatorLoading}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
              title="Simulasi Kadaluarsa/Batal"
            >
              <XCircle className="w-3.5 h-3.5" />
              Simulasi Expire
            </button>
          </div>
        </div>

        {/* Simulator Last Result Output */}
        {simulatorResult && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="text-emerald-700 font-bold">Hasil Webhook:</span>
              <span>Order: {simulatorResult.orderId}</span>
              <span>•</span>
              <span>Status Baru: {simulatorResult.newStatus}</span>
              <span>•</span>
              <span className={simulatorResult.upgradedToPro ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
                Upgraded to PRO: {String(simulatorResult.upgradedToPro)}
              </span>
            </div>
            <button onClick={() => setSimulatorResult(null)} className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari order ID, email pengguna, atau token snap..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 px-2 text-[11px] font-semibold">Status:</span>
            {(['ALL', 'ACTIVE', 'PENDING', 'REJECTED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  statusFilter === s
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'ALL' ? 'Semua' : s}
              </button>
            ))}
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="text-slate-500 px-2 text-[11px] font-semibold">Metode:</span>
            {(['ALL', 'MIDTRANS', 'MANUAL_TRANSFER'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setPaymentMethodFilter(m)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  paymentMethodFilter === m
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m === 'ALL' ? 'Semua' : m === 'MANUAL_TRANSFER' ? 'Transfer Bank' : 'Midtrans'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Subscriptions Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Order ID & Tanggal (WIB)</th>
                <th className="py-3.5 px-4 font-bold">Pelanggan</th>
                <th className="py-3.5 px-4 font-bold">Nominal Paket</th>
                <th className="py-3.5 px-4 font-bold">Metode Pembayaran</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Masa Berlaku</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat daftar transaksi langganan...
                  </td>
                </tr>
              ) : filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada transaksi langganan yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const isPending = sub.status === 'PENDING';
                  const isMidtrans = sub.payment_method === 'MIDTRANS';
                  const isManual = sub.payment_method === 'MANUAL_TRANSFER';

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                      {/* Order ID & Date */}
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-800 text-[11px]">{sub.order_id}</div>
                        <div className="text-[10px] text-slate-400">
                          {sub.created_at ? sub.created_at.slice(0, 16).replace('T', ' ') : '-'} WIB
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">
                          {sub.metadata?.customerName || sub.metadata?.senderAccountName || 'Pengguna TataDana'}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono truncate max-w-[160px]">
                          {sub.metadata?.customerEmail || sub.user_id}
                        </div>
                      </td>

                      {/* Amount & Plan */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{formatRupiah(sub.amount)}</div>
                        <div className="text-[10px] text-orange-600 font-bold">
                          PRO ({sub.metadata?.planType === 'YEARLY' ? '1 Tahun' : '1 Bulan'})
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-3 px-4">
                        {isMidtrans ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">
                            <CreditCard className="w-3.5 h-3.5" /> Midtrans Snap
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-bold">
                            <Receipt className="w-3.5 h-3.5" /> Transfer Manual
                          </span>
                        )}
                        {sub.metadata?.bankName && (
                          <div className="text-[10px] text-slate-400">{sub.metadata.bankName}</div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">{getStatusBadge(sub.status)}</td>

                      {/* Expiration Date */}
                      <td className="py-3 px-4 text-slate-500">
                        {sub.expires_at ? (
                          <span className="font-mono text-[11px] text-slate-800 font-semibold">
                            {sub.expires_at.slice(0, 10)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Admin Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If Pending: Approve & Reject Buttons */}
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(sub)}
                                disabled={actionLoading === sub.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition shadow-xs"
                                title="Setujui pembayaran dan aktifkan paket PRO pengguna"
                              >
                                <CheckCircle2 className="w-3 h-3" /> Setujui
                              </button>

                              <button
                                onClick={() => {
                                  setRejectingSub(sub);
                                  setRejectionReason('Bukti transfer tidak valid atau belum masuk');
                                }}
                                disabled={actionLoading === sub.id}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] flex items-center gap-1 transition"
                                title="Tolak pembayaran"
                              >
                                <XCircle className="w-3 h-3" /> Tolak
                              </button>
                            </>
                          )}

                          {/* Quick simulator shortcut if Midtrans */}
                          {isMidtrans && (
                            <button
                              onClick={() => {
                                setSimulatorOrderId(sub.order_id);
                                window.scrollTo({ top: 150, behavior: 'smooth' });
                              }}
                              className="px-2 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-[11px] transition"
                              title="Pilih untuk simulasi pembayaran sandbox"
                            >
                              <Zap className="w-3 h-3 inline mr-1" /> Uji
                            </button>
                          )}

                          {/* Detail Button */}
                          <button
                            onClick={() => setSelectedSub(sub)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] transition"
                            title="Lihat rincian transaksi lengkap"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Transaction Detail Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-orange-500" /> Rincian Tagihan & Transaksi Midtrans
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Order ID: {selectedSub.order_id}</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Status and Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Status Pembayaran</span>
                  <div className="mt-1">{getStatusBadge(selectedSub.status)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Nominal Tagihan</span>
                  <span className="font-bold text-sm text-slate-900 mt-1 block">
                    {formatRupiah(selectedSub.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Metode Pembayaran</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {selectedSub.payment_method}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Mulai Berlangganan</span>
                  <span className="font-mono text-slate-800 font-semibold mt-1 block">
                    {selectedSub.starts_at?.slice(0, 10) || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Berakhir Pada</span>
                  <span className="font-mono text-slate-800 font-semibold mt-1 block">
                    {selectedSub.expires_at?.slice(0, 10) || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Snap Token</span>
                  <span className="font-mono text-[10px] text-orange-600 font-bold mt-1 block truncate">
                    {selectedSub.snap_token || '-'}
                  </span>
                </div>
              </div>

              {/* Transfer Proof Image if available */}
              {selectedSub.metadata?.transferProofUrl && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-amber-500" /> Bukti Transfer Terlampir:
                  </h4>
                  <div className="rounded-xl overflow-hidden border border-slate-200 max-h-64 bg-slate-50 flex items-center justify-center">
                    <img
                      src={selectedSub.metadata.transferProofUrl}
                      alt="Bukti Transfer"
                      className="max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Raw Metadata JSON */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800">Metadata Transaksi:</h4>
                <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-200 overflow-x-auto">
                  {JSON.stringify(selectedSub.metadata || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">ID Langganan: {selectedSub.id}</span>
              <div className="flex items-center gap-2">
                {selectedSub.status === 'PENDING' && (
                  <button
                    onClick={() => {
                      handleApprove(selectedSub);
                      setSelectedSub(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs"
                  >
                    Setujui Langganan
                  </button>
                )}
                <button
                  onClick={() => setSelectedSub(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Rejection Reason Modal */}
      {rejectingSub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-600" /> Tolak Pembayaran
              </h3>
              <button onClick={() => setRejectingSub(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Konfirmasi penolakan order <strong className="text-slate-800">{rejectingSub.order_id}</strong>. Tindakan ini
              akan dicatat ke dalam audit trail privasi.
            </p>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-700 font-bold">Alasan Penolakan:</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => setRejectingSub(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Batal
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-xs"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
