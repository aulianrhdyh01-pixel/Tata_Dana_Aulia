'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  PiggyBank, 
  Sparkles, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  Layers
} from 'lucide-react';
import { SimulatedTransaction } from './telegram-simulator';

export interface DashboardPreviewProps {
  lastTransaction?: SimulatedTransaction | null;
  className?: string;
}

interface DisplayTx {
  id: string;
  kategori: string;
  catatan: string;
  nominal: number;
  type: 'INCOME' | 'EXPENSE';
  dompet: string;
  source: string;
  time: string;
  isNew?: boolean;
}

const INITIAL_TRANSACTIONS: DisplayTx[] = [
  {
    id: 'tx-init-1',
    kategori: 'Makanan & Minuman',
    catatan: 'Kopi Susu Gula Aren',
    nominal: 18000,
    type: 'EXPENSE',
    dompet: 'Cash (Default)',
    source: 'Telegram Bot',
    time: '14:20 WIB',
  },
  {
    id: 'tx-init-2',
    kategori: 'Transportasi',
    catatan: 'Bensin Motor SPBU',
    nominal: 35000,
    type: 'EXPENSE',
    dompet: 'GoPay',
    source: 'Telegram Bot',
    time: '11:05 WIB',
  },
  {
    id: 'tx-init-3',
    kategori: 'Gaji & Pemasukan',
    catatan: 'Gaji Pokok Bulanan',
    nominal: 10000000,
    type: 'INCOME',
    dompet: 'BCA Utama',
    source: 'Web Dashboard',
    time: '09:00 WIB',
  },
  {
    id: 'tx-init-4',
    kategori: 'Belanja & Kebutuhan',
    catatan: 'Belanja Mingguan Superindo',
    nominal: 285000,
    type: 'EXPENSE',
    dompet: 'BCA Utama',
    source: 'Foto Struk OCR',
    time: 'Kemarin',
  },
  {
    id: 'tx-init-5',
    kategori: 'Tagihan & Utilitas',
    catatan: 'Listrik PLN Pasca Bayar',
    nominal: 450000,
    type: 'EXPENSE',
    dompet: 'Mandiri',
    source: 'Telegram Voice',
    time: '2 hari lalu',
  },
];

function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID');
}

