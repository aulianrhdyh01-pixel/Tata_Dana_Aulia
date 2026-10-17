'use client';

import React from 'react';
import { Star, MessageSquareQuote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Budi Santoso',
    role: 'Freelance Software Engineer',
    location: 'Jakarta Selatan',
    avatar: 'BS',
    stars: 5,
    quote:
      'Dulu selalu malas buka spreadsheet tiap malam. Dengan TataDana, pas bayar makan di warteg tinggal ketik "makan siang padang 35k" di Telegram, beres dalam 2 detik. Akhirnya bisa konsisten catat keuangan lebih dari 4 bulan berturut-turut!',
    highlight: 'Konsisten catat 4 bulan berturut-turut',
  },
  {
    name: 'Siti Rahma',
    role: 'Owner UMKM Fashion Hijab',
    location: 'Bandung',
    avatar: 'SR',
    stars: 5,
    quote:
      'Fitur foto struk belanja minimarket dan toko kain bener-bener lifesaver. Kertas struk sering lecek dan hilang, sekarang langsung foto di kasir, AI-nya ekstrak semua item otomatis. Laporan akhir bulan tinggal export ke Excel.',
    highlight: 'Fitur foto struk OCR sangat akurat',
  },
  {
    name: 'Dimas Pratama',
    role: 'Senior Product Manager',
    location: 'Surabaya',
    avatar: 'DP',
    stars: 5,
    quote:
      'Indikator progress bar [████░░] di setiap balasan bot bikin gue selalu sadar batas budget. Ditambah AI Financial Advisor yang ngingetin saat pengeluaran kopi mingguan mulai melonjak. Worth every rupiah untuk paket Pro!',
    highlight: 'Progress bar di tiap chat bikin sadar budget',
  },
  {
    name: 'Putri Ayu',
    role: 'Digital Marketer & Creator',
    location: 'Denpasar, Bali',
    avatar: 'PA',
    stars: 5,
    quote:
      'Paling suka fitur voice note-nya! Seringkali lagi nyetir motor atau jalan buru-buru, tinggal tekan mic di Telegram dan ngomong "bensin 50 ribu". Bot langsung transkrip dan saldo Cash kepotong otomatis.',
    highlight: 'Voice note sangat praktis di jalan',
  },
  {
    name: 'Hendra Wijaya',
    role: 'Konsultan Manajemen',
    location: 'Medan',
    avatar: 'HW',
    stars: 5,
    quote:
      'Manajemen multi-wallet-nya juara. Saya punya 3 rekening bank dan 2 e-wallet, fitur transfer antar-dompet bikin pembukuan tidak tercampur antara pengeluaran riil dan sekadar pindah saldo.',
    highlight: 'Multi-wallet & transfer antar dompet rapi',
  },
  {
    name: 'Ratna Kusuma',
    role: 'Creative Director',
    location: 'Yogyakarta',
    avatar: 'RK',
    stars: 5,
    quote:
      'UI dashboard web fintech oranye-hitamnya tajam, rapi, dan nyaman banget digunakan di mata. Export PDF-nya rapi banget buat diserahin pas laporan pajak tahunan. Sangat merekomendasikan buat siapa pun yang mau rapi secara finansial.',
    highlight: 'Tema oranye-hitam tajam & export rapi',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 sm:py-32 bg-[#09090b] border-y border-zinc-800 relative overflow-hidden">
      {/* Background soft ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-orange-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-950/40 border border-orange-800/60 text-orange-400 text-xs font-semibold mb-4">
            <MessageSquareQuote className="w-3.5 h-3.5 text-orange-400" />
            <span>Kisah Pengguna Nyata</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight">
            Dipercaya Ribuan Profesional &{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
              Pelaku Usaha di Indonesia
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Dengar langsung bagaimana TataDana membantu mereka membangun kebiasaan finansial yang sehat tanpa rasa terbebani.
          </p>
        </div>

        {/* Testimonials Grid (3 cols on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl bg-[#121215] border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-xl shadow-black/40"
            >
              <div>
                {/* Star rating */}
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote highlight tag */}
                <div className="inline-block px-2.5 py-1 rounded bg-orange-950/40 border border-orange-800/60 text-orange-400 text-[11px] font-semibold mb-3">
                  "{t.highlight}"
                </div>

                {/* Quote text */}
                <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed mb-6">
                  "{t.quote}"
                </p>
              </div>

              {/* Author footer */}
              <div className="flex items-center space-x-3 pt-4 border-t border-zinc-800/80">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-orange-500/20">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-1">
                    {t.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 inline" />
                  </h4>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    {t.role} • {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
