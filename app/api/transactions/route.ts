// ==============================================================================
// TataDana: API Route /api/transactions
// Handles fetching, filtering, searching, and creating transactions
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { Transaction, TransactionItem, Wallet, Category } from '@/types/database';
import { getCurrentMonthWIB, toWIBISOString } from '@/lib/date-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const walletId = searchParams.get('wallet_id');
    const categoryId = searchParams.get('category_id');
    const type = searchParams.get('type');
    const search = searchParams.get('search')?.toLowerCase();
    const period = searchParams.get('period'); // 'today', 'week', 'month', 'year', 'custom'
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Fetch related wallets and categories
    const [{ data: walletsData }, { data: categoriesData }, { data: itemsData }] = await Promise.all([
      supabase.from('wallets').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('transaction_items').select('*'),
    ]);

    const wallets: Wallet[] = walletsData || [];
    const categories: Category[] = categoriesData || [];
    const items: TransactionItem[] = itemsData || [];

    // Fetch transactions
    const { data: rawTransactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) {
      throw error;
    }

    let list: Transaction[] = (rawTransactions || []).map((tx: any) => ({
      ...tx,
      wallet: wallets.find((w) => w.id === tx.wallet_id),
      destination_wallet: wallets.find((w) => w.id === tx.destination_wallet_id),
      category: categories.find((c) => c.id === tx.category_id),
      items: items.filter((it: any) => it.transaction_id === tx.id),
    }));

    // Filter by wallet
    if (walletId && walletId !== 'all') {
      list = list.filter((tx) => tx.wallet_id === walletId || tx.destination_wallet_id === walletId);
    }

    // Filter by category
    if (categoryId && categoryId !== 'all') {
      list = list.filter((tx) => tx.category_id === categoryId);
    }

    // Filter by type
    if (type && type !== 'all') {
      list = list.filter((tx) => tx.type === type);
    }

    // Search keyword in description, category name, or item name
    if (search) {
      list = list.filter((tx) => {
        const descMatch = tx.description?.toLowerCase().includes(search);
        const catMatch = tx.category?.name?.toLowerCase().includes(search);
        const walletMatch = tx.wallet?.name?.toLowerCase().includes(search);
        const itemMatch = tx.items?.some((it) => it.item_name.toLowerCase().includes(search));
        return descMatch || catMatch || walletMatch || itemMatch;
      });
    }

    // Date / Period filters
    const now = new Date();
    if (period === 'today') {
      const todayStr = now.toISOString().slice(0, 10);
      list = list.filter((tx) => tx.transaction_date.slice(0, 10) === todayStr);
    } else if (period === 'week') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
      list = list.filter((tx) => new Date(tx.transaction_date) >= oneWeekAgo);
    } else if (period === 'month' || !period) {
      const currentMonth = getCurrentMonthWIB();
      list = list.filter((tx) => tx.transaction_date.startsWith(currentMonth));
    } else if (period === 'year') {
      const currentYear = String(now.getFullYear());
      list = list.filter((tx) => tx.transaction_date.startsWith(currentYear));
    } else if (period === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter((tx) => {
        const d = new Date(tx.transaction_date);
        return d >= start && d <= end;
      });
    }

    const totalCount = list.length;

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedList = list.slice(startIndex, startIndex + limit);

    // Compute stats
    let totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance || 0), 0);
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    const currentMonth = getCurrentMonthWIB();
    (rawTransactions || []).forEach((tx: any) => {
      if (tx.transaction_date.startsWith(currentMonth)) {
        if (tx.type === 'INCOME') monthlyIncome += Number(tx.amount);
        else if (tx.type === 'EXPENSE') monthlyExpense += Number(tx.amount);
      }
    });

    // Budgets
    const { data: budgetsData } = await supabase.from('budgets').select('*');
    const totalBudget = (budgetsData || []).reduce((acc: number, b: any) => acc + Number(b.amount || 0), 0);
    const remainingBudget = Math.max(0, totalBudget - monthlyExpense);

    return NextResponse.json({
      data: paginatedList,
      total: totalCount,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
      stats: {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        totalBudget,
        remainingBudget,
        budgetUsedPercentage: totalBudget > 0 ? Math.min(100, Math.round((monthlyExpense / totalBudget) * 100)) : 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data transaksi: ' + (error?.message || 'Internal error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id = 'user-dev-tatadana-01',
      wallet_id,
      destination_wallet_id,
      category_id,
      type,
      amount,
      description,
      transaction_date = toWIBISOString(),
      source = 'MANUAL',
      items = [],
    } = body;

    if (!wallet_id || !type || !amount) {
      return NextResponse.json(
        { error: 'Field wallet_id, type, dan amount wajib diisi' },
        { status: 400 }
      );
    }

    // Insert transaction
    const { data: tx, error } = await supabase
      .from('transactions')
      .insert({
        user_id,
        wallet_id,
        destination_wallet_id: type === 'TRANSFER' ? destination_wallet_id : null,
        category_id: type !== 'TRANSFER' ? category_id : null,
        type,
        amount: Number(amount),
        description: description || '',
        transaction_date: transaction_date || toWIBISOString(),
        source,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert items if any
    if (items && items.length > 0) {
      const itemsToInsert = items.map((it: any) => ({
        transaction_id: tx.id,
        item_name: it.item_name,
        qty: Number(it.qty || 1),
        price: Number(it.price || 0),
        total: Number(it.total || (it.qty || 1) * (it.price || 0)),
      }));

      await supabase.from('transaction_items').insert(itemsToInsert);
    }

    return NextResponse.json({ success: true, data: tx }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Gagal mencatat transaksi: ' + (error?.message || 'Internal error') },
      { status: 500 }
    );
  }
}
