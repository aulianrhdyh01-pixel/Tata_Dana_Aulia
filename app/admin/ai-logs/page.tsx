'use client';

// ==============================================================================
// TataDana: Superadmin AI Execution & Token Analytics
// Real-time token usage, latency benchmarking, provider failover logs & inspector
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Zap,
  Layers,
  ArrowUpRight,
  Eye,
  X,
  FileText,
  DollarSign,
  Activity,
  Sparkles,
  Camera,
  Mic,
  BrainCircuit,
} from 'lucide-react';
import { adminService } from '@/lib/admin/admin-service';
import { AILog, AIProvider, AITask } from '@/types/database';
import { formatRupiah } from '@/lib/date-utils';

export default function AdminAiLogsPage() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AILog | null>(null);

  // Filters
  const [providerFilter, setProviderFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [taskFilter, setTaskFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAiLogs(100, providerFilter, statusFilter);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load AI logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [providerFilter, statusFilter]);

  // Client-side filtering for task and search query
  const filteredLogs = logs.filter((log) => {
    if (taskFilter !== 'ALL' && log.task !== taskFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchModel = log.model?.toLowerCase().includes(q);
      const matchProvider = log.provider?.toLowerCase().includes(q);
      const matchTask = log.task?.toLowerCase().includes(q);
      const matchError = log.error_message?.toLowerCase().includes(q);
      return matchModel || matchProvider || matchTask || matchError;
    }
    return true;
  });

  // Calculate Metrics
  const totalCalls = logs.length;
  const totalTokens = logs.reduce((sum, l) => sum + (l.total_tokens || 0), 0);
  const promptTokens = logs.reduce((sum, l) => sum + (l.prompt_tokens || 0), 0);
  const completionTokens = logs.reduce((sum, l) => sum + (l.completion_tokens || 0), 0);
  const avgLatency =
    totalCalls > 0 ? Math.round(logs.reduce((sum, l) => sum + (l.latency_ms || 0), 0) / totalCalls) : 0;
  const successCount = logs.filter((l) => l.status === 'SUCCESS').length;
  const fallbackCount = logs.filter((l) => l.status === 'FALLBACK').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;
  const successRate = totalCalls > 0 ? Math.round(((successCount + fallbackCount) / totalCalls) * 100) : 100;

  // Rough estimated API cost (avg Rp 30 per 1k tokens blended rate)
  const estimatedCostIdr = Math.round((totalTokens / 1000) * 30);

  const getTaskIcon = (task: AITask | string) => {
    switch (task) {
      case 'PARSER':
        return <FileText className="w-3.5 h-3.5 text-orange-400" />;
      case 'OCR':
        return <Camera className="w-3.5 h-3.5 text-cyan-400" />;
      case 'STT':
        return <Mic className="w-3.5 h-3.5 text-emerald-400" />;
      case 'ADVISOR':
        return <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getProviderBadge = (provider: AIProvider | string) => {
    switch (provider) {
      case 'GEMINI':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Gemini
          </span>
        );
      case 'OPENAI':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            OpenAI
          </span>
        );
      case 'DEEPSEEK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            DeepSeek
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {provider}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-orange-500" /> Log Eksekusi AI & Analisis Token
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitoring real-time penggunaan token LLM, benchmark latensi eksekusi, jejak fallback failover, dan audit
            keberhasilan pemrosesan multi-modal.
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

      {/* 2. Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Calls */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Eksekusi AI</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{totalCalls}</div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-bold">{successCount} Berhasil</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{fallbackCount} Failover</span>
            {failedCount > 0 && (
              <>
                <span>•</span>
                <span className="text-rose-600 font-bold">{failedCount} Gagal</span>
              </>
            )}
          </div>
        </div>

        {/* Token Usage Breakdown */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Konsumsi Token</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalTokens.toLocaleString('id-ID')}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Prompt: <span className="text-slate-800 font-semibold">{promptTokens.toLocaleString('id-ID')}</span> • Respon:{' '}
            <span className="text-slate-800 font-semibold">{completionTokens.toLocaleString('id-ID')}</span>
          </p>
        </div>

        {/* Avg Latency */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rata-rata Latensi</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {avgLatency} <span className="text-sm font-normal text-slate-400">ms</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3 h-3" /> Respon optimal (&lt; 1500ms)
          </p>
        </div>

        {/* Success Rate & Cost */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tingkat Sukses & Biaya</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{successRate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Est. Biaya:{' '}
            <span className="text-emerald-600 font-bold">{formatRupiah(estimatedCostIdr)}</span>
          </p>
        </div>
      </div>

      {/* 3. Filter & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari model (misal: gemini-1.5, gpt-4o), tugas, atau pesan error..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Provider Filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 px-2 text-[11px] font-semibold">Provider:</span>
              {(['ALL', 'GEMINI', 'OPENAI', 'DEEPSEEK'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setProviderFilter(p)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    providerFilter === p
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p === 'ALL' ? 'Semua' : p}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-500 px-2 text-[11px] font-semibold">Status:</span>
              {(['ALL', 'SUCCESS', 'FALLBACK', 'FAILED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                    statusFilter === s
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {s === 'ALL' ? 'Semua' : s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Task Filter Pills */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100 overflow-x-auto text-xs">
          <span className="text-slate-500 text-[11px] shrink-0 font-semibold">Jenis Tugas:</span>
          {[
            { id: 'ALL', label: 'Semua Tugas' },
            { id: 'PARSER', label: 'Parser Teks (Telegram)' },
            { id: 'OCR', label: 'OCR Struk Belanja' },
            { id: 'STT', label: 'Voice Note STT' },
            { id: 'ADVISOR', label: 'AI Financial Advisor' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTaskFilter(t.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                taskFilter === t.id
                  ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Logs Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">Waktu (WIB)</th>
                <th className="py-3 px-4 font-bold">Provider & Model</th>
                <th className="py-3 px-4 font-bold">Tugas AI</th>
                <th className="py-3 px-4 font-bold">Status Eksekusi</th>
                <th className="py-3 px-4 font-bold">Penggunaan Token</th>
                <th className="py-3 px-4 font-bold">Latensi</th>
                <th className="py-3 px-4 font-bold text-right">Rincian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Memuat catatan log AI...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Tidak ada log AI yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isFallback = log.status === 'FALLBACK';
                  const isFailed = log.status === 'FAILED';
                  const isSuccess = log.status === 'SUCCESS';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        <div className="font-mono text-[11px] text-slate-800 font-semibold">
                          {log.created_at ? log.created_at.replace('T', ' ').slice(0, 19) : '-'}
                        </div>
                        <span className="text-[10px] text-slate-400">Asia/Jakarta (WIB)</span>
                      </td>

                      {/* Provider & Model */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getProviderBadge(log.provider)}
                          <span className="font-mono text-[11px] text-slate-700">{log.model}</span>
                        </div>
                      </td>

                      {/* Task */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          {getTaskIcon(log.task)}
                          <span>{log.task}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isSuccess && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" /> SUCCESS
                          </span>
                        )}
                        {isFallback && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" /> FALLBACK
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <XCircle className="w-3 h-3" /> FAILED
                          </span>
                        )}
                      </td>

                      {/* Tokens */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-800">
                          {log.total_tokens?.toLocaleString('id-ID')}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">token</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          P: {log.prompt_tokens} / C: {log.completion_tokens}
                        </div>
                      </td>

                      {/* Latency */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-bold font-mono ${
                            log.latency_ms < 1000
                              ? 'text-emerald-600'
                              : log.latency_ms < 2000
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {log.latency_ms} ms
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] inline-flex items-center gap-1 transition"
                        >
                          <Eye className="w-3 h-3 text-slate-500" /> Inspeksi
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

      {/* 5. Log Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-orange-500" /> Rincian Log Eksekusi AI
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">ID Log: {selectedLog.id}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Error / Fallback Alert Banner */}
              {selectedLog.error_message && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Pemberitahuan Sistem / Error Message:
                  </div>
                  <p className="font-mono text-[11px] leading-relaxed break-all bg-white p-2 rounded-lg border border-amber-200/60">
                    {selectedLog.error_message}
                  </p>
                </div>
              )}

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Penyedia (Provider)</span>
                  <div className="mt-1">{getProviderBadge(selectedLog.provider)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block">Model LLM</span>
                  <span className="font-mono font-bold text-slate-800 mt-1 block">
                    {selectedLog.model}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tugas</span>
                  <div className="flex items-center gap-1 mt-1 font-bold text-slate-800">
                    {getTaskIcon(selectedLog.task)}
                    {selectedLog.task}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block">Total Token</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {selectedLog.total_tokens} (P: {selectedLog.prompt_tokens} / C:{' '}
                    {selectedLog.completion_tokens})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Latensi Eksekusi</span>
                  <span className="font-mono font-bold text-emerald-600 mt-1 block">
                    {selectedLog.latency_ms} ms
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Target Pengguna</span>
                  <span className="font-mono text-[11px] text-slate-700 mt-1 block truncate">
                    {selectedLog.user_id || 'Sistem / Anonim'}
                  </span>
                </div>
              </div>

              {/* Architecture Explanation */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-orange-500" />
                  Mekanisme Failover Multi-Provider TataDana
                </h4>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  TataDana mengimplementasikan failover loop cerdas. Ketika request mengalami network timeout atau HTTP
                  429 (quota rate-limited), request otomatis diteruskan ke fallback candidate berikutnya (Google Gemini →
                  OpenAI → DeepSeek) dalam waktu &lt; 2 detik sehingga pengguna di Telegram tidak mengalami interupsi.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Waktu: {selectedLog.created_at}</span>
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
