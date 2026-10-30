// ==============================================================================
// TataDana: API Route /api/export/excel
// Generates and serves on-demand Excel (.xlsx) financial report
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { exportFinancialExcel } from '@/lib/export/excel-exporter';
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

    // Fetch items for receipt transactions
    const { data: itemsData } = await supabase.from('transaction_items').select('*');
    const allItems = itemsData || [];

    transactions = transactions.map((tx) => ({
      ...tx,
      wallet: wallets.find((w) => w.id === tx.wallet_id),
      category: categories.find((c) => c.id === tx.category_id),
      items: allItems.filter((it: any) => it.transaction_id === tx.id),
    }));

    const activeWallet = wallets.find((w) => w.id === walletId);
    const activeCategory = categories.find((c) => c.id === categoryId);

    const user: Partial<User> = {
      full_name: 'Budi Pratama',
      email: 'user@tatadana.id',
      subscription_tier: 'PRO',
    };

    const excelResult = await exportFinancialExcel({
      user,
      transactions,
      wallets,
      categories,
      periodTitle: period,
      filterWalletName: activeWallet ? activeWallet.name : 'Semua Dompet',
      filterCategoryName: activeCategory ? activeCategory.name : 'Semua Kategori',
      filterTypeName: type ? type : 'Semua Tipe',
    });

    const historyItem = addExportHistory({
      userId: 'user-dev-tatadana-01',
      fileName: excelResult.filename,
      format: 'EXCEL',
      periodTitle: period,
      fileSizeFormatted: `${Math.round(excelResult.buffer.length / 1024)} KB`,
      recordCount: transactions.length,
      filterSummary: `${activeWallet ? activeWallet.name : 'Semua Dompet'} • ${activeCategory ? activeCategory.name : 'Semua Kategori'}`,
    });

    if (jsonResponse) {
      const base64 = excelResult.buffer.toString('base64');
      const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${base64}`;
      return NextResponse.json({
        success: true,
        filename: excelResult.filename,
        historyId: historyItem.id,
        downloadUrl: dataUrl,
        size: excelResult.buffer.length,
      });
    }

   return new NextResponse(excelResult.buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${excelResult.filename}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json(
      { error: 'Gagal membuat file laporan Excel: ' + (error?.message || 'Internal error') },
      { status: 500 }
    );
  }
}
