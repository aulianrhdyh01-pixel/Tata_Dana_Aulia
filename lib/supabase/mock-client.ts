// ==============================================================================
// TataDana: Stateful In-Memory Mock Supabase Client
// Provides full CRUD, triggers simulation, filtering, and auth for offline dev
// ==============================================================================

import {
  SEED_USERS,
  SEED_WALLETS,
  SEED_CATEGORIES,
  SEED_TRANSACTIONS,
  SEED_TRANSACTION_ITEMS,
  SEED_BUDGETS,
  SEED_REMINDERS,
  SEED_SUBSCRIPTIONS,
  SEED_AI_LOGS,
  SEED_AUDIT_LOGS,
  SEED_WEBHOOK_EVENTS,
} from './seed-data';
import { User, Wallet, Category, Transaction, TransactionItem, Budget, Reminder, Subscription, AILog, AuditLog, WebhookEvent } from '@/types/database';
import { toWIBISOString } from '@/lib/date-utils';

class InMemoryDatabase {
  users: User[] = JSON.parse(JSON.stringify(SEED_USERS));
  wallets: Wallet[] = JSON.parse(JSON.stringify(SEED_WALLETS));
  categories: Category[] = JSON.parse(JSON.stringify(SEED_CATEGORIES));
  transactions: Transaction[] = JSON.parse(JSON.stringify(SEED_TRANSACTIONS));
  transaction_items: TransactionItem[] = JSON.parse(JSON.stringify(SEED_TRANSACTION_ITEMS));
  budgets: Budget[] = JSON.parse(JSON.stringify(SEED_BUDGETS));
  reminders: Reminder[] = JSON.parse(JSON.stringify(SEED_REMINDERS));
  subscriptions: Subscription[] = JSON.parse(JSON.stringify(SEED_SUBSCRIPTIONS));
  ai_logs: AILog[] = JSON.parse(JSON.stringify(SEED_AI_LOGS));
  audit_logs: AuditLog[] = JSON.parse(JSON.stringify(SEED_AUDIT_LOGS));
  webhook_events: WebhookEvent[] = JSON.parse(JSON.stringify(SEED_WEBHOOK_EVENTS));

  // Simulates Postgres Trigger: trg_transaction_balance
  applyTransactionTrigger(tx: Transaction, isDelete = false) {
    const user = this.users.find((u) => u.id === tx.user_id);
    if (user) {
      if (isDelete) {
        user.monthly_transaction_count = Math.max(0, user.monthly_transaction_count - 1);
      } else {
        user.monthly_transaction_count += 1;
      }
    }

    const wallet = this.wallets.find((w) => w.id === tx.wallet_id);
    if (!wallet) return;

    if (tx.type === 'INCOME') {
      wallet.balance += isDelete ? -tx.amount : tx.amount;
    } else if (tx.type === 'EXPENSE') {
      wallet.balance -= isDelete ? -tx.amount : tx.amount;
    } else if (tx.type === 'TRANSFER') {
      wallet.balance -= isDelete ? -tx.amount : tx.amount;
      if (tx.destination_wallet_id) {
        const destWallet = this.wallets.find((w) => w.id === tx.destination_wallet_id);
        if (destWallet) {
          destWallet.balance += isDelete ? -tx.amount : tx.amount;
        }
      }
    }
  }

  reset() {
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.wallets = JSON.parse(JSON.stringify(SEED_WALLETS));
    this.categories = JSON.parse(JSON.stringify(SEED_CATEGORIES));
    this.transactions = JSON.parse(JSON.stringify(SEED_TRANSACTIONS));
    this.transaction_items = JSON.parse(JSON.stringify(SEED_TRANSACTION_ITEMS));
    this.budgets = JSON.parse(JSON.stringify(SEED_BUDGETS));
    this.reminders = JSON.parse(JSON.stringify(SEED_REMINDERS));
    this.subscriptions = JSON.parse(JSON.stringify(SEED_SUBSCRIPTIONS));
    this.ai_logs = JSON.parse(JSON.stringify(SEED_AI_LOGS));
    this.audit_logs = JSON.parse(JSON.stringify(SEED_AUDIT_LOGS));
    this.webhook_events = JSON.parse(JSON.stringify(SEED_WEBHOOK_EVENTS));
  }
}