export function DashboardPreview({ lastTransaction, className = '' }: DashboardPreviewProps) {
  const [transactions, setTransactions] = useState<DisplayTx[]>(INITIAL_TRANSACTIONS);
  const [totalBalance, setTotalBalance] = useState(15012000);
  const [monthlyIncome, setMonthlyIncome] = useState(10000000);
  const [monthlyExpense, setMonthlyExpense] = useState(788000);
  const [budgetLimit] = useState(5000000);
  const [pulseNew, setPulseNew] = useState(false);

  useEffect(() => {
    if (!lastTransaction) return;

    const newTx: DisplayTx = {
      id: lastTransaction.id,
      kategori: lastTransaction.kategori,
      catatan: lastTransaction.catatan,
      nominal: lastTransaction.nominal,
      type: lastTransaction.type,
      dompet: lastTransaction.dompet,
      source: lastTransaction.source === 'TELEGRAM_RECEIPT' 
        ? 'Foto Struk OCR' 
        : lastTransaction.source === 'TELEGRAM_VOICE' 
        ? 'Telegram Voice' 
        : 'Telegram Bot',
      time: lastTransaction.timestamp,
      isNew: true,
    };

    setTransactions((prev) => [newTx, ...prev.slice(0, 9)]);

    if (lastTransaction.type === 'EXPENSE') {
      setTotalBalance((prev) => prev - lastTransaction.nominal);
      setMonthlyExpense((prev) => prev + lastTransaction.nominal);
    } else {
      setTotalBalance((prev) => prev + lastTransaction.nominal);
      setMonthlyIncome((prev) => prev + lastTransaction.nominal);
    }

    setPulseNew(true);
    const timer = setTimeout(() => setPulseNew(false), 2500);
    return () => clearTimeout(timer);
  }, [lastTransaction]);

  const sisaBudget = Math.max(0, budgetLimit - monthlyExpense);
  const budgetPercentage = Math.min(100, Math.round((monthlyExpense / budgetLimit) * 100));

  return (
    <div className={`flex flex-col h-[620px] rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl overflow-hidden font-sans ${className}`}>
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#18181b] border-b border-zinc-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-orange-950/60 border border-orange-800/60 flex items-center justify-center text-orange-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-zinc-100 text-sm flex items-center gap-1.5">
              Live Dashboard Preview
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-[11px] text-zinc-400">Data realtime sinkron dengan bot</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 text-[11px] rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono font-medium">
            Bulan Ini • WIB
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#09090b]">
        {/* 4 Stats Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Card 1: Total Saldo */}
          <div className={`p-3.5 rounded-xl bg-[#18181b] border transition duration-300 ${pulseNew ? 'border-orange-500 ring-2 ring-orange-500/40' : 'border-zinc-800 shadow-xs'}`}>
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[11px] font-medium">Saldo Seluruh Akun</span>
              <Wallet className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight font-mono">
              {formatRupiah(totalBalance)}
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-1 font-semibold">
              <TrendingUp className="w-3 h-3" /> +12.4% vs bln lalu
            </div>
          </div>

          {/* Card 2: Pengeluaran Bulan Ini */}
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[11px] font-medium">Pengeluaran Bulan Ini</span>
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-sm sm:text-base font-bold text-rose-400 tracking-tight font-mono">
              {formatRupiah(monthlyExpense)}
            </div>
            <div className="text-[10px] text-zinc-400 flex items-center gap-0.5 mt-1">
              Batas: {formatRupiah(budgetLimit)}
            </div>
          </div>

          {/* Card 3: Pemasukan Bulan Ini */}
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[11px] font-medium">Pemasukan Bulan Ini</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-sm sm:text-base font-bold text-emerald-400 tracking-tight font-mono">
              {formatRupiah(monthlyIncome)}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Gaji & Side project
            </div>
          </div>

          {/* Card 4: Sisa Budget */}
          <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between text-zinc-400 mb-1.5">
              <span className="text-[11px] font-medium">Sisa Budget Aman</span>
              <PiggyBank className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-sm sm:text-base font-bold text-amber-400 tracking-tight font-mono">
              {formatRupiah(sisaBudget)}
            </div>
            <div className="text-[10px] text-amber-400 mt-1 font-mono font-medium">
              Terpakai: {budgetPercentage}%
            </div>
          </div>
        </div>

        {/* AI Financial Advisor Mini Banner */}
        <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-800/50 flex items-start space-x-2.5">
          <Sparkles className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-orange-400 mb-0.5">AI Financial Advisor</p>
            <p className="text-zinc-300 leading-relaxed text-[11px]">
              {budgetPercentage > 80
                ? '⚠️ Pengeluaran sudah mendekati 80% batas bulanan. Pertimbangkan tunda belanja non-primer!'
                : '✅ Pengeluaran kamu terkendali dengan baik bulan ini. Rata-rata harian Rp 26.000, proyeksi tabungan meningkat 18%.'}
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-200 font-semibold">Alokasi Budget Utama</span>
            <span className="text-zinc-400 font-mono text-[11px] font-medium">{budgetPercentage}% / 100%</span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, budgetPercentage)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
            <span>Rp 0</span>
            <span>Target Rp 5.000.000</span>
          </div>
        </div>

        {/* Live Transaction Feed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-zinc-200 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              Transaksi Terbaru (Realtime)
            </span>
            <span className="text-[11px] text-zinc-400">{transactions.length} transaksi</span>
          </div>

          <div className="space-y-1.5">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-2.5 rounded-xl bg-[#18181b] border transition duration-300 flex items-center justify-between text-xs ${
                  tx.isNew
                    ? 'border-orange-500/70 bg-orange-950/40 shadow-sm'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                      tx.type === 'INCOME'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                        : 'bg-orange-950/60 text-orange-400 border border-orange-800/60'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '↓' : '↑'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-zinc-100 truncate text-[12px]">{tx.catatan}</p>
                    <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
                      <span>{tx.kategori}</span>
                      <span>•</span>
                      <span className="text-zinc-500 font-mono">{tx.source}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p
                    className={`font-bold font-mono text-[12px] ${
                      tx.type === 'INCOME' ? 'text-emerald-400' : 'text-zinc-100'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'} {formatRupiah(tx.nominal)}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-mono">{tx.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
