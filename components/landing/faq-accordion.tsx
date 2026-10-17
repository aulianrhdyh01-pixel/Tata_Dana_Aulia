'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Bagaimana cara menghubungkan akun TataDana ke bot Telegram?',
    answer:
      'Sangat mudah! Setelah mendaftar di web TataDana, masuk ke menu Pengaturan (Settings) > Tab Telegram Bot. Masukkan nomor HP atau klik tautan verifikasi OTP yang tersedia. Anda akan diarahkan langsung ke Telegram resmi TataDana Bot. Cukup klik /start, dan bot akan langsung terhubung dengan akun Anda secara instan.',
  },
  {
    question: 'Apakah data keuangan dan riwayat transaksi saya aman?',
    answer:
      'Keamanan dan privasi Anda adalah prioritas mutlak kami. Seluruh database dilindungi dengan Row Level Security (RLS) di Supabase, memastikan data transaksi Anda terisolasi secara ketat dan hanya dapat diakses oleh user_id milik Anda. Kami tidak pernah membagikan atau menjual data finansial pengguna ke pihak ketiga mana pun.',
  },
  {
    question: 'Format teks bahasa Indonesia apa saja yang didukung oleh bot?',
    answer:
      'AI TataDana dirancang spesifik untuk bahasa percakapan sehari-hari di Indonesia. Anda bisa mengetik slang nominal seperti "beli kopi susu 18rb", "makan padang 35k", "bensin 50 ribu", "gaji bulanan 10jt", "1.5jt", "250k", atau "bayar wifi 350.000". AI akan otomatis memisahkan nominal, kategori, dompet, dan catatan transaksi.',
  },
  {
    question: 'Bagaimana cara kerja fitur Foto Struk Belanja (OCR) dan Voice Note?',
    answer:
      'Untuk foto struk (fitur Pro), Anda cukup memotret struk minimarket, supermarket, atau restoran langsung di chat Telegram. AI Vision kami akan membaca nama merchant, tanggal transaksi, serta rincian multi-item beserta harganya. Untuk pesan suara, cukup rekam Voice Note hingga 60 detik (misal: "isi bensin pertamax lima puluh ribu di spbu pertamina"), dan sistem akan mentranskripsi sekaligus mencatat pengeluaran Anda.',
  },
  {
    question: 'Apakah saya bisa mengatur banyak rekening bank dan e-wallet sekaligus?',
    answer:
      'Ya! TataDana mendukung fitur Multi-Wallet. Anda dapat menambahkan dompet Cash (Tunai), BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay, dan lainnya. Anda juga dapat menentukan 1 dompet sebagai default, serta mencatat transfer antar-dompet (seperti tarik tunai ATM atau top up e-wallet) tanpa mengacaukan pembukuan pengeluaran harian.',
  },
  {
    question: 'Apa yang terjadi jika kuota 50 transaksi di paket Starter telah habis?',
    answer:
      'Paket Starter memberikan 50 transaksi gratis setiap bulannya. Jika kuota telah mencapai limit 50, bot Telegram akan mengirimkan notifikasi ramah yang menginformasikan bahwa kuota bulan ini telah terpenuhi, disertai tautan upgrade ke paket Pro. Seluruh data transaksi yang sudah dicatat sebelumnya tetap aman dan dapat diakses di web dashboard, dan kuota akan ter-reset otomatis di awal bulan berikutnya.',
  },
  {
    question: 'Bagaimana cara mengekspor laporan transaksi ke format PDF atau Excel (.xlsx)?',
    answer:
      'Di Web Dashboard, buka menu Laporan (Reports). Anda dapat memfilter transaksi berdasarkan rentang tanggal custom (harian, mingguan, bulanan, tahunan), dompet tertentu, atau kategori. Klik tombol "Download PDF" untuk mendapatkan ringkasan berkas siap cetak dengan kop formal, atau "Export Excel" untuk mendapatkan berkas spreadsheet (.xlsx) lengkap dengan rincian multi-item.',
  },
  {
    question: 'Metode pembayaran apa saja yang didukung untuk upgrade ke paket Pro?',
    answer:
      'Pembayaran langganan diproses secara otomatis melalui payment gateway resmi Midtrans. Kami menerima pembayaran via QRIS (GoPay, OVO, Dana, ShopeePay, LinkAja, BCA Mobile), Virtual Account bank nasional (BCA, Mandiri, BNI, BRI, Permata), serta Kartu Kredit/Debit berlogo Visa dan Mastercard.',
  },
];

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 sm:py-32 bg-[#09090b] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-950/40 border border-orange-800/60 text-orange-400 text-xs font-semibold mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
            <span>Pertanyaan yang Sering Diajukan</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-400">
            Punya pertanyaan lain seputar integrasi bot atau keamanan data? Temukan jawabannya di sini.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-[#121215] border-orange-500/80 ring-1 ring-orange-500/30 shadow-lg'
                    : 'bg-[#121215] border-zinc-800 hover:border-zinc-700 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full px-5 sm:px-6 py-4.5 text-left flex items-center justify-between space-x-4 focus:outline-none"
                >
                  <span className="font-semibold text-sm sm:text-base text-zinc-100">
                    {faq.question}
                  </span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? 'transform rotate-180 bg-orange-950/60 text-orange-400 border border-orange-800/60'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-300 leading-relaxed border-t border-zinc-800/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
