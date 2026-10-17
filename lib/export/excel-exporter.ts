// ==============================================================================
// TataDana: On-Demand Excel (.xlsx) Report Exporter
// Generates multi-sheet formatted workbook in Asia/Jakarta (WIB)
// ==============================================================================

import * as XLSX from 'xlsx';
import { Transaction, Wallet, Category, User } from '@/types/database';
import { formatWIB, toWIBISOString } from '@/lib/date-utils';

export interface ExcelExportOptions {
  user: Partial<User>;
  transactions: Transaction[];
  wallets?: Wallet[];
  categories?: Category[];
  periodTitle: string;
  filterWalletName?: string;
  filterCategoryName?: string;
  filterTypeName?: string;
}

export interface ExcelExportResult {
  filename: string;
  blob: Blob;
  buffer: Buffer;
  arrayBuffer: ArrayBuffer;
}

export function generateFinancialWorkbook(options: ExcelExportOptions): XLSX.WorkBook {
  const {
    user,
    transactions,
    wallets = [],
    categories = [],
    periodTitle,
    filterWalletName = 'Semua Dompet',
    filterCategoryName = 'Semua Kategori',
    filterTypeName = 'Semua Tipe',
  } = options;

  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // SHEET 1: RINGKASAN EKSEKUTIF
  // -------------------------------------------------------------
  let totalIncome = 0;
  let totalExpense = 0;
  let totalTransfer = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'INCOME') totalIncome += Number(tx.amount);
    else if (tx.type === 'EXPENSE') totalExpense += Number(tx.amount);
    else if (tx.type === 'TRANSFER') totalTransfer += Number(tx.amount);
  });

  const netCashFlow = totalIncome - totalExpense;

  const summaryData: any[][] = [
    ['TATADANA - LAPORAN KEUANGAN PRIBADI'],
    ['Platform SaaS Manajemen Keuangan Pribadi Indonesia'],
    [],
    ['METADATA LAPORAN'],
    ['Pengguna', user.full_name || user.email || 'Pengguna TataDana'],
    ['Email', user.email || '-'],
    ['Periode', periodTitle],
    ['Zona Waktu', 'Asia/Jakarta (WIB, UTC+7)'],
    ['Tanggal Generate', `${formatWIB(new Date(), 'full')}`],
    ['Filter Dompet', filterWalletName],
    ['Filter Kategori', filterCategoryName],
    ['Filter Tipe', filterTypeName],
    [],
    ['RINGKASAN ARUS KAS (CASH FLOW)', 'NOMINAL (IDR)'],
    ['Total Pemasukan (Income)', totalIncome],
    ['Total Pengeluaran (Expense)', totalExpense],
    ['Arus Kas Bersih (Net Cash Flow)', netCashFlow],
    ['Total Transaksi Transfer', totalTransfer],
    ['Jumlah Catatan Transaksi', transactions.length],
    [],
    ['RINGKASAN PENGELUARAN PER KATEGORI', 'TOTAL (IDR)', 'PERSENTASE'],
  ];

  // Category breakdown
  const categoryMap = new Map<string, number>();
  transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .forEach((tx) => {
      const catName = tx.category?.name || 'Lain-lain';
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + Number(tx.amount));
    });

  const sortedCatEntries = Array.from(categoryMap.entries()).sort((a, b) => b[1] - a[1]);
  if (sortedCatEntries.length === 0) {
    summaryData.push(['(Belum ada pengeluaran pada periode ini)', 0, '0%']);
  } else {
    sortedCatEntries.forEach(([catName, amount]) => {
      const pct = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) + '%' : '0%';
      summaryData.push([catName, amount, pct]);
    });
  }

  summaryData.push([]);
  summaryData.push(['RINGKASAN DOMPET SAAT INI', 'TIPE', 'SALDO TERAKHIR (IDR)']);
  if (wallets.length === 0) {
    summaryData.push(['(Data dompet tidak tersedia)', '-', 0]);
  } else {
    wallets.forEach((w) => {
      summaryData.push([w.name, w.type, Number(w.balance)]);
    });
  }

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [
    { wch: 35 },
    { wch: 25 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan');

  // -------------------------------------------------------------
  // SHEET 2: DAFTAR TRANSAKSI
  // -------------------------------------------------------------
  const txHeaders = [
    'No',
    'ID Transaksi',
    'Tanggal (WIB)',
    'Tipe',
    'Kategori',
    'Dompet Sumber',
    'Dompet Tujuan (Transfer)',
    'Nominal (IDR)',
    'Keterangan',
    'Sumber Pencatatan',
    'Jumlah Item Struk',
  ];

  const txRows: any[][] = [txHeaders];

  transactions.forEach((tx, idx) => {
    let typeLabel = 'PENGELUARAN';
    if (tx.type === 'INCOME') typeLabel = 'PEMASUKAN';
    else if (tx.type === 'TRANSFER') typeLabel = 'TRANSFER';

    const sourceLabel =
      tx.source === 'TELEGRAM_TEXT'
        ? 'Telegram Bot (Teks)'
        : tx.source === 'TELEGRAM_RECEIPT'
        ? 'Telegram Bot (OCR Struk)'
        : tx.source === 'TELEGRAM_VOICE'
        ? 'Telegram Bot (Voice Note)'
        : tx.source === 'TRANSFER'
        ? 'Transfer Antar Dompet'
        : 'Manual Web';

    txRows.push([
      idx + 1,
      tx.id,
      formatWIB(tx.transaction_date, 'short'),
      typeLabel,
      tx.category?.name || '-',
      tx.wallet?.name || '-',
      tx.destination_wallet?.name || '-',
      Number(tx.amount),
      tx.description || '-',
      sourceLabel,
      tx.items?.length || 0,
    ]);
  });

  const wsTransactions = XLSX.utils.aoa_to_sheet(txRows);
  wsTransactions['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 24 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 38 },
    { wch: 26 },
    { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Daftar Transaksi');

  // -------------------------------------------------------------
  // SHEET 3: RINCIAN STRUK ITEM (Untuk multi-item OCR struk)
  // -------------------------------------------------------------
  const itemHeaders = [
    'No',
    'ID Transaksi',
    'Tanggal Transaksi',
    'Keterangan Transaksi',
    'Nama Barang / Item',
    'Qty',
    'Harga Satuan (IDR)',
    'Subtotal (IDR)',
  ];

  const itemRows: any[][] = [itemHeaders];
  let itemCounter = 1;

  transactions.forEach((tx) => {
    if (tx.items && tx.items.length > 0) {
      tx.items.forEach((it) => {
        itemRows.push([
          itemCounter++,
          tx.id,
          formatWIB(tx.transaction_date, 'short'),
          tx.description,
          it.item_name,
          Number(it.qty),
          Number(it.price),
          Number(it.total),
        ]);
      });
    }
  });

  if (itemRows.length === 1) {
    itemRows.push(['-', '-', '-', '-', 'Tidak ada transaksi dengan rincian item struk', 0, 0, 0]);
  }

  const wsItems = XLSX.utils.aoa_to_sheet(itemRows);
  wsItems['!cols'] = [
    { wch: 6 },
    { wch: 20 },
    { wch: 20 },
    { wch: 32 },
    { wch: 30 },
    { wch: 8 },
    { wch: 18 },
    { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, wsItems, 'Rincian Item Struk');

  return wb;
}

/**
 * Generate Excel file and return download artifacts
 */
export async function exportFinancialExcel(options: ExcelExportOptions): Promise<ExcelExportResult> {
  const wb = generateFinancialWorkbook(options);
  const periodSlug = (options.periodTitle || 'laporan').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `tatadana_laporan_${periodSlug}_${Date.now()}.xlsx`;

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
  const buffer = Buffer.isBuffer(excelBuffer) ? excelBuffer : Buffer.from(excelBuffer);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  const blob = new Blob([arrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  return {
    filename,
    blob,
    buffer,
    arrayBuffer,
  };
}
