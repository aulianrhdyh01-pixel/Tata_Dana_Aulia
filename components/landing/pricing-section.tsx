'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Check, 
  X, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  QrCode 
} from 'lucide-react';

export function PricingSection() {
  const [billingMode, setBillingMode] = useState<'monthly' | 'lifetime'>('lifetime');

  return (
    <section id="harga" className="py-20 sm:py-32 bg-[#09090b] relative">
      {/* Background glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/5 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-950/40 border border-orange-800/60 text-orange-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pilihan Paket Langganan TataDana</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight">
            Harga Transparan,{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
              Investasi Finansial Terbaik
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Pilih paket yang paling sesuai dengan kebutuhan finansial Anda. Tanpa biaya tersembunyi, terintegrasi Midtrans.
          </p>

          {/* Toggle Bulanan vs Sekali Bayar */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-inner">
            <button
              onClick={() => setBillingMode('monthly')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
                billingMode === 'monthly'
                  ? 'bg-[#27272a] text-zinc-100 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setBillingMode('lifetime')}
              className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center space-x-1.5 ${
                billingMode === 'lifetime'
                  ? 'bg-[#27272a] text-zinc-100 shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Sekali Bayar</span>
              <span className="px-1.5 py-0.5 text-[10px] bg-orange-950/50 text-orange-400 border border-orange-800/60 rounded-full font-bold uppercase tracking-wider">
                Hemat Terbesar
              </span>
            </button>
          </div>
        </div>

        {/* 2-Column Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-stretch">
          {/* Plan 1: Starter (Rp49.000 / bulan) */}
          <div className="rounded-2xl p-7 sm:p-9 bg-[#121215] border border-zinc-800 flex flex-col justify-between shadow-xl shadow-black/40">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-100">Starter</h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Catat transaksi via teks & voice Telegram, dashboard web lengkap.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700">
                  Paket Dasar
                </span>
              </div>

              <div className="my-6">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-zinc-100 font-mono">Rp 49.000</span>
                  <span className="text-sm text-zinc-400">/bulan</span>
                </div>
                <p className="text-xs text-zinc-400 mt-1">Bayar bulanan fleksibel, batalkan kapan saja.</p>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300 pt-4 border-t border-zinc-800">
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Maksimal 50 Transaksi / bulan</strong></span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Catat transaksi via <strong>teks natural Telegram</strong></span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Catat via <strong>Voice Note STT</strong> (dihitung per transaksi)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dashboard web lengkap (ringkasan & statistik)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Maksimal <strong>3 Wallet</strong> & <strong>5 Kategori Budget</strong></span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Laporan ringkasan bulanan standar</span>
                </li>
                <li className="flex items-center space-x-3 text-zinc-500 line-through">
                  <X className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>Input via Foto Struk (AI Vision OCR)</span>
                </li>
                <li className="flex items-center space-x-3 text-zinc-500 line-through">
                  <X className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>AI Financial Advisor Rekomendasi</span>
                </li>
                <li className="flex items-center space-x-3 text-zinc-500 line-through">
                  <X className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>Filter Lanjutan & Export PDF / Excel</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <Link
                href="/register?plan=starter"
                className="w-full py-3.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-zinc-100 text-sm font-bold flex items-center justify-center space-x-2 transition border border-zinc-700 shadow-sm"
              >
                <span>Pilih Paket Starter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Plan 2: Pro (Rp99.000 Sekali Bayar) */}
          <div className="rounded-2xl p-7 sm:p-9 bg-[#121215] border-2 border-orange-500 shadow-2xl shadow-orange-950/30 flex flex-col justify-between relative">
            {/* Best Value Badge */}
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold uppercase tracking-wider shadow-md">
              Paling Populer ⭐ Sekali Bayar
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                    TataDana Pro
                    <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Akses seumur hidup dengan seluruh kecanggihan AI & laporan tanpa batas.
                  </p>
                </div>
              </div>

              <div className="my-6">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl sm:text-5xl font-extrabold text-orange-400 font-mono">
                    Rp 99.000
                  </span>
                  <span className="text-sm text-zinc-400">Sekali Bayar</span>
                </div>
                <p className="text-xs text-orange-400 font-medium mt-1">
                  ⚡ Bayar sekali untuk selamanya via QRIS, GoPay, BCA, Mandiri (Midtrans)
                </p>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-zinc-300 pt-4 border-t border-zinc-800">
                <li className="flex items-center space-x-3">
                  <div className="p-0.5 rounded-full bg-orange-500 text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Semua Fitur Starter</strong> tanpa batasan</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="p-0.5 rounded-full bg-orange-500 text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="text-zinc-100">Unlimited Transaksi, Wallet & Kategori</strong></span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="p-0.5 rounded-full bg-orange-500 text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="text-zinc-100">Input via Foto Struk (AI Vision OCR)</strong></span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="p-0.5 rounded-full bg-orange-500 text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="text-zinc-100">Laporan Lengkap</strong> dengan filter & search lanjutan</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="p-0.5 rounded-full bg-orange-500 text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="text-zinc-100">Unlimited Export PDF & Excel (.xlsx)</strong></span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="p-0.5 rounded-full bg-orange-500 text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong className="text-zinc-100">AI Financial Advisor Aktif</strong> (Deteksi lonjakan)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="p-0.5 rounded-full bg-orange-500 text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span><strong>Reminder Custom</strong> (hingga 2x per hari)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="p-0.5 rounded-full bg-orange-500 text-white shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>Prioritas Pemrosesan AI Multi-Provider High Speed</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800">
              <Link
                href="/register?plan=pro"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold shadow-lg shadow-orange-500/30 flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5"
              >
                <span>Daftar Pro Sekarang (Rp99.000 Sekali Bayar)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Security & Payment Badges */}
        <div className="mt-12 text-center text-xs text-zinc-400 flex flex-wrap items-center justify-center gap-6">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Garansi Pembatalan Kapan Saja
          </span>
          <span className="flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-orange-400" /> Terintegrasi Midtrans Snap & QRIS
          </span>
          <span className="flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-400" /> Enkripsi SSL 256-Bit Bank Standard
          </span>
        </div>
      </div>
    </section>
  );
}
