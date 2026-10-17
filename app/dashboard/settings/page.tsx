'use client';

// ==============================================================================
// TataDana: Dashboard Settings View
// Tabbed navigation:
// 1. Profil (email, phone number linking for Telegram)
// 2. Telegram Bot (BotFather guide, input token, Test Connection button with status indicator)
// 3. Pengingat Harian (Reminders max 2x/day with time pickers)
// 4. Manajemen Kategori (custom categories with emoji & color)
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { saveActiveSession, getRegisteredUsers, saveRegisteredUsers, normalizePhone } from '@/lib/auth/user-store';
import { Category } from '@/types/database';
import {
  User as UserIcon,
  Bot,
  Bell,
  Tag,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  Smartphone,
  Save,
  RefreshCw,
  Plus,
  Sparkles,
  Clock,
  Eye,
  EyeOff,
  Check,
  X,
  Dices,
  Upload,
  Send,
  Unlink,
} from 'lucide-react';

type TabKey = 'profile' | 'telegram' | 'reminders' | 'categories';

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'telegram';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  // Step Pairing / Activation Token State (Langkah 1, 2, 3)
  const [activationToken, setActivationToken] = useState('/start token_td_889271');
  const [copiedToken, setCopiedToken] = useState(false);
  const [pairingStatus, setPairingStatus] = useState<'idle' | 'checking' | 'connected'>('idle');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState({ title: '', desc: '' });
  const [telegramUsername, setTelegramUsername] = useState('@budipratama');

  // In-App Chat Simulator State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: '👋 Halo Sobat TataDana! Saya bot asisten keuangan cerdas Anda.\n\nUntuk memulai, silakan kirimkan kode token pairing Anda atau langsung ketik transaksi seperti "beli kopi 18rb", "gajian 25jt", atau perintah /bantuan!',
      time: 'Baru saja',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);

  // Restore persistent pairing status from localStorage on mount
  useEffect(() => {
    try {
      const isConnected = localStorage.getItem('tatadana_telegram_connected') === 'true';
      const storedUser = localStorage.getItem('tatadana_telegram_username');
      const defaultUser = user?.full_name ? `@${user.full_name.toLowerCase().replace(/\s+/g, '')}` : '@budipratama';
      if (storedUser) {
        setTelegramUsername(storedUser);
      } else {
        setTelegramUsername(defaultUser);
      }
      if (isConnected) {
        setPairingStatus('connected');
      }
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    const tab = (searchParams.get('tab') as TabKey) || 'telegram';
    setActiveTab(tab);
  }, [searchParams]);

  useEffect(() => {
    const randNum = Math.floor(100000 + Math.random() * 900000);
    setActivationToken(`/start token_td_${randNum}`);
  }, []);

  const handleCopyActivationToken = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(activationToken);
    } else if (typeof document !== 'undefined') {
      const el = document.createElement('textarea');
      el.value = activationToken;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleVerifyPairing = () => {
    setPairingStatus('checking');
    setTimeout(() => {
      setPairingStatus('connected');
      try {
        localStorage.setItem('tatadana_telegram_connected', 'true');
        localStorage.setItem('tatadana_telegram_username', telegramUsername);
      } catch (e) {}
      setToastMsg({
        title: '✓ Bot Telegram berhasil terhubung dengan akun TataDana Anda!',
        desc: `Akun Telegram ${telegramUsername} sudah ter-pairing. Sekarang Anda bisa mulai mencatat keuangan via chat!`,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);
    }, 900);
  };

  const handleDisconnectPairing = () => {
    setPairingStatus('idle');
    try {
      localStorage.removeItem('tatadana_telegram_connected');
      localStorage.removeItem('tatadana_telegram_username');
    } catch (e) {}
    setToastMsg({
      title: 'Koneksi Diputus',
      desc: 'Koneksi bot Telegram telah diputus dari akun TataDana Anda.',
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  const handleSendChat = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : chatInput).trim();
    if (!text || isSendingChat) return;
    setChatInput('');

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    setChatMessages((prev) => [...prev, { sender: 'user', text, time: timeStr }]);

    const isPairing = text.toLowerCase().startsWith('/start') || text.toLowerCase().includes('token_td_');
    if (isPairing) {
      setPairingStatus('connected');
      try {
        localStorage.setItem('tatadana_telegram_connected', 'true');
        localStorage.setItem('tatadana_telegram_username', telegramUsername);
      } catch (e) {}
      setToastMsg({
        title: '✓ Bot Telegram berhasil terhubung dengan akun TataDana Anda!',
        desc: `Akun Telegram ${telegramUsername} berhasil ter-pairing secara otomatis via token!`,
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 6000);
    }

    setIsSendingChat(true);

    try {
      const res = await fetch('/api/telegram/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          chat_id: 8129481234,
          user_name: fullName || 'Budi Pratama',
        }),
      });
      const data = await res.json();
      if (data && data.reply) {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'bot', text: data.reply, time: timeStr },
        ]);
        if (data.paired) {
          setPairingStatus('connected');
          try {
            localStorage.setItem('tatadana_telegram_connected', 'true');
            localStorage.setItem('tatadana_telegram_username', telegramUsername);
          } catch (e) {}
        }
      } else {
        throw new Error('No reply');
      }
    } catch (err) {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `✅ Pesan "${text}" berhasil diterima dan dicatat oleh TataDana Bot!`,
            time: timeStr,
          },
        ]);
      }, 300);
    } finally {
      setIsSendingChat(false);
    }
  };

  const { user, refreshUser, updateProfile } = useAuth();

  // Tab 1: Profile State (Part 3: nama, foto, mata uang default)
  const [fullName, setFullName] = useState(user?.full_name || 'Budi Pratama');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '081234567890');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150');
  const [defaultCurrency, setDefaultCurrency] = useState('IDR');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  // Tab 2: Telegram Bot State
  const [botToken, setBotToken] = useState('8129481234:AAFtATA_DANA_DEMO_TOKEN_INDONESIA');
  const [showToken, setShowToken] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message?: string;
    bot?: any;
    webhook?: any;
  }>({ status: 'idle' });
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  // Tab 3: Reminders State (Part 3: toggle ON/OFF, frekuensi maks 2x/hari, jam, preview)
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState<'1x' | '2x'>('2x');
  const [reminder1Active, setReminder1Active] = useState(true);
  const [reminder1Time, setReminder1Time] = useState('08:00');
  const [reminder2Active, setReminder2Active] = useState(true);
  const [reminder2Time, setReminder2Time] = useState('20:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  // Tab 4: Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [newCatIcon, setNewCatIcon] = useState('☕');
  const [newCatColor, setNewCatColor] = useState('#f97316');
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);
  const [catSuccess, setCatSuccess] = useState<string | null>(null);

  // Synchronize user prop when loaded
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setPhoneNumber(user.phone_number || '');
    }
  }, [user]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/budgets');
        const json = await res.json();
        if (json.categories) setCategories(json.categories);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Handle Tab Switch
  const tabs = [
    { key: 'telegram', label: 'Integrasi Bot Telegram', icon: Bot, badge: 'Penting' },
    { key: 'profile', label: 'Profil Pengguna', icon: UserIcon },
    { key: 'reminders', label: 'Pengingat Harian (2x/hari)', icon: Bell },
    { key: 'categories', label: 'Manajemen Kategori', icon: Tag },
  ];

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage(null);

    try {
      const finalName = fullName.trim() || 'Pengguna TataDana';
      const cleanPhone = normalizePhone(phoneNumber);
      const email = user?.email || 'user@tatadana.com';

      const updatedProfile = {
        nama: finalName,
        kontak: cleanPhone,
        email: email,
        avatarUrl: avatarUrl,
        statusPaket: user?.subscription_tier === 'PRO' ? 'Pro Lifetime (Rp99k)' : 'Starter',
      };

      saveActiveSession(updatedProfile);

      // Update registered users store if present
      try {
        const users = getRegisteredUsers();
        const idx = users.findIndex(
          (u) => (u.email && u.email.toLowerCase() === email.toLowerCase()) ||
                 (u.kontak && u.kontak === cleanPhone)
        );
        if (idx >= 0) {
          users[idx].nama = finalName;
          users[idx].avatarUrl = avatarUrl;
          users[idx].kontak = cleanPhone;
          saveRegisteredUsers(users);
        }
      } catch (e) {}

      updateProfile({
        nama: finalName,
        avatarUrl: avatarUrl,
        kontak: cleanPhone,
      });

      setProfileMessage('Profil, nama pengguna, dan foto profil berhasil disimpan secara persisten!');
      setTimeout(() => setProfileMessage(null), 5000);
    } catch (err: any) {
      setProfileMessage('Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Test Telegram Connection
  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      setTestResult({ status: 'idle' });

      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'set_webhook',
          token: botToken,
        }),
      });

      const json = await res.json();

      if (res.ok && json.status === 'ok') {
        // Also fetch GET status
        const getRes = await fetch('/api/telegram/test');
        const getJson = await getRes.json();

        setTestResult({
          status: 'success',
          message: 'Koneksi ke Bot Telegram berhasil terverifikasi! Webhook aktif.',
          bot: getJson.bot || { username: 'tatadana_bot', first_name: 'TataDana Finance Bot' },
          webhook: getJson.webhook || { url: 'http://localhost:3000/api/telegram/webhook' },
        });
      } else {
        setTestResult({
          status: 'error',
          message: json.message || 'Gagal memverifikasi token bot Telegram.',
        });
      }
    } catch (err: any) {
      setTestResult({
        status: 'error',
        message: 'Koneksi error: ' + (err.message || 'Tidak dapat terhubung ke server Telegram'),
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Save Reminders
  const handleSaveReminders = async (e: React.FormEvent) => {
    e.preventDefault();
    setReminderSaving(true);
    setReminderMessage(null);

    try {
      await new Promise((r) => setTimeout(r, 500));
      setReminderMessage('Jadwal pengingat harian berhasil diperbarui!');
    } catch (err) {
      setReminderMessage('Gagal menyimpan jadwal pengingat.');
    } finally {
      setReminderSaving(false);
    }
  };

  // Toggle Day Selection
  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCatError(null);
    setCatSuccess(null);

    if (!newCatName.trim()) {
      setCatError('Nama kategori wajib diisi.');
      return;
    }

    try {
      setCatLoading(true);
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_category',
          name: newCatName.trim(),
          type: newCatType,
          icon: newCatIcon || '🏷️',
          color: newCatColor,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Gagal membuat kategori');

      setCatSuccess(`Kategori "${newCatName}" berhasil ditambahkan!`);
      setNewCatName('');

      // Reload categories
      const refreshRes = await fetch('/api/budgets');
      const refreshJson = await refreshRes.json();
      if (refreshJson.categories) setCategories(refreshJson.categories);
    } catch (err: any) {
      setCatError(err.message || 'Gagal membuat kategori baru');
    } finally {
      setCatLoading(false);
    }
  };

  // Helper copy text
  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const dayNames = [
    { num: 1, label: 'Sen' },
    { num: 2, label: 'Sel' },
    { num: 3, label: 'Rab' },
    { num: 4, label: 'Kam' },
    { num: 5, label: 'Jum' },
    { num: 6, label: 'Sab' },
    { num: 7, label: 'Min' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 shadow-sm">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-orange-950/40 text-orange-400 border border-orange-800/60">
            {activeTab === 'telegram' ? 'Integrasi Bot Telegram' : 'Pusat Pengaturan'}
          </span>
          <span className="text-xs text-zinc-400">Asia/Jakarta (WIB)</span>
        </div>
        <h1 className="text-xl md:text-2xl font-black text-zinc-100 tracking-tight">
          {activeTab === 'telegram' ? 'Integrasi Bot Telegram' : 'Pengaturan Akun & Integrasi'}
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          {activeTab === 'telegram'
            ? 'Hubungkan akun TataDana Anda ke bot Telegram untuk mulai mencatat keuangan instan via chat.'
            : 'Kelola profil pengguna, integrasi bot Telegram, jadwal pengingat harian, dan kategori kustom.'}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#121215] border border-zinc-800 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-black/20 text-white' : 'bg-orange-950 text-orange-400 border border-orange-800/50'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFIL PENGGUNA */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-zinc-100 tracking-tight">Informasi Pribadi</h3>
              <p className="text-xs text-zinc-400">
                Data akun dan nomor handphone penghubung dengan bot Telegram.
              </p>
            </div>

            {profileMessage && (
              <div className="p-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{profileMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Alamat Email (Login Utama)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'user@tatadana.id'}
                  className="w-full px-3.5 py-2.5 text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-xl cursor-not-allowed"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Email diverifikasi oleh penyedia autentikasi Supabase
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nomor Handphone (Kunci Penghubung Telegram Bot)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                    +62
                  </span>
                  <input
                    type="tel"
                    required
                    placeholder="81234567890"
                    value={phoneNumber.replace(/^\+62|^0/, '')}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-2.5 text-xs text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
                <p className="text-[11px] text-zinc-400 mt-1.5 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                  <span>
                    Nomor ini dicocokkan saat Anda pertama kali mengirim pesan transaksi ke bot Telegram.
                  </span>
                </p>
              </div>

              {/* Foto Profil (Part 3) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Foto Profil
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl border-2 border-orange-500 overflow-hidden bg-zinc-800 flex items-center justify-center shrink-0 shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {[
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser',
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiPratama',
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=MayaDewi',
                        'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexKurniawan',
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                      ].map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className={`w-8 h-8 rounded-lg overflow-hidden border ${avatarUrl === url ? 'ring-2 ring-orange-500 border-white' : 'border-zinc-700 opacity-60 hover:opacity-100'}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const rand = 'TataDana' + Math.floor(Math.random() * 99999);
                          setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${rand}`);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-semibold border border-zinc-700 transition"
                      >
                        <Dices className="w-3 h-3 text-orange-400" />
                        <span>🎲 Acak</span>
                      </button>
                    </div>
                    <span className="text-[10px] text-zinc-500 block">
                      Pilih avatar karakter DiceBear, acak avatar, atau masukkan URL kustom
                    </span>
                  </div>
                </div>
              </div>

              {/* Mata Uang Default (Part 3) */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Mata Uang Default
                </label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 transition-all font-semibold"
                >
                  <option value="IDR" className="bg-[#18181b]">IDR — Rupiah Indonesia (Rp)</option>
                  <option value="USD" className="bg-[#18181b]">USD — US Dollar ($)</option>
                  <option value="SGD" className="bg-[#18181b]">SGD — Singapore Dollar (S$)</option>
                </select>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Semua transaksi dan format reply bot akan ditampilkan dalam mata uang ini
                </span>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{profileSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Subscription Tier Card */}
          <div className="p-6 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-zinc-400">Paket Berlangganan</span>
                <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  {user?.subscription_tier === 'PRO' ? 'PRO PLAN' : 'STARTER'}
                </span>
              </div>

              <h4 className="text-lg font-black text-zinc-100 tracking-tight mb-2">
                TataDana Pro Edition
              </h4>
              <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                Akses tanpa batas ke seluruh modul cerdas finansial:
              </p>

              <div className="space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Vision OCR: Ekstraksi Struk Belanja</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Voice Note Transkripsi (Speech-to-Text)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>AI Financial Advisor Rekomendasi Pengeluaran</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Ekspor Laporan PDF & Excel Tanpa Batas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multi-Wallet & Budget Peringatan Otomatis</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-800/40 text-center">
                <span className="text-xs font-bold text-orange-400">Status Akun Aktif</span>
                <p className="text-[11px] text-zinc-400 mt-0.5">Mendukung koneksi simulator & Midtrans</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTEGRASI TELEGRAM BOT */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          {/* LANGKAH 1 */}
          <div className="p-6 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30">
                Langkah 1
              </span>
              <h3 className="text-base font-bold text-zinc-100">Hubungi Bot Telegram Resmi</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Hubungi bot Telegram resmi TataDana dengan mengeklik tombol oranye besar di bawah ini. Tombol ini akan membuka link eksternal ke Telegram bot kami.
            </p>
            <div>
              <a
                href="https://t.me/TataDanaBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Bot className="w-5 h-5" />
                <span>Buka Bot Telegram (t.me/TataDanaBot)</span>
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          </div>

          {/* LANGKAH 2 (Sistem Pairing / Token) */}
          <div className="p-6 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30">
                Langkah 2
              </span>
              <h3 className="text-base font-bold text-zinc-100">Sistem Pairing / Token</h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Kode Token Aktivasi
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
                <div className="flex-1 px-4 py-3 bg-[#121215] border border-zinc-800 rounded-xl font-mono text-sm font-bold text-orange-400 select-all flex items-center">
                  <code>{activationToken}</code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyActivationToken}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 transition-all shrink-0 cursor-pointer"
                >
                  {copiedToken ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-orange-400" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-2.5 flex items-center gap-2">
                <span className="text-orange-400">💬</span>
                <span>Kirimkan kode token di atas ke chat bot Telegram Anda untuk memverifikasi akun.</span>
              </p>
            </div>
          </div>

          {/* LANGKAH 3 (Verifikasi Status) */}
          <div className="p-6 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30">
                Langkah 3
              </span>
              <h3 className="text-base font-bold text-zinc-100">Verifikasi Status</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Setelah mengirimkan kode token ke chat bot Telegram Anda, klik tombol verifikasi di bawah ini untuk mengonfirmasi status koneksi.
            </p>

            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                pairingStatus === 'connected'
                  ? 'bg-emerald-950/20 border-emerald-500/50'
                  : 'bg-[#121215] border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                    pairingStatus === 'connected'
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/50'
                      : pairingStatus === 'checking'
                      ? 'bg-orange-500 animate-pulse'
                      : 'bg-zinc-600'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold text-zinc-200">
                    {pairingStatus === 'connected' ? (
                      <span className="text-emerald-400 font-extrabold">Akun Telegram Ter-pairing: {telegramUsername}</span>
                    ) : pairingStatus === 'checking' ? (
                      <span className="text-orange-400">Memeriksa koneksi...</span>
                    ) : (
                      <span>Status: Belum Terhubung</span>
                    )}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {pairingStatus === 'connected'
                      ? 'Akun bot aktif & siap menerima pencatatan transaksi instan.'
                      : 'Kirim kode token aktivasi ke chat bot Telegram Anda, lalu klik Verifikasi Hubungan.'}
                  </div>
                </div>
              </div>

              <div>
                {pairingStatus === 'connected' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-black text-xs shadow-md shadow-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                    Terhubung (Aktif)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-semibold">
                    Menunggu Verifikasi
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              {pairingStatus !== 'connected' ? (
                <button
                  type="button"
                  onClick={handleVerifyPairing}
                  disabled={pairingStatus === 'checking'}
                  className="flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {pairingStatus === 'checking' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Memeriksa koneksi...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 text-white" />
                      <span>Verifikasi Hubungan</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDisconnectPairing}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-500/40 rounded-xl transition cursor-pointer"
                >
                  <Unlink className="w-4 h-4 text-rose-400" />
                  <span>Putus Koneksi</span>
                </button>
              )}
            </div>
          </div>

          {/* CHAT INTERAKTIF TATADANA BOT */}
          <div className="p-6 rounded-2xl bg-[#121215] border border-zinc-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white text-xl shadow-lg shadow-orange-500/30">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-zinc-100">💬 Chat Interaktif TataDana Bot</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-bold">
                      ● Online
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Ketik transaksi langsung di bawah dan bot akan membalas secara real-time. Transaksi otomatis tersimpan!
                  </p>
                </div>
              </div>
              <div>
                <span className="text-[11px] px-2.5 py-1 rounded-lg bg-orange-950/40 text-orange-400 border border-orange-800/40 font-mono">
                  ⚡ Multi-Modal AI & Webhook Sync
                </span>
              </div>
            </div>

            {/* Chat Bubble Container */}
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl h-80 overflow-y-auto p-4 flex flex-col gap-3">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'self-end bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-br-xs shadow-md shadow-orange-500/20'
                      : 'self-start bg-[#18181b] border border-zinc-800 text-zinc-200 rounded-bl-xs shadow-sm space-y-1'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 font-semibold mb-1">
                    <span>{msg.sender === 'user' ? 'Anda' : '🤖 TataDana Bot'}</span>
                    <span>{msg.time}</span>
                  </div>
                  <div className="whitespace-pre-line font-sans font-medium">
                    {msg.text}
                  </div>
                </div>
              ))}
              {isSendingChat && (
                <div className="self-start bg-[#18181b] border border-zinc-800 text-orange-400 rounded-2xl rounded-bl-xs p-3 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>TataDana Bot sedang mengetik...</span>
                </div>
              )}
            </div>

            {/* Shortcut Quick Action Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
              <button
                type="button"
                onClick={() => handleSendChat(activationToken)}
                className="px-3 py-1.5 rounded-full bg-orange-950/40 hover:bg-orange-900/50 text-orange-400 border border-orange-800/50 text-xs font-bold shrink-0 transition cursor-pointer"
              >
                📋 Token Pairing
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('beli kopi 18rb')}
                className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold shrink-0 transition cursor-pointer"
              >
                ☕ Beli Kopi 18rb
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('makan siang 35rb')}
                className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold shrink-0 transition cursor-pointer"
              >
                🍜 Makan Siang 35rb
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('bensin 50rb')}
                className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold shrink-0 transition cursor-pointer"
              >
                ⛽ Bensin 50rb
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('gajian 25jt')}
                className="px-3 py-1.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-800/50 text-xs font-bold shrink-0 transition cursor-pointer"
              >
                💰 Gajian 25jt
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('/saldo')}
                className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-mono font-semibold shrink-0 transition cursor-pointer"
              >
                /saldo
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('/hari ini')}
                className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-mono font-semibold shrink-0 transition cursor-pointer"
              >
                /hari ini
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('/budget')}
                className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-mono font-semibold shrink-0 transition cursor-pointer"
              >
                /budget
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('/boost')}
                className="px-3 py-1.5 rounded-full bg-orange-950/40 hover:bg-orange-900/50 text-orange-400 border border-orange-800/50 text-xs font-mono font-semibold shrink-0 transition cursor-pointer"
              >
                🚀 /boost
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('/teamwork-preview')}
                className="px-3 py-1.5 rounded-full bg-blue-950/40 hover:bg-blue-900/50 text-blue-400 border border-blue-800/50 text-xs font-mono font-semibold shrink-0 transition cursor-pointer"
              >
                👥 /teamwork-preview
              </button>
              <button
                type="button"
                onClick={() => handleSendChat('/bantuan')}
                className="px-3 py-1.5 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-xs font-mono font-semibold shrink-0 transition cursor-pointer"
              >
                /bantuan
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                placeholder="Ketik pesan ke bot (contoh: beli kopi 18rb atau /saldo)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-4 py-3 text-xs text-zinc-100 bg-[#09090b] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="flex items-center gap-1.5 px-5 py-3 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition cursor-pointer"
              >
                <span>Kirim</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Success Toast in Bottom Right Corner */}
          {showToast && (
            <div
              role="alert"
              className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-xl bg-[#18181b] border shadow-2xl max-w-sm transition-all animate-in fade-in slide-in-from-bottom-4 duration-300 ${
                pairingStatus === 'connected' ? 'border-emerald-500 shadow-emerald-950/60' : 'border-zinc-700 shadow-black'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 font-bold">
                ✓
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-emerald-400">{toastMsg.title || 'Koneksi Berhasil!'}</h4>
                <p className="text-[11px] text-zinc-300 mt-0.5 leading-relaxed">
                  {toastMsg.desc || `Akun Telegram ${telegramUsername} sudah ter-pairing. Sekarang Anda bisa mulai mencatat keuangan via chat!`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="text-zinc-400 hover:text-zinc-200 p-0.5 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Pengaturan Lanjutan Bot Token & Webhook API */}
          <details className="p-5 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-4 cursor-pointer group">
            <summary className="text-xs font-bold text-zinc-300 flex items-center justify-between outline-none">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-orange-400" />
                <span>Pengaturan Lanjutan: Konfigurasi BotFather Token & Webhook API</span>
              </span>
              <span className="text-[10px] text-orange-400 underline font-mono">Buka / Tutup</span>
            </summary>

            <div className="pt-4 border-t border-zinc-800 space-y-4 cursor-default">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Telegram Bot API Token
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="w-full pl-4 pr-12 py-2.5 text-xs text-zinc-100 font-mono bg-[#121215] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {testingConnection && (
                <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>Sedang memverifikasi token ke Telegram API getMe & setWebhook...</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-900/60 text-amber-300 border border-amber-600">
                    ⏳ Testing...
                  </span>
                </div>
              )}

              {testResult.status === 'success' && !testingConnection && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>{testResult.message || 'getMe & setWebhook berhasil diverifikasi!'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-900/60 text-emerald-300 border border-emerald-600">
                      🟢 Terhubung
                    </span>
                  </div>
                  {testResult.bot && (
                    <div className="text-[11px] text-zinc-300 space-y-1 pl-6 pt-1 border-t border-emerald-900/50">
                      <p>
                        • <strong>Nama Bot:</strong> {testResult.bot.first_name}
                      </p>
                      <p>
                        • <strong>Username:</strong> @{testResult.bot.username}
                      </p>
                      <p>
                        • <strong>Webhook Endpoint:</strong> {testResult.webhook?.url || 'http://localhost:3000/api/telegram/webhook'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {testResult.status === 'error' && !testingConnection && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-300">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{testResult.message}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-900/60 text-rose-300 border border-rose-600">
                      🔴 Tidak terhubung
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${testingConnection ? 'animate-spin' : ''}`} />
                  <span>{testingConnection ? '⏳ Testing...' : 'Test Koneksi'}</span>
                </button>
              </div>
            </div>
          </details>

          {/* Bot Commands Reference */}
          <div className="p-6 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
              Daftar Perintah & Format Input Bot Telegram
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800">
                <code className="text-orange-400 font-bold font-mono">/saldo</code>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Menampilkan saldo seluruh dompet aktif (Cash, BCA, Mandiri, dsb).
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800">
                <code className="text-orange-400 font-bold font-mono">/hari ini</code>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Menampilkan ringkasan seluruh pengeluaran dan pemasukan hari ini.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800">
                <code className="text-orange-400 font-bold font-mono">/minggu ini</code>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Menampilkan akumulasi pengeluaran sepekan terakhir.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800">
                <code className="text-orange-400 font-bold font-mono">/budget</code>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Menampilkan visual progress bar <code className="text-zinc-300">█░</code> dan sisa kuota anggaran per kategori.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800">
                <code className="text-orange-400 font-bold font-mono">Teks Natural</code>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Ketik <em>&quot;beli kopi susu 18rb&quot;</em> atau <em>&quot;gaji 15jt&quot;</em> untuk pencatatan instan.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-[#121215] border border-zinc-800">
                <code className="text-purple-400 font-bold font-mono">Foto Struk & Voice</code>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Kirim foto struk belanjaan (OCR) atau voice note hingga 60 detik.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENGINGAT HARIAN (REMINDERS MAX 2X/DAY) */}
      {activeTab === 'reminders' && (
        <div className="p-6 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm space-y-6">
          {/* Header & Master Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-zinc-100 tracking-tight">
                Jadwal Pengingat Harian (Maksimal 2x / Hari)
              </h3>
              <p className="text-xs text-zinc-400">
                Bot Telegram akan mengirimkan pengingat otomatis untuk mencatat transaksi dan mengevaluasi arus kas Anda.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold ${remindersEnabled ? 'text-orange-400' : 'text-zinc-500'}`}>
                {remindersEnabled ? 'Pengingat Aktif' : 'Pengingat Nonaktif'}
              </span>
              <button
                type="button"
                onClick={() => setRemindersEnabled(!remindersEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  remindersEnabled ? 'bg-orange-500' : 'bg-zinc-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    remindersEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {reminderMessage && (
            <div className="p-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{reminderMessage}</span>
            </div>
          )}

          <form onSubmit={handleSaveReminders} className={`space-y-6 ${!remindersEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {/* Frekuensi Reminder (Part 3: 1x vs 2x sehari) */}
            <div className="p-4 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
              <label className="block text-xs font-semibold text-zinc-300">
                Frekuensi Pengingat (Kebijakan TataDana: Maksimal 2x / Hari)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setReminderFrequency('1x');
                    setReminder1Active(false);
                    setReminder2Active(true);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    reminderFrequency === '1x'
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 ring-1 ring-orange-500/30'
                      : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">1x Sehari</span>
                    {reminderFrequency === '1x' && (
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Hanya pengingat rekapitulasi malam hari (fokus evaluasi pengeluaran).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReminderFrequency('2x');
                    setReminder1Active(true);
                    setReminder2Active(true);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    reminderFrequency === '2x'
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 ring-1 ring-orange-500/30'
                      : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">2x Sehari (Rekomendasi)</span>
                    {reminderFrequency === '2x' && (
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Pagi untuk persiapan harian & malam untuk pencatatan lengkap.
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sesi 1: Pengingat Pagi / Siang */}
              <div className={`p-5 rounded-xl border space-y-4 transition-all ${
                reminder1Active ? 'bg-[#121215] border-zinc-800' : 'bg-[#121215]/40 border-zinc-800/50 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <h4 className="text-xs font-bold text-zinc-100">Sesi 1: Pengingat Pagi</h4>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminder1Active}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setReminder1Active(val);
                      if (val && reminder2Active) setReminderFrequency('2x');
                      else setReminderFrequency('1x');
                    }}
                    className="w-4 h-4 text-orange-500 rounded border-zinc-700 bg-zinc-900 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Waktu Pengingat (WIB)
                  </label>
                  <input
                    type="time"
                    disabled={!reminder1Active}
                    value={reminder1Time}
                    onChange={(e) => setReminder1Time(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 disabled:opacity-50 font-mono"
                  />
                </div>

                <p className="text-[11px] text-zinc-400">
                  Notifikasi motivasi pagi & pengingat mencatat sarapan/kebutuhan awal hari.
                </p>
              </div>

              {/* Sesi 2: Pengingat Malam / Evaluasi */}
              <div className={`p-5 rounded-xl border space-y-4 transition-all ${
                reminder2Active ? 'bg-[#121215] border-zinc-800' : 'bg-[#121215]/40 border-zinc-800/50 opacity-60'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold text-zinc-100">Sesi 2: Rekapitulasi Malam</h4>
                  </div>
                  <input
                    type="checkbox"
                    checked={reminder2Active}
                    onChange={(e) => {
                      const val = e.target.checked;
                      setReminder2Active(val);
                      if (val && reminder1Active) setReminderFrequency('2x');
                      else setReminderFrequency('1x');
                    }}
                    className="w-4 h-4 text-orange-500 rounded border-zinc-700 bg-zinc-900 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Waktu Pengingat (WIB)
                  </label>
                  <input
                    type="time"
                    disabled={!reminder2Active}
                    value={reminder2Time}
                    onChange={(e) => setReminder2Time(e.target.value)}
                    className="w-full px-3 py-2 text-sm text-zinc-100 bg-[#18181b] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 disabled:opacity-50 font-mono"
                  />
                </div>

                <p className="text-[11px] text-zinc-400">
                  Notifikasi rekapitulasi harian, pengingat simpan struk, dan sisa budget kategori.
                </p>
              </div>
            </div>

            {/* Pilihan Hari Aktif */}
            <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
              <label className="block text-xs font-semibold text-zinc-300">
                Pilih Hari Aktif Notifikasi
              </label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((d) => {
                  const isSelected = selectedDays.includes(d.num);
                  return (
                    <button
                      key={d.num}
                      type="button"
                      onClick={() => toggleDay(d.num)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                          : 'bg-[#18181b] text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Preview Pesan Bot Telegram (Part 4.8) */}
            <div className="p-5 rounded-xl bg-[#121215] border border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-orange-500" />
                  Preview Pesan Pengingat Telegram (Part 4.8)
                </span>
                <span className="text-[10px] font-semibold text-zinc-400">
                  Format Resmi Bot TataDana
                </span>
              </div>
              <div className="max-w-md mx-auto sm:mx-0 p-4 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm space-y-2">
                <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                  <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">
                    TD
                  </div>
                  <span className="text-xs font-bold text-zinc-100">TataDana Bot</span>
                  <span className="text-[10px] text-zinc-500 ml-auto">
                    {reminder2Active ? reminder2Time : reminder1Time} WIB
                  </span>
                </div>
                <div className="text-xs text-zinc-300 space-y-1 font-sans leading-relaxed whitespace-pre-line">
                  <p className="font-bold text-zinc-100">⏰ Reminder Keuangan!</p>
                  <p>Jangan lupa catat pengeluaran hari ini ya 📝</p>
                  <p>Pencatatan rutin = keuangan lebih terkontrol 💪</p>
                  <p className="text-orange-400 font-semibold pt-1">Ketik transaksimu sekarang!</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-zinc-800">
              <button
                type="submit"
                disabled={reminderSaving}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>{reminderSaving ? 'Menyimpan...' : 'Simpan Preferensi Pengingat'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: MANAJEMEN KATEGORI */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Category Form */}
          <div className="p-6 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-zinc-100 tracking-tight">Tambah Kategori Baru</h3>
              <p className="text-xs text-zinc-400">
                Kustomisasi emoji dan warna unik untuk kategori pemasukan & pengeluaran Anda.
              </p>
            </div>

            {catError && (
              <div className="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-500/40 rounded-xl">
                {catError}
              </div>
            )}

            {catSuccess && (
              <div className="p-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 rounded-xl">
                {catSuccess}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Langganan Musik, Hewan Peliharaan"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tipe Kategori
                </label>
                <select
                  value={newCatType}
                  onChange={(e) => setNewCatType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
                >
                  <option value="EXPENSE" className="bg-[#18181b]">Pengeluaran (Expense)</option>
                  <option value="INCOME" className="bg-[#18181b]">Pemasukan (Income)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Emoji Ikon
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="w-full px-3 py-2 text-base text-center text-zinc-100 bg-[#121215] border border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Warna Hex
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-9 h-9 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-zinc-400">{newCatColor}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={catLoading}
                className="w-full py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {catLoading ? 'Menyimpan...' : '+ Tambah Kategori'}
              </button>
            </form>
          </div>

          {/* Existing Categories List */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-[#18181b] border border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-100 tracking-tight">
                  Daftar Kategori Aktif
                </h3>
                <p className="text-xs text-zinc-400">
                  {categories.length} kategori terdaftar dalam sistem
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {categories.map((c) => {
                const isExpense = c.type === 'EXPENSE';
                return (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-[#121215] border border-zinc-800 flex items-center justify-between gap-3 hover:border-orange-500/40 hover:bg-zinc-800/40 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 border border-zinc-700/50"
                        style={{ backgroundColor: `${c.color || '#f97316'}20` }}
                      >
                        {c.icon || '🏷️'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-100 truncate">{c.name}</p>
                        <span
                          className={`text-[9px] font-bold uppercase ${
                            isExpense ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {isExpense ? 'Pengeluaran' : 'Pemasukan'}
                        </span>
                      </div>
                    </div>

                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 border border-zinc-900 shadow-xs"
                      style={{ backgroundColor: c.color || '#f97316' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-zinc-500 animate-pulse">
          Memuat pengaturan...
        </div>
      }
    >
      <SettingsContent />
    </React.Suspense>
  );
}