// Global persistent in-memory DB across hot-reloads
declare global {
  var __TATADANA_MEM_DB__: InMemoryDatabase | undefined;
  var __TATADANA_CURRENT_USER__: User | undefined;
}

if (!globalThis.__TATADANA_MEM_DB__) {
  globalThis.__TATADANA_MEM_DB__ = new InMemoryDatabase();
  globalThis.__TATADANA_CURRENT_USER__ = globalThis.__TATADANA_MEM_DB__.users[0];
}

const db = globalThis.__TATADANA_MEM_DB__;

class MockQueryBuilder {
  private tableName: string;
  private filters: ((item: any) => boolean)[] = [];
  private sortField: string | null = null;
  private sortAsc = true;
  private limitCount: number | null = null;
  private selectColumns: string = '*';
  private singleResult = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns: string = '*') {
    this.selectColumns = columns;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push((item) => item[field] === value);
    return this;
  }

  neq(field: string, value: any) {
    this.filters.push((item) => item[field] !== value);
    return this;
  }

  gte(field: string, value: any) {
    this.filters.push((item) => item[field] >= value);
    return this;
  }

  lte(field: string, value: any) {
    this.filters.push((item) => item[field] <= value);
    return this;
  }

  is(field: string, value: any) {
    if (value === null) {
      this.filters.push((item) => item[field] === null || item[field] === undefined);
    } else {
      this.filters.push((item) => item[field] === value);
    }
    return this;
  }

  order(field: string, { ascending = true }: { ascending?: boolean } = {}) {
    this.sortField = field;
    this.sortAsc = ascending;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  maybeSingle() {
    this.singleResult = true;
    return this;
  }

  async insert(values: any | any[]) {
    const list = Array.isArray(values) ? values : [values];
    const table = (db as any)[this.tableName] as any[];
    if (!table) return { data: null, error: { message: `Table ${this.tableName} not found` } };

    const inserted: any[] = [];
    for (const raw of list) {
      const item = {
        id: raw.id || `gen-${Math.random().toString(36).substring(2, 9)}`,
        created_at: raw.created_at || toWIBISOString(),
        ...raw,
      };

      // Check unique constraints for webhook_events
      if (this.tableName === 'webhook_events') {
        const dup = table.find((e: WebhookEvent) => e.source === item.source && e.event_id === item.event_id);
        if (dup) {
          return { data: null, error: { message: 'duplicate key value violates unique constraint', code: '23505' } };
        }
      }

      table.push(item);
      inserted.push(item);

      if (this.tableName === 'transactions') {
        db.applyTransactionTrigger(item, false);
      }
    }

    return {
      data: this.singleResult ? inserted[0] : inserted,
      error: null,
    };
  }

  async update(updates: any) {
    const table = (db as any)[this.tableName] as any[];
    if (!table) return { data: null, error: { message: `Table ${this.tableName} not found` } };

    const updated: any[] = [];
    for (let i = 0; i < table.length; i++) {
      if (this.filters.every((fn) => fn(table[i]))) {
        table[i] = { ...table[i], ...updates, updated_at: toWIBISOString() };
        updated.push(table[i]);
      }
    }

    return {
      data: this.singleResult ? (updated[0] || null) : updated,
      error: null,
    };
  }

  async delete() {
    const table = (db as any)[this.tableName] as any[];
    if (!table) return { data: null, error: { message: `Table ${this.tableName} not found` } };

    const toDelete: any[] = [];
    const remaining: any[] = [];

    for (const item of table) {
      if (this.filters.every((fn) => fn(item))) {
        toDelete.push(item);
        if (this.tableName === 'transactions') {
          db.applyTransactionTrigger(item, true);
        }
      } else {
        remaining.push(item);
      }
    }

    (db as any)[this.tableName] = remaining;

    return {
      data: toDelete,
      error: null,
    };
  }

  // Promise-like resolution when awaited directly
  async then(resolve: (val: any) => void, reject?: (err: any) => void) {
    try {
      const table = (db as any)[this.tableName] as any[];
      if (!table) {
        resolve({ data: null, error: { message: `Table ${this.tableName} not found` } });
        return;
      }

      let results = table.filter((item) => this.filters.every((fn) => fn(item)));

      if (this.sortField) {
        const sf = this.sortField;
        results.sort((a, b) => {
          if (a[sf] < b[sf]) return this.sortAsc ? -1 : 1;
          if (a[sf] > b[sf]) return this.sortAsc ? 1 : -1;
          return 0;
        });
      }

      if (this.limitCount !== null) {
        results = results.slice(0, this.limitCount);
      }

      // Populate foreign joins if needed
      if (this.tableName === 'transactions') {
        results = results.map((tx) => ({
          ...tx,
          wallet: db.wallets.find((w) => w.id === tx.wallet_id),
          destination_wallet: tx.destination_wallet_id ? db.wallets.find((w) => w.id === tx.destination_wallet_id) : undefined,
          category: tx.category_id ? db.categories.find((c) => c.id === tx.category_id) : undefined,
          items: db.transaction_items.filter((item) => item.transaction_id === tx.id),
        }));
      }

      if (this.singleResult) {
        resolve({ data: results[0] || null, error: null });
      } else {
        resolve({ data: results, error: null });
      }
    } catch (e: any) {
      if (reject) reject(e);
      else resolve({ data: null, error: { message: e.message } });
    }
  }
}

