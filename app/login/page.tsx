'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import {
  findUserByIdentifier,
  updateUserPasswordByIdentifier,
  saveActiveSession,
  getRegisteredUsers,
  cleanPhoneDigits,
} from '@/lib/auth/user-store';
import {
  Wallet,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Send,
  ReceiptText,
  PieChart,
  Smartphone,
  KeyRound,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react';
import { authService } from '@/lib/auth/auth-service';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithProfile, profile, logout } = useAuth();

  // Login Method: Email vs Phone OTP
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  // Email form state (Default Auto-fill for Superadmin PRO VIP)
  const [email, setEmail] = useState('shopnoure1619@gmail.com');
  const [password, setPassword] = useState('tugasbisnis16');
  const [passwordError, setPasswordError] = useState(false);

  // Phone OTP form state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentMessage, setOtpSentMessage] = useState<string | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notRegisteredWarning, setNotRegisteredWarning] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Lupa Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotContact, setForgotContact] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  // Reset errors helper
  const clearAlerts = () => {
    setError(null);
    setPasswordError(false);
    setNotRegisteredWarning(null);
  };

  // --------------------------------------------------------------------------
  // Handle Email & Password Login
  // --------------------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setSuccessNotice(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedEmail) {
      setError('Alamat email wajib diisi.');
      return;
    }
    if (!trimmedPass) {
      setPasswordError(true);
      setError('Kata sandi wajib diisi.');
      return;
    }

    setLoading(true);

    try {
      // Special Master Superadmin Bypass & Auto-provision (shopnoure1619@gmail.com / tugasbisnis16)
      if (trimmedEmail === 'shopnoure1619@gmail.com') {
        if (trimmedPass !== 'tugasbisnis16') {
          setPasswordError(true);
          setError('❌ Kata sandi Superadmin salah. Silakan periksa kembali kata sandi tugasbisnis16.');
          setLoading(false);
          return;
        }

        const superadminProfile = {
          nama: 'Superadmin TataDana Prime',
          kontak: '+62 812-1619-0000',
          email: 'shopnoure1619@gmail.com',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaSuperadminVIP',
          statusPaket: 'PRO VIP',
          role: 'SUPERADMIN',
          isVerified: true,
          isApproved: true,
          isLoggedIn: true,
        };

        saveActiveSession(superadminProfile);
        loginWithProfile(superadminProfile);
        router.push('/dashboard');
        return;
      }

      // 1. Cek apakah akun terdaftar di tatadana_registered_users
      const existingUser = findUserByIdentifier(trimmedEmail);

      if (!existingUser) {
        // Requirement 4: Akun belum terdaftar tidak boleh langsung masuk (tampilkan peringatan kuning/oranye)
        setNotRegisteredWarning('⚠️ Akun belum terdaftar. Anda harus mendaftar dan memverifikasi akun terlebih dahulu sebelum bisa masuk.');
        setLoading(false);
        return;
      }

      // 2. Validasi apakah akun sudah diverifikasi
      if (!existingUser.isVerified) {
        setNotRegisteredWarning('⚠️ Akun ini belum diverifikasi. Silakan lakukan pendaftaran ulang dan verifikasi OTP sebelum bisa masuk.');
        setLoading(false);
        return;
      }

      // 3. Validasi Status Persetujuan Admin (Pending Approval)
      if (existingUser.isApproved === false && existingUser.role !== 'SUPERADMIN' && existingUser.email !== 'shopnoure1619@gmail.com') {
        setNotRegisteredWarning('⏳ Akun Anda masih dalam status "Menunggu Persetujuan Admin (Pending Approval)". Harap tunggu hingga Superadmin (shopnoure1619@gmail.com) menyetujui akun Anda.');
        setLoading(false);
        return;
      }

      // 4. Validasi Kata Sandi (Password Salah)
      const expectedPassword = existingUser.password || 'password123';
      if (trimmedPass !== expectedPassword) {
        // Requirement 3: Peringatan Password Salah berlatar merah & highlight border merah
        setPasswordError(true);
        setError('❌ Kata sandi yang Anda masukkan salah. Silakan periksa kembali atau gunakan opsi Lupa Password.');
        setLoading(false);
        return;
      }

      // 5. Kata Sandi Benar: Simpan sesi dan masuk ke dashboard
      const isSuper = existingUser.email === 'shopnoure1619@gmail.com' || existingUser.role === 'SUPERADMIN' || existingUser.email === 'admin@tatadana.com';
      const userProfile = {
        nama: existingUser.nama,
        kontak: existingUser.kontak,
        email: existingUser.email,
        avatarUrl: existingUser.avatarUrl,
        statusPaket: isSuper ? 'PRO VIP' : (existingUser.statusPaket || 'Pro Lifetime (Rp99k)'),
        role: isSuper ? 'SUPERADMIN' : (existingUser.role || 'USER'),
        isApproved: true,
        isLoggedIn: true,
      };

      saveActiveSession(userProfile);
      loginWithProfile(userProfile);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Gagal masuk. Periksa kembali email dan kata sandi Anda.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Superadmin Login Handler
  const handleQuickSuperadminLogin = () => {
    clearAlerts();
    setLoading(true);
    const superadminProfile = {
      nama: 'Superadmin TataDana Prime',
      kontak: '+62 812-1619-0000',
      email: 'shopnoure1619@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaSuperadminVIP',
      statusPaket: 'PRO VIP',
      role: 'SUPERADMIN',
      isVerified: true,
      isApproved: true,
      isLoggedIn: true,
    };
    saveActiveSession(superadminProfile);
    loginWithProfile(superadminProfile);
    router.push('/dashboard');
  };

  // --------------------------------------------------------------------------
  // Handle Phone Number OTP Login (Part 8 requirement)
  // --------------------------------------------------------------------------
  const handleRequestPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();

    const cleanInput = phoneNumber.trim();
    if (!cleanInput) {
      setError('Nomor handphone wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      // Cek apakah nomor terdaftar di tatadana_registered_users
      const existingUser = findUserByIdentifier(cleanInput);

      if (!existingUser) {
        setNotRegisteredWarning('⚠️ Akun belum terdaftar. Anda harus mendaftar dan memverifikasi akun terlebih dahulu sebelum bisa masuk.');
        setLoading(false);
        return;
      }

      if (!existingUser.isVerified) {
        setNotRegisteredWarning('⚠️ Akun ini belum diverifikasi. Silakan lakukan pendaftaran ulang dan verifikasi OTP sebelum bisa masuk.');
        setLoading(false);
        return;
      }

      await new Promise((r) => setTimeout(r, 400));
      setPhoneStep(2);
      setOtpSentMessage(`Kode OTP 6-digit dikirim via WhatsApp ke ${existingUser.kontak || cleanInput}. (Demo OTP: 123456)`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    setLoading(true);

    try {
      const code = otpCode.trim();
      if (!code) {
        setError('Silakan masukkan 6-digit kode OTP.');
        setLoading(false);
        return;
      }
      if (code !== '123456') {
        setError('❌ Kode OTP tidak valid. Silakan gunakan kode verifikasi demo: 123456');
        setLoading(false);
        return;
      }

      const existingUser = findUserByIdentifier(phoneNumber.trim()) || {
        nama: 'Pengguna TataDana',
        kontak: '+62 812-3456-7890',
        email: 'user@tatadana.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser',
        statusPaket: 'Pro Lifetime (Rp99k)',
        isVerified: true,
      };

      const userProfile = {
        nama: existingUser.nama,
        kontak: existingUser.kontak,
        email: existingUser.email,
        avatarUrl: existingUser.avatarUrl,
        statusPaket: existingUser.statusPaket || 'Pro Lifetime (Rp99k)',
        isLoggedIn: true,
      };

      saveActiveSession(userProfile);
      loginWithProfile(userProfile);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Kode OTP tidak valid.');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Handle Google OAuth Login
  // --------------------------------------------------------------------------
  const handleGoogleLogin = async () => {
    clearAlerts();
    setLoading(true);
    try {
      const googleProfile = {
        nama: 'Budi Santoso (Google)',
        kontak: '+62 812-8899-0011',
        email: 'budi.santoso@tatadana.id',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GoogleBudi',
        statusPaket: 'Pro Lifetime (Rp99k)',
        isLoggedIn: true,
      };
      saveActiveSession(googleProfile);
      loginWithProfile(googleProfile);
      router.push('/dashboard');
    } catch (err: any) {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Handle Sandbox Demo Login
  // --------------------------------------------------------------------------
  const handleSandboxLogin = () => {
    clearAlerts();
    setLoading(true);
    try {
      const sandboxProfile = {
        nama: 'Pengguna TataDana (Sandbox)',
        kontak: '+62 812-3456-7890',
        email: 'user@tatadana.com',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaSandbox',
        statusPaket: 'Pro Lifetime (Rp99k)',
        isLoggedIn: true,
      };
      saveActiveSession(sandboxProfile);
      loginWithProfile(sandboxProfile);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail: string) => {
    clearAlerts();
    setLoading(true);
    try {
      const isUser = demoEmail.includes('user');
      const demoProfile = {
        nama: isUser ? 'Budi Pratama' : 'Super Admin TataDana',
        kontak: '+62 812-3456-7890',
        email: demoEmail,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${isUser ? 'BudiPratama' : 'TataDanaAdmin'}`,
        statusPaket: 'Pro Lifetime (Rp99k)',
        isLoggedIn: true,
      };
      saveActiveSession(demoProfile);
      loginWithProfile(demoProfile);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Lupa Password Modal Handlers
  // --------------------------------------------------------------------------
  const openForgotPassword = (prefillEmail?: string) => {
    setForgotStep(1);
    setForgotContact(prefillEmail || email || '');
    setForgotOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError(null);
    setForgotSuccess(null);
    setShowForgotModal(true);
  };

  const handleSendRecoveryOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const contact = forgotContact.trim();
    if (!contact) {
      setForgotError('Masukkan email atau nomor kontak terdaftar.');
      return;
    }

    const user = findUserByIdentifier(contact);
    if (!user) {
      setForgotError('Akun dengan email/kontak tersebut tidak ditemukan dalam sistem terdaftar.');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      setForgotLoading(false);
      setForgotStep(2);
    }, 400);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotOtp.trim() !== '123456') {
      setForgotError('❌ Kode OTP salah. Gunakan kode pemulihan demo: 123456');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setForgotLoading(true);
    setTimeout(() => {
      const ok = updateUserPasswordByIdentifier(forgotContact, newPassword);
      setForgotLoading(false);
      if (ok) {
        setForgotSuccess('✅ Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.');
        setTimeout(() => {
          setShowForgotModal(false);
          setPassword(newPassword);
          setSuccessNotice('Kata sandi baru siap digunakan. Silakan klik tombol Masuk.');
        }, 1800);
      } else {
        setForgotError('Gagal memperbarui kata sandi. Silakan coba lagi.');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex font-sans">
      {/* LEFT 40% BRANDING PANEL (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white p-12 flex-col justify-between relative overflow-hidden shadow-2xl">
        {/* Ambient background blur elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              TataDana
            </span>
          </Link>
          <div className="mt-3">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-white border border-white/20">
              SaaS Finansial Indonesia
            </span>
          </div>
        </div>

        {/* Main Branding Copy */}
        <div className="relative z-10 space-y-6 my-auto py-8">
          <div className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
              Keuanganmu. <br />
              <span className="text-amber-200">Terkontrol.</span>
            </h1>
            <p className="text-sm text-orange-100/90 leading-relaxed max-w-sm">
              Kelola seluruh transaksi keuangan harian tanpa ribet. Catat otomatis dari chat Telegram, scan struk dengan AI Vision, dan monitor arus kas Anda.
            </p>
          </div>

          {/* Key Feature Bullets */}
          <div className="space-y-3 text-xs text-white/90 pt-2">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15">
              <Send className="w-4 h-4 text-amber-200 shrink-0" />
              <span>Pencatatan natural language langsung dari Telegram</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15">
              <ReceiptText className="w-4 h-4 text-amber-200 shrink-0" />
              <span>AI Vision OCR deteksi otomatis item struk belanja</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/15">
              <PieChart className="w-4 h-4 text-amber-200 shrink-0" />
              <span>Evaluasi budget real-time & peringatan batas 80%</span>
            </div>
          </div>
        </div>

        {/* Footer Guarantee */}
        <div className="relative z-10 text-[11px] text-orange-100/80 flex items-center gap-2 border-t border-white/20 pt-4">
          <ShieldCheck className="w-4 h-4 text-amber-200 shrink-0" />
          <span>Keamanan setara standar enkripsi UU PDP & ISO-27001</span>
        </div>
      </div>

      {/* RIGHT 60% FORM PANEL */}
      <div className="w-full lg:w-[60%] flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 bg-[#121215] overflow-y-auto">
        <div className="max-w-md w-full mx-auto space-y-6">
          {/* Mobile Brand Logo */}
          <div className="lg:hidden text-center mb-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
              <div className="w-9 h-9 rounded-xl bg-orange-950/40 border border-orange-800/60 flex items-center justify-center text-orange-400">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Tata<span className="text-orange-500">Dana</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400">Keuanganmu. Terkontrol.</p>
          </div>

          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Selamat Datang Kembali
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Masuk untuk mengelola keuangan cerdas dan integrasi Telegram Bot Anda.
            </p>
          </div>

          {/* Active Session Notification */}
          {profile && profile.isLoggedIn && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-200 text-xs flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">
                  <strong className="text-emerald-300">Sesi Tersimpan:</strong> {profile.nama} ({profile.kontak || profile.email})
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link
                  href="/dashboard"
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition"
                >
                  Ke Dashboard &rarr;
                </Link>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] transition"
                >
                  Ganti
                </button>
              </div>
            </div>
          )}

          {/* Success Notice */}
          {successNotice && (
            <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Requirement 4: Akun Belum Terdaftar Warning Banner (Oranye/Kuning) */}
          {notRegisteredWarning && (
            <div className="p-4 rounded-xl bg-amber-950/50 border-2 border-amber-600 text-amber-200 text-xs space-y-2.5 shadow-lg shadow-amber-950/30">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <span className="font-semibold leading-relaxed">{notRegisteredWarning}</span>
              </div>
              <div className="pt-1 flex justify-end">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-xs hover:from-orange-600 hover:to-amber-600 transition shadow"
                >
                  <span>Daftar Akun Baru Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* Requirement 3: Password Salah / General Error Banner (Merah Pekat) */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/60 border-2 border-rose-600 text-rose-200 text-xs flex items-start gap-2.5 shadow-lg shadow-rose-950/30">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
              <div className="flex-1 space-y-1">
                <div className="font-bold text-rose-300">{error}</div>
                {passwordError && (
                  <button
                    type="button"
                    onClick={() => openForgotPassword(email)}
                    className="text-[11px] text-orange-400 hover:text-orange-300 underline font-semibold mt-1 inline-block"
                  >
                    Buka Pemulihan Kata Sandi &rarr;
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-zinc-800 bg-[#18181b] hover:bg-zinc-800 text-zinc-100 font-bold text-xs sm:text-sm shadow-xs hover:border-zinc-700 transition active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Masuk dengan Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zinc-800 w-full" />
            <span className="bg-[#121215] px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              atau pilih metode
            </span>
          </div>

          {/* Method Switcher Tabs: Email vs Phone OTP */}
          <div className="flex rounded-xl bg-zinc-900 border border-zinc-800 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); clearAlerts(); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMethod === 'email'
                  ? 'bg-[#18181b] text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Email & Kata Sandi
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); clearAlerts(); }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                loginMethod === 'phone'
                  ? 'bg-[#18181b] text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Nomor Handphone (OTP)
            </button>
          </div>

          {/* Login Form: Email & Password */}
          {loginMethod === 'email' && (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearAlerts(); }}
                    placeholder="user@tatadana.com"
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:bg-[#18181b] focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Kata Sandi
                  </label>
                  {/* Requirement 2: Link Lupa Password di dekat input kata sandi */}
                  <button
                    type="button"
                    onClick={() => openForgotPassword(email)}
                    className="text-[11px] font-semibold text-orange-400 hover:text-orange-300 transition hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  {/* Requirement 3: Highlight border merah pada input kata sandi jika salah */}
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearAlerts(); }}
                    placeholder="••••••••"
                    className={`w-full bg-[#18181b] rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 transition-all ${
                      passwordError
                        ? 'border-2 border-rose-500 ring-2 ring-rose-500/20 focus:outline-none focus:border-rose-500'
                        : 'border border-zinc-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Memproses Masuk...' : 'Masuk ke Dashboard'}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleQuickSuperadminLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-500 hover:brightness-110 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-600/30 active:scale-95 disabled:opacity-50 border border-amber-400/40 cursor-pointer"
                >
                  <span>👑 Masuk sebagai Superadmin (PRO VIP)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Login Form: Phone OTP */}
          {loginMethod === 'phone' && (
            <div className="space-y-4">
              {phoneStep === 1 && (
                <form className="space-y-4" onSubmit={handleRequestPhoneOtp}>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Nomor Handphone Terdaftar
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                        +62
                      </span>
                      <input
                        type="tel"
                        required
                        placeholder="81234567890"
                        value={phoneNumber.replace(/^\+62|^0/, '')}
                        onChange={(e) => { setPhoneNumber(e.target.value); clearAlerts(); }}
                        className="w-full pl-12 pr-4 py-2.5 text-xs sm:text-sm text-zinc-100 bg-[#18181b] border border-zinc-800 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-[#18181b] focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-zinc-400 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-orange-400 shrink-0" />
                      <span>Nomor yang sama dengan akun Telegram Anda</span>
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? 'Mengirim OTP...' : 'Kirim Kode OTP'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {phoneStep === 2 && (
                <form className="space-y-4" onSubmit={handleVerifyPhoneOtp}>
                  {otpSentMessage && (
                    <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs flex items-start gap-2">
                      <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{otpSentMessage}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Kode Verifikasi OTP (6 Digit)
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-[#18181b] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-3 text-base font-mono tracking-widest text-center text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:bg-[#18181b] focus:ring-2 focus:ring-orange-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPhoneStep(1)}
                      className="w-1/3 py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs transition"
                    >
                      Ubah No HP
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otpCode.length < 6}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? 'Memverifikasi...' : 'Verifikasi & Masuk'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Access Buttons */}
          <div className="pt-4 border-t border-zinc-800 space-y-3">
            <button
              type="button"
              onClick={handleSandboxLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 font-bold text-xs transition active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              <span>Akses Cepat Mode Sandbox (1-Klik Masuk Demo)</span>
            </button>

            <p className="text-xs text-zinc-400 font-semibold text-center flex items-center justify-center gap-1.5">
              <span>Akun Simulasi:</span>
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemo('user@tatadana.com')}
                disabled={loading}
                className="p-2.5 text-xs bg-[#18181b] hover:bg-zinc-800 hover:border-orange-500/40 border border-zinc-800 rounded-xl text-zinc-300 text-left transition"
              >
                <div className="font-bold text-zinc-100">User Demo</div>
                <div className="text-[10px] text-zinc-400">user@tatadana.com</div>
              </button>

              <button
                type="button"
                onClick={handleQuickSuperadminLogin}
                disabled={loading}
                className="p-2.5 text-xs bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-500/60 border border-amber-900/50 rounded-xl text-zinc-300 text-left transition"
              >
                <div className="font-bold text-amber-300 flex items-center gap-1">
                  <span>👑 Super Admin</span>
                  <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded">PRO VIP</span>
                </div>
                <div className="text-[10px] text-amber-200/70 truncate">shopnoure1619@gmail.com</div>
              </button>
            </div>
          </div>

          {/* Toggle to Register */}
          <p className="text-center text-xs text-zinc-400 pt-2">
            Belum memiliki akun TataDana?{' '}
            <Link href="/register" className="font-bold text-orange-400 hover:text-orange-300 hover:underline">
              Daftar gratis sekarang →
            </Link>
          </p>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* REQUIREMENT 2: MODAL INTERAKTIF PEMULIHAN KATA SANDI (LUPA PW)         */}
      {/* ====================================================================== */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#121215] border border-zinc-800 rounded-2xl shadow-2xl p-6 relative space-y-5">
            {/* Close Button */}
            <button
              onClick={() => setShowForgotModal(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/50 text-orange-400 border border-orange-800/60">
                  Pemulihan Akun
                </span>
                <span className="text-xs text-zinc-500">Langkah {forgotStep} dari 2</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Pemulihan Kata Sandi
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                {forgotStep === 1
                  ? 'Masukkan email atau nomor kontak terdaftar untuk menerima kode OTP pemulihan.'
                  : 'Masukkan kode OTP 6-digit dan tetapkan kata sandi baru Anda.'}
              </p>
            </div>

            {/* Modal Alerts */}
            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}
            {forgotSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* Step 1: Input Email / Contact */}
            {forgotStep === 1 && (
              <form onSubmit={handleSendRecoveryOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email atau Nomor Kontak Terdaftar
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: user@tatadana.com atau 081234567890"
                    value={forgotContact}
                    onChange={(e) => setForgotContact(e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                  <p className="text-[11px] text-zinc-500 mt-1">
                    Gunakan email atau nomor WhatsApp yang telah terverifikasi di akun Anda.
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Kirim Kode OTP Pemulihan</span>
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: OTP + New Password */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* OTP Demo Callout */}
                <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/40 text-xs text-orange-200 flex items-start gap-2.5">
                  <KeyRound className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-orange-300">Kode OTP Demo Tersedia:</span>
                    <span className="ml-1 text-zinc-300">Gunakan kode <strong className="text-white font-mono bg-black/40 px-1.5 py-0.5 rounded border border-orange-500/40">123456</strong> untuk simulasi verifikasi.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Kode OTP 6-Digit
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-center font-mono text-base font-bold tracking-widest text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Ulangi kata sandi baru"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="flex gap-2 justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    &larr; Ubah Email/Kontak
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>Simpan Kata Sandi Baru</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
