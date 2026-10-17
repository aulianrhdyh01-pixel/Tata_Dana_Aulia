'use client';

import React from 'react';
import { 
  Bot, 
  Camera, 
  Mic, 
  BarChart3, 
  Wallet, 
  BellRing, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  Receipt, 
  PieChart, 
  ArrowLeftRight 
} from 'lucide-react';

export function FeatureBlocks() {
  return (
    <section id="fitur" className="py-20 sm:py-32 bg-[#09090b] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-36">

        {/* Feature 1: Multi-Modal AI Parsing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Info */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-950/40 border border-orange-800/60 text-orange-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fitur Unggulan 01</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight">
              Multi-Modal AI Parsing.{' '}
              <span className="block text-orange-500">Teks, Foto Struk, & Suara.</span>
            </h3>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              Tidak ada batasan format kaku. Cukup bicara atau ketik sesuai kebiasaan sehari-hari orang Indonesia. AI kami otomatis mengidentifikasi nominal, jenis dompet, kategori, hingga rincian belanja.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-full bg-orange-950/60 text-orange-400 shrink-0 mt-0.5 border border-orange-800/60">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Format Slang & Nominal Indonesia</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Memahami "18rb", "1.5jt", "500k", "dua puluh lima ribu", "gojek 22rb", dan singkatan lainnya.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-full bg-orange-950/60 text-orange-400 shrink-0 mt-0.5 border border-orange-800/60">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Vision OCR Struk Belanja (Pro)</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Ekstraksi otomatis nama merchant minimarket/resto, tanggal transaksi, dan pemisahan multi-item detail.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-full bg-orange-950/60 text-orange-400 shrink-0 mt-0.5 border border-orange-800/60">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Speech-to-Text Voice Note (60s)</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Kirim rekaman suara saat mengemudi atau berjalan kaki. Bot menampilkan transkripsi sebelum konfirmasi.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative rounded-2xl bg-[#121215] border border-zinc-800 p-6 sm:p-8 space-y-4 shadow-2xl shadow-black/50">
              {/* Mock Chat 1: Slang Text */}
              <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                  <span className="text-orange-400 font-semibold font-mono">Input Teks Natural</span>
                  <span>10:14 WIB</span>
                </div>
                <p className="text-sm text-zinc-100 font-medium">"beli kopi susu 18rb pake gopay"</p>
                <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1 font-mono font-medium">
                  <span>→ Makanan & Minuman: Rp 18.000 (GoPay)</span>
                </div>
              </div>

              {/* Mock Chat 2: OCR Vision */}
              <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                  <span className="text-amber-400 font-semibold font-mono">AI Vision OCR Struk</span>
                  <span>14:02 WIB</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-950/40 border border-orange-800/60 flex items-center justify-center text-orange-400 shrink-0">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div className="text-xs">
                    <p className="text-zinc-100 font-semibold">Indomaret Point Tebet</p>
                    <p className="text-zinc-400">2 Items • Susu UHT & Roti Tawar • Rp 34.000</p>
                  </div>
                </div>
              </div>

              {/* Mock Chat 3: Voice Note */}
              <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-sm">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5 font-medium">
                  <span className="text-purple-400 font-semibold font-mono">Voice Note STT (60s)</span>
                  <span>18:45 WIB</span>
                </div>
                <p className="text-xs text-zinc-300 italic">"Transkripsi: 'isi bensin pertamax lima puluh ribu di spbu pertamina'"</p>
                <div className="mt-1 text-xs text-purple-400 flex items-center gap-1 font-mono font-medium">
                  <span>→ Transportasi: Rp 50.000</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Real-time Analytics & Multi-Wallet (Reversed Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Visual Showcase Card (Left on Desktop) */}
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-gradient-to-tl from-amber-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative rounded-2xl bg-[#121215] border border-zinc-800 p-6 sm:p-8 space-y-4 shadow-2xl shadow-black/50">
              {/* Multi-Wallet Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-mono">BCA Utama</span>
                  <p className="text-sm font-bold text-zinc-100 font-mono mt-0.5">Rp 8.500.000</p>
                  <span className="text-[10px] text-orange-400 font-semibold">Dompet Utama</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-mono">Mandiri Tabungan</span>
                  <p className="text-sm font-bold text-zinc-100 font-mono mt-0.5">Rp 4.250.000</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">Simpanan Dana Darurat</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-mono">GoPay Saldo</span>
                  <p className="text-sm font-bold text-zinc-100 font-mono mt-0.5">Rp 750.000</p>
                  <span className="text-[10px] text-zinc-400">Harian & Ojek</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#18181b] border border-zinc-800 shadow-sm">
                  <span className="text-[11px] text-zinc-400 font-mono">Cash Tunai</span>
                  <p className="text-sm font-bold text-zinc-100 font-mono mt-0.5">Rp 1.512.000</p>
                  <span className="text-[10px] text-zinc-400">Dompet Fisik</span>
                </div>
              </div>

              {/* Inter-Wallet Transfer Badge */}
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-800/50 flex items-center justify-between text-xs text-orange-300">
                <div className="flex items-center space-x-2">
                  <ArrowLeftRight className="w-4 h-4 text-orange-400" />
                  <span className="font-medium">Transfer Dompet: BCA → GoPay Rp 200.000</span>
                </div>
                <span className="text-zinc-400 font-mono font-medium">Sukses</span>
              </div>

              {/* Export Preview */}
              <div className="p-3 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-between text-xs shadow-sm">
                <span className="text-zinc-300 font-medium">Laporan Keuangan Bulanan</span>
                <span className="px-2.5 py-0.5 rounded bg-orange-950/40 border border-orange-800/60 text-orange-400 font-mono font-semibold">
                  PDF & Excel Ready
                </span>
              </div>
            </div>
          </div>

          {/* Text Info (Right on Desktop) */}
          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-950/40 border border-amber-800/60 text-amber-400 text-xs font-semibold">
              <Wallet className="w-3.5 h-3.5 text-amber-400" />
              <span>Fitur Unggulan 02</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight">
              Multi-Wallet Management &{' '}
              <span className="block text-amber-400">Real-Time Analytics.</span>
            </h3>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              Kendalikan seluruh aset dalam satu pintu. Pisahkan saldo rekening bank, dompet digital, dan kas tunai. Lakukan transfer antar-dompet tanpa mengacaukan pembukuan pemasukan/pengeluaranmu.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-full bg-amber-950/60 text-amber-400 shrink-0 mt-0.5 border border-amber-800/60">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Manajemen Dompet Tanpa Batas</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Dukung BCA, Mandiri, BRI, BNI, GoPay, OVO, Dana, ShopeePay hingga kas tunai fisik.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-full bg-amber-950/60 text-amber-400 shrink-0 mt-0.5 border border-amber-800/60">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Transfer Antar-Dompet yang Akurat</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Tarik tunai ATM atau top up e-wallet tercatat otomatis sebagai transfer, bukan beban pengeluaran ganda.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-full bg-amber-950/60 text-amber-400 shrink-0 mt-0.5 border border-amber-800/60">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Export Laporan PDF & Excel Instan</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Generate laporan per periode custom, siap dikirim ke akuntan atau diarsip pribadi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Budget Alerts & Proactive AI Financial Advisor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Info */}
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-950/40 border border-orange-800/60 text-orange-400 text-xs font-semibold">
              <BellRing className="w-3.5 h-3.5" />
              <span>Fitur Unggulan 03</span>
            </div>

            <h3 className="text-3xl sm:text-4xl font-extrabold text-zinc-100 tracking-tight leading-tight">
              Visual Budget Progress &{' '}
              <span className="block text-orange-500">AI Financial Advisor.</span>
            </h3>

            <p className="text-zinc-400 text-base sm:text-lg leading-relaxed">
              Hindari kejutan dompet kosong di akhir bulan. Dapatkan visual bar langsung pada setiap balasan pesan bot, notifikasi lonjakan pengeluaran, serta rekomendasi penghematan cerdas dari AI advisor.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-full bg-orange-950/60 text-orange-400 shrink-0 mt-0.5 border border-orange-800/60">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Visual Progress Bar di Setiap Chat</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Karakter batang progress <code className="text-orange-400 font-mono font-bold">[████░░░░░░] 42%</code> membuat kesadaran anggaran selalu terjaga.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-full bg-orange-950/60 text-orange-400 shrink-0 mt-0.5 border border-orange-800/60">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Deteksi Lonjakan Pengeluaran Otomatis</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">AI langsung memperingatkan saat ada pos kategori yang melonjak drastis di luar tren harianmu.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-1 rounded-full bg-orange-950/60 text-orange-400 shrink-0 mt-0.5 border border-orange-800/60">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-zinc-100">Daily Reminder Sesuai Jadwal (WIB)</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">Pengingat ramah maksimal 2x sehari agar tidak ada transaksi malam hari yang terlewat dicatat.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Showcase Card */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative rounded-2xl bg-[#121215] border border-zinc-800 p-6 sm:p-8 space-y-4 shadow-2xl shadow-black/50">
              {/* Budget Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                    <span>🍔 Makanan & Minuman</span>
                    <span className="text-orange-400 font-mono">42% (Rp 630.000 / Rp 1.500.000)</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full w-[42%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                    <span>🚗 Transportasi</span>
                    <span className="text-amber-400 font-mono">44% (Rp 350.000 / Rp 800.000)</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full w-[44%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-300 mb-1">
                    <span>🛒 Belanja & Kebutuhan</span>
                    <span className="text-rose-400 font-mono">75% (Rp 900.000 / Rp 1.200.000)</span>
                  </div>
                  <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full w-[75%]" />
                  </div>
                </div>
              </div>

              {/* AI Advisor Chat Box */}
              <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-800/50 space-y-2">
                <div className="flex items-center space-x-2 text-orange-400 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>TataDana AI Advisor: Rekomendasi Finansial</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  "Pengeluaran makan kamu minggu ini hemat Rp 120.000 dibandingkan minggu lalu! Jika pola ini dipertahankan, kamu bisa menyisihkan Rp 480.000 ekstra ke pos tabungan dana darurat."
                </p>
                <div className="pt-1 text-[11px] text-zinc-500 font-mono">
                  Waktu analisa: 21:00 WIB • Model AI Multi-Provider
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
