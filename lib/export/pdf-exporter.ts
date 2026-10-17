// ==============================================================================
// TataDana: On-Demand PDF Report Exporter
// Produces professional branded financial statements in Asia/Jakarta (WIB)
// ==============================================================================

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, Wallet, Category, User } from '@/types/database';
import { formatRupiah, formatWIB, toWIBISOString } from '@/lib/date-utils';

export interface ExportReportOptions {
  user: Partial<User>;
  transactions: Transaction[];
  wallets?: Wallet[];
  categories?: Category[];
  periodTitle: string; // e.g. "Oktober 2026", "Semua Waktu", "10/10/2026 - 17/10/2026"
  filterWalletName?: string;
  filterCategoryName?: string;
  filterTypeName?: string;
}

export interface PDFExportResult {
  filename: string;
  blob: Blob;
  arrayBuffer: ArrayBuffer;
  buffer: Buffer;
}

export function generateFinancialPDF(options: ExportReportOptions): jsPDF {
  const {
    user,
    transactions,
    periodTitle,
    filterWalletName = 'Semua Dompet',
    filterCategoryName = 'Semua Kategori',
    filterTypeName = 'Semua Tipe',
  } = options;

  // Initialize PDF in A4 portrait
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. BRAND HEADER (Dark banner matching TataDana dark theme)
  doc.setFillColor(15, 15, 18); // #0f0f12
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Orange accent stripe
  doc.setFillColor(249, 115, 22); // #f97316 (TataDana Orange)
  doc.rect(0, 36, pageWidth, 2, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('TATADANA', margin, 16);

  // Subtitle
  doc.setTextColor(249, 115, 22);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('MANAJEMEN KEUANGAN PRIBADI & ANALYTICS', margin, 23);

  doc.setTextColor(161, 161, 170); // zinc-400
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Laporan Arus Kas Resmi • Standard Asia/Jakarta (WIB)', margin, 29);

  // Right-aligned report metadata in header
  const printDateStr = formatWIB(new Date(), 'short');
  doc.setTextColor(212, 212, 216);
  doc.setFontSize(8);
  doc.text(`Tanggal Cetak: ${printDateStr} WIB`, pageWidth - margin, 15, { align: 'right' });
  doc.text(`Periode: ${periodTitle}`, pageWidth - margin, 21, { align: 'right' });
  doc.text(`Pengguna: ${user.full_name || user.email || 'Pengguna TataDana'}`, pageWidth - margin, 27, { align: 'right' });

  // 2. METADATA & FILTER BADGES
  let cursorY = 46;

  doc.setTextColor(39, 39, 42); // zinc-800
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(24, 24, 27);
  doc.text('RINGKASAN EKSEKUTIF KEUANGAN', margin, cursorY);

  cursorY += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(113, 113, 122);
  doc.text(`Filter Aktif: Dompet [${filterWalletName}] • Kategori [${filterCategoryName}] • Tipe [${filterTypeName}]`, margin, cursorY);

  cursorY += 6;

  // 3. FINANCIAL SUMMARY METRIC CARDS
  // Calculate Totals
  let totalIncome = 0;
  let totalExpense = 0;
  let totalTransfer = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'INCOME') totalIncome += Number(tx.amount);
    else if (tx.type === 'EXPENSE') totalExpense += Number(tx.amount);
    else if (tx.type === 'TRANSFER') totalTransfer += Number(tx.amount);
  });

  const netCashFlow = totalIncome - totalExpense;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 18;

  const metrics = [
    { label: 'Total Pemasukan', value: formatRupiah(totalIncome), color: [34, 197, 94] }, // green
    { label: 'Total Pengeluaran', value: formatRupiah(totalExpense), color: [239, 68, 68] }, // red
    { label: 'Arus Kas Bersih', value: formatRupiah(netCashFlow), color: netCashFlow >= 0 ? [34, 197, 94] : [239, 68, 68] },
    { label: 'Total Transaksi', value: `${transactions.length} Transaksi`, color: [249, 115, 22] }, // orange
  ];

  metrics.forEach((m, idx) => {
    const cardX = margin + idx * (cardWidth + 3);
    // Card background
    doc.setFillColor(244, 244, 245); // zinc-100
    doc.roundedRect(cardX, cursorY, cardWidth, cardHeight, 1.5, 1.5, 'F');

    // Accent line
    doc.setFillColor(m.color[0], m.color[1], m.color[2]);
    doc.rect(cardX, cursorY, cardWidth, 1.2, 'F');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(113, 113, 122);
    doc.text(m.label, cardX + 3, cursorY + 6);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.value, cardX + 3, cursorY + 13);
  });

  cursorY += cardHeight + 8;

  // 4. CATEGORY BREAKDOWN TABLE (Top 5 Expense Categories)
  const categoryExpenseMap = new Map<string, number>();
  transactions
    .filter((tx) => tx.type === 'EXPENSE')
    .forEach((tx) => {
      const catName = tx.category?.name || 'Lain-lain';
      categoryExpenseMap.set(catName, (categoryExpenseMap.get(catName) || 0) + Number(tx.amount));
    });

  const sortedCategories = Array.from(categoryExpenseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedCategories.length > 0 && totalExpense > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(24, 24, 27);
    doc.text('5 KATEGORI PENGELUARAN TERBESAR', margin, cursorY);
    cursorY += 4;

    const catRows = sortedCategories.map(([catName, amount], i) => {
      const percentage = ((amount / totalExpense) * 100).toFixed(1);
      return [`#${i + 1}`, catName, formatRupiah(amount), `${percentage}%`];
    });

    autoTable(doc, {
      startY: cursorY,
      head: [['Rank', 'Kategori', 'Total Pengeluaran', 'Porsi (%)']],
      body: catRows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 2,
        textColor: [39, 39, 42],
      },
      headStyles: {
        fillColor: [39, 39, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 70 },
        2: { cellWidth: 50, halign: 'right' },
        3: { cellWidth: 35, halign: 'right' },
      },
      margin: { left: margin, right: margin },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 8;
  }

  // 5. DETAIL TRANSACTION TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(24, 24, 27);
  doc.text('DETAIL CATATAN TRANSAKSI', margin, cursorY);
  cursorY += 4;

  const tableRows = transactions.map((tx, idx) => {
    const dateFormatted = formatWIB(tx.transaction_date, 'short');
    const catName = tx.category?.name || '-';
    const walletName = tx.wallet?.name || '-';
    let typeLabel = 'Pengeluaran';
    let sign = '-';
    if (tx.type === 'INCOME') {
      typeLabel = 'Pemasukan';
      sign = '+';
    } else if (tx.type === 'TRANSFER') {
      typeLabel = 'Transfer';
      sign = '⇄';
    }

    // Include item details if present
    let desc = tx.description || '-';
    if (tx.items && tx.items.length > 0) {
      const itemSummaries = tx.items.map((it) => `${it.item_name} (${it.qty}x)`).join(', ');
      desc += `\n[Items: ${itemSummaries}]`;
    }

    const amountFormatted = `${sign} ${formatRupiah(Number(tx.amount))}`;

    return [
      String(idx + 1),
      dateFormatted,
      typeLabel,
      catName,
      walletName,
      desc,
      amountFormatted,
    ];
  });

  autoTable(doc, {
    startY: cursorY,
    head: [['No', 'Tanggal (WIB)', 'Tipe', 'Kategori', 'Dompet', 'Keterangan', 'Nominal']],
    body: tableRows,
    theme: 'striped',
    styles: {
      fontSize: 7.2,
      cellPadding: 2.2,
      textColor: [39, 39, 42],
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: [249, 115, 22], // TataDana Orange
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 18 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
      5: { cellWidth: 46 },
      6: { cellWidth: 34, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin, bottom: 20 },
    didDrawPage: (data) => {
      // Footer on every page
      const currentPg = data.pageNumber;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text(
        'TataDana - Platform SaaS Manajemen Keuangan Pribadi Indonesia • https://tatadana.id',
        margin,
        pageHeight - 8
      );
      doc.text(
        `Halaman ${currentPg}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: 'right' }
      );
    },
  });

  return doc;
}

/**
 * Generate PDF and return download artifacts
 */
export async function exportFinancialPDF(options: ExportReportOptions): Promise<PDFExportResult> {
  const doc = generateFinancialPDF(options);
  const periodSlug = (options.periodTitle || 'laporan').toLowerCase().replace(/[^a-z0-9]/g, '_');
  const filename = `tatadana_laporan_${periodSlug}_${Date.now()}.pdf`;

  const arrayBuffer = doc.output('arraybuffer');
  const buffer = Buffer.from(arrayBuffer);
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });

  return {
    filename,
    blob,
    arrayBuffer,
    buffer,
  };
}
