'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  Bot, 
  Check, 
  Send
} from 'lucide-react';

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28 bg-[#09090b] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="relative rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white p-8 sm:p-14 md:p-16 text-center shadow-2xl overflow-hidden">
          {/* Subtle glowing elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-amber-400/20 blur-[90px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold mb-6 shadow-xs">
              <Bot className="w-4 h-4" />
              <span>Mulai Dalam 30 Detik • Zero Setup Friction</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Siap Mengambil Kendali Penuh{' '}
              <span className="block mt-1 text-amber-100">
                Atas Masa Depan Keuanganmu?
              </span>
            </h2>

            {/* Subtitle */}
            <p className="mt-5 text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl mx-auto">
              Tinggalkan cara manual yang melelahkan. Rasakan kebebasan mencatat pengeluaran secepat mengetik chat di Telegram. Mulai gratis hari ini tanpa syarat kartu kredit.
            </p>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-slate-50 text-orange-600 hover:text-orange-700 font-bold text-base shadow-xl shadow-orange-700/20 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
              >
                <span>Mulai Gratis Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                href="#simulator"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-orange-700/50 hover:bg-orange-700/70 text-white font-semibold text-base border border-white/30 transition flex items-center justify-center space-x-2 shadow-md"
              >
                <Send className="w-4 h-4 text-amber-200" />
                <span>Coba Telegram Simulator</span>
              </Link>
            </div>

            {/* Feature Checklist */}
            <div className="mt-10 pt-8 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 text-xs text-white/90 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-300" /> Gratis 50 Transaksi/Bulan
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-300" /> Tanpa Kartu Kredit
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-300" /> Enkripsi Supabase RLS
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-300" /> Zona Waktu Resmi WIB
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
