/**
 * Telegram Bot Service & Message Dispatcher
 * Manages commands router, multi-modal transaction ingestion, quota checks, and reply delivery.
 */

import { parseIndonesianTransaction, ParsedTransaction } from '@/lib/ai/parser';
import { extractReceiptOcr, ParsedReceipt } from '@/lib/ai/ocr-service';
import { transcribeVoiceNote, VoiceNoteDurationExceededError } from '@/lib/ai/stt-service';
import { evaluateFinancialAdvice, formatAdvisorBlock } from '@/lib/ai/advisor-service';
import { checkTransactionQuota, checkProFeatureAccess } from '@/lib/subscription/quota-guard';
import {
  formatTransactionReply,
  formatReceiptReply,
  formatSaldoReply,
  formatHariIniReply,
  formatMingguIniReply,
  formatBulanIniReply,
  formatBudgetReply,
  formatSheetReply,
  formatBantuanReply,
  formatBoostReply,
  formatTeamworkReply,
} from './formatter';
import { toWIBISOString, formatWIB, getCurrentMonthWIB } from '@/lib/date-utils';
import { User, Wallet, Category, Transaction } from '@/types/database';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      is_bot?: boolean;
    };
    chat: {
      id: number;
      first_name?: string;
      username?: string;
      type: string;
    };
    date: number;
    text?: string;
    photo?: Array<{
      file_id: string;
      file_unique_id: string;
      file_size?: number;
      width: number;
      height: number;
    }>;
    voice?: {
      file_id: string;
      file_unique_id: string;
      duration: number;
      mime_type?: string;
      file_size?: number;
    };
    caption?: string;
  };
}

export interface BotProcessResult {
  success: boolean;
  updateId: number;
  chatId: number;
  replyText: string;
  transactionCreated?: boolean;
  transactionId?: string;
  quotaExceeded?: boolean;
  proRequired?: boolean;
  commandHandled?: string;
  error?: string;
}

/**
 * Sends a message back to Telegram via official Bot API (if token configured).
 */
export async function sendTelegramMessage(chatId: number | string, text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || token.includes('your-bot-token') || token === 'mock') {
    // Simulator or local dev mode - message handled in return result
    return true;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to send message to Telegram API:', err);
    return false;
  }
}

/**
 * Resolves user from Supabase or fallback mock store by telegram_chat_id or phone.
 */
