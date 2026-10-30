// ==============================================================================
// TataDana: API Route /api/export/pdf
// Generates and serves on-demand PDF financial report
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { exportFinancialPDF } from '@/lib/export/pdf-exporter';
import { addExportHistory } from '@/lib/export/export-history-store';
import { supabase } from '@/lib/supabase/client';
import { Transaction, Wallet, Category, User } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'Bulan Ini';
    const walletId = searchParams.get('wallet_id');
    const categoryId = searchParams.get('category_id');
    const type = searchParams.get('type');
    const jsonResponse = searchParams.get('json') === 'true';

    // 1. Fetch Wallets & Categories
    const { data: walletsData } = await supabase.from('wallets').select('*');
    const wallets: Wallet[] = walletsData || [];

    const { data: categoriesData } = await supabase.from('categories').select('*');
    const categories: Category[] = categoriesData || [];

    // 2. Fetch Transactions
    let query = supabase.from('transactions').select('*').order('transaction_date', { ascending: false });

    if (walletId && walletId !== 'all') {
      query = query.eq('wallet_id', walletId);
    }
    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }
    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    const { data: txData } = await query;
    let transactions: Transaction[] = (txData as Transaction[]) || [];

    // Enrich transactions with wallet & category references
    transactions = transactions.map((tx) => ({
      ...tx,
      wallet: wallets.find((w) => w.id === tx.wallet_id),
      category: categories.find((c) => c.id === tx.category_id),
    }));

    // User details
    const activeWallet = wallets.find((w) => w.id === walletId);
    const activeCategory = categories.find((c) => c.id === categoryId);

    const user: Partial<User> = {
      full_name: 'Budi Pratama',
      email: 'user@tatadana.id',
      subscription_tier: 'PRO',
    };

    const pdfResult = await exportFinancialPDF({
      user,
      transactions,
      wallets,
      categories,
      periodTitle: period,
      filterWalletName: activeWallet ? activeWallet.name : 'Semua Dompet',
      filterCategoryName: activeCategory ? activeCategory.name : 'Semua Kategori',
      filterTypeName: type ? type : 'Semua Tipe',
    });

    // Record in history
    const historyItem = addExportHistory({
      userId: 'user-dev-tatadana-01',
      fileName: pdfResult.filename,
      format: 'PDF',
      periodTitle: period,
      fileSizeFormatted: `${Math.round(pdfResult.buffer.length / 1024)} KB`,
      recordCount: transactions.length,
      filterSummary: `${activeWallet ? activeWallet.name : 'Semua Dompet'} • ${activeCategory ? activeCategory.name : 'Semua Kategori'}`,
    });

    if (jsonResponse) {
      const base64 = pdfResult.buffer.toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64}`;
      return NextResponse.json({
        success: true,
        filename: pdfResult.filename,
        historyId: historyItem.id,
        downloadUrl: dataUrl,
        size: pdfResult.buffer.length,
      });
    }

    return new NextResponse(pdfResult.buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${pdfResult.filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error generating PDF export:', error);
    return NextResponse.json(
      { error: 'Gagal membuat file laporan PDF: ' + (error?.message || 'Internal error') },
      { status: 500 }
    );
  }
}
