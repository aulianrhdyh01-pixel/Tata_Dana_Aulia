'use client';

// ==============================================================================
// TataDana: Superadmin Privacy & Access Audit Trail (UU PDP & ISO-27001)
// Immutable compliance log tracking data inspections, impersonations & admin actions
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  UserCheck,
  Eye,
  CreditCard,
  XCircle,
  Clock,
  Shield,
  FileCode,
  X,
  ExternalLink,
  Lock,
  Globe,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { adminService } from '@/lib/admin/admin-service';
import { AuditLog } from '@/types/database';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditLogs(100, actionFilter);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  // Client-side search filtering
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchAction = log.action?.toLowerCase().includes(q);
    const matchAdmin = log.admin_id?.toLowerCase().includes(q);
    const matchTarget = log.target_user_id?.toLowerCase().includes(q);
    const matchIp = log.ip_address?.toLowerCase().includes(q);
    const matchDetails = JSON.stringify(log.details || {}).toLowerCase().includes(q);
    return matchAction || matchAdmin || matchTarget || matchIp || matchDetails;
  });

  // Calculate Metrics
  const totalLogs = logs.length;
  const impersonationCount = logs.filter(
    (l) => l.action === 'IMPERSONATION_START' || l.action === 'IMPERSONATION_STOP'
  ).length;
  const transactionInspectionCount = logs.filter((l) => l.action === 'VIEW_TRANSACTIONS').length;
  const subscriptionActionCount = logs.filter(
    (l) => l.action === 'APPROVE_SUBSCRIPTION' || l.action === 'REJECT_SUBSCRIPTION'
  ).length;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'IMPERSONATION_START':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <UserCheck className="w-3 h-3" /> IMPERSONATION_START
          </span>
        );
      case 'IMPERSONATION_STOP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
            <Lock className="w-3 h-3" /> IMPERSONATION_STOP
          </span>
        );
      case 'VIEW_TRANSACTIONS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Eye className="w-3 h-3" /> VIEW_TRANSACTIONS
          </span>
        );
      case 'APPROVE_SUBSCRIPTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileCheck className="w-3 h-3" /> APPROVE_SUBSCRIPTION
          </span>
        );
      case 'REJECT_SUBSCRIPTION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            <XCircle className="w-3 h-3" /> REJECT_SUBSCRIPTION
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400 border border-zinc-700">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-sky-600" /> Audit Trail Privasi Data Finansial
            </h1>
            <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
              UU PDP & ISO-27001
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Jejak audit tidak dapat dihapus (immutable log) yang mencatat secara transparan setiap inspeksi transaksi
            pengguna, login impersonasi, dan persetujuan langganan oleh Superadmin.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* 2. Compliance Notification Card */}
      <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900">
              Integritas Audit Terjamin & Perlindungan Hak Privasi Finansial
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Seluruh catatan di halaman ini disegel otomatis dengan timestamp zona waktu Asia/Jakarta (WIB) dan alamat
              IP operator. Sesuai standar regulasi perbankan terbuka dan perlindungan privasi, penghapusan catatan audit
              dinonaktifkan pada level database.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logs */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Entri Audit</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalLogs}</div>
          <p className="text-[11px] text-slate-400 mt-1">Tercatat di tabel audit_logs</p>
        </div>

        {/* Impersonation Events */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Aksi Impersonasi</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{impersonationCount}</div>
          <p className="text-[11px] text-amber-600 mt-1 font-semibold flex items-center gap-1">
            Audit pergantian konteks sesi
          </p>
        </div>

        {/* Transaction Inspections */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Inspeksi Transaksi</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{transactionInspectionCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Akses data mutasi user</p>
        </div>

        {/* Subscription Control Actions */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Billing & Approval</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{subscriptionActionCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Persetujuan manual / Midtrans</p>
        </div>
      </div>

      {/* 4. Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari admin ID, user ID, alamat IP, atau alasan inspeksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white"
            />
          </div>

          {/* Action Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 px-1 text-[11px] font-semibold">Filter Aksi:</span>
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'IMPERSONATION_START', label: 'Impersonasi' },
              { id: 'VIEW_TRANSACTIONS', label: 'Inspeksi Data' },
              { id: 'APPROVE_SUBSCRIPTION', label: 'Setujui Pro' },
              { id: 'REJECT_SUBSCRIPTION', label: 'Tolak Pro' },
            ].map((a) => (
              <button
                key={a.id}
                onClick={() => setActionFilter(a.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                  actionFilter === a.id
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Audit Trail Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Waktu Kejadian (WIB)</th>
                <th className="py-3 px-4 font-bold">Jenis Aksi</th>
                <th className="py-3 px-4 font-bold">Admin Pelaksana</th>
                <th className="py-3 px-4 font-bold">Target Pengguna</th>
                <th className="py-3 px-4 font-bold">Alamat IP</th>
                <th className="py-3 px-4 font-bold">Ringkasan Rincian</th>
                <th className="py-3 px-4 font-bold text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat catatan jejak audit...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada catatan audit yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-800 font-semibold">
                          {log.created_at ? log.created_at.replace('T', ' ').slice(0, 19) : '-'}
                        </div>
                        <span className="text-[10px] text-slate-400">WIB (Asia/Jakarta)</span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap">{getActionBadge(log.action)}</td>

                      {/* Admin ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-medium">
                          {log.admin_id || 'System'}
                        </span>
                      </td>

                      {/* Target User ID */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] text-slate-600">
                          {log.target_user_id || 'Global'}
                        </span>
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{log.ip_address || '127.0.0.1'}</span>
                        </div>
                      </td>

                      {/* Summary details */}
                      <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                        {log.details?.reason ||
                          log.details?.targetEmail ||
                          (log.details?.orderId ? `Order: ${log.details.orderId}` : '-') ||
                          JSON.stringify(log.details)}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition"
                        >
                          <FileCode className="w-3 h-3 text-sky-600" /> JSON
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. JSON Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-600" /> Detail Entri Audit Kepatuhan
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">ID Entri: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Jenis Aksi</span>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Admin ID</span>
                  <span className="font-mono text-slate-800 font-bold mt-1 block">
                    {selectedLog.admin_id || 'System'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target User ID</span>
                  <span className="font-mono text-slate-800 font-bold mt-1 block">
                    {selectedLog.target_user_id || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Alamat IP</span>
                  <span className="font-mono text-slate-800 font-bold mt-1 block">
                    {selectedLog.ip_address || '127.0.0.1'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Waktu WIB</span>
                  <span className="font-mono text-slate-800 font-bold mt-1 block">
                    {selectedLog.created_at}
                  </span>
                </div>
              </div>

              {/* Raw JSON Payload */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-sky-600" /> Metadata Payload Lengkap:
                </h4>
                <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-sky-300 overflow-x-auto leading-relaxed">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Kepatuhan Privasi Finansial Terverifikasi</span>
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
