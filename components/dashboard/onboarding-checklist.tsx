'use client';

// ==============================================================================
// TataDana: Interactive Onboarding Checklist
// Sesuai Part 3: Hubungkan Telegram → Set Wallet → Set Budget
// Modern Orange-White Fintech Theme
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Circle,
  Bot,
  Wallet,
  Target,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';

interface OnboardingChecklistProps {
  telegramConnected?: boolean;
  hasBudgets?: boolean;
  hasTransactions?: boolean;
  hasWallets?: boolean;
  onOpenAddTransaction?: () => void;
}

export function OnboardingChecklist({
  telegramConnected = true,
  hasWallets = true,
  hasBudgets = true,
  hasTransactions = true,
  onOpenAddTransaction,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);

  // Exact 3 steps from Part 3: (hubungkan Telegram → set wallet → set budget)
  const steps = [
    {
      id: 'telegram',
      title: '1. Hubungkan Telegram Bot',
      description: 'Aktifkan pencatatan instan via chat, foto struk, dan pesan suara di Telegram.',
      completed: telegramConnected,
      href: '/dashboard/settings?tab=telegram',
      buttonText: telegramConnected ? 'Terkoneksi' : 'Sambungkan Bot',
      icon: Bot,
    },
    {
      id: 'wallet',
      title: '2. Atur Dompet Utama',
      description: 'Tentukan rekening bank atau e-wallet default untuk transaksi dari Telegram.',
      completed: hasWallets,
      href: '/dashboard/wallets',
      buttonText: hasWallets ? 'Sudah Diatur' : 'Kelola Dompet',
      icon: Wallet,
    },
    {
      id: 'budget',
      title: '3. Buat Anggaran Bulanan',
      description: 'Tetapkan batas budget per kategori agar bot dapat memberi alert saat 80% & 100%.',
      completed: hasBudgets,
      href: '/dashboard/budgets',
      buttonText: hasBudgets ? 'Sudah Diatur' : 'Set Budget',
      icon: Target,
    },
  ];

  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercentage = Math.round((completedCount / steps.length) * 100);

  if (dismissed || (completedCount === steps.length && dismissed)) {
    return null;
  }

  return (
    <div className="relative p-6 rounded-2xl bg-[#121215] border border-orange-900/40 shadow-xl shadow-black/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 tracking-tight">
              Panduan Memulai TataDana
            </h3>
            <p className="text-xs text-zinc-400">
              Selesaikan 3 langkah onboarding untuk memaksimalkan pencatatan finansial Anda
            </p>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          title="Tutup panduan"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-5 relative z-10">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-zinc-300">
            {completedCount} dari {steps.length} langkah selesai
          </span>
          <span className="font-bold text-orange-400">{progressPercentage}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
        {steps.map((step) => {
          const StepIcon = step.icon;
          return (
            <div
              key={step.id}
              className={`p-4 rounded-xl border transition-all ${
                step.completed
                  ? 'bg-[#18181b] border-emerald-900/60 shadow-sm'
                  : 'bg-[#18181b] border-zinc-800 hover:border-orange-500/50 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    step.completed
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                      : 'bg-orange-950/60 text-orange-400 border border-orange-800/60'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </div>
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-zinc-600 shrink-0" />
                )}
              </div>

              <h4 className="text-xs font-bold text-zinc-100 mb-1">{step.title}</h4>
              <p className="text-[11px] text-zinc-400 mb-3 leading-relaxed">
                {step.description}
              </p>

              <Link
                href={step.href}
                className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  step.completed
                    ? 'bg-emerald-950/60 text-emerald-400 hover:bg-emerald-950/90 border border-emerald-800/60'
                    : 'bg-orange-600 text-white hover:bg-orange-500 shadow-sm shadow-orange-500/20'
                }`}
              >
                <span>{step.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
