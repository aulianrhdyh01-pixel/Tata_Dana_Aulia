import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';

export const metadata: Metadata = {
  title: 'TataDana — Catat Keuangan Semudah Chat via Telegram Bot & AI',
  description:
    'TataDana adalah aplikasi manajemen keuangan pribadi yang terintegrasi dengan Telegram Bot. Catat pemasukan dan pengeluaran langsung dari chat dengan bahasa natural atau foto struk.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-[#09090b] text-zinc-100 min-h-screen antialiased selection:bg-orange-500 selection:text-white font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
