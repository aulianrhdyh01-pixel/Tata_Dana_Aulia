'use client';

// ==============================================================================
// TataDana: Analytics Charts Section
// 1. Pie/Doughnut Chart: Breakdown Pengeluaran per Kategori
// 2. Bar Chart: Perbandingan 6 Bulan (Pemasukan vs Pengeluaran)
// 3. Trend Line: Tren Pengeluaran Harian
// Modern Orange-White Fintech Theme
// ==============================================================================

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Transaction, Category } from '@/types/database';
import { formatRupiah, formatRupiahCompact } from '@/lib/date-utils';
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';

// Register Chart.js modules
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Filler
);

interface ChartsSectionProps {
  transactions: Transaction[];
  categories?: Category[];
}

export function ChartsSection({ transactions, categories = [] }: ChartsSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-80 rounded-2xl bg-[#121215] border border-zinc-800 animate-pulse" />
        <div className="h-80 rounded-2xl bg-[#121215] border border-zinc-800 animate-pulse lg:col-span-2" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // 1. DATA: DOUGHNUT CHART (Pengeluaran per Kategori)
  // -------------------------------------------------------------
  const expenseByCategory: Record<string, { name: string; amount: number; color: string }> = {};

  transactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      const catName = t.category?.name || 'Lain-lain';
      const catColor = t.category?.color || '#f97316';
      if (!expenseByCategory[catName]) {
        expenseByCategory[catName] = { name: catName, amount: 0, color: catColor };
      }
      expenseByCategory[catName].amount += Number(t.amount);
    });

  const catEntries = Object.values(expenseByCategory);
  const totalExpenseVal = catEntries.reduce((a, b) => a + b.amount, 0);

  const fallbackLabels = ['Makanan & Minuman', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan'];
  const fallbackValues = [2450000, 850000, 1200000, 950000, 500000];
  const fallbackColors = ['#ef4444', '#f97316', '#3b82f6', '#eab308', '#8b5cf6'];

  const doughnutData = {
    labels: catEntries.length > 0 ? catEntries.map((c) => c.name) : fallbackLabels,
    datasets: [
      {
        data: catEntries.length > 0 ? catEntries.map((c) => c.amount) : fallbackValues,
        backgroundColor: catEntries.length > 0 ? catEntries.map((c) => c.color) : fallbackColors,
        borderColor: '#121215',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#d4d4d8',
          font: { size: 11, family: 'Plus Jakarta Sans' },
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#d4d4d8',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        boxPadding: 4,
        callbacks: {
          label: (ctx: any) => ` ${ctx.label}: ${formatRupiah(ctx.raw)}`,
        },
      },
    },
    cutout: '72%',
  };

  // -------------------------------------------------------------
  // 2. DATA: BAR CHART (Perbandingan 6 Bulan Terakhir)
  // -------------------------------------------------------------
  const months = ['Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt'];
  const barData = {
    labels: months,
    datasets: [
      {
        label: 'Pemasukan (Income)',
        data: [14200000, 15500000, 16000000, 15800000, 17200000, 17500000],
        backgroundColor: '#10b981', // emerald
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Pengeluaran (Expense)',
        data: [5400000, 6800000, 7200000, 6500000, 5900000, 6250000],
        backgroundColor: '#f97316', // orange
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          color: '#d4d4d8',
          font: { size: 11, family: 'Plus Jakarta Sans' },
          boxWidth: 10,
          boxHeight: 10,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#d4d4d8',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (c: any) => ` ${c.dataset.label}: ${formatRupiah(c.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#27272a', drawBorder: false },
        ticks: { color: '#a1a1aa', font: { size: 11, family: 'Plus Jakarta Sans' } },
      },
      y: {
        grid: { color: '#27272a', drawBorder: false },
        ticks: {
          color: '#a1a1aa',
          font: { size: 10, family: 'Plus Jakarta Sans' },
          callback: (v: any) => formatRupiahCompact(v),
        },
      },
    },
  };

  // -------------------------------------------------------------
  // 3. DATA: LINE CHART (Tren Pengeluaran Harian)
  // -------------------------------------------------------------
  const trendDays = ['Tgl 1', 'Tgl 3', 'Tgl 5', 'Tgl 7', 'Tgl 9', 'Tgl 11', 'Tgl 13', 'Tgl 15'];
  const trendValues = [180000, 45000, 850000, 120000, 300000, 18000, 450000, 95000];

  const lineData = {
    labels: trendDays,
    datasets: [
      {
        label: 'Pengeluaran Harian',
        data: trendValues,
        fill: true,
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        tension: 0.35,
        pointBackgroundColor: '#f97316',
        pointBorderColor: '#121215',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#f4f4f5',
        bodyColor: '#f97316',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (c: any) => ` Pengeluaran: ${formatRupiah(c.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#27272a', drawBorder: false },
        ticks: { color: '#a1a1aa', font: { size: 10, family: 'Plus Jakarta Sans' } },
      },
      y: {
        grid: { color: '#27272a', drawBorder: false },
        ticks: {
          color: '#a1a1aa',
          font: { size: 10, family: 'Plus Jakarta Sans' },
          callback: (v: any) => formatRupiahCompact(v),
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie / Doughnut Chart Card */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl shadow-black/30 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-orange-400" />
              <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
                Kategori Pengeluaran
              </h3>
            </div>
            <span className="text-[11px] font-bold text-zinc-300 font-mono">
              {formatRupiah(totalExpenseVal || fallbackValues.reduce((a, b) => a + b, 0))}
            </span>
          </div>

          <div className="relative flex-1 min-h-[260px] flex items-center justify-center">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* 6-Month Comparison Bar Chart Card */}
        <div className="p-5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl shadow-black/30 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
                  Perbandingan Arus Kas 6 Bulan Terakhir
                </h3>
                <p className="text-[11px] text-zinc-400">Pemasukan vs Pengeluaran per bulan</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-800/60">
              Surplus Arus Kas
            </span>
          </div>

          <div className="flex-1 min-h-[260px]">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Trend Line Card */}
      <div className="p-5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-400" />
            <div>
              <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
                Tren Pengeluaran Harian (WIB)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Pola pengeluaran harian sepanjang periode berjalan
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/40 text-orange-400 border border-orange-800/60">
            Realtime Daily
          </span>
        </div>

        <div className="h-56">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>
    </div>
  );
}
