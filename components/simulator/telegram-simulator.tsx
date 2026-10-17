'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Camera, 
  Mic, 
  CheckCheck, 
  RefreshCw, 
  Receipt, 
  Play, 
  Square 
} from 'lucide-react';

export interface SimulatedTransaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  nominal: number;
  kategori: string;
  catatan: string;
  dompet: string;
  source: 'TELEGRAM_TEXT' | 'TELEGRAM_RECEIPT' | 'TELEGRAM_VOICE';
  timestamp: string;
  items?: { name: string; qty: number; price: number; total: number }[];
}

export interface TelegramSimulatorProps {
  onTransactionAdded?: (tx: SimulatedTransaction) => void;
  className?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  mediaType?: 'receipt' | 'voice';
  receiptData?: {
    merchant: string;
    items: { name: string; qty: number; price: number; total: number }[];
    total: number;
  };
  voiceDuration?: string;
}

const MOTIVATIONAL_QUOTES = [
  'Hemat pangkal kaya, catat setiap rupiahmu!',
  'Disiplin finansial hari ini adalah kemerdekaan esok hari.',
  'Uang kecil yang tercatat mencegah kebocoran besar.',
  'Investasi terbaik dimulai dari kontrol pengeluaran harian.',
  'Keren! Satu langkah lebih dekat menuju target tabunganmu.',
];

