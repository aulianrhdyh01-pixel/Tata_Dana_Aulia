'use client';

// ==============================================================================
// TataDana: Multi-Provider AI Configuration Dashboard
// Gemini, OpenAI, DeepSeek orchestration, Single vs Failover mode, & Key Masking
// ==============================================================================

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  ArrowRight,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import { multiProviderAi, MultiAIConfig, maskApiKey } from '@/lib/ai/multi-provider-client';
import { AIProvider } from '@/types/database';

export default function AdminAiSettingsPage() {
  const [config, setConfig] = useState<MultiAIConfig>(multiProviderAi.getConfig());
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    GEMINI: false,
    OPENAI: false,
    DEEPSEEK: false,
    MOCK: false,
  });

  // Test status per provider
  const [testResults, setTestResults] = useState<
    Record<AIProvider, { loading: boolean; success?: boolean; latencyMs?: number; message?: string }>
  >({
    GEMINI: { loading: false },
    OPENAI: { loading: false },
    DEEPSEEK: { loading: false },
    MOCK: { loading: false },
  });

  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  useEffect(() => {
    setConfig(multiProviderAi.getConfig());
  }, []);

  const handleModeChange = (mode: 'SINGLE' | 'FAILOVER') => {
    setConfig((prev) => ({ ...prev, mode }));
  };

  const handlePrimaryChange = (primaryProvider: AIProvider) => {
    setConfig((prev) => ({ ...prev, primaryProvider }));
  };

  const handleApiKeyChange = (provider: AIProvider, key: string) => {
    setConfig((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          apiKey: key,
        },
      },
    }));
  };

  const handleModelChange = (provider: AIProvider, model: string) => {
    setConfig((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          defaultModel: model,
        },
      },
    }));
  };

  const toggleKeyVisibility = (provider: AIProvider) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }));
  };

  const handleTestConnection = async (provider: AIProvider) => {
    setTestResults((prev) => ({
      ...prev,
      [provider]: { loading: true },
    }));

    try {
      const targetSettings = config.providers[provider];
      const res = await multiProviderAi.testConnection(
        provider,
        targetSettings.apiKey,
        targetSettings.defaultModel
      );

      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          loading: false,
          success: res.success,
          latencyMs: res.latencyMs,
          message: res.message,
        },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          loading: false,
          success: false,
          message: err?.message || 'Gagal terhubung',
        },
      }));
    }
  };

  const handleSave = () => {
    multiProviderAi.updateConfig(config);
    setSaveNotice('Pengaturan Multi-Provider AI berhasil disimpan!');
    setTimeout(() => setSaveNotice(null), 4000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-orange-500" /> Pengaturan Multi-Provider AI Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi Google Gemini, OpenAI, dan DeepSeek dengan router failover otomatis, masking kunci API, dan uji koneksi langsung.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-orange-500/20 active:scale-95"
        >
          <Save className="w-4 h-4" /> Simpan Pengaturan
        </button>
      </div>

      {/* Save Notification */}
      {saveNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveNotice}</span>
        </div>
      )}

      {/* 2. Routing Mode Selector: Single vs Failover */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-500" /> Mode Eksekusi Router AI
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilih bagaimana permintaan AI (Parsing Telegram, OCR Struk, Voice Note STT, AI Advisor) dialirkan ke penyedia AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Failover Mode */}
          <div
            onClick={() => handleModeChange('FAILOVER')}
            className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              config.mode === 'FAILOVER'
                ? 'bg-orange-50/70 border-orange-300 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-orange-500" /> Failover Otomatis (Direkomendasikan)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Resilient
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Jika provider utama mengalami rate limit (HTTP 429), timeout, atau gangguan API, router otomatis beralih
                dan mencoba provider cadangan dalam sekejap tanpa memutus proses pengguna.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-500">
              <span>Alur:</span>
              <span className="text-orange-600 font-bold">Gemini</span>
              <span>→</span>
              <span className="text-slate-700 font-semibold">OpenAI</span>
              <span>→</span>
              <span className="text-slate-700 font-semibold">DeepSeek</span>
            </div>
          </div>

          {/* Option B: Single Provider Mode */}
          <div
            onClick={() => handleModeChange('SINGLE')}
            className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
              config.mode === 'SINGLE'
                ? 'bg-orange-50/70 border-orange-300 shadow-xs'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-500" /> Mode Single Provider
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Strict
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seluruh permintaan hanya ditujukan ke satu provider utama yang dipilih. Jika provider mengalami kendala,
                sistem langsung mengembalikan pesan error tanpa mencoba provider alternatif.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-500">
              Cocok untuk pengujian performa atau isolasi biaya provider tertentu.
            </div>
          </div>
        </div>

        {/* Primary Provider Selector */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Provider Utama (Primary):</label>
          <div className="flex items-center gap-2">
            {(['GEMINI', 'OPENAI', 'DEEPSEEK'] as AIProvider[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePrimaryChange(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  config.primaryProvider === p
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Provider Settings Cards */}
      <div className="space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-500" /> Konfigurasi Kunci API & Model Penyedia
        </h2>

        {/* Card 1: Google Gemini */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center text-xs border border-blue-200">
                G
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Google Gemini</h3>
                <p className="text-[11px] text-slate-500">Paling optimal untuk kecepatan dan Vision OCR Struk</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-semibold">Model Default</label>
              <select
                value={config.providers.GEMINI.defaultModel}
                onChange={(e) => handleModelChange('GEMINI', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              >
                {config.providers.GEMINI.availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Masked API Key Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-semibold">API Key (Google AI Studio)</label>
              <div className="relative">
                <input
                  type={showKeys.GEMINI ? 'text' : 'password'}
                  placeholder="AIzaSy..."
                  value={config.providers.GEMINI.apiKey}
                  onChange={(e) => handleApiKeyChange('GEMINI', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('GEMINI')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showKeys.GEMINI ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs">
              {testResults.GEMINI.message && (
                <span
                  className={testResults.GEMINI.success ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}
                >
                  {testResults.GEMINI.message}
                </span>
              )}
            </div>
            <button
              onClick={() => handleTestConnection('GEMINI')}
              disabled={testResults.GEMINI.loading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testResults.GEMINI.loading ? 'animate-spin' : ''}`} />
              Test Koneksi (Ping)
            </button>
          </div>
        </div>

        {/* Card 2: OpenAI */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center text-xs border border-emerald-200">
                OA
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">OpenAI</h3>
                <p className="text-[11px] text-slate-500">Paling presisi untuk pemahaman bahasa gaul dan nominal kompleks</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-semibold">Model Default</label>
              <select
                value={config.providers.OPENAI.defaultModel}
                onChange={(e) => handleModelChange('OPENAI', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              >
                {config.providers.OPENAI.availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Masked API Key Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-semibold">API Key (OpenAI Platform)</label>
              <div className="relative">
                <input
                  type={showKeys.OPENAI ? 'text' : 'password'}
                  placeholder="sk-proj-..."
                  value={config.providers.OPENAI.apiKey}
                  onChange={(e) => handleApiKeyChange('OPENAI', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('OPENAI')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showKeys.OPENAI ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs">
              {testResults.OPENAI.message && (
                <span
                  className={testResults.OPENAI.success ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}
                >
                  {testResults.OPENAI.message}
                </span>
              )}
            </div>
            <button
              onClick={() => handleTestConnection('OPENAI')}
              disabled={testResults.OPENAI.loading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testResults.OPENAI.loading ? 'animate-spin' : ''}`} />
              Test Koneksi (Ping)
            </button>
          </div>
        </div>

        {/* Card 3: DeepSeek */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 font-bold flex items-center justify-center text-xs border border-purple-200">
                DS
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">DeepSeek</h3>
                <p className="text-[11px] text-slate-500">Efisiensi biaya tertinggi untuk financial advisor & kalkulasi budget</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Ready
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Model Selection */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-semibold">Model Default</label>
              <select
                value={config.providers.DEEPSEEK.defaultModel}
                onChange={(e) => handleModelChange('DEEPSEEK', e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
              >
                {config.providers.DEEPSEEK.availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Masked API Key Input */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-700 font-semibold">API Key (DeepSeek API)</label>
              <div className="relative">
                <input
                  type={showKeys.DEEPSEEK ? 'text' : 'password'}
                  placeholder="sk-..."
                  value={config.providers.DEEPSEEK.apiKey}
                  onChange={(e) => handleApiKeyChange('DEEPSEEK', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('DEEPSEEK')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showKeys.DEEPSEEK ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs">
              {testResults.DEEPSEEK.message && (
                <span
                  className={testResults.DEEPSEEK.success ? 'text-emerald-700 font-semibold' : 'text-rose-600 font-semibold'}
                >
                  {testResults.DEEPSEEK.message}
                </span>
              )}
            </div>
            <button
              onClick={() => handleTestConnection('DEEPSEEK')}
              disabled={testResults.DEEPSEEK.loading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testResults.DEEPSEEK.loading ? 'animate-spin' : ''}`} />
              Test Koneksi (Ping)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
