/**
 * Pro AI Financial Advisor Service
 * Sesuai Part 4.7:
 * Aktif otomatis (Pro), trigger saat:
 * 1. Pengeluaran satu kategori naik >50% dibanding minggu lalu
 * 2. Total pengeluaran sudah >80% dari total pemasukan bulan ini
 * 3. Pengeluaran besar (>20% budget kategori sekaligus)
 * 4. Lonjakan transaksi abnormal / deviasi overbudget >20%
 *
 * Format telegram:
 * 🤖 Financial Advisor
 * Hei [nama]! [analisa personal berdasarkan data transaksi user]
 * 💡 Saran: [saran spesifik yang actionable]
 */

export interface AdvisorContext {
  subscriptionTier: 'STARTER' | 'PRO';
  categoryName: string;
  transactionAmount: number;
  userName?: string;
  currentBudgetLimit?: number;
  currentTotalSpent?: number;
  averageMonthlyExpense?: number;
  recentDailySpending?: number[];
  monthlyExpense?: number;
  monthlyIncome?: number;
  categoryWeeklyIncreasePercentage?: number;
}

export interface AdvisorEvaluation {
  triggered: boolean;
  type: 'BUDGET_OVERSPEND' | 'BUDGET_WARNING' | 'SPENDING_SPIKE' | 'CATEGORY_SPIKE' | 'INCOME_RATIO_ALERT' | 'NONE';
  percentageDeviation?: number;
  userName?: string;
  analysisText?: string;
  alertText?: string;
  recommendations: string[];
}

/**
 * Evaluates whether the recent spending triggers Pro AI Financial Advisor alerts.
 */
