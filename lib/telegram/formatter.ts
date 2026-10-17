/**
 * Standardized Telegram Bot Response Formatter
 * Provides visual budget progress bars, default wallet balances, and motivational quotes.
 */

export interface FormatterContext {
  walletName?: string;
  walletBalance?: number;
  budgetTotal?: number;
  budgetSpent?: number;
  categoryName?: string;
  transcriptionLine?: string; // e.g. [Transkripsi: "beli kopi 18rb"]
  advisorAlert?: string;
}

/**
 * Formats a number to Indonesian Rupiah currency string.
 * Example: 18000 -> "Rp 18.000", 1450000 -> "Rp 1.450.000"
 */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = Math.abs(rounded).toLocaleString('id-ID');
  return rounded < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
}

/**
 * Renders a visual Unicode progress bar for budgets.
 * Example: [██████░░░░] 60%
 */
export function renderProgressBar(spent: number, total: number, length: number = 10): string {
  if (total <= 0) return `[░░░░░░░░░░] 0%`;

  const ratio = Math.max(0, spent / total);
  const percent = Math.round(ratio * 100);
  const filledBlocks = Math.min(length, Math.round(ratio * length));
  const emptyBlocks = Math.max(0, length - filledBlocks);

  const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  return `[${bar}] ${percent}%`;
}

/**
 * Collection of Indonesian financial motivational quotes.
 */
const MOTIVATIONAL_EXPENSE_QUOTES = [
  'Hemat pangkal kaya, catat terus biar gak boncos! 💪',
  'Pengeluaran kecil yang bocor halus bisa menenggelamkan kapal besar. Tetap waspada! ⚓',
  'Kendalikan uangmu sebelum uang yang mengendalikan hidupmu. Mantap sudah dicatat! 🎯',
  'Setiap rupiah yang tercatat adalah langkah menuju kebebasan finansial! ✨',
  'Beli yang dibutuhkan, bukan yang diinginkan. Keuanganmu aman hari ini! 🛡️',
];

const MOTIVATIONAL_INCOME_QUOTES = [
  'Alhamdulillah! Jangan lupa sisihkan untuk tabungan & investasi minimal 20% ya! 📈',
  'Rezeki lancar berkah! Alokasikan dengan bijak untuk masa depan cerah. 🚀',
  'Pemasukan bertambah, jangan sampai gaya hidup ikut melonjak ya! Tetap disiplin. 💡',
  'Kerja keras terbayar! Sisihkan dana darurat sebelum mulai belanja. 💰',
];

/**
 * Returns a random motivational quote.
 */
