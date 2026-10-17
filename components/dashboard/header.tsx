'use client';

// ==============================================================================
// TataDana: Dashboard Header
// Modern Orange-White Fintech Theme
// Header bar with breadcrumbs, quick wallet status, WIB indicator, and action triggers
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Menu, Plus, Clock, Wallet, Bell, Sparkles, LogOut, Edit2 } from 'lucide-react';
import { formatRupiah } from '@/lib/date-utils';
import { Wallet as WalletType } from '@/types/database';
import { useAuth } from '@/lib/auth/auth-context';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenAddTransaction?: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({
  onToggleSidebar,
  onOpenAddTransaction,
  title = 'Ringkasan Keuangan',
  subtitle = 'Kelola arus kas pribadi & integrasi bot Telegram',
}: HeaderProps) {
  const { profile, user, logout } = useAuth();
  const [defaultWallet, setDefaultWallet] = useState<WalletType | null>(null);
  const [timeStr, setTimeStr] = useState<string>('');
  const [, setSyncTick] = useState<number>(0);

  const displayName = profile?.nama || user?.full_name || 'Pengguna TataDana';
  const displayContact = profile?.kontak || profile?.email || user?.phone_number || user?.email || '+62 812-3456-7890';
  const displayAvatar = profile?.avatarUrl || user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser';
  const displayPlan = profile?.statusPaket || (user?.subscription_tier === 'PRO' ? 'Pro Lifetime' : 'Starter');

  useEffect(() => {
    const handleProfileSync = () => {
      setSyncTick((t) => t + 1);
    };
    window.addEventListener('tatadana_profile_updated', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);

    // Fetch default wallet
    const fetchDefault = async () => {
      try {
        const res = await fetch('/api/wallets');
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          const def = json.data.find((w: WalletType) => w.is_default) || json.data[0];
          setDefaultWallet(def);
        }
      } catch (err) {
        // Fallback default wallet
        setDefaultWallet({
          id: 'wallet-bca-01',
          user_id: 'user-dev-tatadana-01',
          name: 'BCA Utama',
          type: 'BANK',
          balance: 14500000,
          is_default: true,
          created_at: new Date().toISOString(),
        });
      }
    };

    fetchDefault();

    // Clock update
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      const formatter = new Intl.DateTimeFormat('id-ID', options);
      setTimeStr(formatter.format(now) + ' WIB');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('tatadana_profile_updated', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-[#121215]/95 backdrop-blur-md border-b border-[#27272a] shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className="p-2 -ml-2 text-zinc-400 hover:text-zinc-100 rounded-lg lg:hidden hover:bg-zinc-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="hidden sm:block text-xs text-zinc-400">{subtitle}</p>
        </div>
      </div>

      {/* Right: Quick Default Wallet, Timezone, and Add Transaction Button */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* WIB Clock Indicator */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-[11px] text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-mono font-medium">{timeStr || 'Asia/Jakarta (WIB)'}</span>
        </div>

        {/* Default Wallet Pill */}
        {defaultWallet && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-950/40 border border-orange-800/60 text-xs">
            <Wallet className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-zinc-400 font-medium">{defaultWallet.name}:</span>
            <span className="font-bold text-orange-400 font-mono">
              {formatRupiah(defaultWallet.balance)}
            </span>
          </div>
        )}

        {/* Add Transaction Button */}
        {onOpenAddTransaction && (
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold text-xs md:text-sm shadow-md shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span className="hidden xs:inline">Catat Transaksi</span>
          </button>
        )}

        {/* User Mini Profile Chip (Header Kanan Atas) */}
        <div className="hidden md:flex items-center gap-2 pl-3 border-l border-zinc-800">
          <div className="relative shrink-0">
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-orange-500 bg-zinc-800"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-900" />
          </div>
          <div className="hidden lg:block text-left max-w-[120px]">
            <div className="text-xs font-bold text-zinc-100 truncate" title={displayName}>
              {displayName}
            </div>
            <div className="text-[10px] text-zinc-400 truncate" title={displayContact}>
              {displayContact}
            </div>
          </div>
          <span className="hidden xl:inline-block text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-950/60 border border-orange-800 text-orange-400 uppercase">
            {displayPlan.includes('Pro') ? 'Pro' : 'Starter'}
          </span>
          <button
            onClick={() => {
              window.dispatchEvent(new Event('tatadana_open_edit_profile'));
            }}
            title="Ubah Profil"
            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-orange-400 hover:text-orange-300 bg-orange-950/40 hover:bg-orange-950/70 border border-orange-800/60 rounded-lg transition-colors"
          >
            <Edit2 className="w-3 h-3" />
            <span className="hidden xl:inline">Ubah Profil</span>
          </button>
          <button
            onClick={async () => {
              await logout();
              window.location.href = '/login';
            }}
            title="Keluar / Logout"
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
