'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, ShieldCheck, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#09090b] border-t border-zinc-800 text-zinc-400 font-sans text-xs sm:text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-zinc-100">
                Tata<span className="text-orange-500">Dana</span>
              </span>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed">
              SaaS manajemen finansial pribadi premium Indonesia terintegrasi penuh dengan Telegram Bot, Supabase, dan Midtrans. Catat keuangan harian semudah chatting santai.
            </p>

            <div className="pt-2 flex items-center space-x-2 text-[11px] text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Operasional Normal • WIB (Asia/Jakarta)</span>
            </div>
          </div>

          {/* Col 2: Produk & Fitur */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Produk & Fitur</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#fitur" className="hover:text-orange-400 transition">
                  Telegram Bot AI Assistant
                </Link>
              </li>
              <li>
                <Link href="#simulator" className="hover:text-orange-400 transition">
                  Interactive Live Simulator
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-orange-400 transition">
                  AI Vision OCR Struk Belanja
                </Link>
              </li>
              <li>
                <Link href="#fitur" className="hover:text-orange-400 transition">
                  Voice Note STT (60 Detik)
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-orange-400 transition">
                  Web Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link href="/dashboard/reports" className="hover:text-orange-400 transition">
                  Export Laporan PDF & Excel
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Panduan & Bantuan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Panduan & Bantuan</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="#faq" className="hover:text-orange-400 transition">
                  FAQ & Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings" className="hover:text-orange-400 transition">
                  Panduan Setup BotFather
                </Link>
              </li>
              <li>
                <Link href="#harga" className="hover:text-orange-400 transition">
                  Tabel Harga & Langganan
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-orange-400 transition">
                  Portal Masuk Akun
                </Link>
              </li>
              <li>
                <a href="mailto:support@tatadana.id" className="hover:text-orange-400 transition">
                  Hubungi Tim Dukungan
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Keamanan & Kepatuhan */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-100">Keamanan & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase Row Level Security</span>
              </li>
              <li>
                <span className="text-zinc-500">Enkripsi Data AES 256-Bit</span>
              </li>
              <li>
                <span className="text-zinc-500">Midtrans Verified Merchant</span>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">Kebijakan Privasi Pengguna</a>
              </li>
              <li>
                <a href="#" className="hover:text-orange-400 transition">Syarat & Ketentuan Layanan</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-8 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© 2026 TataDana Indonesia. Hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1">
              Dibuat dengan <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> untuk FinTech Indonesia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