export const mockSupabaseClient = {
  from(tableName: string) {
    return new MockQueryBuilder(tableName);
  },

  rpc(fnName: string, args?: any) {
    return {
      async then(resolve: any) {
        resolve({ data: null, error: null });
      },
    };
  },

  auth: {
    async getUser() {
      return {
        data: {
          user: globalThis.__TATADANA_CURRENT_USER__
            ? {
                id: globalThis.__TATADANA_CURRENT_USER__.id,
                email: globalThis.__TATADANA_CURRENT_USER__.email,
                user_metadata: {
                  full_name: globalThis.__TATADANA_CURRENT_USER__.full_name,
                  avatar_url: globalThis.__TATADANA_CURRENT_USER__.avatar_url,
                  phone_number: globalThis.__TATADANA_CURRENT_USER__.phone_number,
                },
              }
            : null,
        },
        error: null,
      };
    },

    async getSession() {
      const user = globalThis.__TATADANA_CURRENT_USER__;
      return {
        data: {
          session: user
            ? {
                access_token: 'mock-access-token-tatadana',
                user: {
                  id: user.id,
                  email: user.email,
                },
              }
            : null,
        },
        error: null,
      };
    },

    async signInWithPassword({ email }: { email: string; password?: string }) {
      const matched = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        globalThis.__TATADANA_CURRENT_USER__ = matched;
        return { data: { user: matched, session: { access_token: 'mock-token' } }, error: null };
      }
      // If not found, log in as first dev user
      globalThis.__TATADANA_CURRENT_USER__ = db.users[0];
      return { data: { user: db.users[0], session: { access_token: 'mock-token' } }, error: null };
    },

    async signInWithOAuth({ provider }: { provider: string }) {
      globalThis.__TATADANA_CURRENT_USER__ = db.users[0];
      return { data: { provider, url: '/dashboard' }, error: null };
    },

    async signUp({ email, password, options }: { email: string; password?: string; options?: any }) {
      const newUser: User = {
        id: `user-${Math.random().toString(36).substring(2, 9)}`,
        email,
        full_name: options?.data?.full_name || 'Pengguna Baru',
        phone_number: options?.data?.phone_number || null,
        subscription_tier: 'STARTER',
        monthly_transaction_count: 0,
        is_admin: false,
        created_at: toWIBISOString(),
      };
      db.users.push(newUser);
      globalThis.__TATADANA_CURRENT_USER__ = newUser;

      // Seed default wallets (Cash & BCA) for new user
      db.wallets.push(
        {
          id: `wallet-cash-${newUser.id}`,
          user_id: newUser.id,
          name: 'Dompet Utama (Cash)',
          type: 'CASH',
          balance: 500000,
          is_default: true,
          color: '#f97316',
          icon: 'wallet',
          created_at: toWIBISOString(),
        },
        {
          id: `wallet-bca-${newUser.id}`,
          user_id: newUser.id,
          name: 'Rekening BCA',
          type: 'BANK',
          balance: 2500000,
          is_default: false,
          color: '#0284c7',
          icon: 'credit-card',
          created_at: toWIBISOString(),
        }
      );

      // Seed AI recommended initial categories (Part 3)
      const aiInitialCategories = [
        { id: `cat-food-${newUser.id}`, user_id: newUser.id, name: 'Makanan & Minuman', type: 'EXPENSE' as const, icon: '🍜', color: '#ef4444', is_system: false },
        { id: `cat-trans-${newUser.id}`, user_id: newUser.id, name: 'Transportasi', type: 'EXPENSE' as const, icon: '🚗', color: '#f97316', is_system: false },
        { id: `cat-hiburan-${newUser.id}`, user_id: newUser.id, name: 'Hiburan', type: 'EXPENSE' as const, icon: '🎮', color: '#8b5cf6', is_system: false },
        { id: `cat-tagihan-${newUser.id}`, user_id: newUser.id, name: 'Tagihan & Utilitas', type: 'EXPENSE' as const, icon: '🏠', color: '#eab308', is_system: false },
        { id: `cat-sehat-${newUser.id}`, user_id: newUser.id, name: 'Kesehatan', type: 'EXPENSE' as const, icon: '💊', color: '#10b981', is_system: false },
        { id: `cat-belanja-${newUser.id}`, user_id: newUser.id, name: 'Belanja', type: 'EXPENSE' as const, icon: '👕', color: '#ec4899', is_system: false },
        { id: `cat-didik-${newUser.id}`, user_id: newUser.id, name: 'Pendidikan', type: 'EXPENSE' as const, icon: '📚', color: '#06b6d4', is_system: false },
        { id: `cat-gaji-${newUser.id}`, user_id: newUser.id, name: 'Gaji', type: 'INCOME' as const, icon: '💰', color: '#22c55e', is_system: false },
      ];

      for (const cat of aiInitialCategories) {
        db.categories.push({
          ...cat,
          created_at: toWIBISOString(),
        });
      }

      // Initial budget for recommended category
      db.budgets.push({
        id: `bgt-food-${newUser.id}`,
        user_id: newUser.id,
        category_id: `cat-food-${newUser.id}`,
        amount: 1500000,
        month: new Date().toISOString().substring(0, 7),
        created_at: toWIBISOString(),
      });

      return { data: { user: newUser, session: { access_token: 'mock-token' } }, error: null };
    },

    async signOut() {
      globalThis.__TATADANA_CURRENT_USER__ = undefined;
      return { error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      const user = globalThis.__TATADANA_CURRENT_USER__;
      callback('SIGNED_IN', user ? { user } : null);
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  },

  channel(name: string) {
    return {
      on(event: string, filter: any, callback: (payload: any) => void) {
        return this;
      },
      subscribe() {
        return { unsubscribe: () => {} };
      },
    };
  },

  storage: {
    from(bucketName: string) {
      return {
        async upload(path: string, file: any) {
          return { data: { path: `mock-storage/${bucketName}/${path}` }, error: null };
        },
        getPublicUrl(path: string) {
          return { data: { publicUrl: `https://mock.storage.tatadana.id/${bucketName}/${path}` } };
        },
        async createSignedUrl(path: string, expiresIn: number) {
          return { data: { signedUrl: `https://mock.storage.tatadana.id/${bucketName}/${path}?token=mock_signed` }, error: null };
        },
      };
    },
  },

  _getInternalDb() {
    return db;
  },
};
