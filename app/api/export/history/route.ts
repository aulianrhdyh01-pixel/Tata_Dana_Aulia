// ==============================================================================
// TataDana: API Route /api/export/history
// Returns the list of generated PDF and Excel reports with download links
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getExportHistory } from '@/lib/export/export-history-store';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id') || undefined;
    const list = getExportHistory(userId);
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Gagal mengambil riwayat ekspor: ' + (error?.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
