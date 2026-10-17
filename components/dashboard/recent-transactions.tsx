'use client';

// ==============================================================================
// TataDana: 10 Recent Transactions Table / List
// Shows categories, Asia/Jakarta (WIB) timestamps, wallet badges, and source indicators
// Modern Orange-White Fintech Theme
// ==============================================================================

import React from 'react';
import Link from 'next/link';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Bot,
  Camera,
  Mic,
  FileText,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import { Transaction } from '@/types/database';
import { formatRupiah, formatWIB } from '@/lib/date-utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onOpenReceipt?: (tx: Transaction) => void;
}

export function RecentTransactions({ transactions, onOpenReceipt }: RecentTransactionsProps) {
  const top10 = transactions.slice(0, 10);

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'TELEGRAM_TEXT':
      case 'TELEGRAM':
        return {
          label: 'Telegram Bot',
          icon: Bot,
          style: 'bg-sky-950/60 text-sky-400 border-sky-800/60',
        };
      case 'TELEGRAM_RECEIPT':
        return {
          label: 'Foto Struk OCR',
          icon: Camera,
          style: 'bg-purple-950/60 text-purple-400 border-purple-800/60',
        };
      case 'TELEGRAM_VOICE':
        return {
          label: 'Voice Note STT',
          icon: Mic,
          style: 'bg-amber-950/60 text-amber-400 border-amber-800/60',
        };
      case 'TRANSFER':
        return {
          label: 'Transfer Dompet',
          icon: ArrowRightLeft,
          style: 'bg-blue-950/60 text-blue-400 border-blue-800/60',
        };
      default:
        return {
          label: 'Manual Web',
          icon: FileText,
          style: 'bg-zinc-800 text-zinc-300 border-zinc-700',
        };
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-xl shadow-black/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm md:text-base font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <span>10 Transaksi Terbaru</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/60 text-orange-400 border border-orange-800/60">
              Asia/Jakarta (WIB)
            </span>
          </h3>
          <p className="text-xs text-zinc-400">
            Aktivitas pengeluaran dan pemasukan terkini dari bot & web
          </p>
        </div>

        <Link
          href="/dashboard/transactions"
          className="flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors group"
        >
          <span>Lihat Semua</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Transaction List */}
      {top10.length === 0 ? (
        <div className="py-12 text-center text-zinc-500 text-xs">
          Belum ada transaksi tercatat pada periode ini.
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/80">
          {top10.map((tx) => {
            const isIncome = tx.type === 'INCOME';
            const isTransfer = tx.type === 'TRANSFER';
            const source = getSourceBadge(tx.source);
            const SourceIcon = source.icon;

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-[#18181b] px-2 rounded-xl transition-colors"
              >
                {/* Left: Icon & Description */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isIncome
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                        : isTransfer
                        ? 'bg-blue-950/60 text-blue-400 border-blue-800/60'
                        : 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : isTransfer ? (
                      <ArrowRightLeft className="w-5 h-5" />
                    ) : (
                      <span className="text-lg">{tx.category?.icon || '💸'}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-zinc-100 truncate">
                        {tx.description || (isIncome ? 'Pemasukan' : 'Pengeluaran')}
                      </p>
                      {tx.items && tx.items.length > 0 && (
                        <button
                          onClick={() => onOpenReceipt && onOpenReceipt(tx)}
                          className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-950/60 text-purple-400 border border-purple-800/60 hover:bg-purple-900/60 transition-colors"
                        >
                          <Layers className="w-3 h-3" />
                          <span>{tx.items.length} items</span>
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400">
                      {/* Category Badge */}
                      <span className="text-zinc-200 font-semibold">
                        {tx.category?.name || (isTransfer ? 'Transfer Dompet' : 'Umum')}
                      </span>
                      <span>•</span>
                      {/* Wallet Badge */}
                      <span className="text-zinc-400">
                        {tx.wallet?.name || 'Dompet'}
                        {tx.destination_wallet && ` → ${tx.destination_wallet.name}`}
                      </span>
                      <span>•</span>
                      {/* Time */}
                      <span className="flex items-center gap-1 text-zinc-500">
                        <Clock className="w-3 h-3" />
                        {formatWIB(tx.transaction_date, 'short')} WIB
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Source Badge */}
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm md:text-base font-bold font-mono tracking-tight ${
                      isIncome
                        ? 'text-emerald-400'
                        : isTransfer
                        ? 'text-blue-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isIncome ? '+' : isTransfer ? '⇄' : '-'} {formatRupiah(Number(tx.amount))}
                  </p>

                  <div className="flex justify-end mt-1">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${source.style}`}
                    >
                      <SourceIcon className="w-3 h-3" />
                      <span>{source.label}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
