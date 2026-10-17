'use client';

// ==============================================================================
// TataDana: Dashboard Sidebar Navigation
// Modern Orange-White Fintech Theme
// Sidebar items: Logo · 🏠 Beranda · 💳 Transaksi · 📊 Laporan · 🎯 Budget · 👛 Wallet · ⚙️ Settings
// User badge plan + avatar + logout + ✏️ Ubah Profil modal
// ==============================================================================

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CreditCard,
  BarChart3,
  Target,
  Wallet as WalletIcon,
  Settings,
  LogOut,
  Sparkles,
  TrendingUp,
  Users,
  Shield,
  Edit2,
  X,
  Upload,
  Dices,
  CheckCircle2,
  Save,
  Camera,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { saveActiveSession, getRegisteredUsers, saveRegisteredUsers } from '@/lib/auth/user-store';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, logout, updateProfile } = useAuth();
  const [localProfile, setLocalProfile] = useState<any>(null);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editCustomUrl, setEditCustomUrl] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const syncLocal = () => {
    try {
      const raw = localStorage.getItem('tatadana_user_profile') || localStorage.getItem('user_profile') || localStorage.getItem('tatadana_user');
      if (raw) {
        setLocalProfile(JSON.parse(raw));
      }
    } catch (e) {}
  };

  useEffect(() => {
    syncLocal();

    const handleUpdate = () => {
      syncLocal();
    };

    const handleOpenEdit = () => {
      setIsEditModalOpen(true);
    };

    window.addEventListener('tatadana_profile_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('tatadana_open_edit_profile', handleOpenEdit);

    return () => {
      window.removeEventListener('tatadana_profile_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('tatadana_open_edit_profile', handleOpenEdit);
    };
  }, []);

  const navItems = [
    {
      label: 'Beranda',
      href: '/dashboard',
      icon: Home,
      badge: null,
    },
    {
      label: 'Transaksi',
      href: '/dashboard/transactions',
      icon: CreditCard,
      badge: null,
    },
    {
      label: 'Laporan',
      href: '/dashboard/reports',
      icon: BarChart3,
      badge: 'PDF/XLSX',
    },
    {
      label: 'Budget',
      href: '/dashboard/budgets',
      icon: Target,
      badge: null,
    },
    {
      label: 'Wallet',
      href: '/dashboard/wallets',
      icon: WalletIcon,
      badge: null,
    },
    {
      label: 'Pengaturan & Bot',
      href: '/dashboard/settings',
      icon: Settings,
      badge: null,
    },
    {
      label: 'Pro Boost',
      href: '/boost',
      icon: Sparkles,
      badge: 'Rp99k',
    },
    {
      label: 'Teamwork',
      href: '/teamwork-preview',
      icon: Users,
      badge: 'Preview',
    },
  ];

  const displayName = localProfile?.nama || profile?.nama || user?.full_name || 'Pengguna TataDana';
  const displayContact = localProfile?.kontak || localProfile?.email || profile?.kontak || profile?.email || user?.phone_number || user?.email || '+62 812-3456-7890';
  const displayAvatar = localProfile?.avatarUrl || profile?.avatarUrl || user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;
  const displayPlan = localProfile?.statusPaket || profile?.statusPaket || (user?.subscription_tier === 'PRO' ? 'Pro Lifetime (Rp99k)' : 'Starter');

  // Open Edit Profile Modal
  const openEditModal = () => {
    setEditName(displayName);
    setEditAvatarUrl(displayAvatar);
    setEditCustomUrl('');
    setIsEditModalOpen(true);
  };

  // Avatar Presets (DiceBear)
  const avatarPresets = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiPratama',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=MayaDewi',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexKurniawan',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=SitiRahma',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=RianSaputra',
  ];

  // Random Avatar Generator
  const handleRandomizeAvatar = () => {
    const randomSeeds = ['Garuda', 'Nusantara', 'Merdeka', 'Kencana', 'Semangat', 'Bintang', 'Surya', 'Samudra', 'Arjuna', 'Srikandi'];
    const pick = randomSeeds[Math.floor(Math.random() * randomSeeds.length)] + Math.floor(Math.random() * 999);
    setEditAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pick)}`);
  };

  // Upload Local File Image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Profile Changes
  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = editName.trim() || 'Pengguna TataDana';
    const finalAvatar = editCustomUrl.trim() || editAvatarUrl;

    const currentProfile = localProfile || profile || {
      email: user?.email || 'user@tatadana.com',
      kontak: user?.phone_number || '+62 812-3456-7890',
      statusPaket: 'Pro Lifetime (Rp99k)',
    };

    const updated = {
      ...currentProfile,
      nama: finalName,
      avatarUrl: finalAvatar,
      isLoggedIn: true,
    };

    // 1. Simpan ke localStorage tatadana_user_profile, user_profile, tatadana_user
    saveActiveSession(updated);

    // 2. Update tatadana_registered_users
    try {
      const users = getRegisteredUsers();
      const idx = users.findIndex(
        (u) => (u.email && u.email.toLowerCase() === updated.email?.toLowerCase()) ||
               (u.kontak && u.kontak === updated.kontak)
      );
      if (idx >= 0) {
        users[idx].nama = finalName;
        users[idx].avatarUrl = finalAvatar;
        saveRegisteredUsers(users);
      }
    } catch (e) {}

    // 3. Update Auth Context
    updateProfile({
      nama: finalName,
      avatarUrl: finalAvatar,
    });

    setLocalProfile(updated);
    setIsEditModalOpen(false);

    // 4. Tampilkan Notifikasi Toast Sukses
    setToastMessage('✅ Profil berhasil diperbarui!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#121215] border-r border-[#27272a] shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-zinc-800 bg-[#121215]">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center text-white font-black shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-zinc-100 tracking-tight">Tata<span className="text-orange-500">Dana</span></span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-orange-950/40 text-orange-400 border border-orange-800/60">
                  Fintech
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Catat Keuangan via Telegram</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
            Menu Utama
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`nav-item flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'active bg-orange-500/10 text-orange-400 border border-orange-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 transition-colors ${
                      isActive ? 'text-orange-500' : 'text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-orange-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section: Superadmin Panel, Ke Landing Page & Profil Pengguna Terdaftar */}
        <div className="p-4 border-t border-zinc-800 bg-[#121215] space-y-3">
          {/* Quick links */}
          <div className="space-y-1">
            <Link
              href="/admin"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-orange-400 hover:text-orange-300 hover:bg-orange-950/20 border border-orange-900/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span>🛡️ Superadmin Panel</span>
              </div>
              <span className="text-[10px] bg-orange-950/80 text-orange-300 px-1.5 py-0.5 rounded font-mono border border-orange-800/40">Admin</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 transition-colors"
            >
              <span>⬅️ Ke Landing Page</span>
            </Link>
          </div>

          {/* Kartu Profil Pengguna yang Sudah Terdaftar (Persisten dinamis dari localStorage) */}
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-[#18181b] border border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {/* Foto profil (avatar) bulat */}
                <div className="relative shrink-0">
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-orange-500 bg-zinc-800"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
                </div>
                {/* Nama pengguna dan kontak/email */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-100 truncate" title={displayName}>
                    {displayName}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate" title={displayContact}>
                    {displayContact}
                  </p>
                </div>
              </div>

              {/* Tombol Logout */}
              <button
                onClick={async () => {
                  try {
                    await logout();
                  } catch (e) {}
                  try {
                    localStorage.removeItem('tatadana_user_profile');
                    localStorage.removeItem('user_profile');
                    localStorage.removeItem('tatadana_user');
                  } catch (e) {}
                  window.location.href = '/login';
                }}
                title="Keluar / Logout"
                className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* REQUIREMENT 1: Tombol Aksi '✏️ Ubah Profil' */}
            <button
              type="button"
              onClick={openEditModal}
              className="w-full mt-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>✏️ Ubah Profil</span>
            </button>

            {/* Status lencana (badge) keanggotaan */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[10px]">
              <span className="text-zinc-500 font-medium">Status:</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs uppercase tracking-wider">
                {displayPlan}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ====================================================================== */}
      {/* REQUIREMENT 1: MODAL INTERAKTIF EDIT PROFIL PENGGUNA                   */}
      {/* ====================================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-6 relative space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/50 text-orange-400 border border-orange-800/60">
                  Pengaturan Pengguna
                </span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span>✏️ Ubah Profil Pengguna</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Sesuaikan nama tampilan dan foto profil akun TataDana Anda.
              </p>
            </div>

            <form onSubmit={handleSaveProfileChanges} className="space-y-4">
              {/* 1. Live Avatar Preview & Actions */}
              <div className="p-4 rounded-xl bg-[#18181b] border border-zinc-800 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <img
                    src={editCustomUrl.trim() || editAvatarUrl}
                    alt="Preview Avatar"
                    className="w-20 h-20 rounded-full object-cover border-4 border-orange-500 bg-zinc-800 shadow-lg shadow-orange-500/20"
                  />
                  <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-orange-500 text-white shadow">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="text-xs font-bold text-zinc-200">Live Preview Avatar</div>
                  <p className="text-[11px] text-zinc-400">
                    Pilih salah satu preset avatar di bawah, unggah foto sendiri, atau acak avatar baru.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition"
                    >
                      <Dices className="w-3.5 h-3.5 text-orange-400" />
                      <span>🎲 Acak Avatar</span>
                    </button>

                    <label className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-orange-400" />
                      <span>Unggah Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Preset Avatars Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-2">
                  Pilihan Avatar Karakter (DiceBear)
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {avatarPresets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setEditAvatarUrl(preset);
                        setEditCustomUrl('');
                      }}
                      className={`relative rounded-full p-0.5 border-2 transition shrink-0 ${
                        editAvatarUrl === preset && !editCustomUrl
                          ? 'border-orange-500 ring-2 ring-orange-500/40 scale-105'
                          : 'border-zinc-700 hover:border-zinc-500 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={preset}
                        alt={`Preset ${i + 1}`}
                        className="w-10 h-10 rounded-full bg-zinc-800 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Input URL Foto Kustom */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Atau Masukkan URL Foto Profil
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={editCustomUrl}
                  onChange={(e) => setEditCustomUrl(e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* 4. Input Nama Pengguna */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nama Pengguna / Nama Tampilan
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="misal: Budi Pratama"
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#18181b] border border-emerald-500 text-emerald-300 rounded-xl shadow-2xl animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}
    </>
  );
}
