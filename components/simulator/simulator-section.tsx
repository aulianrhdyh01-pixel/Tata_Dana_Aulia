'use client';

import React, { useState } from 'react';
import { TelegramSimulator, SimulatedTransaction } from './telegram-simulator';
import { DashboardPreview } from './dashboard-preview';
import { Sparkles, ArrowRight, ShieldCheck, Check } from 'lucide-react';

export function InteractiveSimulatorSection() {
  const [latestTx, setLatestTx] = useState<SimulatedTransaction | null>(null);
  const [totalSimulatedCount, setTotalSimulatedCount] = useState(0);

  const handleTransactionAdded = (tx: SimulatedTransaction) => {
    setLatestTx(tx);
    setTotalSimulatedCount((c) => c + 1);
  };

  return (
    <section id="simulator" className="py-20 sm:py-28 relative overflow-hidden bg-[#09090b]">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-500/5 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-amber-500/5 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-950/40 border border-orange-800/60 text-orange-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-spin" />
            <span>Interactive Live Sandbox • Coba Langsung di Sini</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight">
            Rasakan Kemudahannya.{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
              Coba Chat Bot & Lihat Dashboard Realtime.
            </span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-zinc-400 leading-relaxed">
            Tanpa perlu instalasi atau registrasi terlebih dahulu. Ketik kalimat alami bahasa Indonesia seperti{' '}
            <span className="text-orange-400 font-mono font-semibold">"beli kopi susu 18rb"</span>, tes foto struk, atau dengarkan balasan bot yang langsung tercatat di dashboard.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Deteksi nominal "18rb", "1.5jt", "250k"
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Multi-Item OCR Struk Belanja
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Speech-to-Text Voice Note 60 Detik
            </span>
          </div>
        </div>

        {/* 2-Column Interactive Simulator & Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Column: Telegram Bot Simulator */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>1. Telegram Chat Widget (Input)</span>
              </div>
              <span className="text-[11px] text-zinc-500">Ketik atau klik chip instan</span>
            </div>

            <TelegramSimulator
              onTransactionAdded={handleTransactionAdded}
              className="shadow-xl shadow-black/60 border border-zinc-800"
            />
          </div>

          {/* Right Column: Real-Time Dashboard Preview */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-300">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>2. Web Dashboard Analytics (Output Sinkron)</span>
              </div>
              {totalSimulatedCount > 0 ? (
                <span className="text-[11px] text-orange-400 font-mono font-medium animate-pulse">
                  ⚡ +{totalSimulatedCount} transaksi tersinkron!
                </span>
              ) : (
                <span className="text-[11px] text-zinc-500">Live preview auto-update</span>
              )}
            </div>

            <DashboardPreview
              lastTransaction={latestTx}
              className="shadow-xl shadow-black/60 border border-zinc-800"
            />
          </div>
        </div>

        {/* Bottom Guarantee Banner */}
        <div className="mt-12 p-4 sm:p-5 rounded-2xl bg-[#121215] border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-950/40 border border-orange-800/60 flex items-center justify-center text-orange-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-zinc-100">Siap untuk data finansial aslimu?</h4>
              <p className="text-xs text-zinc-400">
                Daftar sekarang dalam 30 detik. Akun gratis Starter sudah mencakup 50 transaksi per bulan selamanya.
              </p>
            </div>
          </div>
          <a
            href="/register"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition shrink-0 flex items-center space-x-1.5"
          >
            <span>Daftar Gratis Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
