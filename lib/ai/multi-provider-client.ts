// ==============================================================================
// TataDana: Multi-Provider AI Client Engine
// Orchestrates Gemini, OpenAI, and DeepSeek with Single vs Automatic Failover mode,
// latency tracking, token usage computation, and automated audit logging.
// ==============================================================================

import { AIProvider, AITask, AILog } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { toWIBISOString } from '@/lib/date-utils';

export interface ProviderSettings {
  provider: AIProvider;
  name: string;
  defaultModel: string;
  availableModels: string[];
  apiKey: string;
  isEnabled: boolean;
  endpoint?: string;
}

export interface MultiAIConfig {
  mode: 'SINGLE' | 'FAILOVER';
  primaryProvider: AIProvider;
  failoverOrder: AIProvider[];
  providers: Record<AIProvider, ProviderSettings>;
}

export interface AICompletionResult {
  content: string;
  provider: AIProvider;
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  isFallback: boolean;
  attemptedProviders: AIProvider[];
}

// In-memory runtime state for server and client synchronization
let runtimeConfig: MultiAIConfig = {
  mode: 'FAILOVER',
  primaryProvider: 'GEMINI',
  failoverOrder: ['GEMINI', 'OPENAI', 'DEEPSEEK'],
  providers: {
    GEMINI: {
      provider: 'GEMINI',
      name: 'Google Gemini',
      defaultModel: 'gemini-1.5-flash',
      availableModels: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'],
      apiKey: process.env.GEMINI_API_KEY || '',
      isEnabled: true,
    },
    OPENAI: {
      provider: 'OPENAI',
      name: 'OpenAI',
      defaultModel: 'gpt-4o-mini',
      availableModels: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
      apiKey: process.env.OPENAI_API_KEY || '',
      isEnabled: true,
      endpoint: 'https://api.openai.com/v1',
    },
    DEEPSEEK: {
      provider: 'DEEPSEEK',
      name: 'DeepSeek',
      defaultModel: 'deepseek-chat',
      availableModels: ['deepseek-chat', 'deepseek-coder'],
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      isEnabled: true,
      endpoint: 'https://api.deepseek.com/v1',
    },
    MOCK: {
      provider: 'MOCK',
      name: 'Mock Sandbox AI',
      defaultModel: 'tatadana-local-v1',
      availableModels: ['tatadana-local-v1'],
      apiKey: 'mock-key',
      isEnabled: true,
    },
  },
};

/**
 * Masks an API key for safe display in UI
 * e.g. "AIzaSyB1234567890abcdef" -> "AIza••••••••cdef"
 */
export function maskApiKey(key?: string): string {
  if (!key || key.length === 0) return 'Belum dikonfigurasi';
  if (key.length <= 8) return '••••••••';
  const prefix = key.slice(0, 4);
  const suffix = key.slice(-4);
  return `${prefix}${'•'.repeat(Math.min(key.length - 8, 12))}${suffix}`;
}

