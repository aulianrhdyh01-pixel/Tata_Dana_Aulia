'use client';

// ==============================================================================
// TataDana: 4 Stats Cards Component
// 1. Saldo Total, 2. Pemasukan Bulan Ini, 3. Pengeluaran Bulan Ini, 4. Budget Tersisa
// Modern Orange-White Fintech Theme
// ==============================================================================

import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { formatRupiah } from '@/lib/date-utils';

export interface StatsData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  totalBudget: number;
  remainingBudget: number;
  budgetUsedPercentage: number;
}

interface StatsCardsProps {
  stats: StatsData;
  loading?: boolean;
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const cards = [
    {
      title: 'Saldo Total Seluruh Dompet',
      value: formatRupiah(stats.totalBalance),
      subtitle: 'Akumulasi rekening & dompet aktif',
      icon: Wallet,
      iconBg: 'bg-orange-950/60 text-orange-400 border border-orange-800/60',
      badge: 'Aktif Terhubung',
      badgeColor: 'text-orange-400 bg-orange-950/40 border-orange-800/60',
    },
    {
      title: 'Pemasukan Bulan Ini',
      value: formatRupiah(stats.monthlyIncome),
      subtitle: 'Gaji, deviden, & pemasukan lain',
      icon: ArrowDownLeft,
      iconBg: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60',
      badge: 'Aliran Masuk',
      badgeColor: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    },
    {
      title: 'Pengeluaran Bulan Ini',
      value: formatRupiah(stats.monthlyExpense),
      subtitle: 'Kebutuhan harian, tagihan & belanja',
      icon: ArrowUpRight,
      iconBg: 'bg-rose-950/60 text-rose-400 border border-rose-800/60',
      badge: 'Arus Keluar',
      badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
    },
    {
      title: 'Budget Tersisa Bulan Ini',
      value: formatRupiah(stats.remainingBudget),
      subtitle: `${stats.budgetUsedPercentage}% dari ${formatRupiah(stats.totalBudget)} terpakai`,
      icon: Target,
      iconBg: 'bg-amber-950/60 text-amber-400 border border-amber-800/60',
      badge: stats.budgetUsedPercentage >= 100 ? 'Budget Habis' : stats.budgetUsedPercentage >= 80 ? 'Waspada 80%' : 'Aman',
      badgeColor:
        stats.budgetUsedPercentage >= 100
          ? 'text-rose-400 bg-rose-950/40 border-rose-800/60'
          : stats.budgetUsedPercentage >= 80
          ? 'text-amber-400 bg-amber-950/40 border-amber-800/60'
          : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-[#121215] border border-zinc-800 animate-pulse space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-zinc-800" />
            <div className="w-28 h-4 rounded bg-zinc-800" />
            <div className="w-36 h-7 rounded bg-zinc-800" />
            <div className="w-24 h-3 rounded bg-zinc-800/60" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl shadow-black/30 hover:border-zinc-700 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} shadow-inner`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>

            <p className="text-xs font-semibold text-zinc-400 mb-1">{card.title}</p>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight font-mono">
              {card.value}
            </h3>
            <p className="text-[11px] text-zinc-400 mt-1 truncate">{card.subtitle}</p>

            {/* Micro visual progress for budget card */}
            {idx === 3 && (
              <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    stats.budgetUsedPercentage >= 100
                      ? 'bg-rose-500'
                      : stats.budgetUsedPercentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, stats.budgetUsedPercentage)}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
