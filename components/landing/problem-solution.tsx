'use client';

import React from 'react';
import { 
  XCircle, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ArrowRight
} from 'lucide-react';

export function ProblemSolution() {
  return (
    <section id="solusi" className="py-20 sm:py-28 bg-[#09090b] border-y border-zinc-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-950/40 border border-orange-800/60 text-orange-400 text-xs font-semibold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Problem vs Solusi Cerdas</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight">
            Mengapa Mencatat Keuangan{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
              Selama Ini Terasa Sulit?
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Banyak orang Indonesia pengeluarannya lebih besar dari pemasukan bukan karena tidak mau berhemat, tapi aplikasi keuangan konvensional terlalu merepotkan.
          </p>
        </div>

        {/* 2-Column Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Left Card: The Old Painful Way */}
          <div className="rounded-2xl p-7 sm:p-9 bg-[#121215] border border-rose-950/60 shadow-lg relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-950/20 blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-rose-950/50 text-rose-400 text-xs font-bold uppercase tracking-wider mb-6 border border-rose-800/60">
                <XCircle className="w-4 h-4" />
                <span>Cara Lama yang Melelahkan</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-6">
                Spreadsheet Excel & Aplikasi Ribet
              </h3>

              <ul className="space-y-4 text-sm sm:text-base text-zinc-300">
                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-rose-950/60 text-rose-400 mt-0.5 shrink-0 border border-rose-900/60">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <span>
                    <strong className="text-zinc-100">😫 "Buka aplikasi? Nanti dulu deh..."</strong> Harus login, pilih dompet, cari kategori bertingkat. Akhirnya malas mencatat dan uang menguap tanpa jejak.
                  </span>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-rose-950/60 text-rose-400 mt-0.5 shrink-0 border border-rose-900/60">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <span>
                    <strong className="text-zinc-100">💸 "Kok uangnya habis ya? Padahal kayak ga beli apa-apa"</strong> Pengeluaran mikro (kopi 18rb, parkir 5rb, transfer admin) tidak tercatat. Tiba-tiba tanggal 20 saldo sudah menipis.
                  </span>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-rose-950/60 text-rose-400 mt-0.5 shrink-0 border border-rose-900/60">
                    <XCircle className="w-4 h-4" />
                  </div>
                  <span>
                    <strong className="text-zinc-100">📉 "Udah niat bikin budget, seminggu lupa"</strong> Budget di Excel tidak memberi peringatan saat pengeluaran mendekati 80%. TataDana otomatis kirim alert via Telegram.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 text-xs text-rose-400 font-mono">
              ⚠️ Rata-rata 83% orang berhenti mencatat keuangan setelah 2 minggu karena proses yang ribet.
            </div>
          </div>

          {/* Right Card: The TataDana Way */}
          <div className="rounded-2xl p-7 sm:p-9 bg-[#121215] border-2 border-orange-500/70 shadow-xl shadow-orange-950/20 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-950/20 blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-orange-950/50 text-orange-400 text-xs font-bold uppercase tracking-wider mb-6 border border-orange-800/60">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span>Solusi TataDana</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-6">
                Cukup Chat Telegram & Selesai dlm 3 Detik
              </h3>

              <ul className="space-y-4 text-sm sm:text-base text-zinc-300">
                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-emerald-950/60 text-emerald-400 mt-0.5 shrink-0 border border-emerald-800/60">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>
                    <strong className="text-zinc-100">Bahasa Indonesia Alami:</strong> Cukup ketik <span className="text-orange-400 font-mono font-semibold">"kopi susu 18rb"</span> atau <span className="text-orange-400 font-mono font-semibold">"padang 35k"</span>, bot langsung memproses.
                  </span>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-emerald-950/60 text-emerald-400 mt-0.5 shrink-0 border border-emerald-800/60">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>
                    <strong className="text-zinc-100">Foto Struk Otomatis (OCR):</strong> Jepret foto struk supermarket, AI langsung mengekstrak setiap item & nominal total.
                  </span>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-emerald-950/60 text-emerald-400 mt-0.5 shrink-0 border border-emerald-800/60">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>
                    <strong className="text-zinc-100">Voice Note saat Nyetir:</strong> Rekam pesan suara 5 detik, sistem otomatis transkripsi dan catat pengeluaran.
                  </span>
                </li>

                <li className="flex items-start space-x-3">
                  <div className="p-1 rounded-full bg-emerald-950/60 text-emerald-400 mt-0.5 shrink-0 border border-emerald-800/60">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span>
                    <strong className="text-zinc-100">Alert Proaktif & Budget Bar:</strong> Bot langsung menampilkan progress bar <span className="text-orange-400 font-mono font-bold">[████░░]</span> dan peringatan jika budget menipis.
                  </span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 text-xs text-orange-400 font-mono flex items-center justify-between">
              <span>⚡ 96% pengguna bertahan konsisten hingga berbulan-bulan.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
