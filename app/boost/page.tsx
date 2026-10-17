'use client';

// ==============================================================================
// TataDana: Pro Boost Lifetime Upgrade Page (/boost)
// Pitch-black dark fintech theme (#09090b, #121215) with orange accents (#f97316)
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Zap,
  Camera,
  Mic,
  Brain,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  ArrowRight,
  Home,
  Bot,
  Check,
} from 'lucide-react';

export default function BoostPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleUpgrade = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      try {
        const profileRaw = localStorage.getItem('tatadana_user_profile');
        if (profileRaw) {
          const parsed = JSON.parse(profileRaw);
          parsed.statusPaket = 'Pro Lifetime (Rp99k)';
          localStorage.setItem('tatadana_user_profile', JSON.stringify(parsed));
          window.dispatchEvent(new Event('tatadana_profile_updated'));
        }
      } catch (e) {}
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-white font-black text-lg tracking-tight">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              ⚡
            </span>
            <span>Tata<span className="text-orange-500">Dana</span></span>
          </Link>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-950/60 text-orange-400 border border-orange-800/50 font-bold">
            PRO BOOST
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
          >
            <Home className="w-3.5 h-3.5 text-zinc-400" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
          >
            <Bot className="w-3.5 h-3.5 text-orange-400" />
            <span>Bot Telegram</span>
          </Link>
          <Link
            href="/teamwork-preview"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Teamwork</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/50 border border-orange-500/30 text-orange-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span>Investasi Finansial Sekali Bayar Seumur Hidup</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Upgrade ke <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent">TataDana PRO Boost</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
            Dapatkan akses tak terbatas ke seluruh teknologi AI multi-modal kami: Scan Struk Belanja OCR, Voice Note Speech-to-Text 60 detik, AI Financial Advisor, dan Ekspor Laporan Tak Terbatas.
          </p>
        </div>

        {/* Pricing & Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Starter Plan */}
          <div className="p-8 rounded-3xl bg-[#121215] border border-zinc-800 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Starter Plan</span>
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-semibold">Gratis</span>
              </div>
              <div>
                <div className="text-3xl font-black text-white">Rp 0</div>
                <div className="text-xs text-zinc-500">Gratis selamanya</div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cocok untuk pencatatan transaksi dasar secara personal dengan kuota terbatas setiap bulannya.
              </p>
              <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs">
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>50 Transaksi per Bulan</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chat Bot Teks Natural Bahasa Indonesia</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Dompet Utama (GoPay / BCA)</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-500 line-through">
                  <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>AI Vision OCR Scan Foto Struk</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-500 line-through">
                  <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>AI Voice Note Transkripsi (STT)</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-500 line-through">
                  <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>AI Financial Advisor Deteksi Boros</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-500 line-through">
                  <XCircle className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>Ekspor Laporan PDF & Excel Unlimited</span>
                </div>
              </div>
            </div>
            <div>
              <Link
                href="/dashboard"
                className="w-full block text-center py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition"
              >
                Tetap di Starter
              </Link>
            </div>
          </div>

          {/* Pro Boost Plan */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#18181b] to-[#121215] border-2 border-orange-500 shadow-2xl shadow-orange-950/40 relative flex flex-col justify-between space-y-6">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-zinc-950 text-[11px] font-black uppercase tracking-wider shadow-md">
              🔥 Best Value — Sekali Bayar
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-400">PRO BOOST LIFETIME</span>
                <span className="px-2.5 py-0.5 rounded-md bg-orange-950/60 text-orange-300 text-xs font-semibold border border-orange-800/40">Seumur Hidup</span>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-black text-white">Rp 99.000</div>
                  <div className="text-xs text-orange-400 font-bold uppercase">/ Sekali Bayar</div>
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">Tanpa biaya langganan bulanan / tahunan</div>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Membuka seluruh kecanggihan AI TataDana secara permanen. Hemat jutaan dibanding langganan bulanan.
              </p>
              <div className="space-y-3 pt-4 border-t border-zinc-800 text-xs">
                <div className="flex items-center gap-2.5 text-zinc-100 font-semibold">
                  <Zap className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Transaksi Bulanan Tanpa Batas (Unlimited)</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-100 font-semibold">
                  <Camera className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>AI Vision OCR: Scan Struk Belanja Multi-Item</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-100 font-semibold">
                  <Mic className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>AI Voice Note Transkripsi (Maks 60 Detik)</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-100 font-semibold">
                  <Brain className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>AI Financial Advisor (Deteksi Boros & Tips Hemat)</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-100 font-semibold">
                  <FileSpreadsheet className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Ekspor Laporan PDF & Excel Tanpa Batas</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-100 font-semibold">
                  <Users className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Multi-Wallet & Shared Wallets (Preview Teamwork)</span>
                </div>
                <div className="flex items-center gap-2.5 text-zinc-100 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prioritas Enkripsi Data Transaksi (UU PDP)</span>
                </div>
              </div>
            </div>

            <div>
              {isSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-2">
                  <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Check className="w-5 h-5" />
                    <span>Akun Anda Telah Diupgrade ke PRO!</span>
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Nikmati seluruh fitur Pro tanpa batas di Telegram Bot dan Dashboard Web.
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 transition"
                  >
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-bold shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Memproses Pembayaran Midtrans...</span>
                  ) : (
                    <>
                      <span>Aktivasi Pro Boost Sekarang (Rp 99.000)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="pt-8 border-t border-zinc-800 space-y-6">
          <h2 className="text-xl md:text-2xl font-black text-center text-white">
            Fitur Cerdas yang Mengubah Finansial Anda
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-950/50 border border-orange-800/40 flex items-center justify-center text-xl">
                📸
              </div>
              <h3 className="text-sm font-bold text-white">AI Vision OCR Struk</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Foto struk minimarket atau restoran Anda langsung di Telegram. AI membaca merchant, tanggal, nama barang, dan harga otomatis.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-950/50 border border-orange-800/40 flex items-center justify-center text-xl">
                🎙️
              </div>
              <h3 className="text-sm font-bold text-white">Voice Note AI STT</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sedang menyetir atau sibuk? Kirim voice note hingga 60 detik di Telegram, sistem mentranskripsikannya ke nominal dan kategori presisi.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-orange-950/50 border border-orange-800/40 flex items-center justify-center text-xl">
                👥
              </div>
              <h3 className="text-sm font-bold text-white">Teamwork & Shared Wallets</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Kolaborasi pencatatan dompet bersama pasangan, keluarga, atau rekan bisnis dalam satu bot Telegram terpadu.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-6 text-center text-xs text-zinc-500">
        TataDana Fintech &copy; 2026. Seluruh hak cipta dilindungi. Zona Waktu Asia/Jakarta (WIB).
      </footer>
    </div>
  );
}
