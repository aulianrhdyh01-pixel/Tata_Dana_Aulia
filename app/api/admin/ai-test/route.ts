// ==============================================================================
// TataDana: Multi-Provider AI Connection Test API
// Live connection and latency testing for Gemini, OpenAI, and DeepSeek
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { multiProviderAi } from '@/lib/ai/multi-provider-client';
import { AIProvider } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiKey, model } = body;

    if (!provider) {
      return NextResponse.json({ error: 'Provider is required (GEMINI, OPENAI, DEEPSEEK).' }, { status: 400 });
    }

    const result = await multiProviderAi.testConnection(provider as AIProvider, apiKey, model);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        latencyMs: 0,
        message: error?.message || 'Gagal menguji koneksi AI',
      },
      { status: 500 }
    );
  }
}
