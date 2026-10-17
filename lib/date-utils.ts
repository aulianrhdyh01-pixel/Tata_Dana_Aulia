// ==============================================================================
// TataDana: Date & Currency Utilities (Strict Asia/Jakarta WIB - UTC+7)
// ==============================================================================

export const TIMEZONE_WIB = 'Asia/Jakarta';
export const WIB_OFFSET_HOURS = 7;
export const WIB_OFFSET_MS = WIB_OFFSET_HOURS * 60 * 60 * 1000;

export const HARI_INDONESIA = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export const BULAN_INDONESIA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

/**
 * Returns current Date object shifted to WIB representation
 */
export function getNowWIB(): Date {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + WIB_OFFSET_MS);
}

/**
 * Returns ISO-8601 string formatted with +07:00 WIB offset
 * e.g. "2026-10-10T12:45:00.000+07:00"
 */
export function toWIBISOString(dateInput: Date | string | number = new Date()): string {
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) {
    return new Date().toISOString();
  }
  
  // Calculate UTC timestamp then add 7 hours
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const wibDate = new Date(utc + WIB_OFFSET_MS);
  
  const yyyy = wibDate.getFullYear();
  const mm = String(wibDate.getMonth() + 1).padStart(2, '0');
  const dd = String(wibDate.getDate()).padStart(2, '0');
  const hh = String(wibDate.getHours()).padStart(2, '0');
  const min = String(wibDate.getMinutes()).padStart(2, '0');
  const ss = String(wibDate.getSeconds()).padStart(2, '0');
  const ms = String(wibDate.getMilliseconds()).padStart(3, '0');

  return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}.${ms}+07:00`;
}

/**
 * Returns current month in 'YYYY-MM' format in WIB
 */
export function getCurrentMonthWIB(): string {
  const wib = getNowWIB();
  const yyyy = wib.getFullYear();
  const mm = String(wib.getMonth() + 1).padStart(2, '0');
  return `${yyyy}-${mm}`;
}

/**
 * Formats a date into human-readable Indonesian string in Asia/Jakarta timezone
 */
export function formatWIB(
  dateInput: Date | string | number,
  style: 'full' | 'date-only' | 'time-only' | 'short' | 'month-year' | 'telegram-header' = 'full'
): string {
  const d = typeof dateInput === 'string' || typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return '-';

  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  const wib = new Date(utc + WIB_OFFSET_MS);

  const dayName = HARI_INDONESIA[wib.getDay()];
  const day = wib.getDate();
  const monthName = BULAN_INDONESIA[wib.getMonth()];
  const year = wib.getFullYear();
  const hours = String(wib.getHours()).padStart(2, '0');
  const mins = String(wib.getMinutes()).padStart(2, '0');

  switch (style) {
    case 'time-only':
      return `${hours}:${mins} WIB`;
    case 'date-only':
      return `${day} ${monthName} ${year}`;
    case 'short':
      return `${String(day).padStart(2, '0')}/${String(wib.getMonth() + 1).padStart(2, '0')}/${year} ${hours}:${mins}`;
    case 'month-year':
      return `${monthName} ${year}`;
    case 'telegram-header':
      return `${dayName}, ${day} ${monthName} ${year} — ${hours}:${mins} WIB`;
    case 'full':
    default:
      return `${dayName}, ${day} ${monthName} ${year} ${hours}:${mins} WIB`;
  }
}

/**
 * Returns start and end of month boundaries in WIB ISO string
 */
export function getMonthRangeWIB(monthStr?: string): { start: string; end: string } {
  const target = monthStr || getCurrentMonthWIB();
  const [yearStr, monthNumStr] = target.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthNumStr, 10); // 1-12

  const startStr = `${year}-${String(month).padStart(2, '0')}-01T00:00:00.000+07:00`;
  
  // Last day of month
  const lastDay = new Date(Date.UTC(year, month, 0)).getDate();
  const endStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}T23:59:59.999+07:00`;

  return { start: startStr, end: endStr };
}

/**
 * Format currency to Indonesian Rupiah (e.g. 1500000 -> "Rp 1.500.000")
 */
export function formatRupiah(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(abs);

  return amount < 0 ? `-${formatted}` : formatted;
}

/**
 * Formats compact Indonesian currency (e.g. 1500000 -> "1.5jt", 250000 -> "250rb")
 */
export function formatRupiahCompact(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}rb`;
  }
  return String(amount);
}