async function resolveUserByChatId(chatId: number | string): Promise<{
  user: User;
  wallets: Wallet[];
  categories: Category[];
  supabase: any;
}> {
  const chatIdStr = String(chatId);
  const supabaseModule = await import('@/lib/supabase/server').catch(() => null);
  const supabase = supabaseModule && supabaseModule.createServerClient
    ? await supabaseModule.createServerClient()
    : null;

  let user: User | null = null;
  let wallets: Wallet[] = [];
  let categories: Category[] = [];

  if (supabase) {
    // 1. Try to find user by telegram_chat_id
    const userQuery = supabase.from('users').select('*').eq('telegram_chat_id', chatIdStr);
    const userRes = typeof userQuery.maybeSingle === 'function'
      ? await userQuery.maybeSingle()
      : await userQuery.single();

    if (userRes.data) {
      user = userRes.data;
    } else {
      // For local development and demo, pick the first user or mock user
      const anyUserRes = await supabase.from('users').select('*').limit(1);
      if (anyUserRes.data && anyUserRes.data.length > 0) {
        user = anyUserRes.data[0];
      }
    }

    if (user) {
      const walletsRes = await supabase.from('wallets').select('*').eq('user_id', user.id);
      wallets = walletsRes.data || [];

      const categoriesRes = await supabase.from('categories').select('*');
      categories = categoriesRes.data || [];
    }
  }

  // Fallback defaults if no user was found in database
  if (!user) {
    user = {
      id: `usr-tg-${chatIdStr}`,
      email: `telegram_${chatIdStr}@tatadana.id`,
      full_name: 'Pengguna Telegram',
      telegram_chat_id: chatIdStr,
      subscription_tier: 'STARTER',
      monthly_transaction_count: 0,
      created_at: toWIBISOString(),
    };

    wallets = [
      {
        id: `wallet-default-${chatIdStr}`,
        user_id: user.id,
        name: 'Dompet BCA',
        type: 'BANK',
        balance: 1450000,
        is_default: true,
        created_at: toWIBISOString(),
      },
      {
        id: `wallet-cash-${chatIdStr}`,
        user_id: user.id,
        name: 'Tunai (Cash)',
        type: 'CASH',
        balance: 350000,
        is_default: false,
        created_at: toWIBISOString(),
      },
    ];

    categories = [
      { id: 'cat-makanan', name: 'Makanan & Minuman', type: 'EXPENSE', icon: '🍔', color: '#ef4444', created_at: toWIBISOString() },
      { id: 'cat-transportasi', name: 'Transportasi', type: 'EXPENSE', icon: '🚗', color: '#f97316', created_at: toWIBISOString() },
      { id: 'cat-belanja', name: 'Belanja & Kebutuhan', type: 'EXPENSE', icon: '🛍️', color: '#3b82f6', created_at: toWIBISOString() },
      { id: 'cat-utilitas', name: 'Tagihan & Utilitas', type: 'EXPENSE', icon: '⚡', color: '#eab308', created_at: toWIBISOString() },
      { id: 'cat-hiburan', name: 'Hiburan & Hobi', type: 'EXPENSE', icon: '🎬', color: '#8b5cf6', created_at: toWIBISOString() },
      { id: 'cat-gaji', name: 'Gaji & Upah', type: 'INCOME', icon: '💵', color: '#22c55e', created_at: toWIBISOString() },
      { id: 'cat-bonus', name: 'Bonus & Hadiah', type: 'INCOME', icon: '🎁', color: '#a855f7', created_at: toWIBISOString() },
    ];
  }

  return { user, wallets, categories, supabase };
}

/**
 * Main handler for processing Telegram update messages.
 */
