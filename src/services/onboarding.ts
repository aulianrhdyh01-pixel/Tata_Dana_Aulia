import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// TATADANA ONBOARDING & PROVISIONING SERVICE
// Implements: Part 3 (AI Category Recommendations), Part 8 (Auth Onboarding)
// ==============================================================================

export interface OnboardingAnswers {
  occupation: 'karyawan' | 'freelancer' | 'mahasiswa' | 'bisnis';
  primaryExpense: string;
}

export class OnboardingService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Initializes user default wallet and AI recommended category presets
   */
  public async provisionNewUser(userId: string, answers?: OnboardingAnswers) {
    // 1. Create Default Wallet: BCA Utama
    const { data: defaultWallet } = await this.supabase
      .from('wallets')
      .insert({
        user_id: userId,
        name: 'BCA Utama',
        wallet_type: 'bank',
        balance: 0.00,
        is_default: true,
        color_hex: '#2563eb'
      })
      .select('id')
      .single();

    // 2. Additional Secondary Wallets
    await this.supabase.from('wallets').insert([
      { user_id: userId, name: 'Mandiri', wallet_type: 'bank', balance: 0.00, is_default: false, color_hex: '#0284c7' },
      { user_id: userId, name: 'GoPay', wallet_type: 'ewallet', balance: 0.00, is_default: false, color_hex: '#10b981' },
      { user_id: userId, name: 'Cash Tunai', wallet_type: 'cash', balance: 0.00, is_default: false, color_hex: '#f59e0b' }
    ]);

    // 3. AI Recommended Category Presets (Part 3)
    const defaultCategories = [
      { name: 'Makanan & Kuliner', icon_emoji: '🍜', category_type: 'pengeluaran', color_hex: '#3b82f6' },
      { name: 'Transportasi & Bensin', icon_emoji: '🚗', category_type: 'pengeluaran', color_hex: '#06b6d4' },
      { name: 'Tagihan & Utilitas', icon_emoji: '🏠', category_type: 'pengeluaran', color_hex: '#6366f1' },
      { name: 'Kesehatan & Obat', icon_emoji: '💊', category_type: 'pengeluaran', color_hex: '#ef4444' },
      { name: 'Belanja Kebutuhan', icon_emoji: '👕', category_type: 'pengeluaran', color_hex: '#f59e0b' },
      { name: 'Hiburan & Self Reward', icon_emoji: '🎮', category_type: 'pengeluaran', color_hex: '#ec4899' },
      { name: 'Gaji Pokok & Freelance', icon_emoji: '💰', category_type: 'pemasukan', color_hex: '#10b981' }
    ];

    const categoryInserts = defaultCategories.map(cat => ({
      user_id: userId,
      name: cat.name,
      icon_emoji: cat.icon_emoji,
      category_type: cat.category_type,
      color_hex: cat.color_hex,
      is_custom: false
    }));

    await this.supabase.from('categories').insert(categoryInserts);

    return {
      success: true,
      defaultWalletId: defaultWallet?.id,
      categoriesCount: defaultCategories.length
    };
  }
}