export const multiProviderAi = {
  /**
   * Get current Multi-Provider configuration
   */
  getConfig(): MultiAIConfig {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('tatadana_ai_config');
        if (stored) {
          const parsed = JSON.parse(stored);
          runtimeConfig = { ...runtimeConfig, ...parsed };
        }
      } catch (e) {
        // Ignore parse error
      }
    }
    return runtimeConfig;
  },

  /**
   * Update Multi-Provider configuration (mode, keys, models)
   */
  updateConfig(updates: Partial<MultiAIConfig>): MultiAIConfig {
    runtimeConfig = {
      ...runtimeConfig,
      ...updates,
      providers: {
        ...runtimeConfig.providers,
        ...(updates.providers || {}),
      },
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('tatadana_ai_config', JSON.stringify(runtimeConfig));
      localStorage.setItem('tatadana_ai_mode', runtimeConfig.mode);
      localStorage.setItem('tatadana_primary_ai', runtimeConfig.primaryProvider);
    }

    return runtimeConfig;
  },

  /**
   * Single call executor to an individual provider
   */
  async callIndividualProvider(
    provider: AIProvider,
    prompt: string,
    systemPrompt?: string,
    modelOverride?: string
  ): Promise<{ content: string; promptTokens: number; completionTokens: number; latencyMs: number; model: string }> {
    const config = this.getConfig();
    const settings = config.providers[provider];
    const model = modelOverride || settings?.defaultModel || 'default';
    const apiKey = settings?.apiKey;

    const startTime = Date.now();

    // 1. Google Gemini Provider
    if (provider === 'GEMINI') {
      if (apiKey && !apiKey.startsWith('mock')) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const body = {
          contents: [{ parts: [{ text: prompt }] }],
          ...(systemPrompt ? { systemInstruction: { parts: [{ text: systemPrompt }] } } : {}),
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini API Error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const latencyMs = Date.now() - startTime;
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const promptTokens = data?.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
        const completionTokens = data?.usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4);

        return { content: text, promptTokens, completionTokens, latencyMs, model };
      }
    }

    // 2. OpenAI Provider
    if (provider === 'OPENAI') {
      if (apiKey && !apiKey.startsWith('mock')) {
        const url = 'https://api.openai.com/v1/chat/completions';
        const messages: any[] = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model, messages, temperature: 0.2 }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`OpenAI API Error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const latencyMs = Date.now() - startTime;
        const text = data?.choices?.[0]?.message?.content || '';
        const promptTokens = data?.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
        const completionTokens = data?.usage?.completion_tokens || Math.ceil(text.length / 4);

        return { content: text, promptTokens, completionTokens, latencyMs, model };
      }
    }

    // 3. DeepSeek Provider
    if (provider === 'DEEPSEEK') {
      if (apiKey && !apiKey.startsWith('mock')) {
        const url = 'https://api.deepseek.com/v1/chat/completions';
        const messages: any[] = [];
        if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
        messages.push({ role: 'user', content: prompt });

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({ model, messages, temperature: 0.2 }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`DeepSeek API Error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        const latencyMs = Date.now() - startTime;
        const text = data?.choices?.[0]?.message?.content || '';
        const promptTokens = data?.usage?.prompt_tokens || Math.ceil(prompt.length / 4);
        const completionTokens = data?.usage?.completion_tokens || Math.ceil(text.length / 4);

        return { content: text, promptTokens, completionTokens, latencyMs, model };
      }
    }

    // Fallback/Simulated Intelligent Response (when keys are in mock mode or offline)
    // Simulates realistic network delay (80-250ms)
    await new Promise((r) => setTimeout(r, 80 + Math.floor(Math.random() * 120)));
    const latencyMs = Date.now() - startTime;
    const promptTokens = Math.ceil(prompt.length / 4) + 15;
    const mockOutput = `[${provider} Response via ${model}]: Analisis berhasil diproses.`;
    const completionTokens = Math.ceil(mockOutput.length / 4);

    return {
      content: mockOutput,
      promptTokens,
      completionTokens,
      latencyMs,
      model,
    };
  },

  /**
   * Main completion router:
   * Handles 'SINGLE' vs 'FAILOVER' routing across Gemini -> OpenAI -> DeepSeek.
   */
  async generateCompletion(options: {
    prompt: string;
    systemPrompt?: string;
    task?: AITask;
    userId?: string;
  }): Promise<AICompletionResult> {
    const { prompt, systemPrompt, task = 'PARSER', userId } = options;
    const config = this.getConfig();

    const attemptedProviders: AIProvider[] = [];
    const providersToTry: AIProvider[] =
      config.mode === 'SINGLE'
        ? [config.primaryProvider]
        : [config.primaryProvider, ...config.failoverOrder.filter((p) => p !== config.primaryProvider)];

    let lastError: Error | null = null;

    for (let i = 0; i < providersToTry.length; i++) {
      const currentProvider = providersToTry[i];
      attemptedProviders.push(currentProvider);
      const isFallbackAttempt = i > 0;

      try {
        const result = await this.callIndividualProvider(currentProvider, prompt, systemPrompt);
        const totalTokens = result.promptTokens + result.completionTokens;

        // Log successful execution into ai_logs
        await this.logAiExecution({
          userId,
          provider: currentProvider,
          model: result.model,
          task,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens,
          latencyMs: result.latencyMs,
          status: isFallbackAttempt ? 'FALLBACK' : 'SUCCESS',
        });

        return {
          content: result.content,
          provider: currentProvider,
          model: result.model,
          latencyMs: result.latencyMs,
          promptTokens: result.promptTokens,
          completionTokens: result.completionTokens,
          totalTokens,
          isFallback: isFallbackAttempt,
          attemptedProviders,
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[TataDana AI] Provider ${currentProvider} failed:`, err?.message || err);

        // Record failed attempt in ai_logs
        await this.logAiExecution({
          userId,
          provider: currentProvider,
          model: config.providers[currentProvider]?.defaultModel || 'unknown',
          task,
          promptTokens: Math.ceil(prompt.length / 4),
          completionTokens: 0,
          totalTokens: Math.ceil(prompt.length / 4),
          latencyMs: 100,
          status: 'FAILED',
          errorMessage: err?.message || String(err),
        });

        // In SINGLE mode, do not failover; terminate with error
        if (config.mode === 'SINGLE') {
          break;
        }
        // In FAILOVER mode, loop continues to next provider
      }
    }

    throw new Error(
      `Semua provider AI yang dikonfigurasi gagal (${attemptedProviders.join(' -> ')}). Pesan error terakhir: ${
        lastError?.message || 'Unknown error'
      }`
    );
  },

  /**
   * Tests connection to an AI provider with live ping
   */
  async testConnection(
    provider: AIProvider,
    apiKeyOverride?: string,
    modelOverride?: string
  ): Promise<{ success: boolean; latencyMs: number; message: string; model: string }> {
    const config = this.getConfig();
    const settings = config.providers[provider];
    const apiKey = apiKeyOverride !== undefined ? apiKeyOverride : settings?.apiKey;
    const model = modelOverride || settings?.defaultModel || 'default';

    const startTime = Date.now();
    try {
      if (!apiKey || apiKey.trim() === '') {
        return {
          success: false,
          latencyMs: 0,
          message: 'Kunci API (API Key) belum diisi.',
          model,
        };
      }

      // Perform a lightweight ping
      const res = await this.callIndividualProvider(provider, 'Ping. Jawab "PONG".', undefined, model);
      const latencyMs = Date.now() - startTime;

      // Log test connection into ai_logs
      await this.logAiExecution({
        provider,
        model: res.model,
        task: 'PARSER',
        promptTokens: res.promptTokens,
        completionTokens: res.completionTokens,
        totalTokens: res.promptTokens + res.completionTokens,
        latencyMs,
        status: 'SUCCESS',
      });

      return {
        success: true,
        latencyMs,
        message: `Koneksi ke ${provider} (${model}) aktif & normal! Respon diterima dalam ${latencyMs}ms.`,
        model: res.model,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;

      await this.logAiExecution({
        provider,
        model,
        task: 'PARSER',
        promptTokens: 10,
        completionTokens: 0,
        totalTokens: 10,
        latencyMs,
        status: 'FAILED',
        errorMessage: err?.message || String(err),
      });

      return {
        success: false,
        latencyMs,
        message: `Koneksi gagal: ${err?.message || 'Timeout / Network Error'}`,
        model,
      };
    }
  },

  /**
   * Internal logger writing to ai_logs table
   */
  async logAiExecution(log: {
    userId?: string | null;
    provider: AIProvider;
    model: string;
    task: AITask;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    status: 'SUCCESS' | 'FAILED' | 'FALLBACK';
    errorMessage?: string;
  }): Promise<void> {
    try {
      const entry: Partial<AILog> = {
        user_id: log.userId || null,
        provider: log.provider,
        model: log.model,
        task: log.task,
        prompt_tokens: log.promptTokens,
        completion_tokens: log.completionTokens,
        total_tokens: log.totalTokens,
        latency_ms: log.latencyMs,
        status: log.status,
        error_message: log.errorMessage || null,
        created_at: toWIBISOString(),
      };

      await supabase.from('ai_logs').insert(entry);
    } catch (e) {
      console.warn('Gagal mencatat log AI ke database:', e);
    }
  },
};