export function getRandomQuote(type: 'INCOME' | 'EXPENSE'): string {
  const list = type === 'INCOME' ? MOTIVATIONAL_INCOME_QUOTES : MOTIVATIONAL_EXPENSE_QUOTES;
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

const CATEGORY_EMOJI_MAP: Record<string, string> = {
  'makanan & minuman': '🍜',
  'makanan': '🍜',
  'transportasi': '🚗',
  'transport': '🚗',
  'belanja': '🛍️',
  'belanja & kebutuhan': '🛍️',
  'tagihan & utilitas': '🏠',
  'tagihan': '🏠',
  'hiburan': '🎮',
  'hiburan & hobi': '🎮',
  'kesehatan': '💊',
  'pendidikan': '📚',
  'investasi': '📈',
  'gaji': '💰',
  'gaji & upah': '💰',
  'bonus & hadiah': '🎁',
  'sosial & donasi': '🤝',
  'lain-lain': '📦',
};

function getCategoryWithEmoji(cat: string): string {
  if (!cat) return '💸 Umum';
  // Check if string already starts with an emoji / non-ascii character
  if (/^[\p{Emoji}\u2000-\u3300]/u.test(cat.trim())) {
    return cat.trim();
  }
  const lower = cat.toLowerCase().trim();
  const emoji = CATEGORY_EMOJI_MAP[lower] || '💸';
  return `${emoji} ${cat.trim()}`;
}

/**
 * Formats standard transaction response for bot reply.
 */
export function formatTransactionReply(
  tx: {
    jenis: 'INCOME' | 'EXPENSE';
    nominal: number;
    kategori: string;
    catatan: string;
    tanggal?: string;
  },
  ctx: FormatterContext = {}
): string {
  const isExpense = tx.jenis === 'EXPENSE';
  const lines: string[] = [];

  // STT transcription line if present (e.g. 🎙️ Transkrip: "beli kopi 18rb")
  if (ctx.transcriptionLine) {
    const rawLine = ctx.transcriptionLine.replace(/^\[?Transkripsi:\s*/i, '').replace(/^"|"$/g, '').trim();
    lines.push(`🎙️ Transkrip: "${rawLine}"\n`);
  }

  // Date and Time header (WIB) - Part 4.4 format: 📅 [Hari], [Tanggal] — [Jam WIB]
  const timeHeader = tx.tanggal && tx.tanggal.includes('—')
    ? (tx.tanggal.startsWith('📅') ? tx.tanggal : `📅 ${tx.tanggal}`)
    : `📅 ${formatWIB(new Date(), 'telegram-header')}`;
  lines.push(timeHeader);

  const defaultWalletName = ctx.walletName || 'Dompet Utama';
  const formattedNominal = formatRupiah(tx.nominal);
  const formattedBalance = ctx.walletBalance !== undefined ? formatRupiah(ctx.walletBalance) : 'Rp 0';

  if (isExpense) {
    // 4.4 Format reply bot untuk pengeluaran:
    const categoryDisplay = getCategoryWithEmoji(tx.kategori);
    lines.push('💸 Pengeluaran tercatat!');
    lines.push(`├ Nominal : ${formattedNominal}`);
    lines.push(`├ Kategori : ${categoryDisplay}`);
    lines.push(`├ Dompet : 👛 ${defaultWalletName}`);
    lines.push(`├ Catatan : ${tx.catatan || '-'}`);
    lines.push(`└ Saldo : ${formattedBalance}`);

    // Budget section
    const catLabel = ctx.categoryName || tx.kategori;
    if (ctx.budgetTotal && ctx.budgetTotal > 0) {
      const spent = ctx.budgetSpent ?? tx.nominal;
      const bar = renderProgressBar(spent, ctx.budgetTotal);
      const remaining = Math.max(0, ctx.budgetTotal - spent);
      const ratio = spent / ctx.budgetTotal;
      lines.push('');
      lines.push(`📊 Budget ${catLabel} bulan ini:`);
      lines.push(`${bar} — sisa ${formatRupiah(remaining)}`);

      if (ratio >= 1.0) {
        lines.push('⚠️ *Perhatian:* Anggaran kategori ini sudah mencapai batas 100%! Yuk rem pengeluaranmu.');
      } else if (ratio >= 0.8) {
        lines.push('⚠️ *Waspada:* Anggaran kategori ini sudah terpakai 80%. Jaga pengeluaranmu ya!');
      } else {
        lines.push(`💪 ${getRandomQuote('EXPENSE')}`);
      }
    } else {
      lines.push('');
      lines.push(`💪 ${getRandomQuote('EXPENSE')}`);
    }
  } else {
    // 4.5 Format reply bot untuk pemasukan:
    const categoryDisplay = tx.kategori && tx.kategori.toLowerCase().includes('gaji')
      ? '💼 Gaji & Pendapatan'
      : (tx.kategori ? `💼 ${tx.kategori}` : '💼 Gaji & Pendapatan');
    lines.push('💰 Pemasukan tercatat!');
    lines.push(`├ Nominal : ${formattedNominal}`);
    lines.push(`├ Kategori : ${categoryDisplay}`);
    lines.push(`├ Dompet : 👛 ${defaultWalletName}`);
    lines.push(`└ Saldo baru : ${formattedBalance}`);
    lines.push('');
    lines.push('💪 Semangat terus! Jangan lupa sisihkan untuk tabungan & investasi ya.');
  }

  // Advisor warning if triggered
  if (ctx.advisorAlert) {
    lines.push(`\n${ctx.advisorAlert}`);
  }

  return lines.join('\n');
}

/**
 * Standardized Daily Reminder Message (Part 4.8)
 */
export function formatDailyReminder(): string {
  return [
    '⏰ Reminder Keuangan!',
    'Jangan lupa catat pengeluaran hari ini ya 📝',
    'Pencatatan rutin = keuangan lebih terkontrol 💪',
    'Ketik transaksimu sekarang!',
  ].join('\n');
}

/**
 * Formats receipt OCR transaction response.
 */
export function formatReceiptReply(
  receipt: {
    merchant: string;
    date: string;
    items: { name: string; qty: number; price: number; total: number }[];
    total: number;
    subtotal: number;
    tax?: number;
    category: string;
  },
  ctx: FormatterContext = {}
): string {
  const lines: string[] = [];

  lines.push('🧾 *Struk Belanja Berhasil Dipindai!*');
  lines.push(`🏪 *Merchant:* ${receipt.merchant}`);
  lines.push(`📅 *Tanggal:* ${receipt.date} (WIB)`);
  lines.push(`📁 *Kategori:* ${receipt.category}`);
  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`*Rincian Belanja:*`);

  receipt.items.forEach((item, idx) => {
    const qtyStr = item.qty > 1 ? `${item.qty}x ` : '';
    lines.push(`${idx + 1}. ${qtyStr}${item.name} — ${formatRupiah(item.total)}`);
  });

  if (receipt.tax && receipt.tax > 0) {
    lines.push(`• Pajak / PPN: ${formatRupiah(receipt.tax)}`);
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💵 *Total Transaksi:* ${formatRupiah(receipt.total)}`);

  if (ctx.walletBalance !== undefined) {
    const walletLabel = ctx.walletName ? ` (${ctx.walletName})` : '';
    lines.push(`💳 *Sisa Saldo:* ${formatRupiah(ctx.walletBalance)}${walletLabel}`);
  }

  if (ctx.budgetTotal && ctx.budgetTotal > 0) {
    const spent = ctx.budgetSpent ?? receipt.total;
    const bar = renderProgressBar(spent, ctx.budgetTotal);
    lines.push(
      `📊 *Budget ${receipt.category}:*\n${bar} (${formatRupiah(spent)} / ${formatRupiah(ctx.budgetTotal)})`
    );
  }

  if (ctx.advisorAlert) {
    lines.push(`\n${ctx.advisorAlert}`);
  }

  lines.push(`\n💬 _"${getRandomQuote('EXPENSE')}"_`);

  return lines.join('\n');
}

/**
 * Formats /saldo command response.
 */
export function formatSaldoReply(
  wallets: { name: string; balance: number; isDefault: boolean }[],
  totalBalance: number
): string {
  const lines: string[] = [];
  lines.push('💼 *Informasi Saldo Dompet TataDana*\n');

  if (wallets.length === 0) {
    lines.push('Belum ada dompet yang terdaftar. Buka dashboard web untuk menambahkan dompet.');
  } else {
    for (const w of wallets) {
      const badge = w.isDefault ? ' ⭐ (Default)' : '';
      lines.push(`• *${w.name}*${badge}: ${formatRupiah(w.balance)}`);
    }
  }

  lines.push(`\n━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💰 *Total Saldo Keseluruhan:* ${formatRupiah(totalBalance)}`);
  lines.push(`\n💡 _Gunakan perintah /hari ini untuk melihat arus kas hari ini._`);

  return lines.join('\n');
}

/**
 * Formats /hari ini command response.
 */
export function formatHariIniReply(
  transactions: { description: string; amount: number; type: 'INCOME' | 'EXPENSE'; category: string }[],
  totalIncome: number,
  totalExpense: number,
  dateFormatted: string
): string {
  const lines: string[] = [];
  lines.push(`📅 *Rekap Keuangan Hari Ini (${dateFormatted} WIB)*\n`);

  if (transactions.length === 0) {
    lines.push('Belum ada transaksi yang tercatat hari ini. Yuk catat pengeluaran atau pemasukanmu!');
  } else {
    transactions.forEach((tx, idx) => {
      const icon = tx.type === 'INCOME' ? '🟢' : '🔴';
      lines.push(`${idx + 1}. ${icon} ${tx.description} — ${formatRupiah(tx.amount)} [${tx.category}]`);
    });
  }

  lines.push(`\n━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`🟢 *Pemasukan:* ${formatRupiah(totalIncome)}`);
  lines.push(`🔴 *Pengeluaran:* ${formatRupiah(totalExpense)}`);
  const net = totalIncome - totalExpense;
  const netIcon = net >= 0 ? '📈' : '📉';
  lines.push(`${netIcon} *Arus Kas Bersih:* ${formatRupiah(net)}`);

  return lines.join('\n');
}

/**
 * Formats /minggu ini command response.
 */
export function formatMingguIniReply(
  totalIncome: number,
  totalExpense: number,
  txCount: number,
  topCategory?: string
): string {
  const lines: string[] = [];
  lines.push('🗓️ *Rekap Keuangan Minggu Ini*\n');
  lines.push(`📊 *Total Transaksi:* ${txCount} transaksi`);
  lines.push(`🟢 *Total Pemasukan:* ${formatRupiah(totalIncome)}`);
  lines.push(`🔴 *Total Pengeluaran:* ${formatRupiah(totalExpense)}`);
  const net = totalIncome - totalExpense;
  lines.push(`📈 *Arus Kas Bersih:* ${formatRupiah(net)}`);

  if (topCategory) {
    lines.push(`🏷️ *Pengeluaran Terbanyak:* ${topCategory}`);
  }

  lines.push(`\n💡 _Tips: Pantau budget mingguan agar tidak overspend di akhir bulan!_`);
  return lines.join('\n');
}

/**
 * Formats /bulan ini command response.
 */
export function formatBulanIniReply(
  monthName: string,
  totalIncome: number,
  totalExpense: number,
  txCount: number,
  remainingBudget?: number
): string {
  const lines: string[] = [];
  lines.push(`📆 *Laporan Keuangan Bulan ${monthName}*\n`);
  lines.push(`📝 *Jumlah Transaksi:* ${txCount}`);
  lines.push(`🟢 *Total Pemasukan:* ${formatRupiah(totalIncome)}`);
  lines.push(`🔴 *Total Pengeluaran:* ${formatRupiah(totalExpense)}`);
  const net = totalIncome - totalExpense;
  lines.push(`📈 *Arus Kas Bersih:* ${formatRupiah(net)}`);

  if (remainingBudget !== undefined) {
    lines.push(`🛡️ *Sisa Total Budget:* ${formatRupiah(remainingBudget)}`);
  }

  lines.push(`\n💬 _Unduh laporan PDF dan Excel lengkap dengan perintah /sheet._`);
  return lines.join('\n');
}

/**
 * Formats /budget command response.
 */
export function formatBudgetReply(
  budgets: { category: string; spent: number; limit: number }[]
): string {
  const lines: string[] = [];
  lines.push('📊 *Status Budget Bulanan TataDana*\n');

  if (budgets.length === 0) {
    lines.push('Belum ada anggaran kategori yang diatur. Atur anggaran Anda di menu Dashboard > Budget.');
  } else {
    for (const b of budgets) {
      const bar = renderProgressBar(b.spent, b.limit);
      const isOver = b.spent > b.limit;
      const warning = isOver ? ' ⚠️ *OVERBUDGET!*' : '';
      lines.push(
        `📁 *${b.category}*${warning}\n${bar} (${formatRupiah(b.spent)} / ${formatRupiah(b.limit)})\n`
      );
    }
  }

  lines.push(`━━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`💡 _Atur atau sesuaikan alokasi budget bulananmu di dashboard web._`);
  return lines.join('\n');
}

/**
 * Formats /sheet command response.
 */
export function formatSheetReply(webUrl: string): string {
  return [
    '📑 *Ekspor Laporan Keuangan TataDana*',
    '━━━━━━━━━━━━━━━━━━━━━',
    'Anda dapat mengunduh dan menyinkronkan laporan keuangan dalam format:',
    '• 📄 *PDF Report* (Rincian visual & siap cetak)',
    '• 📊 *Excel / Spreadsheet (.xlsx)* (Analisis data mendalam)',
    '',
    `🌐 *Akses Riwayat & Download di Dashboard:*`,
    `👉 ${webUrl}/dashboard/reports`,
    '',
    'Semua transaksi dari Telegram bot terintegrasi dan tersinkronisasi otomatis secara real-time!',
  ].join('\n');
}

/**
 * Formats /bantuan command response.
 */
export function formatBantuanReply(): string {
  return [
    '🤖 *Panduan Penggunaan TataDana Bot*',
    '━━━━━━━━━━━━━━━━━━━━━',
    'TataDana memudahkan pencatatan keuangan pribadi langsung dari Telegram dengan AI!',
    '',
    '💬 *1. Catat Transaksi Teks Natural:*',
    'Cukup ketik kalimat sehari-hari dalam Bahasa Indonesia:',
    '• `beli kopi susu 18rb`',
    '• `makan siang padang 25k`',
    '• `gaji bulanan 10jt`',
    '• `bayar wifi indihome 350k`',
    '• `bensin pertalite 50rb`',
    '',
    '📸 *2. Scan Foto Struk (Fitur Pro):*',
    'Kirim foto struk belanja Anda, AI Vision kami akan otomatis mendeteksi merchant, tanggal, rincian per item, dan total pengeluaran.',
    '',
    '🎙️ *3. Voice Note (Fitur Pro):*',
    'Rekam suara Anda (maks 60 detik), sebutkan pengeluaran/pemasukan, dan sistem akan mentranskripsikannya secara otomatis.',
    '',
    '⚡ *Perintah Cepat (Commands):*',
    '• `/saldo` — Cek sisa saldo semua dompet',
    '• `/hari ini` — Rekap pemasukan & pengeluaran hari ini',
    '• `/minggu ini` — Rangkuman keuangan minggu ini',
    '• `/bulan ini` — Evaluasi arus kas bulan ini',
    '• `/budget` — Cek progress bar penggunaan budget',
    '• `/boost` — Info & aktivasi TataDana Pro Boost',
    '• `/teamwork-preview` — Kolaborasi tim & dompet bersama',
    '• `/sheet` — Tautan download laporan PDF / Excel',
    '• `/bantuan` — Tampilkan pesan bantuan ini',
    '',
    '🔒 *Privasi & Keamanan:* Data transaksi Anda dilindungi dengan enkripsi dan Row Level Security (RLS).',
  ].join('\n');
}

/**
 * Formats /boost command response.
 */
export function formatBoostReply(webUrl: string): string {
  return [
    '🚀 *TataDana PRO Boost*',
    '━━━━━━━━━━━━━━━━━━━━━',
    'Upgrade akun Anda ke *PRO Lifetime* hanya *Rp 99.000* (sekali bayar seumur hidup):',
    '⚡ *Transaksi bulanan tanpa batas* (Starter: 50 tx/bln)',
    '📸 *AI Vision OCR Struk Belanja* multi-item otomatis',
    '🎙️ *Voice Note AI Speech-to-Text* hingga 60 detik',
    '🧠 *AI Financial Advisor* pendeteksi lonjakan & boros',
    '📊 *Ekspor Laporan PDF & Excel* tak terbatas',
    '',
    '👉 *Aktivasi sekarang di browser:*',
    `${webUrl}/boost`,
  ].join('\n');
}

/**
 * Formats /teamwork-preview command response.
 */
export function formatTeamworkReply(webUrl: string): string {
  return [
    '👥 *TataDana Teamwork & Shared Wallets (Preview)*',
    '━━━━━━━━━━━━━━━━━━━━━',
    'Kelola keuangan bersama pasangan, keluarga, atau tim bisnis Anda!',
    '',
    '*Fitur Utama Teamwork:*',
    '👛 *Shared Wallets* — Dompet kas & rekening bank bersama',
    '🎯 *Shared Budgets* — Kontrol anggaran barengan multi-kategori',
    '👥 *Multi-User Telegram* — Pasangan & tim catat ke dompet yang sama',
    '🔒 *Role & Audit Trail* — Pantau riwayat pencatatan transparan',
    '',
    '👉 *Akses halaman preview di browser:*',
    `${webUrl}/teamwork-preview`,
  ].join('\n');
}
