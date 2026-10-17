'use client';

// ==============================================================================
// TataDana: Multi-Wallet Management View (/dashboard/wallets)
// Kelola multi-rekening & dompet (Cash, BCA, Mandiri, GoPay, OVO),
// tetapkan dompet default untuk Telegram bot, dan transfer saldo antar-dompet secara instan.
// Modern Orange-White Fintech Theme
// ==============================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Wallet, Transaction } from '@/types/database';
import { formatRupiah, formatWIB, toWIBISOString } from '@/lib/date-utils';
import {
  Wallet as WalletIcon,
  CreditCard,
  Smartphone,
  Banknote,
  TrendingUp,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  Star,
  RefreshCw,
  X,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);

  // Transfer Form State
  const [sourceWalletId, setSourceWalletId] = useState('');
  const [destWalletId, setDestWalletId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDesc, setTransferDesc] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  // Add Wallet Form State
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState('BANK');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newWalletColor, setNewWalletColor] = useState('#2563eb');
  const [newWalletDefault, setNewWalletDefault] = useState(false);
  const [newWalletNote, setNewWalletNote] = useState('');
  const [addWalletLoading, setAddWalletLoading] = useState(false);
  const [addWalletError, setAddWalletError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  const closeAddWalletModal = useCallback(() => {
    setIsAddWalletOpen(false);
    setAddWalletError(null);
    setNewWalletName('');
    setNewWalletBalance('');
    setNewWalletNote('');
    setNewWalletDefault(false);
    setNewWalletType('BANK');
    setNewWalletColor('#2563eb');
  }, []);

  // Fetch wallets and transactions
  const loadWalletsData = useCallback(async () => {
    try {
      setRefreshing(true);
      const [wRes, txRes] = await Promise.all([
        fetch('/api/wallets'),
        fetch('/api/transactions?type=TRANSFER&limit=10'),
      ]);

      const wJson = await wRes.json();
      const txJson = await txRes.json();

      if (wJson.data) {
        setWallets(wJson.data);
        const def = wJson.data.find((w: Wallet) => w.is_default) || wJson.data[0];
        if (def && !sourceWalletId) setSourceWalletId(def.id);
        const other = wJson.data.find((w: Wallet) => w.id !== def?.id);
        if (other && !destWalletId) setDestWalletId(other.id);
      }

      if (txJson.data) {
        setRecentTransfers(txJson.data);
      }
    } catch (err) {
      console.error('Failed to load wallets data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sourceWalletId, destWalletId]);

  useEffect(() => {
    loadWalletsData();
  }, [loadWalletsData]);

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAddWalletOpen) {
          closeAddWalletModal();
        }
        if (isTransferModalOpen) {
          setIsTransferModalOpen(false);
          setTransferError(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddWalletOpen, isTransferModalOpen, closeAddWalletModal]);

  // Set Default Wallet
  const handleSetDefault = async (walletId: string) => {
    // Optimistically update local state immediately
    setWallets((prev) =>
      prev.map((w) => ({
        ...w,
        is_default: w.id === walletId,
      }))
    );
    try {
      setRefreshing(true);
      const res = await fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_default', wallet_id: walletId }),
      });
      if (res.ok) {
        await loadWalletsData();
      }
    } catch (err) {
      console.error('Failed to set default wallet:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Submit Inter-Wallet Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError(null);
    setTransferSuccess(null);

    const numAmount = Number(transferAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setTransferError('Nominal transfer harus lebih besar dari 0.');
      return;
    }

    if (!sourceWalletId || !destWalletId) {
      setTransferError('Pilih dompet sumber dan tujuan.');
      return;
    }

    if (sourceWalletId === destWalletId) {
      setTransferError('Dompet sumber dan tujuan tidak boleh sama.');
      return;
    }

    const srcWallet = wallets.find((w) => w.id === sourceWalletId);
    if (srcWallet && Number(srcWallet.balance) < numAmount) {
      setTransferError(`Saldo ${srcWallet.name} tidak mencukupi (Tersedia: ${formatRupiah(Number(srcWallet.balance))}).`);
      return;
    }

    try {
      setTransferLoading(true);
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_id: sourceWalletId,
          destination_wallet_id: destWalletId,
          type: 'TRANSFER',
          amount: numAmount,
          description: transferDesc || 'Transfer Antar Dompet',
          transaction_date: toWIBISOString(),
          source: 'MANUAL',
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal memproses transfer');
      }

      setTransferSuccess(`Transfer sebesar ${formatRupiah(numAmount)} berhasil diproses!`);
      setTransferAmount('');
      setTransferDesc('');
      await loadWalletsData();

      setTimeout(() => {
        setIsTransferModalOpen(false);
        setTransferSuccess(null);
      }, 1500);
    } catch (err: any) {
      setTransferError(err.message || 'Gagal melakukan transfer');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (addWalletError) setAddWalletError(null);
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setNewWalletBalance('');
      return;
    }
    const num = parseInt(raw, 10);
    setNewWalletBalance('Rp ' + num.toLocaleString('id-ID'));
  };

  // Submit Add Wallet
  const handleAddWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddWalletError(null);

    const trimmedName = newWalletName.trim();
    if (!trimmedName) {
      setAddWalletError('Nama Wallet / Akun wajib diisi.');
      return;
    }

    const rawDigits = newWalletBalance.replace(/\D/g, '');
    if (!rawDigits) {
      setAddWalletError('Saldo Awal wajib diisi.');
      return;
    }

    const initBalance = Number(rawDigits);
    if (isNaN(initBalance)) {
      setAddWalletError('Saldo awal harus berupa angka valid.');
      return;
    }

    try {
      setAddWalletLoading(true);
      let createdWallet: Wallet | null = null;

      try {
        const res = await fetch('/api/wallets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: trimmedName,
            type: newWalletType,
            balance: initBalance,
            color: newWalletColor,
            is_default: newWalletDefault,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            createdWallet = json.data;
          }
        }
      } catch (apiErr) {
        console.warn('API error, saving wallet to state:', apiErr);
      }

      const walletToAdd: Wallet & { note?: string } = {
        ...(createdWallet || {}),
        id: createdWallet?.id || `wallet-${Date.now()}`,
        user_id: createdWallet?.user_id || 'user-dev-tatadana-01',
        name: trimmedName,
        type: newWalletType as any,
        balance: initBalance,
        color: newWalletColor,
        icon: 'wallet',
        is_default: newWalletDefault,
        note: newWalletNote.trim() || undefined,
        created_at: createdWallet?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        transactionCount: 0,
      };

      setWallets((prev) => {
        let updated = prev;
        if (newWalletDefault) {
          updated = updated.map((w) => ({ ...w, is_default: false }));
          return [walletToAdd, ...updated];
        }
        return [...updated, walletToAdd];
      });

      // Reset and close modal
      closeAddWalletModal();

      // Toast Notification
      showToast(`Dompet "${trimmedName}" berhasil ditambahkan!`);
    } catch (err: any) {
      setAddWalletError(err.message || 'Gagal menambahkan dompet baru');
    } finally {
      setAddWalletLoading(false);
    }
  };

  const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);
  const defaultWallet = wallets.find((w) => w.is_default);

  const getWalletIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'BANK':
      case 'BANK REKENING':
        return CreditCard;
      case 'EWALLET':
      case 'E-WALLET':
        return Smartphone;
      case 'CASH':
      case 'DOMPET KAS / TUNAI':
        return Banknote;
      default:
        return WalletIcon;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              Multi-Wallet Management
            </span>
            <span className="text-xs text-slate-500">Asia/Jakarta (WIB)</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
            👛 Dompet & Rekening Keuangan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau saldo Tunai, Rekening Bank (BCA, Mandiri), dan E-Wallet (GoPay, OVO).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadWalletsData}
            disabled={refreshing}
            aria-label="Segarkan dompet"
            className="p-2.5 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setTransferError(null);
              setTransferSuccess(null);
              setIsTransferModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors active:scale-95"
          >
            <ArrowRightLeft className="w-4 h-4 text-orange-600" />
            <span>Transfer Antar Dompet</span>
          </button>

          <button
            onClick={() => {
              setAddWalletError(null);
              setIsAddWalletOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Tambah Wallet</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Saldo Terakumulasi</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-mono">
            {formatRupiah(totalBalance)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Gabungan seluruh {wallets.length} dompet aktif</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Dompet Utama (Default Telegram)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-emerald-500" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight truncate">
            {defaultWallet?.name || 'Belum Diatur'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Saldo: {defaultWallet ? formatRupiah(Number(defaultWallet.balance)) : 'Rp 0'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Jumlah Rekening Terhubung</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <WalletIcon className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-mono">
            {wallets.length} Akun
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Bank, E-Wallet & Dompet Tunai</p>
        </div>
      </div>

      {/* Wallet Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Daftar Dompet & Saldo</h3>
          <span className="text-xs text-slate-500 font-semibold">{wallets.length} dompet terdaftar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map((w) => {
            const IconComponent = getWalletIcon(w.type);
            return (
              <div
                key={w.id}
                className={`p-5 rounded-2xl bg-white border transition-all duration-200 relative group overflow-hidden shadow-xs ${
                  w.is_default
                    ? 'border-orange-300 ring-1 ring-orange-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Card Top: Icon, Type & Default Badge */}
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: w.color || '#f97316' }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight truncate">
                        {w.name}
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        {w.type}
                      </span>
                    </div>
                  </div>

                  {w.is_default ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                      <Star className="w-3 h-3 fill-orange-500" />
                      <span>Utama</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(w.id)}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      Jadikan Utama
                    </button>
                  )}
                </div>

                {/* Balance Display */}
                <div className="my-4 relative z-10">
                  <span className="text-[11px] font-medium text-slate-500">Saldo Saat Ini</span>
                  <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-mono">
                    {formatRupiah(Number(w.balance))}
                  </p>
                  {(w as any).note && (
                    <p className="text-[11px] text-slate-500 mt-1.5 truncate flex items-center gap-1" title={(w as any).note}>
                      <span className="text-slate-400">Catatan:</span>
                      <span className="italic font-medium text-slate-600">{(w as any).note}</span>
                    </p>
                  )}
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
                  <span className="text-[11px] text-slate-400">
                    {(w as any).transactionCount || 0} transaksi
                  </span>

                  <button
                    onClick={() => {
                      setSourceWalletId(w.id);
                      const other = wallets.find((o) => o.id !== w.id);
                      if (other) setDestWalletId(other.id);
                      setTransferError(null);
                      setTransferSuccess(null);
                      setIsTransferModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-bold text-xs"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Transfer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfer History Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-orange-600" />
              <span>Riwayat Transfer Antar Dompet</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pencatatan perpindahan saldo antar rekening & e-wallet
            </p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{recentTransfers.length} aktivitas</span>
        </div>

        {recentTransfers.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Belum ada riwayat transfer antar dompet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTransfers.map((tx) => (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {tx.description}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <span>{tx.wallet?.name || 'Dompet Asal'}</span>
                      <span className="mx-1 text-orange-600">→</span>
                      <span>{tx.destination_wallet?.name || 'Dompet Tujuan'}</span>
                      <span className="mx-1.5">•</span>
                      <span className="text-slate-400">{formatWIB(tx.transaction_date, 'short')} WIB</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs md:text-sm font-black font-mono text-blue-600">
                    {formatRupiah(Number(tx.amount))}
                  </p>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700">
                    TRANSFER
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Inter-Wallet Transfer */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">Transfer Antar Dompet</h3>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {transferError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {transferError}
              </div>
            )}

            {transferSuccess && (
              <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{transferSuccess}</span>
              </div>
            )}

            <form onSubmit={handleTransferSubmit} className="space-y-4">
              {/* Source Wallet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dari Dompet (Sumber)
                </label>
                <select
                  value={sourceWalletId}
                  onChange={(e) => setSourceWalletId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(Number(w.balance))})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Wallet */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ke Dompet (Tujuan)
                </label>
                <select
                  value={destWalletId}
                  onChange={(e) => setDestWalletId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id} disabled={w.id === sourceWalletId}>
                      {w.name} ({formatRupiah(Number(w.balance))})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nominal Transfer (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="1000"
                    placeholder="0"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Quick Nominal Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTransferAmount(String(amt))}
                      className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    >
                      +{formatRupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan / Keterangan
                </label>
                <input
                  type="text"
                  placeholder="cth: Top Up Saldo GoPay dari Rekening BCA"
                  value={transferDesc}
                  onChange={(e) => setTransferDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={transferLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {transferLoading ? 'Memproses...' : 'Eksekusi Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add New Wallet (Dark Mode) */}
      {isAddWalletOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeAddWalletModal();
            }
          }}
        >
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-[#18181b] border border-orange-500/30 shadow-2xl shadow-black/80 space-y-4 text-zinc-100 relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
                  <WalletIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-100">Tambah Wallet Baru</h3>
                  <p className="text-[11px] text-zinc-400">Tambahkan rekening bank, e-wallet, atau kas fisik</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeAddWalletModal}
                className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800/80 transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Alert */}
            {addWalletError && (
              <div className="p-3 text-xs text-rose-300 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{addWalletError}</span>
              </div>
            )}

            <form onSubmit={handleAddWalletSubmit} className="space-y-4">
              {/* 1. Nama Wallet / Akun */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nama Wallet / Akun <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Bank Jago, DANA, Dompet Fisik"
                  value={newWalletName}
                  onChange={(e) => {
                    setNewWalletName(e.target.value);
                    if (addWalletError) setAddWalletError(null);
                  }}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>

              {/* 2. Tipe / Kategori Wallet */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tipe / Kategori Wallet <span className="text-orange-500">*</span>
                </label>
                <select
                  value={newWalletType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewWalletType(val);
                    if (val === 'BANK') setNewWalletColor('#2563eb');
                    else if (val === 'EWALLET') setNewWalletColor('#06b6d4');
                    else if (val === 'CASH') setNewWalletColor('#10b981');
                    else setNewWalletColor('#f97316');
                  }}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                >
                  <option value="BANK">Bank Rekening</option>
                  <option value="EWALLET">E-Wallet</option>
                  <option value="CASH">Dompet Kas / Tunai</option>
                  <option value="OTHER">Lainnya</option>
                </select>
              </div>

              {/* 3. Saldo Awal with format Rupiah */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Saldo Awal <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Rp 500.000"
                  value={newWalletBalance}
                  onChange={handleBalanceChange}
                  className="w-full px-3 py-2 text-xs font-bold font-mono text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>

              {/* 4. Catatan / Keterangan (Opsional) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Catatan / Keterangan <span className="text-zinc-500 font-normal">(Opsional)</span>
                </label>
                <input
                  type="text"
                  placeholder="contoh: Rekening tabungan liburan, dana darurat"
                  value={newWalletNote}
                  onChange={(e) => setNewWalletNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>

              {/* 5. Checkbox / Toggle: Jadikan Default untuk Telegram */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="wallet-default-chk"
                  checked={newWalletDefault}
                  onChange={(e) => setNewWalletDefault(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-orange-600 focus:ring-orange-500 border-zinc-700 bg-[#121215] accent-orange-500 cursor-pointer"
                />
                <label htmlFor="wallet-default-chk" className="text-xs text-zinc-300 cursor-pointer select-none leading-relaxed">
                  Jadikan Default untuk Telegram <span className="text-zinc-500 block text-[11px]">(jika dicentang, pindahkan status default dari wallet sebelumnya)</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeAddWalletModal}
                  className="px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl bg-zinc-800/80 hover:bg-zinc-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addWalletLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {addWalletLoading ? 'Menyimpan...' : 'Simpan Wallet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#18181b] border border-orange-500/40 text-zinc-100 shadow-2xl shadow-black/80">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-zinc-200">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-500 hover:text-zinc-300 ml-1.5 p-1 rounded hover:bg-zinc-800"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
