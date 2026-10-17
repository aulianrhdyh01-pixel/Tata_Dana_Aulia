'use client';

// ==============================================================================
// TataDana: Halaman Transaksi (/dashboard/transactions)
// Halaman native untuk pencatatan dan manajemen transaksi keuangan
// Fitur:
// - Catat Pemasukan, Pengeluaran, Transfer antar wallet
// - Filter & Search: tipe, wallet, kategori, keyword
// - Multi-item receipt expansion
// - Loading skeleton & empty state dengan action button
// - Realtime updates
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Receipt,
  Trash2,
  Calendar,
  Wallet as WalletIcon,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Sparkles,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { Transaction, Wallet, Category, TransactionItem } from '@/types/database';
import { formatRupiah, formatWIB } from '@/lib/date-utils';
import { AddTransactionModal } from '@/components/dashboard/add-transaction-modal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedWallet, setSelectedWallet] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals & expansions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [txRes, wRes, bRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/wallets'),
        fetch('/api/budgets'),
      ]);

      const txJson = await txRes.json();
      const wJson = await wRes.json();
      const bJson = await bRes.json();

      if (txJson.data) setTransactions(txJson.data);
      if (wJson.data) setWallets(wJson.data);
      if (bJson.categories) setCategories(bJson.categories);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data transaksi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to custom event from global modal or other components
    const handleTxCreated = () => loadData();
    window.addEventListener('tatadana:transaction-created', handleTxCreated);
    return () => window.removeEventListener('tatadana:transaction-created', handleTxCreated);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini? Saldo dompet akan disesuaikan otomatis.')) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/transactions?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } else {
        alert('Gagal menghapus transaksi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menghapus transaksi.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filtered transactions
  const filtered = transactions.filter((t) => {
    if (selectedType !== 'ALL' && t.type !== selectedType) return false;
    if (selectedWallet !== 'ALL' && t.wallet_id !== selectedWallet && t.destination_wallet_id !== selectedWallet) {
      return false;
    }
    if (selectedCategory !== 'ALL' && t.category_id !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const descMatch = (t.description || '').toLowerCase().includes(q);
      const catMatch = (t.category?.name || '').toLowerCase().includes(q);
      const walletMatch = (t.wallet?.name || '').toLowerCase().includes(q);
      return descMatch || catMatch || walletMatch;
    }
    return true;
  });

  // Calculate totals
  const totalIncome = filtered
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = filtered
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + Number(t.amount), 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              Pencatatan Keuangan
            </span>
            <span className="text-xs text-slate-500">Asia/Jakarta (WIB)</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            💳 Riwayat & Input Transaksi
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Catat pemasukan, pengeluaran, dan transfer dompet secara manual atau otomatis via Bot Telegram.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Muat Ulang Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pemasukan Terfilter</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-black text-emerald-600 font-mono mt-2">
            {formatRupiah(totalIncome)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pengeluaran Terfilter</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg md:text-xl font-black text-rose-600 font-mono mt-2">
            {formatRupiah(totalExpense)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Arus Kas Bersih (Net)</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-lg md:text-xl font-black font-mono mt-2 ${netFlow >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatRupiah(netFlow)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">Semua Jenis Transaksi</option>
            <option value="EXPENSE">Pengeluaran Saja</option>
            <option value="INCOME">Pemasukan Saja</option>
            <option value="TRANSFER">Transfer Dompet</option>
          </select>

          {/* Wallet Filter */}
          <select
            value={selectedWallet}
            onChange={(e) => setSelectedWallet(e.target.value)}
            className="px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">Semua Dompet / Rekening</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          // Loading Skeleton
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-200 rounded-xl" />
                  <div className="space-y-2">
                    <div className="w-36 h-4 bg-slate-200 rounded" />
                    <div className="w-24 h-3 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="w-24 h-5 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          // Friendly Empty State with Action
          <div className="py-16 px-4 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Belum Ada Transaksi Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              {searchQuery || selectedType !== 'ALL' || selectedWallet !== 'ALL'
                ? 'Tidak ada transaksi yang cocok dengan filter yang dipilih. Silakan reset filter pencarian.'
                : 'Mulai kelola keuangan Anda sekarang dengan mencatat pemasukan atau pengeluaran pertama!'}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi Sekarang</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((tx) => {
              const isExpense = tx.type === 'EXPENSE';
              const isIncome = tx.type === 'INCOME';
              const isTransfer = tx.type === 'TRANSFER';
              const hasItems = tx.items && tx.items.length > 0;
              const isExpanded = expandedTxId === tx.id;

              return (
                <div key={tx.id} className="transition-colors hover:bg-slate-50/70">
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Icon, Category & Details */}
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isExpense
                            ? 'bg-rose-50 text-rose-600'
                            : isIncome
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-blue-50 text-blue-600'
                        }`}
                      >
                        {isExpense ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : isIncome ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowRightLeft className="w-5 h-5" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {tx.description || (isTransfer ? 'Transfer Antar Dompet' : 'Transaksi')}
                          </p>
                          {/* Source badge */}
                          {tx.source === 'TELEGRAM' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200">
                              <Bot className="w-3 h-3" />
                              Bot Telegram
                            </span>
                          )}
                          {hasItems && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              <Receipt className="w-3 h-3" />
                              {tx.items?.length} item struk
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                          <span>{tx.category ? `${tx.category.icon} ${tx.category.name}` : 'Transfer'}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <WalletIcon className="w-3 h-3" />
                            {tx.wallet?.name || 'Dompet'}
                            {isTransfer && tx.destination_wallet && ` → ${tx.destination_wallet.name}`}
                          </span>
                          <span>•</span>
                          <span>{formatWIB(tx.transaction_date, 'date-time')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Nominal & Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-13 sm:pl-0">
                      <div className="text-right">
                        <p
                          className={`text-sm sm:text-base font-black font-mono ${
                            isExpense
                              ? 'text-rose-600'
                              : isIncome
                              ? 'text-emerald-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {isExpense ? '-' : isIncome ? '+' : ''}
                          {formatRupiah(Number(tx.amount))}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {hasItems && (
                          <button
                            onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Lihat Rincian Struk"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-orange-600" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Struk Detail Table */}
                  {isExpanded && hasItems && (
                    <div className="px-5 pb-4 pt-1 bg-slate-50/80 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-orange-600" />
                        <span>Rincian Barang Belanja (Foto Struk AI Vision):</span>
                      </div>
                      <div className="space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                        {tx.items?.map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0"
                          >
                            <span className="text-slate-800">
                              {it.qty > 1 ? `${it.qty}x ` : ''}
                              {it.item_name}
                            </span>
                            <span className="font-mono font-semibold text-slate-900">
                              {formatRupiah(Number(it.total || it.price * it.qty))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
