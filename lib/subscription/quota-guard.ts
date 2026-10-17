/**
 * Subscription Quota Guard Service
 * Enforces Starter tier limits (max 50 tx/month) and restricts Pro features (OCR, Voice, Advisor) with polite CTAs.
 */

export const STARTER_MAX_MONTHLY_TRANSACTIONS = 50;

export type ProFeature = 'RECEIPT_OCR' | 'VOICE_STT' | 'AI_ADVISOR';

export interface UserSubscriptionInfo {
  id: string;
  subscription_tier: 'STARTER' | 'PRO';
  monthly_transaction_count: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  replyMessage?: string;
}

/**
 * Checks whether the user is permitted to record a new transaction this month.
 */
export function checkTransactionQuota(
  user: UserSubscriptionInfo,
  webUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://tatadana.id'
): QuotaCheckResult {
  // Pro users have unlimited quota
  if (user.subscription_tier === 'PRO') {
    return { allowed: true };
  }

  // Starter tier limit: 50 transactions/month
  if (user.monthly_transaction_count >= STARTER_MAX_MONTHLY_TRANSACTIONS) {
    const upgradeUrl = `${webUrl}/dashboard/settings?tab=subscription`;
    const message = [
      '⚠️ *Batas Kuota Bulanan Tercapai (50/50)*',
      '━━━━━━━━━━━━━━━━━━━━━',
      `Anda telah menggunakan seluruh kuota *50 transaksi* gratis bulan ini untuk akun *Starter*.`,
      '',
      '✨ *Tingkatkan ke TataDana Pro:*',
      '• 🚀 Pencatatan transaksi tanpa batas (Unlimited)',
      '• 🧾 AI Vision Scan Struk otomatis',
      '• 🎙️ Voice Note pencatatan cepat 60 detik',
      '• 🧠 Pro AI Financial Advisor & analisis anomali',
      '• 📑 Export laporan PDF & Excel tanpa batas',
      '',
      `👉 *Upgrade Sekarang di Dashboard:*`,
      `[Klik Disini untuk Upgrade ke Pro](${upgradeUrl})`,
    ].join('\n');

    return {
      allowed: false,
      reason: 'STARTER_LIMIT_REACHED',
      replyMessage: message,
    };
  }

  return { allowed: true };
}

/**
 * Checks whether the user is permitted to use a Pro-only feature (Receipt OCR, Voice Note, AI Advisor).
 */
export function checkProFeatureAccess(
  user: UserSubscriptionInfo,
  feature: ProFeature,
  webUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://tatadana.id'
): QuotaCheckResult {
  if (user.subscription_tier === 'PRO') {
    return { allowed: true };
  }

  const upgradeUrl = `${webUrl}/dashboard/settings?tab=subscription`;

  let featureName = '';
  let featureDescription = '';

  switch (feature) {
    case 'RECEIPT_OCR':
      featureName = 'Scan Foto Struk (AI Vision OCR)';
      featureDescription = 'ekstraksi merchant, tanggal, dan multi-item struk otomatis';
      break;
    case 'VOICE_STT':
      featureName = 'Voice Note Transkripsi (Speech-to-Text)';
      featureDescription = 'pencatatan transaksi instan via pesan suara hingga 60 detik';
      break;
    case 'AI_ADVISOR':
      featureName = 'Pro AI Financial Advisor';
      featureDescription = 'analisis otomatis saat pengeluaran melonjak atau budget deviasi';
      break;
  }

  const message = [
    `🔒 *Fitur Khusus TataDana Pro: ${featureName}*`,
    '━━━━━━━━━━━━━━━━━━━━━',
    `Maaf, fitur ${featureDescription} hanya tersedia untuk anggota *TataDana Pro*.`,
    '',
    'Nikmati kemudahan pencatatan instan dan analisis keuangan cerdas dengan upgrade akun Anda hari ini!',
    '',
    `👉 *Buka Akses Pro Sekarang:*`,
    `[Upgrade ke TataDana Pro](${upgradeUrl})`,
  ].join('\n');

  return {
    allowed: false,
    reason: 'PRO_FEATURE_REQUIRED',
    replyMessage: message,
  };
}
