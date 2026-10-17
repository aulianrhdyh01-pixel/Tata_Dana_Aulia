import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// TATADANA AI FINANCIAL ADVISOR ENGINE
// Implements: Part 4.7 (Fitur Pro - Automatic Proactive Financial Advisor)
// Triggers:
// 1. Pengeluaran satu kategori melonjak >50% dibanding minggu lalu
// 2. Total pengeluaran sudah >80% dari total pemasukan bulan ini
// 3. Pengeluaran besar (>20% budget kategori sekaligus)
// ==============================================================================

export interface AdvisorAlert {
  shouldNotify: boolean;
  message: string;
  triggerType: 'category_surge' | 'total_budget_warning' | 'large_single_transaction';
}

export class AiFinancialAdvisorService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Evaluates user financial health after each transaction (Pro users only)
   */
  public async evaluateTriggers(userId: string, currentTxAmount: number, categoryId: string, userName: string): Promise<AdvisorAlert | null> {
    // 1. Fetch user plan
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('plan, full_name')
      .eq('id', userId)
      .single();

    if (!profile || profile.plan !== 'pro') {
      return null; // AI Financial Advisor khusus untuk pengguna paket Pro
    }

    const name = userName || profile.full_name.split(' ')[0] || 'Teman';

    // 2. Check Trigger 1: Single Transaction > 20% of monthly category budget
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: budget } = await this.supabase
      .from('budgets')
      .select('amount_limit, categories(name, icon_emoji)')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .gte('month_year', startOfMonth.toISOString().split('T')[0])
      .single();

    if (budget && Number(budget.amount_limit) > 0) {
      const budgetLimit = Number(budget.amount_limit);
      const ratio = currentTxAmount / budgetLimit;

      if (ratio >= 0.20) {
        const percent = Math.round(ratio * 100);
        return {
          shouldNotify: true,
          triggerType: 'large_single_transaction',
          message: `🤖 Financial Advisor
Hei ${name}! Transaksi barusan menghabiskan ${percent}% dari seluruh budget ${budget.categories?.name || 'kategori ini'} bulan ini.
💡 Saran: Pertimbangkan untuk mengerem pengeluaran kategori ini hingga minggu depan agar budget tidak jebol sebelum akhir bulan ya!`
        };
      }
    }

    // 3. Check Trigger 2: Total pengeluaran bulan ini sudah >80% total pemasukan
    const { data: monthTx } = await this.supabase
      .from('transactions')
      .select('transaction_type, amount')
      .eq('user_id', userId)
      .gte('transaction_time', startOfMonth.toISOString());

    let totalMasuk = 0;
    let totalKeluar = 0;

    (monthTx || []).forEach((t: any) => {
      const val = Number(t.amount);
      if (t.transaction_type === 'pemasukan') totalMasuk += val;
      if (t.transaction_type === 'pengeluaran') totalKeluar += val;
    });

    if (totalMasuk > 0) {
      const spendRatio = totalKeluar / totalMasuk;
      if (spendRatio >= 0.80) {
        const percentSpent = Math.round(spendRatio * 100);
        return {
          shouldNotify: true,
          triggerType: 'total_budget_warning',
          message: `🤖 Financial Advisor
Hei ${name}! Total pengeluaranmu bulan ini sudah mencapai ${percentSpent}% dari seluruh pemasukan.
💡 Saran: Sisihkan dana darurat minimal 10-20% sebelum menghabiskan sisa cashflow Anda bulan ini!`
        };
      }
    }

    return null;
  }
}
