'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  Bot,
  MessageSquare,
  Play
} from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden bg-[#09090b]">
      {/* Radial Gradient Glow in background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-gradient-to-tr from-orange-500/10 via-amber-400/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-orange-400/5 blur-[120px] pointer-events-none" />

      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#27272a 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-orange-950/40 border border-orange-800/60 text-orange-400 text-xs sm:text-sm font-medium mb-8 shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
            </span>
            <span className="font-semibold text-orange-200">✨ Catat keuangan langsung dari Telegram</span>
            <span className="text-orange-600">•</span>
            <span className="text-orange-400 font-semibold flex items-center gap-1">
              Gratis 50 Transaksi/Bulan <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-zinc-100 tracking-tight leading-[1.12]">
            Gaji habis sebelum akhir bulan?{' '}
            <span className="block mt-2 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
              Sudah saatnya kamu tahu ke mana uangmu pergi.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            TataDana mencatat setiap pengeluaranmu langsung dari chat Telegram atau foto struk — sisanya kami yang urus dengan AI otomatis.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-base shadow-xl shadow-orange-500/25 hover:shadow-orange-500/35 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
            >
              <span>Mulai Gratis Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              href="#simulator"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-base border border-zinc-800 hover:border-zinc-700 transition flex items-center justify-center space-x-2.5 shadow-sm"
            >
              <Play className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Lihat cara kerjanya →</span>
            </Link>
          </div>

          {/* Hero Video Placeholder */}
          <div className="mt-12 sm:mt-16 relative max-w-3xl mx-auto">
            {/* TODO: ganti dengan video asli */}
            <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-900 border-2 border-zinc-700/80 p-2 sm:p-4 shadow-xl overflow-hidden group">
              <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex flex-col items-center justify-center text-white relative overflow-hidden">
                {/* Background glow in preview */}
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 via-transparent to-transparent pointer-events-none" />
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:scale-110 transition transform cursor-pointer">
                  <Play className="w-7 h-7 fill-white translate-x-0.5" />
                </div>
                <div className="mt-4 text-center px-4">
                  <p className="text-sm sm:text-base font-semibold text-white">Video Demo: Cara Catat Pengeluaran via Telegram dalam 3 Detik</p>
                  <p className="text-xs text-zinc-400 mt-1 font-mono">0:45 Menit • Pengenalan Fitur TataDana AI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-14 pt-8 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono">10.000+</span>
              <span className="text-xs text-zinc-400 mt-0.5">Transaksi Tercatat</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 font-mono">3 Detik</span>
              <span className="text-xs text-zinc-400 mt-0.5">Rata-rata Waktu Catat</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">Bank-Grade</span>
              <span className="text-xs text-zinc-400 mt-0.5">Supabase RLS Enkripsi</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-extrabold text-orange-400 font-mono">100% WIB</span>
              <span className="text-xs text-zinc-400 mt-0.5">Zona Waktu Indonesia</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