function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function getWibTime(): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const wib = new Date(utc + 7 * 3600000);
  const hours = String(wib.getHours()).padStart(2, '0');
  const minutes = String(wib.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} WIB`;
}

export function parseIndonesianNominal(text: string): { nominal: number; cleanText: string } {
  const lower = text.toLowerCase();
  
  // Pattern like 1.5jt, 1,5 jt, 2jt, 10 juta
  const jtRegex = /(\d+(?:[.,]\d+)?)\s*(?:jt|juta)\b/i;
  const jtMatch = lower.match(jtRegex);
  if (jtMatch) {
    const val = parseFloat(jtMatch[1].replace(',', '.'));
    return { nominal: Math.round(val * 1000000), cleanText: lower.replace(jtRegex, '').trim() };
  }

  // Pattern like 18rb, 18k, 250rb, 500k, 15 ribu
  const rbRegex = /(\d+(?:[.,]\d+)?)\s*(?:rb|k|ribu)\b/i;
  const rbMatch = lower.match(rbRegex);
  if (rbMatch) {
    const val = parseFloat(rbMatch[1].replace(',', '.'));
    return { nominal: Math.round(val * 1000), cleanText: lower.replace(rbRegex, '').trim() };
  }

  // Pattern like Rp 18.000 or 18000
  const rpRegex = /(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+|\d{4,})/i;
  const rpMatch = lower.match(rpRegex);
  if (rpMatch) {
    const rawVal = rpMatch[1].replace(/\./g, '');
    const val = parseInt(rawVal, 10);
    if (!isNaN(val) && val > 0) {
      return { nominal: val, cleanText: lower.replace(rpRegex, '').trim() };
    }
  }

  return { nominal: 0, cleanText: lower };
}

function categorizeTransaction(text: string): { 
  type: 'INCOME' | 'EXPENSE'; 
  kategori: string; 
  catatan: string;
  icon: string;
} {
  const lower = text.toLowerCase();

  const isIncome = /gaji|salary|bonus|freelance|terima|dapat uang|penjualan|transfer masuk|profit|cair/i.test(lower);

  if (isIncome) {
    return {
      type: 'INCOME',
      kategori: 'Gaji & Pemasukan',
      catatan: text.replace(/gaji|salary|bonus|freelance/i, '').trim() || 'Gaji Bulanan',
      icon: '💼',
    };
  }

  if (/kopi|coffee|makan|lunch|dinner|sarapan|padang|sate|bakso|ayam|mie|resto|cafe|food/i.test(lower)) {
    return {
      type: 'EXPENSE',
      kategori: 'Makanan & Minuman',
      catatan: text.replace(/beli|bayar|pesan/gi, '').trim() || 'Makanan & Minuman',
      icon: '🍜',
    };
  }

  if (/bensin|pertamax|pertalite|spbu|pertamina|shell|gojek|grab|maxim|parkir|tol|taxi/i.test(lower)) {
    return {
      type: 'EXPENSE',
      kategori: 'Transportasi',
      catatan: text.replace(/beli|bayar|isi/gi, '').trim() || 'Bensin / Transportasi',
      icon: '🚗',
    };
  }

  if (/belanja|supermarket|indomaret|alfamart|baju|sepatu|tokopedia|shopee|lazada/i.test(lower)) {
    return {
      type: 'EXPENSE',
      kategori: 'Belanja & Kebutuhan',
      catatan: text.replace(/beli|bayar|shopping/gi, '').trim() || 'Belanja Harian',
      icon: '🛒',
    };
  }

  if (/listrik|pln|pdam|air|wifi|indihome|pulsa|paket data|telkom/i.test(lower)) {
    return {
      type: 'EXPENSE',
      kategori: 'Tagihan & Utilitas',
      catatan: text.replace(/bayar|tagihan/gi, '').trim() || 'Tagihan Bulanan',
      icon: '⚡',
    };
  }

  return {
    type: 'EXPENSE',
    kategori: 'Lain-lain',
    catatan: text.replace(/beli|bayar/gi, '').trim() || 'Pengeluaran',
    icon: '📦',
  };
}

function generateProgressBar(percent: number): string {
  const filledCount = Math.min(10, Math.max(0, Math.round(percent / 10)));
  const emptyCount = 10 - filledCount;
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
}

export function TelegramSimulator({ onTransactionAdded, className = '' }: TelegramSimulatorProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: `👋 Halo! Selamat datang di **TataDana Bot**.\n\nSaya asisten keuangan pribadimu. Kamu bisa langsung mengetik pengeluaran atau pemasukan secara alami dalam bahasa Indonesia.\n\nContoh:\n• *"beli kopi susu 18rb"*\n• *"makan siang padang 35k"*\n• *"gaji bulanan 10jt"*\n• Atau klik tombol struk / voice note di bawah!`,
      timestamp: getWibTime(),
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [walletBalance, setWalletBalance] = useState(4300000);
  const [categoryBudgets, setCategoryBudgets] = useState<Record<string, { spent: number; limit: number }>>({
    'Makanan & Minuman': { spent: 612000, limit: 1500000 },
    'Transportasi': { spent: 300000, limit: 800000 },
    'Belanja & Kebutuhan': { spent: 450000, limit: 1200000 },
    'Tagihan & Utilitas': { spent: 500000, limit: 1000000 },
    'Lain-lain': { spent: 100000, limit: 500000 },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => {
          if (s >= 59) {
            handleStopRecording();
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const handleSendText = (textToSend?: string) => {
    const raw = (textToSend || inputText).trim();
    if (!raw) return;

    const timeStr = getWibTime();
    const userMsgId = 'user-' + Date.now();

    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        sender: 'user',
        text: raw,
        timestamp: timeStr,
      },
    ]);

    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      processBotResponse(raw);
      setIsTyping(false);
    }, 600);
  };

  const processBotResponse = (raw: string) => {
    const lower = raw.toLowerCase();
    const timeStr = getWibTime();
    const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    // Bot Commands handling
    if (lower === '/saldo') {
      const botReply = `💼 *Informasi Saldo Dompet*\n\n` +
        `💵 *Cash (Default)*: ${formatRupiah(walletBalance)}\n` +
        `💳 *BCA*: ${formatRupiah(8500000)}\n` +
        `📱 *GoPay*: ${formatRupiah(750000)}\n` +
        `🏛️ *Mandiri*: ${formatRupiah(2300000)}\n\n` +
        `💰 *Total Aset*: ${formatRupiah(walletBalance + 8500000 + 750000 + 2300000)}\n` +
        `💡 _Gunakan perintah /budget untuk melihat batas pengeluaran bulan ini._`;

      setMessages((prev) => [
        ...prev,
        { id: 'bot-' + Date.now(), sender: 'bot', text: botReply, timestamp: timeStr },
      ]);
      return;
    }

    if (lower === '/budget') {
      let budgetText = `📊 *Status Budget Bulan Ini (WIB)*\n\n`;
      Object.entries(categoryBudgets).forEach(([cat, data]) => {
        const pct = Math.round((data.spent / data.limit) * 100);
        const bar = generateProgressBar(pct);
        budgetText += `🏷️ *${cat}*\n[${bar}] ${pct}%\nTerpakai: ${formatRupiah(data.spent)} / ${formatRupiah(data.limit)}\n\n`;
      });
      budgetText += `💡 *${quote}*`;

      setMessages((prev) => [
        ...prev,
        { id: 'bot-' + Date.now(), sender: 'bot', text: budgetText, timestamp: timeStr },
      ]);
      return;
    }

    if (lower === '/bantuan') {
      const helpText = `📖 *Panduan Perintah TataDana Bot*\n\n` +
        `• *Catat Teks*: Ketik langsung *"beli kopi susu 18rb"*, *"makan siang padang 35k"*, *"gaji bulanan 10jt"*\n` +
        `• *Foto Struk*: Kirim foto struk belanja untuk deteksi OCR otomatis (Pro)\n` +
        `• *Voice Note*: Kirim rekaman suara pesan singkat (maks 60s)\n` +
        `• */saldo*: Cek saldo seluruh dompet aktif\n` +
        `• */budget*: Monitoring progress budget tiap kategori\n` +
        `• */hari ini*: Ringkasan transaksi hari ini\n` +
        `• */bulan ini*: Rekap pemasukan & pengeluaran bulan ini\n` +
        `• */sheet*: Tautan export laporan Excel & PDF`;

      setMessages((prev) => [
        ...prev,
        { id: 'bot-' + Date.now(), sender: 'bot', text: helpText, timestamp: timeStr },
      ]);
      return;
    }

    // Natural Language Transaction Parsing
    const { nominal, cleanText } = parseIndonesianNominal(raw);

    if (nominal <= 0) {
      const errorReply = `❓ *Format Transaksi Belum Dikenali*\n\n` +
        `Bot tidak dapat mendeteksi nominal transaksi dari pesan: "${raw}".\n\n` +
        `📝 *Contoh format yang benar:*\n` +
        `• *"beli kopi susu 18rb"*\n` +
        `• *"makan siang padang 35k"*\n` +
        `• *"bensin motor 25ribu"*\n` +
        `• *"gaji bulanan 10jt"*\n\n` +
        `Gunakan perintah \`/bantuan\` untuk panduan format lengkap.`;

      setMessages((prev) => [
        ...prev,
        { id: 'bot-' + Date.now(), sender: 'bot', text: errorReply, timestamp: timeStr },
      ]);
      return;
    }

    const effectiveNominal = nominal;
    const { type, kategori, catatan, icon } = categorizeTransaction(cleanText || raw);

    let newBalance = walletBalance;
    let newSpent = categoryBudgets[kategori]?.spent || 0;
    const catLimit = categoryBudgets[kategori]?.limit || 1000000;

    if (type === 'EXPENSE') {
      newBalance = walletBalance - effectiveNominal;
      newSpent += effectiveNominal;
    } else {
      newBalance = walletBalance + effectiveNominal;
    }

    setWalletBalance(newBalance);
    setCategoryBudgets((prev) => ({
      ...prev,
      [kategori]: {
        spent: newSpent,
        limit: catLimit,
      },
    }));

    const budgetPercent = Math.min(100, Math.round((newSpent / catLimit) * 100));
    const progressBar = generateProgressBar(budgetPercent);
    const remainingBudget = Math.max(0, catLimit - newSpent);

    let replyMessage = '';
    if (type === 'EXPENSE') {
      // Exact Part 4.4 format
      replyMessage = `📅 ${timeStr}\n` +
        `💸 Pengeluaran tercatat!\n` +
        `├ Nominal : ${formatRupiah(effectiveNominal)}\n` +
        `├ Kategori : ${icon} ${kategori}\n` +
        `├ Dompet : 👛 Cash (Default)\n` +
        `├ Catatan : ${catatan || 'Pengeluaran'}\n` +
        `└ Saldo : ${formatRupiah(newBalance)}\n\n` +
        `📊 Budget ${kategori} bulan ini:\n` +
        `${progressBar} ${budgetPercent}% — sisa ${formatRupiah(remainingBudget)}\n` +
        `💡 ${quote}`;
    } else {
      // Exact Part 4.4 format
      replyMessage = `📅 ${timeStr}\n` +
        `💰 Pemasukan tercatat!\n` +
        `├ Nominal : ${formatRupiah(effectiveNominal)}\n` +
        `├ Kategori : 💼 Gaji & Pemasukan\n` +
        `├ Dompet : 👛 Cash (Default)\n` +
        `└ Saldo baru : ${formatRupiah(newBalance)}\n\n` +
        `💪 Semangat terus! Jangan lupa sisihkan untuk tabungan & investasi ya.`;
    }

    const tx: SimulatedTransaction = {
      id: 'tx-' + Date.now(),
      type,
      nominal: effectiveNominal,
      kategori,
      catatan: catatan || (type === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'),
      dompet: 'Cash (Default)',
      source: 'TELEGRAM_TEXT',
      timestamp: timeStr,
    };

    setMessages((prev) => [
      ...prev,
      {
        id: 'bot-' + Date.now(),
        sender: 'bot',
        text: replyMessage,
        timestamp: timeStr,
      },
    ]);

    if (onTransactionAdded) {
      onTransactionAdded(tx);
    }
  };

  const handleSimulateReceipt = () => {
    const timeStr = getWibTime();
    const receiptData = {
      merchant: 'Indomaret Point Tebet',
      items: [
        { name: 'Ultra Milk Full Cream 1L', qty: 1, price: 19500, total: 19500 },
        { name: 'Sari Roti Tawar Gandum', qty: 1, price: 14500, total: 14500 },
      ],
      total: 34000,
    };

    setMessages((prev) => [
      ...prev,
      {
        id: 'user-receipt-' + Date.now(),
        sender: 'user',
        text: '📸 Mengunggah foto struk belanja...',
        timestamp: timeStr,
        mediaType: 'receipt',
        receiptData,
      },
    ]);

    setIsTyping(true);

    setTimeout(() => {
      const effectiveNominal = receiptData.total;
      const kategori = 'Belanja & Kebutuhan';
      const newBalance = walletBalance - effectiveNominal;
      const newSpent = (categoryBudgets[kategori]?.spent || 0) + effectiveNominal;
      const catLimit = categoryBudgets[kategori]?.limit || 1200000;

      setWalletBalance(newBalance);
      setCategoryBudgets((prev) => ({
        ...prev,
        [kategori]: { spent: newSpent, limit: catLimit },
      }));

      const budgetPercent = Math.min(100, Math.round((newSpent / catLimit) * 100));
      const progressBar = generateProgressBar(budgetPercent);
      const remainingBudget = Math.max(0, catLimit - newSpent);

      const botReply = `🧾 *Struk Berhasil Diekstrak (AI Vision OCR)*\n\n` +
        `📅 ${timeStr}\n` +
        `💸 Pengeluaran tercatat!\n` +
        `├ Nominal : ${formatRupiah(effectiveNominal)}\n` +
        `├ Kategori : 🛒 ${kategori}\n` +
        `├ Dompet : 👛 Cash (Default)\n` +
        `├ Catatan : Belanja ${receiptData.merchant}\n` +
        `└ Saldo : ${formatRupiah(newBalance)}\n\n` +
        `🏪 *Merchant*: ${receiptData.merchant}\n` +
        `🛒 *Rincian Item*:\n` +
        `  • ${receiptData.items[0].name}: ${formatRupiah(receiptData.items[0].total)}\n` +
        `  • ${receiptData.items[1].name}: ${formatRupiah(receiptData.items[1].total)}\n\n` +
        `📊 Budget ${kategori} bulan ini:\n` +
        `${progressBar} ${budgetPercent}% — sisa ${formatRupiah(remainingBudget)}\n` +
        `💡 Tips: Struk belanja berhasil disimpan & terarsip otomatis.`;

      const tx: SimulatedTransaction = {
        id: 'tx-rcpt-' + Date.now(),
        type: 'EXPENSE',
        nominal: effectiveNominal,
        kategori,
        catatan: `Belanja ${receiptData.merchant} (2 item)`,
        dompet: 'Cash (Default)',
        source: 'TELEGRAM_RECEIPT',
        timestamp: timeStr,
        items: receiptData.items,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-rcpt-' + Date.now(),
          sender: 'bot',
          text: botReply,
          timestamp: timeStr,
        },
      ]);

      setIsTyping(false);

      if (onTransactionAdded) {
        onTransactionAdded(tx);
      }
    }, 900);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordSeconds(0);
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    const timeStr = getWibTime();
    const durationStr = `0:${String(recordSeconds || 6).padStart(2, '0')}`;

    setMessages((prev) => [
      ...prev,
      {
        id: 'user-voice-' + Date.now(),
        sender: 'user',
        text: `🎙️ Voice Note (${durationStr})\n"beli bensin pertamax lima puluh ribu di spbu pertamina"`,
        timestamp: timeStr,
        mediaType: 'voice',
        voiceDuration: durationStr,
      },
    ]);

    setIsTyping(true);

    setTimeout(() => {
      const nominal = 50000;
      const kategori = 'Transportasi';
      const newBalance = walletBalance - nominal;
      const newSpent = (categoryBudgets[kategori]?.spent || 0) + nominal;
      const catLimit = categoryBudgets[kategori]?.limit || 800000;

      setWalletBalance(newBalance);
      setCategoryBudgets((prev) => ({
        ...prev,
        [kategori]: { spent: newSpent, limit: catLimit },
      }));

      const budgetPercent = Math.min(100, Math.round((newSpent / catLimit) * 100));
      const progressBar = generateProgressBar(budgetPercent);
      const remainingBudget = Math.max(0, catLimit - newSpent);

      const botReply = `🎙️ [Transkripsi: "beli bensin pertamax lima puluh ribu di spbu pertamina"]\n\n` +
        `📅 ${timeStr}\n` +
        `💸 Pengeluaran tercatat!\n` +
        `├ Nominal : ${formatRupiah(nominal)}\n` +
        `├ Kategori : 🚗 ${kategori}\n` +
        `├ Dompet : 👛 Cash (Default)\n` +
        `├ Catatan : Bensin Pertamax SPBU Pertamina\n` +
        `└ Saldo : ${formatRupiah(newBalance)}\n\n` +
        `📊 Budget ${kategori} bulan ini:\n` +
        `${progressBar} ${budgetPercent}% — sisa ${formatRupiah(remainingBudget)}\n` +
        `💡 Tips: Bensin terisi, catatan rapi, perjalanan aman!`;

      const tx: SimulatedTransaction = {
        id: 'tx-voice-' + Date.now(),
        type: 'EXPENSE',
        nominal,
        kategori,
        catatan: 'Bensin Pertamax SPBU Pertamina (Voice)',
        dompet: 'Cash (Default)',
        source: 'TELEGRAM_VOICE',
        timestamp: timeStr,
      };

      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-voice-' + Date.now(),
          sender: 'bot',
          text: botReply,
          timestamp: timeStr,
        },
      ]);

      setIsTyping(false);

      if (onTransactionAdded) {
        onTransactionAdded(tx);
      }
    }, 800);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: `👋 Simulator di-reset. Coba ketik transaksi barumu!`,
        timestamp: getWibTime(),
      },
    ]);
  };

  return (
    <div className={`flex flex-col h-[620px] rounded-2xl bg-[#121215] border border-zinc-800 shadow-2xl overflow-hidden font-sans ${className}`}>
      {/* Telegram Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#18181b] border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-orange-500/20">
              TD
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#18181b]" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h4 className="font-semibold text-zinc-100 text-sm">TataDana Official Bot</h4>
              <span className="px-1.5 py-0.2 text-[10px] bg-orange-950/60 text-orange-400 border border-orange-800/60 rounded font-mono font-medium">BOT</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {isTyping ? (
                <span className="text-orange-400 font-medium animate-pulse">sedang mengetik...</span>
              ) : (
                'bot • online (WIB Asia/Jakarta)'
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <button 
            onClick={handleResetChat}
            title="Reset percakapan"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="px-3 py-2 bg-[#121215] border-b border-zinc-800 flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs">
        <span className="text-zinc-500 shrink-0 text-[11px] font-medium">Contoh:</span>
        <button
          onClick={() => handleSendText('beli kopi susu 18rb')}
          className="px-2.5 py-1 rounded-full bg-[#18181b] hover:bg-[#27272a] text-zinc-300 hover:text-orange-400 shrink-0 transition border border-zinc-700 shadow-xs"
        >
          ☕ kopi susu 18rb
        </button>
        <button
          onClick={() => handleSendText('makan siang padang 35k')}
          className="px-2.5 py-1 rounded-full bg-[#18181b] hover:bg-[#27272a] text-zinc-300 hover:text-orange-400 shrink-0 transition border border-zinc-700 shadow-xs"
        >
          🍛 padang 35k
        </button>
        <button
          onClick={() => handleSendText('gaji bulanan 10jt')}
          className="px-2.5 py-1 rounded-full bg-[#18181b] hover:bg-[#27272a] text-zinc-300 hover:text-emerald-400 shrink-0 transition border border-zinc-700 shadow-xs"
        >
          💰 gaji 10jt
        </button>
        <button
          onClick={handleSimulateReceipt}
          className="px-2.5 py-1 rounded-full bg-orange-950/40 hover:bg-orange-950/70 text-orange-400 shrink-0 transition border border-orange-800/60 font-medium"
        >
          🧾 Tes Foto Struk
        </button>
        <button
          onClick={() => {
            if (!isRecording) {
              handleStartRecording();
              setTimeout(() => handleStopRecording(), 2000);
            }
          }}
          className="px-2.5 py-1 rounded-full bg-purple-950/40 hover:bg-purple-950/70 text-purple-400 shrink-0 transition border border-purple-800/60 font-medium"
        >
          🎙️ Tes Voice Note
        </button>
        <button
          onClick={() => handleSendText('/saldo')}
          className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 shrink-0 transition"
        >
          /saldo
        </button>
        <button
          onClick={() => handleSendText('/budget')}
          className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 shrink-0 transition"
        >
          /budget
        </button>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#09090b]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-none'
                  : 'bg-[#18181b] text-zinc-100 border border-zinc-800 rounded-bl-none shadow-md'
              }`}
            >
              {msg.mediaType === 'receipt' && msg.receiptData && (
                <div className="mb-2 p-2 bg-black/30 rounded-lg border border-orange-500/40 text-xs">
                  <div className="flex items-center space-x-1.5 text-orange-400 font-semibold mb-1">
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Foto Struk Terlampir</span>
                  </div>
                  <p className="text-zinc-200 font-mono text-[11px]">{msg.receiptData.merchant}</p>
                </div>
              )}

              {msg.mediaType === 'voice' && (
                <div className="mb-2 p-2 bg-black/30 rounded-lg border border-purple-500/40 text-xs flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300">
                    <Play className="w-3 h-3 fill-current" />
                  </div>
                  <div className="flex-1">
                    <div className="h-1.5 bg-white/20 rounded-full w-24">
                      <div className="h-1.5 bg-purple-400 rounded-full w-14" />
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-300 font-mono">{msg.voiceDuration || '0:06'}</span>
                </div>
              )}

              <div className="whitespace-pre-line font-normal">
                {msg.text.split('\n').map((line, idx) => {
                  if (line.startsWith('✅') || line.startsWith('💰') || line.startsWith('🧾') || line.startsWith('🎙️') || line.startsWith('💸')) {
                    return <span key={idx} className={`font-semibold block mb-0.5 ${msg.sender === 'user' ? 'text-white' : 'text-orange-400'}`}>{line}</span>;
                  }
                  if (line.includes('[') && line.includes(']') && (line.includes('█') || line.includes('░'))) {
                    return <span key={idx} className="font-mono text-amber-400 font-bold block my-0.5">{line}</span>;
                  }
                  if (line.startsWith('├') || line.startsWith('└')) {
                    return <span key={idx} className="font-mono text-zinc-300 block text-[11px] sm:text-xs">{line}</span>;
                  }
                  return <span key={idx} className="block">{line}</span>;
                })}
              </div>

              <div className="flex items-center justify-end space-x-1 mt-1.5 text-[10px] opacity-70">
                <span>{msg.timestamp}</span>
                {msg.sender === 'user' && <CheckCheck className="w-3.5 h-3.5 text-white inline" />}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center space-x-2 text-zinc-400 text-xs pl-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="text-[11px] text-zinc-400">TataDana Bot sedang memproses...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Recording Active Bar */}
      {isRecording && (
        <div className="px-4 py-2 bg-red-950/60 border-t border-red-800/80 flex items-center justify-between text-xs text-red-200 animate-pulse">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-medium">Merekam Audio Suara (Batas 60s)...</span>
            <span className="font-mono font-bold">0:{String(recordSeconds).padStart(2, '0')}</span>
          </div>
          <button
            onClick={handleStopRecording}
            className="flex items-center space-x-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs font-semibold shadow transition"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Selesai & Kirim</span>
          </button>
        </div>
      )}

      {/* Bottom Input Controls */}
      <div className="p-3 bg-[#18181b] border-t border-zinc-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText();
          }}
          className="flex items-center space-x-2"
        >
          {/* Receipt OCR button */}
          <button
            type="button"
            onClick={handleSimulateReceipt}
            title="Upload Foto Struk Belanja (OCR)"
            className="p-2.5 rounded-xl bg-[#27272a] hover:bg-zinc-700 text-zinc-300 hover:text-orange-400 transition border border-zinc-700"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Voice Note STT button */}
          <button
            type="button"
            onClick={() => {
              if (isRecording) {
                handleStopRecording();
              } else {
                handleStartRecording();
              }
            }}
            title={isRecording ? 'Hentikan rekaman' : 'Rekam Pesan Suara (STT)'}
            className={`p-2.5 rounded-xl transition border ${
              isRecording
                ? 'bg-red-600 text-white border-red-500 animate-pulse'
                : 'bg-[#27272a] hover:bg-zinc-700 text-zinc-300 hover:text-purple-400 border border-zinc-700'
            }`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik: 'beli kopi 18rb' atau 'makan padang 35k'..."
            className="flex-1 px-3.5 py-2.5 bg-[#121215] border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-orange-500/20 transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
