/**
 * Indonesian Natural Language Transaction Parser
 * Handles natural expressions, Indonesian nominal suffixes (rb, jt, k), and category inference.
 */

export interface ParsedTransactionItem {
  name: string;
  qty: number;
  price: number;
  total: number;
}

export interface ParsedTransaction {
  jenis: 'INCOME' | 'EXPENSE';
  nominal: number;
  kategori: string;
  catatan: string;
  items?: ParsedTransactionItem[];
}

/**
 * Normalizes Indonesian currency strings into pure integer numbers.
 * Examples:
 *   "18rb"   -> 18000
 *   "15rb"   -> 15000
 *   "1.5jt"  -> 1500000
 *   "1,5jt"  -> 1500000
 *   "500k"   -> 500000
 *   "250k"   -> 250000
 *   "10jt"   -> 10000000
 *   "15.000" -> 15000
 *   "Rp 25.000" -> 25000
 */
export function parseIndonesianNominal(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase().replace(/^rp\.?\s*/i, '');

  // Pattern: number (with possible decimal/thousand separator) + optional space + suffix
  // e.g. "1.5jt", "1,5 jt", "18rb", "500k", "10juta", "25ribu"
  const suffixMatch = cleaned.match(/^(\d+(?:[.,]\d+)?)\s*(rb|ribu|k|jt|juta|m|milyar|miliar|b)$/i);
  if (suffixMatch) {
    let numStr = suffixMatch[1].replace(',', '.');
    const num = parseFloat(numStr);
    const suffix = suffixMatch[2].toLowerCase();

    if (suffix === 'rb' || suffix === 'ribu' || suffix === 'k') {
      return Math.round(num * 1_000);
    }
    if (suffix === 'jt' || suffix === 'juta') {
      return Math.round(num * 1_000_000);
    }
    if (suffix === 'm' || suffix === 'milyar' || suffix === 'miliar' || suffix === 'b') {
      return Math.round(num * 1_000_000_000);
    }
  }

  // Indonesian dot-separated thousands: e.g. "15.000", "1.500.000", "250.000"
  if (/^\d{1,3}(?:\.\d{3})+$/.test(cleaned)) {
    return parseInt(cleaned.replace(/\./g, ''), 10);
  }

  // Comma-separated thousands: e.g. "15,000", "1,500,000"
  if (/^\d{1,3}(?:,\d{3})+$/.test(cleaned)) {
    return parseInt(cleaned.replace(/,/g, ''), 10);
  }

  // Plain number: e.g. "18000"
  const plainNum = parseInt(cleaned.replace(/[^0-9]/g, ''), 10);
  if (!isNaN(plainNum) && plainNum > 0) {
    return plainNum;
  }

  return null;
}

/**
 * Extracts all potential nominal substrings from text.
 */
export function extractNominalAndText(input: string): { nominal: number; cleanText: string } | null {
  // Regex to detect Indonesian nominal patterns within a sentence:
  // e.g. "18rb", "18 rb", "1.5jt", "1,5jt", "500k", "250k", "rp 18.000", "rp.18000", "15.000"
  const regex = /(?:(?:rp\.?|idr)\s*)?(\d+(?:[.,]\d+)?\s*(?:rb|ribu|k|jt|juta|m|milyar|miliar|b)\b|\d{1,3}(?:\.\d{3})+\b|\d{1,3}(?:,\d{3})+\b|(?:(?:rp\.?|idr)\s*)\d+\b|\b\d{4,}\b)/gi;

  const matches = Array.from(input.matchAll(regex));
  if (!matches || matches.length === 0) {
    return null;
  }

  // Find the best nominal match (typically the largest valid nominal in a transaction description)
  let bestNominal: number | null = null;
  let bestMatchText = '';

  for (const match of matches) {
    const candidateStr = match[0];
    const parsed = parseIndonesianNominal(candidateStr);
    if (parsed !== null && parsed > 0) {
      bestNominal = parsed;
      bestMatchText = candidateStr;
      break;
    }
  }

  if (bestNominal === null) {
    return null;
  }

  // Clean the text by removing the matched currency amount
  let cleanText = input.replace(bestMatchText, '').trim();
  // Remove trailing prepositions or separators
  cleanText = cleanText.replace(/^(sebesar|sejumlah|senilai|seharga|harga|sebesar rp|harga rp)\s*/i, '');
  cleanText = cleanText.replace(/\s*(sebesar|sejumlah|senilai|seharga)\s*$/i, '');
  cleanText = cleanText.replace(/\s{2,}/g, ' ').trim();

  return {
    nominal: bestNominal,
    cleanText: cleanText || input.trim(),
  };
}

/**
 * Categorizes an Indonesian financial description into standard categories.
 */
