'use client';

// ==============================================================================
// TataDana: Teamwork & Shared Wallets Preview Page (/teamwork-preview)
// Pitch-black dark fintech theme (#09090b, #121215) with orange & blue accents
// ==============================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Wallet,
  Shield,
  Bot,
  Home,
  Sparkles,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleBadge: string;
  telegramUsername: string;
  wallets: string;
  status: string;
}

export default function TeamworkPreviewPage() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Budi Pratama (Anda)',
      role: 'Owner / Admin',
      roleBadge: 'bg-orange-950/60 text-orange-400 border border-orange-800/40',
      telegramUsername: '@budipratama (8129481234)',
      wallets: 'Semua Dompet (GoPay, BCA, Tunai)',
      status: 'Aktif',
    },
    {
      id: '2',
      name: 'Siti Rahma',
      role: 'Editor (Pasangan)',
      roleBadge: 'bg-blue-950/60 text-blue-400 border border-blue-800/40',
      telegramUsername: '@sitirahma (9182371923)',
      wallets: '👛 GoPay Operasional, 💵 Tunai',
      status: 'Aktif',
    },
    {
      id: '3',
      name: 'Alex Kurniawan',
      role: 'Viewer (Akuntan)',
      roleBadge: 'bg-zinc-800 text-zinc-300 border border-zinc-700',
      telegramUsername: '@alexkurnia (7182948192)',
      wallets: 'Hanya Laporan & Ekspor (.xlsx)',
      status: 'Aktif',
    },
  ]);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) return;
    const newMember: TeamMember = {
      id: String(Date.now()),
      name: inviteName.trim(),
      role: inviteRole,
      roleBadge:
        inviteRole === 'Editor'
          ? 'bg-blue-950/60 text-blue-400 border border-blue-800/40'
          : 'bg-zinc-800 text-zinc-300 border border-zinc-700',
      telegramUsername: `@${inviteName.toLowerCase().replace(/\s+/g, '_')}`,
      wallets: '👛 GoPay Operasional',
      status: 'Menunggu Pairing',
    };
    setMembers([...members, newMember]);
    setInviteName('');
    setInviteModalOpen(false);
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
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-400 border border-blue-800/50 font-bold">
            TEAMWORK PREVIEW
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
            href="/boost"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-xs font-bold text-white shadow-md shadow-orange-500/20 hover:brightness-110 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Pro Boost</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Banner Preview */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-[#18181b] via-[#121215] to-[#18181b] border border-blue-500/30 relative overflow-hidden shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-blue-400 text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>Kolaborasi Finansial Bersama Pasangan, Keluarga & Tim</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                TataDana Teamwork & Shared Wallets
              </h1>
              <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
                Semua anggota tim dapat mencatat transaksi ke satu bot Telegram yang sama. Bot otomatis mengenali pengirim, memotong saldo dompet bersama, dan memberikan laporan terpadu secara transparan.
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setInviteModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Undang Anggota Tim</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3 Pillar Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-950/40 border border-orange-800/40 flex items-center justify-center text-2xl">
              👛
            </div>
            <h3 className="text-base font-bold text-white">Shared Wallets (Dompet Bersama)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Bagi rekening kas operasional, belanja rumah tangga, atau kas proyek. Saldo otomatis tersinkronisasi saat ada transaksi baru dari anggota tim.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-center text-2xl">
              👥
            </div>
            <h3 className="text-base font-bold text-white">Multi-User Telegram Bot</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Cukup bagikan token pairing ke anggota. Setiap pengeluaran yang dicatat via Telegram menampilkan nama pengirim di dashboard.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-2xl">
              🔒
            </div>
            <h3 className="text-base font-bold text-white">Role & Audit Trail (UU PDP)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hak akses bertingkat: Owner, Editor, dan Viewer. Semua mutasi tercatat dalam riwayat audit lengkap demi akuntabilitas keuangan.
            </p>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Anggota Tim Aktif: Tim Rumah Tangga / Usaha</h3>
              <p className="text-xs text-zinc-400">{members.length} Akun Terhubung via Telegram Bot</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-bold">
              {members.length} Anggota Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Anggota</th>
                  <th className="py-3 px-4">Peran (Role)</th>
                  <th className="py-3 px-4">Telegram ID</th>
                  <th className="py-3 px-4">Dompet Yang Diakses</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-zinc-800/30 transition">
                    <td className="py-3.5 px-4 font-bold text-white">{m.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${m.roleBadge}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-zinc-300">{m.telegramUsername}</td>
                    <td className="py-3.5 px-4 text-zinc-300">{m.wallets}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity in Shared Wallets */}
        <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Aktivitas Terakhir di Dompet Bersama</h3>
            <span className="text-xs text-zinc-500">Real-time WIB</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Dicatat Oleh</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Dompet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                <tr className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 text-zinc-400">Hari ini, 12:40 WIB</td>
                  <td className="py-3.5 px-4 font-bold text-blue-400">Siti Rahma</td>
                  <td className="py-3.5 px-4 text-white">Belanja Mingguan Sayur & Buah Segar</td>
                  <td className="py-3.5 px-4 font-bold text-rose-400">-Rp 125.000</td>
                  <td className="py-3.5 px-4 text-zinc-300">👛 GoPay Operasional</td>
                </tr>
                <tr className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 text-zinc-400">Hari ini, 09:15 WIB</td>
                  <td className="py-3.5 px-4 font-bold text-orange-400">Budi Pratama</td>
                  <td className="py-3.5 px-4 text-white">Bayar Listrik PLN & IPL Apartemen</td>
                  <td className="py-3.5 px-4 font-bold text-rose-400">-Rp 650.000</td>
                  <td className="py-3.5 px-4 text-zinc-300">🏦 BCA Utama</td>
                </tr>
                <tr className="hover:bg-zinc-800/30 transition">
                  <td className="py-3.5 px-4 text-zinc-400">Kemarin, 19:30 WIB</td>
                  <td className="py-3.5 px-4 font-bold text-orange-400">Budi Pratama</td>
                  <td className="py-3.5 px-4 text-white">Makan Malam Keluarga Seafood</td>
                  <td className="py-3.5 px-4 font-bold text-rose-400">-Rp 210.000</td>
                  <td className="py-3.5 px-4 text-zinc-300">👛 GoPay Operasional</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Undang Anggota ke Dompet Bersama</h3>
            <p className="text-xs text-zinc-400">
              Masukkan nama anggota dan pilih hak akses untuk pencatatan via Telegram.
            </p>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Nama Anggota</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rian Saputra"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-zinc-700 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Peran (Role)</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181b] border border-zinc-700 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="Editor">Editor (Bisa mencatat transaksi)</option>
                  <option value="Viewer">Viewer (Hanya melihat saldo & laporan)</option>
                  <option value="Admin">Admin (Akses penuh ke semua dompet)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500"
                >
                  Tambahkan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 px-6 py-6 text-center text-xs text-zinc-500">
        TataDana Fintech &copy; 2026. Seluruh hak cipta dilindungi. Zona Waktu Asia/Jakarta (WIB).
      </footer>
    </div>
  );
}
