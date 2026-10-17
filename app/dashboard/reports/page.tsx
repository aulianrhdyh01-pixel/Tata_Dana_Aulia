'use client';

// ==============================================================================
// TataDana: Reports & Transaction Analytics View (/dashboard/reports)
// Modern Orange-White Fintech Theme
// Interactive data table with sorting, search, multi-filters (period, wallet, category, type),
// multi-item receipt expansion, on-demand PDF and Excel export triggers calling
// /api/export/pdf and /api/export/excel, generated export history, and Supabase Realtime sync.
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, Wallet, Category } from '@/types/database';
import { formatRupiah, formatWIB } from '@/lib/date-utils';
import { ExportHistoryItem } from '@/lib/export/export-history-store';
import { supabase } from '@/lib/supabase/client';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Layers,
  Receipt,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  Camera,
  Bot,
  Mic,
  ArrowRightLeft,
  FileCode,
  TrendingUp,
  TrendingDown,
  Wallet as WalletIcon,
} from 'lucide-react';

export default function ReportsPage() {
  // Filter States
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<string>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'amount' | 'desc'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Data States
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<Transaction | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile') || localStorage.getItem('tatadana_user');
      if (stored) {
        setUserProfile(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Requirement 3: PRO VIP Full Export Unlocked
  const isProVip = !userProfile || 
    userProfile?.email === 'shopnoure1619@gmail.com' || 
    userProfile?.role === 'SUPERADMIN' || 
    String(userProfile?.statusPaket || '').toUpperCase().includes('PRO') || 
    String(userProfile?.plan || '').toUpperCase().includes('PRO');

  // Load Transactions & Metadata
  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(pageSize));
      if (search) params.set('search', search);
      if (period) params.set('period', period);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (selectedWallet !== 'all') params.set('wallet_id', selectedWallet);
      if (selectedCategory !== 'all') params.set('category_id', selectedCategory);
      if (selectedType !== 'all') params.set('type', selectedType);

      const [txRes, wRes, bgtRes, histRes] = await Promise.all([
        fetch(`/api/transactions?${params.toString()}`),
        fetch('/api/wallets'),
        fetch('/api/budgets'),
        fetch('/api/export/history'),
      ]);

      const txJson = await txRes.json();
      const wJson = await wRes.json();
      const bgtJson = await bgtRes.json();
      const histJson = await histRes.json();

      if (txJson.data) {
        setTransactions(txJson.data);
        setTotalCount(txJson.total || txJson.data.length);
        setTotalPages(txJson.totalPages || Math.ceil((txJson.total || txJson.data.length) / pageSize));
      }

      if (wJson.data) {
        setWallets(wJson.data);
      }

      if (bgtJson.categories) {
        setCategories(bgtJson.categories);
      }

      if (histJson.history) {
        setExportHistory(histJson.history);
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, pageSize, search, period, startDate, endDate, selectedWallet, selectedCategory, selectedType]);

  useEffect(() => {
    loadData();

    // Supabase Realtime for live updates without manual refresh
    const channel = supabase
      .channel('public:reports_transactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          loadData();
        }
      )
      .subscribe();

    const handleCreated = () => loadData();
    window.addEventListener('tatadana:transaction-created', handleCreated);

    return () => {
      window.removeEventListener('tatadana:transaction-created', handleCreated);
      if (channel && typeof channel.unsubscribe === 'function') {
        channel.unsubscribe();
      }
    };
  }, [loadData]);

  // Handle Sort
  const handleSort = (field: 'date' | 'amount' | 'desc') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortField === 'date') {
      const timeA = new Date(a.transaction_date).getTime();
      const timeB = new Date(b.transaction_date).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    }
    if (sortField === 'amount') {
      const amtA = Number(a.amount);
      const amtB = Number(b.amount);
      return sortOrder === 'asc' ? amtA - amtB : amtB - amtA;
    }
    if (sortField === 'desc') {
      const descA = a.description || '';
      const descB = b.description || '';
      return sortOrder === 'asc' ? descA.localeCompare(descB) : descB.localeCompare(descA);
    }
    return 0;
  });

  // Export PDF Trigger
  const handleExportPDF = async () => {
    try {
      setExportingPDF(true);
      const params = new URLSearchParams();
      params.set('period', period);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (selectedWallet !== 'all') params.set('wallet_id', selectedWallet);
      if (selectedCategory !== 'all') params.set('category_id', selectedCategory);
      if (selectedType !== 'all') params.set('type', selectedType);

      const res = await fetch(`/api/export/pdf?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal menghasilkan file PDF.');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `TataDana_Laporan_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Refresh export history
      await loadData();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Gagal mengekspor laporan PDF.');
    } finally {
      setExportingPDF(false);
    }
  };

  // Export Excel Trigger
  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      const params = new URLSearchParams();
      params.set('period', period);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (selectedWallet !== 'all') params.set('wallet_id', selectedWallet);
      if (selectedCategory !== 'all') params.set('category_id', selectedCategory);
      if (selectedType !== 'all') params.set('type', selectedType);

      const res = await fetch(`/api/export/excel?${params.toString()}`);
      if (!res.ok) throw new Error('Gagal menghasilkan file Excel.');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `TataDana_Laporan_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      // Refresh export history
      await loadData();
    } catch (err) {
      console.error('Error generating Excel:', err);
      alert('Gagal mengekspor laporan Excel.');
    } finally {
      setExportingExcel(false);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch('');
    setPeriod('month');
    setStartDate('');
    setEndDate('');
    setSelectedWallet('all');
    setSelectedCategory('all');
    setSelectedType('all');
    setPage(1);
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'TELEGRAM_TEXT':
      case 'TELEGRAM':
        return { label: 'Telegram Bot', icon: Bot, style: 'bg-sky-50 text-sky-700 border-sky-200' };
      case 'TELEGRAM_RECEIPT':
        return { label: 'Struk OCR', icon: Camera, style: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'TELEGRAM_VOICE':
        return { label: 'Voice Note', icon: Mic, style: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'TRANSFER':
        return { label: 'Transfer', icon: ArrowRightLeft, style: 'bg-blue-50 text-blue-700 border-blue-200' };
      default:
        return { label: 'Manual Web', icon: FileCode, style: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  // Ringkasan Laporan Per Periode (Part 3)
  const periodIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const periodExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const netCashflow = periodIncome - periodExpense;

  const categoryExpenseMap: Record<string, { name: string; icon: string; total: number; count: number }> = {};
  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      const catName = t.category?.name || 'Lain-lain';
      const catIcon = t.category?.icon || '💸';
      if (!categoryExpenseMap[catName]) {
        categoryExpenseMap[catName] = { name: catName, icon: catIcon, total: 0, count: 0 };
      }
      categoryExpenseMap[catName].total += Number(t.amount || 0);
      categoryExpenseMap[catName].count += 1;
    });

  const top5Categories = Object.values(categoryExpenseMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {isProVip ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-mono">
                <span>👑</span>
                <span>PRO VIP (Ekspor PDF & Excel Tak Terbatas)</span>
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                Laporan Keuangan
              </span>
            )}
            <span className="text-xs text-slate-500">Format Resmi Asia/Jakarta (WIB)</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
            📊 Laporan Transaksi & Mutasi Keuangan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Eksplorasi tabel mutasi interaktif, filter multi-dimensi, dan unduh berkas laporan PDF & Excel langsung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <button
            onClick={loadData}
            disabled={refreshing}
            aria-label="Segarkan laporan"
            className="p-2.5 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
          </button>

          {/* PDF Export Button */}
          <button
            onClick={handleExportPDF}
            disabled={exportingPDF}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-md shadow-rose-600/20 transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>{exportingPDF ? 'Membuat PDF...' : 'Ekspor PDF'}</span>
          </button>

          {/* Excel Export Button */}
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exportingExcel ? 'Membuat Excel...' : 'Ekspor Excel (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Filter Bar */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-600" />
            <span>Filter Transaksi</span>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-[11px] text-slate-500 hover:text-orange-600 underline underline-offset-2"
          >
            Reset Semua Filter
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari deskripsi / catatan..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Period Filter */}
          <div>
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
            >
              <option value="month">Bulan Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="today">Hari Ini</option>
              <option value="year">Tahun Ini</option>
              <option value="custom">Rentang Tanggal Kustom</option>
            </select>
          </div>

          {/* Wallet Filter */}
          <div>
            <select
              value={selectedWallet}
              onChange={(e) => {
                setSelectedWallet(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
            >
              <option value="all">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
            >
              <option value="all">Semua Tipe</option>
              <option value="EXPENSE">Pengeluaran</option>
              <option value="INCOME">Pemasukan</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
        </div>

        {/* Custom Date Pickers */}
        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Dari:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Sampai:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="px-2.5 py-1 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Ringkasan Laporan Per Periode (Sesuai Part 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pemasukan */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block mb-1">Total Pemasukan</span>
            <div className="text-lg md:text-xl font-black font-mono text-emerald-600">
              +{formatRupiah(periodIncome)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {transactions.filter((t) => t.type === 'INCOME').length} transaksi masuk
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block mb-1">Total Pengeluaran</span>
            <div className="text-lg md:text-xl font-black font-mono text-rose-600">
              -{formatRupiah(periodExpense)}
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              {transactions.filter((t) => t.type === 'EXPENSE').length} transaksi keluar
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        {/* Net Cashflow */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block mb-1">Net Cashflow</span>
            <div
              className={`text-lg md:text-xl font-black font-mono ${
                netCashflow >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {netCashflow >= 0 ? '+' : ''}{formatRupiah(netCashflow)}
            </div>
            <span
              className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold mt-0.5 ${
                netCashflow >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {netCashflow >= 0 ? 'Arus Kas Surplus' : 'Arus Kas Defisit'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        {/* Total Mutasi */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold block mb-1">Total Mutasi</span>
            <div className="text-lg md:text-xl font-black font-mono text-slate-900">
              {totalCount} Transaksi
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Periode {period} terpilih
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
            <WalletIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top 5 Kategori Pengeluaran */}
      {top5Categories.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs md:text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>🏆 Top 5 Kategori Pengeluaran (Periode Terpilih)</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              Total Beban: {formatRupiah(periodExpense)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-1">
            {top5Categories.map((cat) => {
              const pct = periodExpense > 0 ? Math.round((cat.total / periodExpense) * 100) : 0;
              return (
                <div
                  key={cat.name}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="text-[10px] font-bold text-orange-600 font-mono">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-mono font-bold text-slate-900">{formatRupiah(cat.total)}</span>
                    <span>{cat.count} tx</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Transactions Data Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm md:text-base font-bold text-slate-900 tracking-tight">
            Data Transaksi ({totalCount} rekaman ditemukan)
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Baris per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Tanggal & Jam (WIB)</span>
                    {sortField === 'date' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-orange-600" /> : <ArrowDown className="w-3 h-3 text-orange-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('desc')}
                  className="py-3 px-3 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Keterangan & Rincian Struk</span>
                    {sortField === 'desc' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-orange-600" /> : <ArrowDown className="w-3 h-3 text-orange-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Dompet</th>
                <th className="py-3 px-3">Sumber</th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3 px-3 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Nominal</span>
                    {sortField === 'amount' ? (
                      sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-orange-600" /> : <ArrowDown className="w-3 h-3 text-orange-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 opacity-40" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Tidak ada transaksi yang cocok dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                sortedTransactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isTransfer = tx.type === 'TRANSFER';
                  const source = getSourceBadge(tx.source);
                  const SourceIcon = source.icon;
                  const hasItems = tx.items && tx.items.length > 0;

                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-slate-50 transition-colors group"
                    >
                      {/* Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        {formatWIB(tx.transaction_date, 'full')} WIB
                      </td>

                      {/* Description & Receipt expansion trigger */}
                      <td className="py-3 px-3 min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{tx.description}</span>
                          {hasItems && (
                            <button
                              onClick={() => setSelectedReceiptTx(tx)}
                              className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-colors"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>{tx.items?.length} item struk</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 font-semibold">
                          <span>{tx.category?.icon || '💸'}</span>
                          <span>{tx.category?.name || (isTransfer ? 'Transfer Dompet' : 'Umum')}</span>
                        </span>
                      </td>

                      {/* Wallet */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        <span>{tx.wallet?.name || 'Dompet'}</span>
                        {tx.destination_wallet && (
                          <span className="text-orange-600 font-semibold ml-1">→ {tx.destination_wallet.name}</span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${source.style}`}
                        >
                          <SourceIcon className="w-3 h-3" />
                          <span>{source.label}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right whitespace-nowrap font-black font-mono">
                        <span
                          className={
                            isIncome
                              ? 'text-emerald-600'
                              : isTransfer
                              ? 'text-blue-600'
                              : 'text-rose-600'
                          }
                        >
                          {isIncome ? '+' : isTransfer ? '⇄' : '-'} {formatRupiah(Number(tx.amount))}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500">
            Menampilkan {sortedTransactions.length > 0 ? (page - 1) * pageSize + 1 : 0} hingga{' '}
            {Math.min(page * pageSize, totalCount)} dari {totalCount} transaksi
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                onClick={() => setPage(pNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  page === pNum
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Export History Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm md:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Download className="w-4 h-4 text-orange-600" />
              <span>Riwayat Unduhan Laporan</span>
            </h3>
            <p className="text-xs text-slate-500">
              Daftar file PDF dan Excel yang telah digenerate sebelumnya
            </p>
          </div>
          <span className="text-xs text-slate-500 font-semibold">{exportHistory.length} berkas</span>
        </div>

        {exportHistory.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Belum ada berkas ekspor yang pernah dibuat. Klik tombol Ekspor PDF atau Ekspor Excel di atas untuk membuat laporan pertama.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {exportHistory.map((item) => {
              const isPDF = item.format === 'PDF';
              return (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPDF
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {isPDF ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.fileName}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{item.periodTitle}</span>
                        <span>•</span>
                        <span>{item.filterSummary}</span>
                        <span>•</span>
                        <span className="text-slate-400 font-mono">
                          {formatWIB(item.generatedAt, 'short')} WIB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <p className="text-xs font-bold text-slate-700">{item.fileSizeFormatted}</p>
                      <p className="text-[10px] text-slate-400">{item.recordCount} baris</p>
                    </div>

                    <button
                      onClick={isPDF ? handleExportPDF : handleExportExcel}
                      className="p-2 text-slate-500 hover:text-slate-900 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                      title="Unduh Ulang"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Multi-Item Receipt Expansion Modal */}
      {selectedReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Rincian Multi-Item Struk Belanja</h3>
                  <p className="text-xs text-slate-500">
                    {selectedReceiptTx.description} • {formatWIB(selectedReceiptTx.transaction_date, 'full')} WIB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceiptTx(null)}
                aria-label="Tutup modal struk"
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                    <th className="py-2">Nama Barang / Menu</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Harga Satuan</th>
                    <th className="py-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedReceiptTx.items && selectedReceiptTx.items.length > 0 ? (
                    selectedReceiptTx.items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 font-semibold text-slate-800">{it.item_name}</td>
                        <td className="py-2.5 text-center text-slate-500">{it.qty}</td>
                        <td className="py-2.5 text-right text-slate-500">{formatRupiah(Number(it.price))}</td>
                        <td className="py-2.5 text-right font-bold text-slate-900 font-mono">{formatRupiah(Number(it.total))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        Tidak ada item rincian tersimpan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-600">Total Nominal Struk:</span>
              <span className="font-black text-orange-600 text-base font-mono">
                {formatRupiah(Number(selectedReceiptTx.amount))}
              </span>
            </div>

            <button
              onClick={() => setSelectedReceiptTx(null)}
              className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Tutup Rincian Struk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