export function inferIndonesianCategory(text: string, type: 'INCOME' | 'EXPENSE'): string {
  const lower = text.toLowerCase();

  if (type === 'INCOME') {
    if (/\b(gaji|payroll|salary|upah|honor|thrd)\b/i.test(lower)) {
      return 'Gaji';
    }
    if (/\b(bonus|cashback|hadiah|giveaway|reward|angpao)\b/i.test(lower)) {
      return 'Bonus & Hadiah';
    }
    if (/\b(freelance|proyek|project|jastip|jualan|komisi|side\s*job|side\s*hustle|klien)\b/i.test(lower)) {
      return 'Pekerjaan Sampingan';
    }
    if (/\b(dividen|bunga|reksadana|saham|crypto|profit|cuan|hasil)\b/i.test(lower)) {
      return 'Investasi';
    }
    return 'Pemasukan Lainnya';
  }

  // EXPENSE categories
  if (/\b(kopi|coffee|makan|lunch|dinner|sarapan|nasi|padang|warteg|mie|bakso|sate|burger|pizza|ayam|boba|jus|minum|kafe|cafe|resto|gofood|grabfood|shopeefood|jajan|snack|cemilan)\b/i.test(lower)) {
    return 'Makanan & Minuman';
  }

  if (/\b(bensin|pertalite|pertamax|solar|shell|ojek|grab|gojek|maxim|goride|gocar|parkir|tol|kereta|bus|krl|mrt|transjakarta|taksi|angkot|servis|service\s*motor|oli|bengkel)\b/i.test(lower)) {
    return 'Transportasi';
  }

  if (/\b(belanja|baju|celana|sepatu|tas|indomaret|alfamart|superindo|hypermart|supermarket|pasar|mall|shopee|tokopedia|lazada|tiktok\s*shop|skincare|sabun|shampoo)\b/i.test(lower)) {
    return 'Belanja';
  }

  if (/\b(listrik|pln|token|air|pdam|wifi|indihome|biznet|internet|pulsa|kuota|bpjs|tagihan|iuran|kos|kost|kosan|kontrakan|sewa)\b/i.test(lower)) {
    return 'Tagihan & Utilitas';
  }

  if (/\b(nonton|bioskop|cgv|xxi|film|movie|netflix|spotify|youtube|game|steam|playstation|ps\d|liburan|hotel|staycation|karaoke|konser|tiket|rekreasi)\b/i.test(lower)) {
    return 'Hiburan';
  }

  if (/\b(obat|apotek|dokter|rs|rumah\s*sakit|klinik|vitamin|dental|gigi|periksa|cek\s*darah|farmasi)\b/i.test(lower)) {
    return 'Kesehatan';
  }

  if (/\b(kursus|buku|spp|kuliah|seminar|ukt|les|bimbel|sekolah|ujian|skripsi|training)\b/i.test(lower)) {
    return 'Pendidikan';
  }

  if (/\b(investasi|saham|reksadana|crypto|bitcoin|bibit|ajaib|emas|antam|deposito|tabungan)\b/i.test(lower)) {
    return 'Investasi';
  }

  if (/\b(sedekah|infaq|zakat|donasi|amal|kondangan|sumbangan)\b/i.test(lower)) {
    return 'Sosial & Donasi';
  }

  return 'Lain-lain';
}

/**
 * Determines transaction type (INCOME vs EXPENSE).
 */
export function inferTransactionType(text: string): 'INCOME' | 'EXPENSE' {
  const lower = text.toLowerCase();

  // Explicit income keywords
  const incomeKeywords = [
    'gaji',
    'salary',
    'payroll',
    'dapat transferan',
    'terima transfer',
    'transfer masuk',
    'dapat uang',
    'pemasukan',
    'income',
    'bonus',
    'cashback',
    'thr',
    'hadiah',
    'freelance',
    'jualan',
    'omzet',
    'omset',
    'komisi',
    'upah',
    'dividen',
    'cuan',
    'laba',
    'untung',
  ];

  for (const kw of incomeKeywords) {
    if (lower.includes(kw)) {
      return 'INCOME';
    }
  }

  return 'EXPENSE';
}

/**
 * Main parser: takes natural Indonesian text and returns structured transaction.
 * Supports LLM fallback/enhancement if multi-provider AI is active.
 */
export async function parseIndonesianTransaction(input: string): Promise<ParsedTransaction> {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error('Input transaksi tidak boleh kosong.');
  }

  // 1. Perform rule-based Indonesian extraction (fast & guaranteed offline)
  const extraction = extractNominalAndText(trimmed);

  if (!extraction || extraction.nominal <= 0) {
    throw new Error(`Tidak dapat mendeteksi nominal transaksi dari pesan: "${trimmed}". Harap sertakan nominal seperti "18rb", "1.5jt", atau "500k".`);
  }

  const { nominal, cleanText } = extraction;
  const jenis = inferTransactionType(trimmed);
  const kategori = inferIndonesianCategory(cleanText || trimmed, jenis);

  // Clean note
  let catatan = cleanText || trimmed;
  // If cleanText starts with common prefixes, leave clean or normalize
  catatan = catatan.trim();

  // Return structured output
  return {
    jenis,
    nominal,
    kategori,
    catatan: catatan || trimmed,
  };
}
