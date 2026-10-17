'use client';

// ==============================================================================
// TataDana: Superadmin Dashboard Layout
// Navigation sidebar, role verification, and persistent impersonation banner
// ==============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Cpu,
  ScrollText,
  ShieldCheck,
  CreditCard,
  LogOut,
  ExternalLink,
  Menu,
  X,
  AlertTriangle,
  UserCheck,
  Sparkles,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { impersonationManager } from '@/lib/admin/impersonation';
import { User } from '@/types/database';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  {
    name: 'Ringkasan',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: 'Pengguna & Impersonasi',
    href: '/admin/users',
    icon: Users,
    badge: null,
  },
  {
    name: 'Multi-Provider AI',
    href: '/admin/ai-settings',
    icon: Cpu,
    badge: 'Failover',
  },
  {
    name: 'Log AI & Token',
    href: '/admin/ai-logs',
    icon: ScrollText,
    badge: null,
  },
  {
    name: 'Audit Trail Privasi',
    href: '/admin/audit-logs',
    icon: ShieldCheck,
    badge: 'ISO-27001',
  },
  {
    name: 'Langganan & Midtrans',
    href: '/admin/subscriptions',
    icon: CreditCard,
    badge: null,
  },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isImpersonating, setImpersonatedUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [impersonatedTarget, setImpersonatedTarget] = useState<User | null>(null);

  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Requirement 2: Strict Route Protection - Only ADMIN/SUPERADMIN can access /admin
    try {
      const stored = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile') || localStorage.getItem('tatadana_user');
      const activeUser = stored ? JSON.parse(stored) : null;
      const role = String(activeUser?.role || activeUser?.statusPaket || '').toUpperCase();
      const email = String(activeUser?.email || '').toLowerCase();

      const isAdmin = role.includes('SUPERADMIN') || role.includes('ADMIN') || email === 'shopnoure1619@gmail.com' || email === 'admin@tatadana.com';

      if (!activeUser || !isAdmin) {
        alert('Akses Ditolak: Rute /admin hanya dapat diakses oleh akun role SUPERADMIN atau ADMIN. Silakan masuk terlebih dahulu.');
        router.push('/login');
        return;
      }
      setAuthorized(true);
    } catch (e) {
      router.push('/login');
    }

    // Check if impersonation is active in localStorage
    const impUser = impersonationManager.getImpersonatedUser();
    if (impUser) {
      setImpersonatedTarget(impUser);
    } else {
      setImpersonatedTarget(null);
    }
  }, [pathname, isImpersonating, router]);

  const handleExitImpersonation = async () => {
    await impersonationManager.stop();
    setImpersonatedUser(null);
    setImpersonatedTarget(null);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* 1. Persistent Impersonation Top Banner */}
      {(isImpersonating || impersonatedTarget) && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border-b border-amber-600 px-4 py-2.5 text-sm flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-pulse" />
            <span>
              <strong>Mode Impersonasi Aktif:</strong> Anda sedang melihat data sebagai{' '}
              <span className="font-bold underline underline-offset-2">
                {impersonatedTarget?.full_name || impersonatedTarget?.email || 'Pengguna'}
              </span>{' '}
              ({impersonatedTarget?.subscription_tier || 'PRO'})
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded transition border border-white/30 flex items-center gap-1 font-medium"
            >
              Lihat Dashboard User <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={handleExitImpersonation}
              className="text-xs font-bold bg-white text-amber-900 hover:bg-amber-50 px-3 py-1 rounded transition shadow-sm"
            >
              Keluar Impersonasi
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1">
        {/* 2. Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-[#121215] border-r border-[#27272a] p-4 shrink-0 shadow-xs">
          {/* Logo & Superadmin Header */}
          <div className="flex items-center justify-between px-2 py-3 border-b border-zinc-800 mb-4">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-md shadow-orange-500/20">
                TD
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-zinc-100 block">TataDana</span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-orange-400 bg-orange-950/40 px-1.5 py-0.5 rounded border border-orange-800/50">
                  Superadmin
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-400 font-semibold border border-orange-500/30 shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-zinc-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Shortcuts */}
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                Dashboard Pengguna
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>
            <Link
              href="/"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                Landing Page
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </Link>

            {/* Admin identity badge */}
            <div className="mt-4 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-orange-950 text-orange-400 flex items-center justify-center font-bold text-xs border border-orange-800/60">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-zinc-200 truncate">Super Admin</p>
                <p className="text-[10px] text-zinc-400 truncate">admin@tatadana.id</p>
              </div>
            </div>
          </div>
        </aside>

        {/* 3. Mobile Header & Drawer */}
        <div className="lg:hidden w-full flex flex-col">
          <header className="h-14 border-b border-zinc-800 bg-[#121215] px-4 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center font-bold text-white text-xs">
                TD
              </div>
              <span className="font-bold text-sm text-zinc-100">TataDana Admin</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {mobileMenuOpen && (
            <div className="bg-[#121215] border-b border-zinc-800 p-3 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-orange-500/10 text-orange-400 font-semibold' : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Main Page Content */}
        <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
