// ==============================================================================
// TataDana: Database & Domain Types Contract
// Matching supabase/migrations/20261010_initial_schema.sql
// ==============================================================================

export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';
export type SubscriptionTier = 'STARTER' | 'PRO';
export type WalletType = 'CASH' | 'BANK' | 'EWALLET' | 'INVESTMENT' | 'OTHER';
export type CategoryType = 'INCOME' | 'EXPENSE';
export type TransactionSource = 'MANUAL' | 'TELEGRAM_TEXT' | 'TELEGRAM_RECEIPT' | 'TELEGRAM_VOICE' | 'TRANSFER';
export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'REJECTED';
export type AIProvider = 'GEMINI' | 'OPENAI' | 'DEEPSEEK' | 'MOCK';
export type AITask = 'PARSER' | 'OCR' | 'STT' | 'ADVISOR';
export type ReminderChannel = 'TELEGRAM' | 'WEB_PUSH' | 'EMAIL';

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  phone_number?: string | null; // Used for Telegram linking
  telegram_chat_id?: string | null;
  telegram_username?: string | null;
  subscription_tier: SubscriptionTier;
  monthly_transaction_count: number;
  subscription_expires_at?: string | null;
  is_admin?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  name: string; // e.g. Cash, BCA, Mandiri, GoPay, OVO
  type: WalletType | string;
  balance: number;
  is_default: boolean;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  user_id?: string | null; // NULL for global system category
  name: string;
  type: CategoryType;
  icon: string; // emoji icon e.g. '🍔'
  color: string;
  is_system?: boolean;
  created_at: string;
}

export interface TransactionItem {
  id?: string;
  transaction_id?: string;
  item_name: string;
  qty: number;
  price: number;
  total: number;
  created_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  destination_wallet_id?: string | null; // For TRANSFER
  category_id?: string | null;
  type: TransactionType;
  amount: number;
  description: string;
  transaction_date: string; // Asia/Jakarta (WIB) ISO String
  source: TransactionSource;
  receipt_url?: string | null;
  audio_url?: string | null;
  raw_input?: string | null;
  items?: TransactionItem[];
  created_at: string;
  // Joined fields for display
  wallet?: Wallet;
  destination_wallet?: Wallet;
  category?: Category;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: string; // YYYY-MM e.g. '2026-10'
  created_at: string;
  updated_at?: string;
  // Joined fields
  category?: Category;
  spent?: number; // Computed runtime field
}

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  reminder_time: string; // e.g. '08:00' or '20:00'
  days_of_week: number[]; // 1=Mon, 7=Sun
  is_active: boolean;
  channel: ReminderChannel;
  last_sent_at?: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  payment_method: 'MIDTRANS' | 'MANUAL_TRANSFER' | 'FREE' | string;
  order_id: string;
  amount: number;
  snap_token?: string | null;
  midtrans_transaction_id?: string | null;
  starts_at: string;
  expires_at?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
  user?: User;
}

export interface AILog {
  id: string;
  user_id?: string | null;
  provider: AIProvider;
  model: string;
  task: AITask;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  latency_ms: number;
  status: 'SUCCESS' | 'FAILED' | 'FALLBACK';
  error_message?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string | null;
  target_user_id?: string | null;
  action: string;
  details?: Record<string, any>;
  ip_address?: string | null;
  created_at: string;
}

export interface WebhookEvent {
  id: string;
  source: 'TELEGRAM' | 'MIDTRANS';
  event_id: string;
  payload: Record<string, any>;
  processed: boolean;
  created_at: string;
}

// Database schema definition for Supabase client typing
export interface Database {
  public: {
    Tables: {
      users: { Row: User; Insert: Partial<User>; Update: Partial<User> };
      wallets: { Row: Wallet; Insert: Partial<Wallet>; Update: Partial<Wallet> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      transactions: { Row: Transaction; Insert: Partial<Transaction>; Update: Partial<Transaction> };
      transaction_items: { Row: TransactionItem; Insert: Partial<TransactionItem>; Update: Partial<TransactionItem> };
      budgets: { Row: Budget; Insert: Partial<Budget>; Update: Partial<Budget> };
      reminders: { Row: Reminder; Insert: Partial<Reminder>; Update: Partial<Reminder> };
      subscriptions: { Row: Subscription; Insert: Partial<Subscription>; Update: Partial<Subscription> };
      ai_logs: { Row: AILog; Insert: Partial<AILog>; Update: Partial<AILog> };
      audit_logs: { Row: AuditLog; Insert: Partial<AuditLog>; Update: Partial<AuditLog> };
      webhook_events: { Row: WebhookEvent; Insert: Partial<WebhookEvent>; Update: Partial<WebhookEvent> };
    };
  };
}