export function evaluateFinancialAdvice(ctx: AdvisorContext): AdvisorEvaluation {
  // If user is STARTER, Pro AI Advisor is disabled
  if (ctx.subscriptionTier !== 'PRO') {
    return {
      triggered: false,
      type: 'NONE',
      recommendations: [],
    };
  }

  const name = ctx.userName || 'Sobat';

  // 1. Check Budget Overspend (>20% deviation over limit)
  if (ctx.currentBudgetLimit && ctx.currentBudgetLimit > 0 && ctx.currentTotalSpent !== undefined) {
    const ratio = ctx.currentTotalSpent / ctx.currentBudgetLimit;
    const percentage = Math.round(ratio * 100);

    if (ratio >= 1.2) {
      // Over budget by 20% or more
      const overPercent = percentage - 100;
      return {
        triggered: true,
        type: 'BUDGET_OVERSPEND',
        percentageDeviation: overPercent,
        userName: name,
        analysisText: `Pengeluaran kategori ${ctx.categoryName} sudah melebihi anggaran bulanan sebesar ${overPercent}% (Total: ${percentage}% dari budget).`,
        alertText: `⚠️ *Pro AI Advisor: Overbudget Alert!*\nPengeluaran kategori *${ctx.categoryName}* sudah melebihi anggaran bulanan sebesar *${overPercent}%* (Total: ${percentage}% dari budget).`,
        recommendations: [
          `Tunda pengeluaran non-primer untuk pos ${ctx.categoryName} sampai awal bulan depan.`,
          `Lakukan realokasi sisa dana dari pos kategori yang masih longgar.`,
          `Gunakan alternatif lebih hemat untuk sisa bulan ini guna menjaga arus kas bersih tetap positif.`,
        ],
      };
    }
  }

  // 2. Check Large Single Expense (>20% of category budget simultaneously)
  if (ctx.currentBudgetLimit && ctx.currentBudgetLimit > 0) {
    const singleTxRatio = ctx.transactionAmount / ctx.currentBudgetLimit;
    if (singleTxRatio >= 0.20) {
      const singleTxPercent = Math.round(singleTxRatio * 100);
      return {
        triggered: true,
        type: 'SPENDING_SPIKE',
        percentageDeviation: singleTxPercent,
        userName: name,
        analysisText: `Transaksi baru saja ini menghabiskan ${singleTxPercent}% dari total budget kategori ${ctx.categoryName} sekaligus.`,
        alertText: `🚨 *Pro AI Advisor: Pengeluaran Besar Terdeteksi!*\nTransaksi ini memakai *${singleTxPercent}%* alokasi budget ${ctx.categoryName} secara instan.`,
        recommendations: [
          `Pastikan sisa kuota budget kategori ini cukup untuk kebutuhan esensial hingga akhir bulan.`,
          `Catat transaksi pendukung agar batas toleransi budget tidak terlampaui.`,
        ],
      };
    }
  }

  // 3. Check Category weekly spike (>50% compared to previous week)
  if (ctx.categoryWeeklyIncreasePercentage && ctx.categoryWeeklyIncreasePercentage >= 50) {
    return {
      triggered: true,
      type: 'CATEGORY_SPIKE',
      percentageDeviation: ctx.categoryWeeklyIncreasePercentage,
      userName: name,
      analysisText: `Pengeluaran di kategori ${ctx.categoryName} naik ${ctx.categoryWeeklyIncreasePercentage}% dibanding minggu lalu. Terjadi akselerasi belanja di pos ini.`,
      alertText: `📈 *Pro AI Advisor: Lonjakan Mingguan!*\nPengeluaran kategori *${ctx.categoryName}* melonjak *${ctx.categoryWeeklyIncreasePercentage}%* dibanding minggu lalu.`,
      recommendations: [
        `Tinjau kembali daftar kebutuhan mingguan di pos ${ctx.categoryName}.`,
        `Tetapkan batas belanja harian agar tidak kehabisan saldo sebelum akhir bulan.`,
      ],
    };
  }

  // 4. Check Total Expense >80% of Total Income for current month
  if (ctx.monthlyExpense && ctx.monthlyIncome && ctx.monthlyIncome > 0) {
    const expenseToIncomeRatio = ctx.monthlyExpense / ctx.monthlyIncome;
    if (expenseToIncomeRatio >= 0.8) {
      const expensePct = Math.round(expenseToIncomeRatio * 100);
      return {
        triggered: true,
        type: 'INCOME_RATIO_ALERT',
        percentageDeviation: expensePct,
        userName: name,
        analysisText: `Total pengeluaran bulan ini sudah mencapai ${expensePct}% dari seluruh pemasukanmu. Arus kas mendekati zona rawan defisit.`,
        alertText: `⚠️ *Pro AI Advisor: Arus Kas Menipis!*\nTotal pengeluaran bulan ini sudah mencapai *${expensePct}%* dari pemasukanmu.`,
        recommendations: [
          `Rem pengeluaran sekunder dan tersier untuk sisa bulan ini.`,
          `Pastikan alokasi tabungan atau dana darurat sudah diamankan di awal.`,
        ],
      };
    }
  }

  // 5. Check Spending Spike: single transaction is > 50% of user's average monthly expense
  if (ctx.averageMonthlyExpense && ctx.averageMonthlyExpense > 0) {
    const spikeRatio = ctx.transactionAmount / ctx.averageMonthlyExpense;
    if (spikeRatio >= 0.5) {
      const spikePercent = Math.round(spikeRatio * 100);
      return {
        triggered: true,
        type: 'SPENDING_SPIKE',
        percentageDeviation: spikePercent,
        userName: name,
        analysisText: `Transaksi senilai Rp ${ctx.transactionAmount.toLocaleString('id-ID')} ini setara dengan ${spikePercent}% dari rata-rata pengeluaran bulananmu.`,
        alertText: `🚨 *Pro AI Advisor: Lonjakan Pengeluaran Terdeteksi!*\nTransaksi senilai Rp ${ctx.transactionAmount.toLocaleString('id-ID')} ini setara dengan *${spikePercent}%* dari rata-rata pengeluaran bulanan Anda.`,
        recommendations: [
          `Pastikan transaksi bernilai besar ini sudah sesuai dengan rencana keuangan tahunan Anda.`,
          `Catat apakah pengeluaran ini merupakan investasi aset atau belanja konsumtif.`,
          `Periksa kembali kecukupan dana darurat untuk menutup variansi tak terduga.`,
        ],
      };
    }
  }

  return {
    triggered: false,
    type: 'NONE',
    recommendations: [],
  };
}

/**
 * Formats the advisor evaluation into exact Part 4.7 message block for Telegram.
 */
export function formatAdvisorBlock(evaluation: AdvisorEvaluation): string | undefined {
  if (!evaluation.triggered) {
    return undefined;
  }

  const name = evaluation.userName || 'Sobat';
  const analysis = evaluation.analysisText || 'Terdeteksi anomali pada rasio pengeluaran keuangan Anda.';
  const primaryRecommendation = evaluation.recommendations[0] || 'Pertahankan disiplin alokasi anggaran bulanan Anda.';

  return [
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🤖 *Financial Advisor*`,
    `Hei ${name}! ${analysis}`,
    ``,
    `💡 *Saran:* ${primaryRecommendation}`,
  ].join('\n');
}
