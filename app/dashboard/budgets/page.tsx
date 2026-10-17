'use client';

// ==============================================================================
// TataDana: Category Budgets View (/dashboard/budgets)
// Visual progress bar '█░', percentage spent, alert badges for overspending / warnings,
// add/edit category budget modal, and custom category creator.
// Modern Orange-White Fintech Theme
// ==============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Budget, Category } from '@/types/database';
import { formatRupiah, getCurrentMonthWIB } from '@/lib/date-utils';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Edit2,
  TrendingDown,
  Sparkles,
  Layers,
} from 'lucide-react';

// Generates standardized visual text progress bar e.g. '████████░░'
function generateAsciiProgressBar(percentage: number, totalBlocks = 10): string {
  const filledBlocks = Math.min(totalBlocks, Math.max(0, Math.round((percentage / 100) * totalBlocks)));
  const emptyBlocks = Math.max(0, totalBlocks - filledBlocks);
  return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
}

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthWIB());
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentage: 0,
    overbudgetCount: 0,
    warningCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Budget Modal Form State
  const [budgetCatId, setBudgetCatId] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [budgetModalLoading, setBudgetModalLoading] = useState(false);
  const [budgetModalError, setBudgetModalError] = useState<string | null>(null);

  // Category Modal Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [newCatIcon, setNewCatIcon] = useState('🛍️');
  const [newCatColor, setNewCatColor] = useState('#f97316');
  const [catModalLoading, setCatModalLoading] = useState(false);
  const [catModalError, setCatModalError] = useState<string | null>(null);

  const loadBudgetsData = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/budgets?month=${selectedMonth}`);
      const json = await res.json();

      if (json.data) {
        setBudgets(json.data);
      }
      if (json.categories) {
        setCategories(json.categories);
        if (!budgetCatId && json.categories.length > 0) {
          const firstExp = json.categories.find((c: Category) => c.type === 'EXPENSE') || json.categories[0];
          setBudgetCatId(firstExp.id);
        }
      }
      if (json.summary) {
        setSummary(json.summary);
      }
    } catch (err) {
      console.error('Failed to load budgets:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMonth, budgetCatId]);

  useEffect(() => {
    loadBudgetsData();
  }, [loadBudgetsData]);

  // Open Edit / Add Budget
  const openBudgetModal = (category_id?: string, currentAmount?: number) => {
    setBudgetModalError(null);
    if (category_id) {
      setBudgetCatId(category_id);
    }
    if (currentAmount) {
      setBudgetAmount(String(currentAmount));
    } else {
      setBudgetAmount('');
    }
    setIsBudgetModalOpen(true);
  };

  // Submit Budget
  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetModalError(null);

    const numAmount = Number(budgetAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setBudgetModalError('Nominal anggaran harus lebih dari 0.');
      return;
    }

    try {
      setBudgetModalLoading(true);
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: budgetCatId,
          amount: numAmount,
          month: selectedMonth,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal menyimpan anggaran');
      }

      setIsBudgetModalOpen(false);
      setBudgetAmount('');
      await loadBudgetsData();
    } catch (err: any) {
      setBudgetModalError(err.message || 'Gagal menyimpan anggaran');
    } finally {
      setBudgetModalLoading(false);
    }
  };

  // Submit Category
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatModalError(null);

    if (!newCatName.trim()) {
      setCatModalError('Nama kategori wajib diisi.');
      return;
    }

    try {
      setCatModalLoading(true);
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_category',
          name: newCatName.trim(),
          type: newCatType,
          icon: newCatIcon || '🏷️',
          color: newCatColor,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal membuat kategori baru');
      }

      setIsCategoryModalOpen(false);
      setNewCatName('');
      await loadBudgetsData();
    } catch (err: any) {
      setCatModalError(err.message || 'Gagal membuat kategori');
    } finally {
      setCatModalLoading(false);
    }
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage > 100) {
      return {
        label: `Overbudget (${percentage}%)`,
        style: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: AlertCircle,
      };
    }
    if (percentage >= 80) {
      return {
        label: `Waspada 80% (${percentage}%)`,
        style: 'bg-amber-50 text-amber-700 border-amber-200',
        icon: AlertTriangle,
      };
    }
    return {
      label: `Terkendali (${percentage}%)`,
      style: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">
              Budget & Limit Control
            </span>
            <span className="text-xs text-slate-500">Asia/Jakarta (WIB)</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
            🎯 Anggaran & Batas Pengeluaran
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kendalikan pengeluaran bulanan dengan visual progress bar & peringatan dini Telegram bot.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month Selector */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
          />

          <button
            onClick={loadBudgetsData}
            disabled={refreshing}
            aria-label="Segarkan anggaran"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              setCatModalError(null);
              setIsCategoryModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors active:scale-95"
          >
            <Layers className="w-4 h-4 text-orange-600" />
            <span>Kategori Baru</span>
          </button>

          <button
            onClick={() => openBudgetModal()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Pasang Anggaran</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Total Plafon Anggaran</span>
          <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1 mb-1 font-mono">
            {formatRupiah(summary.totalBudget)}
          </h3>
          <p className="text-[11px] text-slate-400">Plafon bulan {selectedMonth}</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Pengeluaran Terpakai</span>
          <h3 className="text-xl md:text-2xl font-black text-rose-600 tracking-tight mt-1 mb-1 font-mono">
            {formatRupiah(summary.totalSpent)}
          </h3>
          <p className="text-[11px] text-slate-400">
            {summary.overallPercentage}% dari total plafon
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Sisa Anggaran Bebas</span>
          <h3 className="text-xl md:text-2xl font-black text-emerald-600 tracking-tight mt-1 mb-1 font-mono">
            {formatRupiah(summary.totalRemaining)}
          </h3>
          <p className="text-[11px] text-slate-400">
            {Math.max(0, 100 - summary.overallPercentage)}% sisa kuota belanja
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Status Peringatan</span>
          <div className="flex items-center gap-2 mt-1 mb-1">
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight font-mono">
              {summary.overbudgetCount + summary.warningCount}
            </h3>
            <span className="text-xs text-slate-500">Kategori</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {summary.overbudgetCount} Overbudget • {summary.warningCount} Waspada
          </p>
        </div>
      </div>

      {/* Budgets Grid with Visual Progress Bar '█░' */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Anggaran Kategori Bulan Ini ({selectedMonth})
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{budgets.length} kategori dianggarkan</span>
        </div>

        {budgets.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
              <PieChart className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Belum Ada Anggaran untuk Bulan Ini</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tetapkan batas pengeluaran kategori makanan, belanja, atau tagihan agar bot dapat memantau arus kas Anda.
            </p>
            <button
              onClick={() => openBudgetModal()}
              className="px-4 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-all shadow-md shadow-orange-500/20"
            >
              + Pasang Anggaran Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {budgets.map((b) => {
              const cat = b.category;
              const pct = b.percentage || 0;
              const status = getStatusBadge(pct);
              const StatusIcon = status.icon;
              const asciiBar = generateAsciiProgressBar(pct, 12);

              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-2xl bg-white border transition-all duration-200 relative group overflow-hidden shadow-xs ${
                    pct > 100
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : pct >= 80
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : 'border-slate-200 hover:border-orange-300'
                  }`}
                >
                  {/* Top: Icon, Category Name, Alert Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs shrink-0"
                        style={{ backgroundColor: `${cat?.color || '#f97316'}20` }}
                      >
                        {cat?.icon || '🏷️'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                          {cat?.name || 'Kategori'}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Batas: {formatRupiah(Number(b.amount))}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.style}`}
                      >
                        <StatusIcon className="w-3 h-3 shrink-0" />
                        <span>{status.label}</span>
                      </span>

                      <button
                        onClick={() => openBudgetModal(b.category_id, Number(b.amount))}
                        className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Ubah Anggaran"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts Row */}
                  <div className="flex items-center justify-between text-xs my-3">
                    <div>
                      <span className="text-[11px] text-slate-500">Terpakai:</span>
                      <p className="font-bold font-mono text-slate-900">{formatRupiah(Number(b.spent))}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-500">Sisa Kuota:</span>
                      <p
                        className={`font-bold font-mono ${
                          b.remaining <= 0 ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {formatRupiah(Number(b.remaining))}
                      </p>
                    </div>
                  </div>

                  {/* Visual Progress Bar (Tailwind Sleek Bar) */}
                  <div className="w-full h-2 rounded-full bg-slate-100 border border-slate-200 overflow-hidden mb-2">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        pct > 100
                          ? 'bg-rose-500'
                          : pct >= 80
                          ? 'bg-amber-500'
                          : 'bg-gradient-to-r from-orange-600 to-orange-400'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>

                  {/* Standardized ASCII Progress Bar '█░' */}
                  <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 pt-1">
                    <span
                      className={`tracking-widest ${
                        pct > 100
                          ? 'text-rose-600'
                          : pct >= 80
                          ? 'text-amber-600'
                          : 'text-orange-600'
                      }`}
                    >
                      {asciiBar}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {pct}% terpakai
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Set / Update Budget */}
      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">Pasang / Ubah Anggaran</h3>
              </div>
              <button
                onClick={() => setIsBudgetModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {budgetModalError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {budgetModalError}
              </div>
            )}

            <form onSubmit={handleBudgetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih Kategori Pengeluaran
                </label>
                <select
                  value={budgetCatId}
                  onChange={(e) => setBudgetCatId(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                >
                  {categories
                    .filter((c) => c.type === 'EXPENSE')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Batas Plafon Anggaran (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    required
                    min="10000"
                    step="10000"
                    placeholder="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Quick nominal buttons */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[500000, 1000000, 2000000, 3000000, 5000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBudgetAmount(String(amt))}
                      className="px-2 py-1 text-[10px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    >
                      +{formatRupiah(amt)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Periode Bulan (WIB)
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBudgetModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={budgetModalLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {budgetModalLoading ? 'Menyimpan...' : 'Simpan Anggaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Custom Category */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-600" />
                <h3 className="text-base font-bold text-slate-900">Tambah Kategori Baru</h3>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {catModalError && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {catModalError}
              </div>
            )}

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Hiburan, Kebutuhan Bayi, Investasi"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jenis Kategori
                  </label>
                  <select
                    value={newCatType}
                    onChange={(e) => setNewCatType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                  >
                    <option value="EXPENSE">Pengeluaran</option>
                    <option value="INCOME">Pemasukan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emoji Ikon
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-center text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Warna Indikator
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs font-mono text-slate-600">{newCatColor}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={catModalLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 rounded-xl shadow-md shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {catModalLoading ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
