// ==============================================================================
// TataDana: API Route /api/budgets
// Handles category budgets with live spend tracking and alert indicators
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { Budget, Category } from '@/types/database';
import { getCurrentMonthWIB, toWIBISOString } from '@/lib/date-utils';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || getCurrentMonthWIB();

    // 1. Fetch categories
    const { data: categoriesData, error: catError } = await supabase.from('categories').select('*');
    if (catError) throw catError;
    const categories: Category[] = categoriesData || [];

    // 2. Fetch budgets for the month
    const { data: budgetsData, error: bgtError } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', month);

    if (bgtError) throw bgtError;
    const budgets: Budget[] = budgetsData || [];

    // 3. Fetch expenses for the month to calculate actual spent
    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'EXPENSE');

    const transactions = (transactionsData || []).filter((tx: any) =>
      tx.transaction_date.startsWith(month)
    );

    // Group expenses by category
    const spentByCategory = new Map<string, number>();
    transactions.forEach((tx: any) => {
      if (tx.category_id) {
        spentByCategory.set(
          tx.category_id,
          (spentByCategory.get(tx.category_id) || 0) + Number(tx.amount)
        );
      }
    });

    // Enrich budgets
    const enrichedBudgets = budgets.map((b) => {
      const spent = spentByCategory.get(b.category_id) || 0;
      const budgetAmount = Number(b.amount);
      const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;
      let status: 'NORMAL' | 'WARNING' | 'DANGER' = 'NORMAL';
      if (percentage > 100) status = 'DANGER';
      else if (percentage >= 80) status = 'WARNING';

      return {
        ...b,
        category: categories.find((c) => c.id === b.category_id),
        spent,
        remaining: Math.max(0, budgetAmount - spent),
        percentage,
        status,
      };
    });

    const totalBudget = enrichedBudgets.reduce((acc, b) => acc + Number(b.amount), 0);
    const totalSpent = enrichedBudgets.reduce((acc, b) => acc + Number(b.spent), 0);
    const overallPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return NextResponse.json({
      data: enrichedBudgets,
      categories,
      month,
      summary: {
        totalBudget,
        totalSpent,
        totalRemaining: Math.max(0, totalBudget - totalSpent),
        overallPercentage,
        overbudgetCount: enrichedBudgets.filter((b) => b.status === 'DANGER').length,
        warningCount: enrichedBudgets.filter((b) => b.status === 'WARNING').length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data anggaran: ' + (error?.message || 'Internal error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // Action 1: Create custom category
    if (action === 'create_category') {
      const { name, type = 'EXPENSE', icon = '🏷️', color = '#f97316', user_id = 'user-dev-tatadana-01' } = body;
      if (!name) {
        return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 });
      }

      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          user_id,
          name,
          type,
          icon,
          color,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data: newCategory }, { status: 201 });
    }

    // Action 2: Set / Update category budget
    const {
      category_id,
      amount,
      month = getCurrentMonthWIB(),
      user_id = 'user-dev-tatadana-01',
    } = body;

    if (!category_id || amount === undefined || amount === null) {
      return NextResponse.json({ error: 'category_id dan amount wajib diisi' }, { status: 400 });
    }

    // Check if budget exists for this month
    const { data: existing } = await supabase
      .from('budgets')
      .select('*')
      .eq('category_id', category_id)
      .eq('month', month)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('budgets')
        .update({ amount: Number(amount), updated_at: toWIBISOString() })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id,
          category_id,
          amount: Number(amount),
          month,
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error saving budget:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan anggaran: ' + (error?.message || 'Internal error') },
      { status: 500 }
    );
  }
}
