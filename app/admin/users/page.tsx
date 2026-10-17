'use client';

// ==============================================================================
// TataDana: User Directory & Impersonation Management
// Real user list, instant context switching (Impersonation), and privacy audit
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Shield,
  Eye,
  ExternalLink,
  Smartphone,
  Send,
  AlertCircle,
  CheckCircle2,
  X,
  CreditCard,
  ReceiptText,
  Download,
} from 'lucide-react';
import { adminService, AdminUserListItem } from '@/lib/admin/admin-service';
import { impersonationManager } from '@/lib/admin/impersonation';
import { useAuth } from '@/lib/auth/auth-context';
import { formatRupiah } from '@/lib/date-utils';
import { User, Transaction } from '@/types/database';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentAdmin, setImpersonatedUser } = useAuth();

  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'STARTER' | 'PRO'>('ALL');

  // Modal inspection states
  const [inspectUser, setInspectUser] = useState<User | null>(null);
  const [inspectTransactions, setInspectTransactions] = useState<Transaction[]>([]);
  const [inspectLoading, setInspectLoading] = useState(false);

  // Impersonation notification state
  const [impersonateNotice, setImpersonateNotice] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers(searchQuery, tierFilter);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [tierFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleStartImpersonation = async (targetUser: User) => {
    try {
      await impersonationManager.start(targetUser, currentAdmin);
      setImpersonatedUser(targetUser);
      setImpersonateNotice(`Mode impersonasi aktif untuk ${targetUser.email}. Banner atas kini muncul.`);
    } catch (err: any) {
      alert(`Gagal memulai impersonasi: ${err.message}`);
    }
  };

  const handleInspectUserTransactions = async (targetUser: User) => {
    try {
      setInspectLoading(true);
      setInspectUser(targetUser);
      const details = await adminService.getUserDetails(
        currentAdmin?.id || 'admin-dev-tatadana-01',
        targetUser.id
      );
      setInspectTransactions(details?.transactions || []);
    } catch (err) {
      console.error('Inspection error:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleExportUsers = () => {
    if (!users || users.length === 0) {
      alert('Tidak ada data pengguna untuk diekspor.');
      return;
    }
    const headers = ['ID', 'Nama', 'Email', 'No HP', 'Paket', 'Username Telegram', 'Status Telegram', 'Total Transaksi Bulan Ini', 'Tanggal Daftar'];
    const rows = users.map((u) => [
      u.id,
      `"${(u.full_name || '').replace(/"/g, '""')}"`,
      u.email,
      u.phone_number || '-',
      u.subscription_tier,
      u.telegram_username ? `@${u.telegram_username}` : '-',
      u.telegram_chat_id ? 'Terhubung' : 'Belum Terhubung',
      u.monthly_transaction_count || 0,
      new Date(u.created_at).toLocaleDateString('id-ID'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tatadana_data_pengguna_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-orange-500" /> Direktori Pengguna & Fitur Impersonasi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Lihat semua profil pengguna terdaftar, nomor WhatsApp/Telegram, status paket PRO, dan lakukan impersonasi instan.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportUsers}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-slate-700 font-bold text-xs shadow-xs transition active:scale-95 shrink-0"
        >
          <Download className="w-4 h-4 text-orange-500" />
          <span>Ekspor Data Pengguna (CSV)</span>
        </button>
      </div>

      {/* 2. Impersonation Success Notice */}
      {impersonateNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-amber-900 text-xs sm:text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">{impersonateNotice}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-sm transition"
            >
              Buka Dashboard User <ExternalLink className="w-3 h-3" />
            </button>
            <button onClick={() => setImpersonateNotice(null)} className="p-1 text-amber-700 hover:text-amber-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari email, nama, nomor telepon, atau username Telegram..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Paket:</span>
          {(['ALL', 'STARTER', 'PRO'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                tierFilter === tier
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tier === 'ALL' ? 'Semua' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4 font-bold">Pengguna</th>
                <th className="py-3.5 px-4 font-bold">Kontak & Telegram</th>
                <th className="py-3.5 px-4 font-bold">Paket Langganan</th>
                <th className="py-3.5 px-4 font-bold">Transaksi Bulan Ini</th>
                <th className="py-3.5 px-4 font-bold">Terdaftar</th>
                <th className="py-3.5 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat data pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ada pengguna ditemukan dengan kriteria pencarian ini.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-200 flex items-center justify-center font-bold text-orange-600 text-xs shrink-0">
                            {u.full_name?.slice(0, 2).toUpperCase() || u.email.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-800 truncate">{u.full_name || 'Tanpa Nama'}</p>
                              {u.is_admin && (
                                <span className="text-[9px] bg-rose-50 text-rose-600 px-1.5 py-0.2 rounded border border-rose-200 font-bold">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contacts & Telegram */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {u.phone_number ? (
                            <p className="text-slate-700 flex items-center gap-1">
                              <Smartphone className="w-3 h-3 text-slate-400" /> {u.phone_number}
                            </p>
                          ) : (
                            <span className="text-slate-400">No HP (-)</span>
                          )}
                          {u.telegram_chat_id ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-medium">
                              <Send className="w-2.5 h-2.5" /> ID: {u.telegram_chat_id}
                              {u.telegram_username ? ` (@${u.telegram_username})` : ''}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 block">Belum taut Telegram</span>
                          )}
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            u.subscription_tier === 'PRO'
                              ? 'bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border border-orange-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          <CreditCard className="w-3 h-3" />
                          {u.subscription_tier}
                        </span>
                      </td>

                      {/* Monthly Tx Count */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800">
                            {u.monthly_transaction_count}{' '}
                            <span className="text-[10px] font-normal text-slate-500">
                              {u.subscription_tier === 'STARTER' ? '/ 50 batas' : 'transaksi (unlimited)'}
                            </span>
                          </p>
                          {u.subscription_tier === 'STARTER' && (
                            <div className="w-24 bg-slate-100 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-orange-500 h-1 rounded-full"
                                style={{ width: `${Math.min(100, (u.monthly_transaction_count / 50) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-slate-500">
                        {u.created_at ? u.created_at.slice(0, 10) : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleInspectUserTransactions(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                            title="Inspeksi transaksi keuangan pengguna"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            Inspeksi
                          </button>

                          <button
                            onClick={() => handleStartImpersonation(u)}
                            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs active:scale-95"
                            title="Masuk ke dashboard sebagai pengguna ini tanpa password"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Impersonate
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Inspection Modal Drawer (With Privacy Audit Logging) */}
      {inspectUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-600" /> Inspeksi Data Pengguna: {inspectUser.email}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Aksi ini telah dicatat otomatis ke dalam <strong className="text-sky-600">Audit Trail Privasi</strong>.
                </p>
              </div>
              <button onClick={() => setInspectUser(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* User Metadata Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Nama Lengkap</span>
                  <span className="font-bold text-slate-800">{inspectUser.full_name || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Paket Aktif</span>
                  <span className="font-bold text-orange-600">{inspectUser.subscription_tier}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Telegram ID</span>
                  <span className="font-bold text-slate-800">{inspectUser.telegram_chat_id || 'Tidak tertaut'}</span>
                </div>
              </div>

              {/* Transactions List */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <ReceiptText className="w-3.5 h-3.5 text-orange-500" /> Transaksi Terbaru Pengguna
                </h4>
                {inspectLoading ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Memuat catatan transaksi...</p>
                ) : inspectTransactions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Pengguna belum memiliki catatan transaksi.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {inspectTransactions.map((tx) => (
                      <div key={tx.id} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                        <div>
                          <p className="font-bold text-slate-800">{tx.description}</p>
                          <p className="text-[10px] text-slate-400">
                            {tx.transaction_date.slice(0, 10)} (WIB) • Sumber: {tx.source}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              tx.type === 'INCOME'
                                ? 'text-emerald-600'
                                : tx.type === 'EXPENSE'
                                ? 'text-rose-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {tx.type === 'EXPENSE' ? '-' : '+'}
                            {formatRupiah(tx.amount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">ID Pengguna: {inspectUser.id}</span>
              <button
                onClick={() => {
                  handleStartImpersonation(inspectUser);
                  setInspectUser(null);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95"
              >
                <UserCheck className="w-3.5 h-3.5" /> Mulai Impersonasi Pengguna Ini
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