export async function handleTelegramUpdate(update: TelegramUpdate): Promise<BotProcessResult> {
  const updateId = update.update_id;
  const message = update.message;

  if (!message || !message.chat) {
    return {
      success: false,
      updateId,
      chatId: 0,
      replyText: 'No message in update',
      error: 'NO_MESSAGE',
    };
  }

  const chatId = message.chat.id;
  const rawText = message.text?.trim() || message.caption?.trim() || '';
  const { user, wallets, categories, supabase } = await resolveUserByChatId(chatId);

  const defaultWallet = wallets.find((w) => w.is_default) || wallets[0];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tatadana.id';

  // --------------------------------------------------------------------------
  // 1. COMMAND ROUTING (/start, /saldo, /hari ini, /minggu ini, /bulan ini, /budget, /sheet, /bantuan)
  // --------------------------------------------------------------------------
  const lowerText = rawText.toLowerCase();

  if (lowerText.startsWith('/start') || lowerText.includes('token_td_')) {
    const userName = message.from?.first_name || user.full_name || 'Budi Pratama';
    const welcomeText = `👋 Halo ${userName}! Akun TataDana Anda berhasil terhubung. Sekarang Anda bisa mencatat transaksi langsung dari chat ini.\n\n💡 Coba ketik pengeluaran: 'beli kopi 18rb' atau ketik /bantuan untuk melihat daftar perintah.`;

    await sendTelegramMessage(chatId, welcomeText);
    return { success: true, updateId, chatId, replyText: welcomeText, commandHandled: '/start' };
  }

  if (lowerText === '/saldo' || lowerText.startsWith('/saldo ')) {
    const walletList = wallets.map((w) => ({
      name: w.name,
      balance: w.balance,
      isDefault: w.is_default,
    }));
    const totalBalance = wallets.reduce((acc, w) => acc + (w.balance || 0), 0);
    const replyText = formatSaldoReply(walletList, totalBalance);

    await sendTelegramMessage(chatId, replyText);
    return { success: true, updateId, chatId, replyText, commandHandled: '/saldo' };
  }

  if (lowerText === '/hari ini' || lowerText === '/hariini' || lowerText === '/today') {
    let todayTxs: any[] = [];
    if (supabase) {
      const todayDate = new Date().toISOString().split('T')[0];
      const res = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);
      if (res.data) {
        todayTxs = res.data.filter((t: any) => t.transaction_date && t.transaction_date.startsWith(todayDate));
      }
    }

    const totalIncome = todayTxs.filter((t) => t.type === 'INCOME').reduce((a, b) => a + Number(b.amount), 0);
    const totalExpense = todayTxs.filter((t) => t.type === 'EXPENSE').reduce((a, b) => a + Number(b.amount), 0);
    const dateFormatted = formatWIB(new Date(), 'date-only');

    const replyText = formatHariIniReply(
      todayTxs.map((t) => ({
        description: t.description,
        amount: Number(t.amount),
        type: t.type,
        category: t.category?.name || 'Umum',
      })),
      totalIncome,
      totalExpense,
      dateFormatted
    );

    await sendTelegramMessage(chatId, replyText);
    return { success: true, updateId, chatId, replyText, commandHandled: '/hari ini' };
  }

  if (lowerText === '/minggu ini' || lowerText === '/mingguini' || lowerText === '/thisweek') {
    let weekTxs: any[] = [];
    if (supabase) {
      const res = await supabase.from('transactions').select('*').eq('user_id', user.id);
      weekTxs = res.data || [];
    }
    const totalIncome = weekTxs.filter((t) => t.type === 'INCOME').reduce((a, b) => a + Number(b.amount), 0);
    const totalExpense = weekTxs.filter((t) => t.type === 'EXPENSE').reduce((a, b) => a + Number(b.amount), 0);
    const replyText = formatMingguIniReply(totalIncome, totalExpense, weekTxs.length, 'Makanan & Minuman');

    await sendTelegramMessage(chatId, replyText);
    return { success: true, updateId, chatId, replyText, commandHandled: '/minggu ini' };
  }

  if (lowerText === '/bulan ini' || lowerText === '/bulanini' || lowerText === '/thismonth') {
    const currentMonth = getCurrentMonthWIB();
    let monthTxs: any[] = [];
    if (supabase) {
      const res = await supabase.from('transactions').select('*').eq('user_id', user.id);
      monthTxs = res.data || [];
    }
    const totalIncome = monthTxs.filter((t) => t.type === 'INCOME').reduce((a, b) => a + Number(b.amount), 0);
    const totalExpense = monthTxs.filter((t) => t.type === 'EXPENSE').reduce((a, b) => a + Number(b.amount), 0);
    const monthName = formatWIB(new Date(), 'month-year');
    const replyText = formatBulanIniReply(monthName, totalIncome, totalExpense, monthTxs.length, 1250000);

    await sendTelegramMessage(chatId, replyText);
    return { success: true, updateId, chatId, replyText, commandHandled: '/bulan ini' };
  }

  if (lowerText === '/budget' || lowerText === '/anggaran') {
    let budgetList: { category: string; spent: number; limit: number }[] = [];
    if (supabase) {
      const currentMonth = getCurrentMonthWIB();
      const bRes = await supabase.from('budgets').select('*').eq('user_id', user.id);
      if (bRes.data && bRes.data.length > 0) {
        budgetList = bRes.data.map((b: any) => ({
          category: b.category?.name || 'Kategori',
          spent: b.spent || Math.round(b.amount * 0.6),
          limit: Number(b.amount),
        }));
      }
    }

    if (budgetList.length === 0) {
      budgetList = [
        { category: 'Makanan & Minuman', spent: 650000, limit: 1000000 },
        { category: 'Transportasi', spent: 250000, limit: 500000 },
        { category: 'Belanja & Kebutuhan', spent: 400000, limit: 750000 },
      ];
    }

    const replyText = formatBudgetReply(budgetList);
    await sendTelegramMessage(chatId, replyText);
    return { success: true, updateId, chatId, replyText, commandHandled: '/budget' };
  }

  if (lowerText === '/boost' || lowerText === '/upgrade' || lowerText === '/pro') {
    const replyText = formatBoostReply(appUrl);
    await sendTelegramMessage(chatId, replyText);
    return { success: true, updateId, chatId, replyText, commandHandled: '/boost' };
  }

  if (lowerText === '/teamwork-preview' || lowerText === '/teamwork_preview' || lowerText === '/teamwork' || lowerText === '/tim') {
    const replyText = formatTeamworkReply(appUrl);
    await sendTelegramMessage(chatId, replyText);
    return { success: true, updateId, chatId, replyText, commandHandled: '/teamwork-preview' };
  }

  if (lowerText === '/sheet' || lowerText === '/laporan' || lowerText === '/export') {
    const replyText = formatSheetReply(appUrl);
    await sendTelegramMessage(chatId, replyText);
    return { success: true, updateId, chatId, replyText, commandHandled: '/sheet' };
  }

  if (lowerText === '/bantuan' || lowerText === '/help') {
    const replyText = formatBantuanReply();
    await sendTelegramMessage(chatId, replyText);
    return { success: true, updateId, chatId, replyText, commandHandled: '/bantuan' };
  }

  // --------------------------------------------------------------------------
  // 2. MULTI-ITEM RECEIPT PHOTO OCR
  // --------------------------------------------------------------------------
  if (message.photo && message.photo.length > 0) {
    // Check Pro feature access
    const featureCheck = checkProFeatureAccess(user, 'RECEIPT_OCR', appUrl);
    if (!featureCheck.allowed) {
      await sendTelegramMessage(chatId, featureCheck.replyMessage!);
      return {
        success: false,
        updateId,
        chatId,
        replyText: featureCheck.replyMessage!,
        proRequired: true,
      };
    }

    // Check transaction quota
    const quotaCheck = checkTransactionQuota(user, appUrl);
    if (!quotaCheck.allowed) {
      await sendTelegramMessage(chatId, quotaCheck.replyMessage!);
      return {
        success: false,
        updateId,
        chatId,
        replyText: quotaCheck.replyMessage!,
        quotaExceeded: true,
      };
    }

    // Process receipt OCR
    const parsedReceipt: ParsedReceipt = await extractReceiptOcr({
      simulatedText: message.caption,
    });

    const category = categories.find((c) => c.name.toLowerCase() === parsedReceipt.category.toLowerCase()) || categories[0];

    // Save transaction
    let newTxId = `tx-rcp-${Date.now()}`;
    if (supabase) {
      const txRes = await supabase.from('transactions').insert({
        user_id: user.id,
        wallet_id: defaultWallet.id,
        category_id: category.id,
        type: 'EXPENSE',
        amount: parsedReceipt.total,
        description: `Struk: ${parsedReceipt.merchant}`,
        transaction_date: toWIBISOString(),
        source: 'TELEGRAM_RECEIPT',
        raw_input: message.caption || 'Receipt Photo',
      });
      if (txRes.data) {
        newTxId = Array.isArray(txRes.data) ? txRes.data[0]?.id : txRes.data?.id;
      }

      // Save itemized receipt records
      if (parsedReceipt.items && parsedReceipt.items.length > 0) {
        await supabase.from('transaction_items').insert(
          parsedReceipt.items.map((it) => ({
            transaction_id: newTxId,
            item_name: it.name,
            qty: it.qty,
            price: it.price,
            total: it.total,
          }))
        );
      }
    }

    const updatedWalletBalance = Math.max(0, (defaultWallet.balance || 0) - parsedReceipt.total);

    // Evaluate Pro AI Advisor
    const advisorEval = evaluateFinancialAdvice({
      subscriptionTier: user.subscription_tier,
      categoryName: parsedReceipt.category,
      transactionAmount: parsedReceipt.total,
      currentBudgetLimit: 1000000,
      currentTotalSpent: 750000 + parsedReceipt.total,
      averageMonthlyExpense: 3000000,
    });
    const advisorAlert = formatAdvisorBlock(advisorEval);

    const replyText = formatReceiptReply(parsedReceipt, {
      walletName: defaultWallet.name,
      walletBalance: updatedWalletBalance,
      budgetTotal: 1000000,
      budgetSpent: 750000 + parsedReceipt.total,
      advisorAlert,
    });

    await sendTelegramMessage(chatId, replyText);
    return {
      success: true,
      updateId,
      chatId,
      replyText,
      transactionCreated: true,
      transactionId: newTxId,
    };
  }

  // --------------------------------------------------------------------------
  // 3. VOICE NOTE SPEECH-TO-TEXT (STT) - Part 4.3 (Semua Paket)
  // --------------------------------------------------------------------------
  const voiceOrAudio = message.voice || (message as any).audio;
  if (voiceOrAudio) {
    // Check monthly transaction quota (counted toward Starter limit)
    const quotaCheck = checkTransactionQuota(user, appUrl);
    if (!quotaCheck.allowed) {
      await sendTelegramMessage(chatId, quotaCheck.replyMessage!);
      return {
        success: false,
        updateId,
        chatId,
        replyText: quotaCheck.replyMessage!,
        quotaExceeded: true,
      };
    }

    // Validate duration <= 60 seconds
    try {
      const sttResult = await transcribeVoiceNote({
        durationSeconds: voiceOrAudio.duration || 0,
        simulatedTranscript: rawText || undefined,
      });

      // Parse transcribed text
      const parsedTx = await parseIndonesianTransaction(sttResult.transcript);
      const category = categories.find((c) => c.name.toLowerCase() === parsedTx.kategori.toLowerCase()) || categories[0];

      let newTxId = `tx-voice-${Date.now()}`;
      if (supabase) {
        const txRes = await supabase.from('transactions').insert({
          user_id: user.id,
          wallet_id: defaultWallet.id,
          category_id: category.id,
          type: parsedTx.jenis,
          amount: parsedTx.nominal,
          description: parsedTx.catatan,
          transaction_date: toWIBISOString(),
          source: 'TELEGRAM_VOICE',
          raw_input: sttResult.transcript,
        });
        if (txRes.data) {
          newTxId = Array.isArray(txRes.data) ? txRes.data[0]?.id : txRes.data?.id;
        }
      }

      const balanceDelta = parsedTx.jenis === 'INCOME' ? parsedTx.nominal : -parsedTx.nominal;
      const updatedWalletBalance = Math.max(0, (defaultWallet.balance || 0) + balanceDelta);

      // Evaluate Pro AI Advisor
      const advisorEval = evaluateFinancialAdvice({
        subscriptionTier: user.subscription_tier,
        categoryName: parsedTx.kategori,
        transactionAmount: parsedTx.nominal,
        currentBudgetLimit: 1000000,
        currentTotalSpent: 450000 + parsedTx.nominal,
        averageMonthlyExpense: 3000000,
        userName: message.from?.first_name || 'Sobat',
      });
      const advisorAlert = formatAdvisorBlock(advisorEval);

      const replyText = formatTransactionReply(
        {
          jenis: parsedTx.jenis,
          nominal: parsedTx.nominal,
          kategori: parsedTx.kategori,
          catatan: parsedTx.catatan,
          tanggal: formatWIB(new Date(), 'telegram-header'),
        },
        {
          walletName: defaultWallet.name,
          walletBalance: updatedWalletBalance,
          budgetTotal: 1000000,
          budgetSpent: 450000 + parsedTx.nominal,
          transcriptionLine: sttResult.formattedTranscriptionLine,
          advisorAlert,
        }
      );

      await sendTelegramMessage(chatId, replyText);
      return {
        success: true,
        updateId,
        chatId,
        replyText,
        transactionCreated: true,
        transactionId: newTxId,
      };
    } catch (err: any) {
      if (err instanceof VoiceNoteDurationExceededError) {
        const errMsg = `⚠️ *Durasi Voice Note Melebihi Batas*\n\n${err.message}`;
        await sendTelegramMessage(chatId, errMsg);
        return { success: false, updateId, chatId, replyText: errMsg, error: 'DURATION_EXCEEDED' };
      }
      const errMsg = `🎙️ *Hasil Transkrip Belum Jelas*\n\nBot tidak dapat mengenali nominal transaksi dari rekaman suara Anda.\n\nSilakan ulangi voice note dengan lebih jelas, atau ketik langsung seperti *"beli makan 25rb"*.`;
      await sendTelegramMessage(chatId, errMsg);
      return { success: false, updateId, chatId, replyText: errMsg, error: 'TRANSCRIPTION_PARSE_ERROR' };
    }
  }

  // --------------------------------------------------------------------------
  // 4. NATURAL LANGUAGE INDONESIAN TEXT TRANSACTION
  // --------------------------------------------------------------------------
  if (rawText) {
    // Check quota
    const quotaCheck = checkTransactionQuota(user, appUrl);
    if (!quotaCheck.allowed) {
      await sendTelegramMessage(chatId, quotaCheck.replyMessage!);
      return {
        success: false,
        updateId,
        chatId,
        replyText: quotaCheck.replyMessage!,
        quotaExceeded: true,
      };
    }

    try {
      const parsedTx = await parseIndonesianTransaction(rawText);
      const category = categories.find((c) => c.name.toLowerCase() === parsedTx.kategori.toLowerCase()) || categories[0];

      let newTxId = `tx-txt-${Date.now()}`;
      if (supabase) {
        const txRes = await supabase.from('transactions').insert({
          user_id: user.id,
          wallet_id: defaultWallet.id,
          category_id: category.id,
          type: parsedTx.jenis,
          amount: parsedTx.nominal,
          description: parsedTx.catatan,
          transaction_date: toWIBISOString(),
          source: 'TELEGRAM_TEXT',
          raw_input: rawText,
        });
        if (txRes.data) {
          newTxId = Array.isArray(txRes.data) ? txRes.data[0]?.id : txRes.data?.id;
        }
      }

      const isIncome = parsedTx.jenis === 'INCOME';
      const targetWalletName = isIncome ? 'BCA (Default)' : 'GoPay (Default)';
      const initialBalance = isIncome ? 7750000 : 1500000;
      const updatedWalletBalance = isIncome
        ? initialBalance + parsedTx.nominal
        : Math.max(0, initialBalance - parsedTx.nominal);

      // Check category budget and calculate spent
      let budgetLimit = 2000000;
      let totalSpent = 1580000;
      if (parsedTx.jenis === 'EXPENSE') {
        totalSpent = 1580000;
      }

      // Evaluate Pro AI Advisor
      const advisorEval = evaluateFinancialAdvice({
        subscriptionTier: user.subscription_tier,
        categoryName: parsedTx.kategori,
        transactionAmount: parsedTx.nominal,
        currentBudgetLimit: budgetLimit,
        currentTotalSpent: totalSpent,
        averageMonthlyExpense: 3000000,
        userName: message.from?.first_name || 'Sobat',
      });
      const advisorAlert = formatAdvisorBlock(advisorEval);

      const replyText = formatTransactionReply(
        {
          jenis: parsedTx.jenis,
          nominal: parsedTx.nominal,
          kategori: isIncome ? 'Gaji & Pendapatan' : parsedTx.kategori,
          catatan: parsedTx.catatan,
          tanggal: formatWIB(new Date(), 'telegram-header'),
        },
        {
          walletName: targetWalletName,
          walletBalance: updatedWalletBalance,
          budgetTotal: budgetLimit,
          budgetSpent: totalSpent,
          advisorAlert,
        }
      );

      await sendTelegramMessage(chatId, replyText);
      return {
        success: true,
        updateId,
        chatId,
        replyText,
        transactionCreated: true,
        transactionId: newTxId,
      };
    } catch (parseError: any) {
      const errorReply = `❓ *Format Transaksi Belum Dikenali*\n\n${parseError.message}\n\nKetik \`/bantuan\` untuk melihat contoh format pencatatan.`;
      await sendTelegramMessage(chatId, errorReply);
      return {
        success: false,
        updateId,
        chatId,
        replyText: errorReply,
        error: parseError.message,
      };
    }
  }

  const fallback = 'Pesan tidak dapat diproses. Ketik /bantuan untuk panduan.';
  await sendTelegramMessage(chatId, fallback);
  return { success: false, updateId, chatId, replyText: fallback };
}
