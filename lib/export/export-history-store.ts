// ==============================================================================
// TataDana: Export History Record & Local Cache
// Stores and serves on-demand generated exports with direct download links
// ==============================================================================

export interface ExportHistoryItem {
  id: string;
  userId: string;
  fileName: string;
  format: 'PDF' | 'EXCEL';
  periodTitle: string;
  fileSizeFormatted: string;
  recordCount: number;
  generatedAt: string; // WIB ISO string
  downloadUrl?: string; // Data URL or object URL
  filterSummary: string;
}

// Global in-memory list for export history
declare global {
  var __TATADANA_EXPORT_HISTORY__: ExportHistoryItem[] | undefined;
}

if (!globalThis.__TATADANA_EXPORT_HISTORY__) {
  globalThis.__TATADANA_EXPORT_HISTORY__ = [
    {
      id: 'exp-hist-001',
      userId: 'user-dev-tatadana-01',
      fileName: 'tatadana_laporan_oktober_2026_demo.pdf',
      format: 'PDF',
      periodTitle: 'Bulan Ini (Oktober 2026)',
      fileSizeFormatted: '142 KB',
      recordCount: 8,
      generatedAt: new Date(Date.now() - 3600000).toISOString(),
      filterSummary: 'Semua Dompet • Semua Kategori',
    },
    {
      id: 'exp-hist-002',
      userId: 'user-dev-tatadana-01',
      fileName: 'tatadana_laporan_oktober_2026_demo.xlsx',
      format: 'EXCEL',
      periodTitle: 'Bulan Ini (Oktober 2026)',
      fileSizeFormatted: '38 KB',
      recordCount: 8,
      generatedAt: new Date(Date.now() - 7200000).toISOString(),
      filterSummary: 'Semua Dompet • Semua Kategori',
    },
  ];
}

export function getExportHistory(userId?: string): ExportHistoryItem[] {
  const list = globalThis.__TATADANA_EXPORT_HISTORY__ || [];
  if (userId) {
    return list.filter((item) => item.userId === userId || !item.userId);
  }
  return list;
}

export function addExportHistory(item: Omit<ExportHistoryItem, 'id' | 'generatedAt'>): ExportHistoryItem {
  const fullItem: ExportHistoryItem = {
    ...item,
    id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    generatedAt: new Date().toISOString(),
  };

  if (!globalThis.__TATADANA_EXPORT_HISTORY__) {
    globalThis.__TATADANA_EXPORT_HISTORY__ = [];
  }

  globalThis.__TATADANA_EXPORT_HISTORY__.unshift(fullItem);
  return fullItem;
}
