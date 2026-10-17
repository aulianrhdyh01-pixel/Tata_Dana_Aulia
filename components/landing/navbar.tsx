'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, 
  X, 
  ArrowRight, 
  Bot,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [, setSyncTick] = useState(0);

  // Landing space modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isForgotPwModalOpen, setIsForgotPwModalOpen] = useState(false);
  const [loginContact, setLoginContact] = useState('user@tatadana.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [loginWarning, setLoginWarning] = useState('');
  const [loginPassErrorBorder, setLoginPassErrorBorder] = useState(false);

  // Forgot password flow states
  const [forgotTarget, setForgotTarget] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const { user, profile, logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleProfileUpdate = () => {
      setSyncTick((t) => t + 1);
    };
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('tatadana_profile_updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('tatadana_profile_updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const DEFAULT_USERS = [
    { nama: 'Pengguna TataDana', email: 'user@tatadana.com', kontak: '+62 812-3456-7890', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true },
    { nama: 'Budi Santoso', email: 'budi.santoso@tatadana.id', kontak: '+62 812-8899-0011', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiSantoso', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true },
    { nama: 'Super Admin TataDana', email: 'admin@tatadana.com', kontak: '+62 811-9988-7766', password: 'password123', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaAdmin', statusPaket: 'Pro Lifetime (Rp99k)', isVerified: true }
  ];

  const getRegisteredUsers = () => {
    try {
      const raw = localStorage.getItem('tatadana_registered_users');
      if (!raw) {
        localStorage.setItem('tatadana_registered_users', JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem('tatadana_registered_users', JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return parsed;
    } catch {
      return DEFAULT_USERS;
    }
  };

  const findUserByIdentifier = (identifier: string) => {
    const users = getRegisteredUsers();
    const idTrim = identifier.trim().toLowerCase();
    const digits = idTrim.replace(/\D/g, '');
    for (const u of users) {
      if (u.email && u.email.toLowerCase() === idTrim) return u;
      if (u.kontak) {
        if (u.kontak.toLowerCase() === idTrim) return u;
        const uDigits = u.kontak.replace(/\D/g, '');
        if (digits && digits.length >= 8 && uDigits.endsWith(digits.slice(-8))) return u;
      }
    }
    return null;
  };

  const clearLandingAlerts = () => {
    setLoginError('');
    setLoginWarning('');
    setLoginPassErrorBorder(false);
  };

  const handleLandingLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    clearLandingAlerts();

    const contact = loginContact.trim();
    const pass = loginPassword.trim();

    const matchedUser = findUserByIdentifier(contact);

    // Requirement 4: Akun belum terdaftar tidak boleh langsung masuk
    if (!matchedUser) {
      setLoginWarning('⚠️ Akun belum terdaftar. Anda harus mendaftar dan memverifikasi akun terlebih dahulu sebelum bisa masuk.');
      return;
    }

    // Requirement 4: Akun belum diverifikasi tidak boleh langsung masuk
    if (matchedUser.isVerified === false) {
      setLoginWarning('⚠️ Akun ini belum diverifikasi. Anda harus menyelesaikan verifikasi akun terlebih dahulu sebelum bisa masuk.');
      return;
    }

    // Requirement 3: Peringatan password salah & highlight border merah
    const expectedPass = matchedUser.password || 'password123';
    if (pass !== expectedPass) {
      setLoginError('❌ Kata sandi yang Anda masukkan salah. Silakan periksa kembali atau gunakan opsi Lupa Password.');
      setLoginPassErrorBorder(true);
      return;
    }

    // Login Sukses
    const userProfile = {
      nama: matchedUser.nama,
      kontak: matchedUser.kontak,
      email: matchedUser.email,
      avatarUrl: matchedUser.avatarUrl,
      statusPaket: matchedUser.statusPaket || 'Pro Lifetime (Rp99k)',
      isLoggedIn: true,
    };

    try {
      localStorage.setItem('tatadana_user_profile', JSON.stringify(userProfile));
      localStorage.setItem('user_profile', JSON.stringify(userProfile));
      localStorage.setItem('tatadana_user', JSON.stringify(userProfile));
      window.dispatchEvent(new Event('tatadana_profile_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {}

    setIsLoginModalOpen(false);
    window.location.href = '/dashboard';
  };

  const handleLandingDemoLogin = () => {
    const demoProfile = {
      nama: 'Pengguna TataDana (Demo)',
      kontak: '+62 812-3456-7890',
      email: 'user@tatadana.com',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TataDanaUser',
      statusPaket: 'Pro Lifetime (Rp99k)',
      isLoggedIn: true,
    };
    try {
      localStorage.setItem('tatadana_user_profile', JSON.stringify(demoProfile));
      localStorage.setItem('user_profile', JSON.stringify(demoProfile));
      localStorage.setItem('tatadana_user', JSON.stringify(demoProfile));
      window.dispatchEvent(new Event('tatadana_profile_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    setIsLoginModalOpen(false);
    window.location.href = '/dashboard';
  };

  const openForgotModalFromLogin = () => {
    setForgotTarget(loginContact);
    setForgotStep(1);
    setForgotOtp('');
    setForgotNewPass('');
    setForgotConfirmPass('');
    setForgotError('');
    setForgotSuccess('');
    setIsLoginModalOpen(false);
    setIsForgotPwModalOpen(true);
  };

  const handleSendRecoveryOtp = () => {
    setForgotError('');
    const target = forgotTarget.trim();
    if (!target) {
      setForgotError('Masukkan email atau nomor kontak terdaftar.');
      return;
    }
    const matched = findUserByIdentifier(target);
    if (!matched) {
      setForgotError('⚠️ Akun tidak ditemukan dalam sistem terdaftar.');
      return;
    }
    setForgotStep(2);
  };

  const handleSubmitResetPassword = () => {
    setForgotError('');
    const otp = forgotOtp.trim();
    const newP = forgotNewPass;
    const confP = forgotConfirmPass;

    if (otp !== '123456') {
      setForgotError('❌ Kode OTP salah. Gunakan kode pemulihan demo: 123456');
      return;
    }
    if (newP.length < 6) {
      setForgotError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newP !== confP) {
      setForgotError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    const users = getRegisteredUsers();
    const matched = findUserByIdentifier(forgotTarget.trim());
    if (matched) {
      for (let i = 0; i < users.length; i++) {
        if (
          (matched.email && users[i].email && users[i].email.toLowerCase() === matched.email.toLowerCase()) ||
          (matched.kontak && users[i].kontak && users[i].kontak === matched.kontak)
        ) {
          users[i].password = newP;
          break;
        }
      }
      try {
        localStorage.setItem('tatadana_registered_users', JSON.stringify(users));
      } catch {}

      setForgotSuccess('✅ Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.');
      setTimeout(() => {
        setIsForgotPwModalOpen(false);
        setLoginPassword(newP);
        setIsLoginModalOpen(true);
      }, 1600);
    }
  };

  const isLoggedIn = isMounted && (
    (profile && profile.isLoggedIn !== false && !!profile.nama) ||
    (user && !!user.id)
  );
  const displayName = profile?.nama || user?.full_name || 'Pengguna TataDana';
  const displayAvatar = profile?.avatarUrl || user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(displayName)}`;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {}
    try {
      localStorage.removeItem('tatadana_user_profile');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('tatadana_user');
    } catch (e) {}
    window.location.reload();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800 shadow-sm shadow-black/50'
          : 'bg-[#09090b]/60 backdrop-blur-sm border-b border-zinc-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition transform">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-100 flex items-center gap-1">
                Tata<span className="text-orange-500">Dana</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono -mt-1 tracking-wider uppercase">Fintech AI</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-300">
            <Link href="#fitur" className="hover:text-orange-400 transition">
              Fitur
            </Link>
            <Link href="#solusi" className="hover:text-orange-400 transition">
              Solusi
            </Link>
            <Link href="#simulator" className="hover:text-orange-400 transition flex items-center gap-1.5 text-zinc-200">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
              Live Simulator
            </Link>
            <Link href="#harga" className="hover:text-orange-400 transition">
              Harga
            </Link>
            <Link href="#faq" className="hover:text-orange-400 transition">
              FAQ
            </Link>
          </nav>

          {/* Action Buttons / User Profile Badge */}
          <div className="hidden md:flex items-center space-x-3.5">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                {/* Profile Badge (Foto Avatar & Nama Pengguna) */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner">
                  <div className="relative">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-7 h-7 rounded-full object-cover border border-orange-500 bg-zinc-800"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-900" />
                  </div>
                  <span className="text-xs font-bold text-zinc-100 max-w-[130px] truncate" title={displayName}>
                    {displayName}
                  </span>
                </div>

                {/* Tombol Masuk ke Dashboard */}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-semibold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition transform hover:-translate-y-0.5 flex items-center space-x-1.5"
                >
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Opsi Keluar / Logout */}
                <button
                  onClick={handleLogout}
                  title="Keluar / Logout"
                  className="text-xs font-semibold text-zinc-400 hover:text-rose-400 px-2.5 py-2 rounded-lg hover:bg-zinc-800/80 transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm font-semibold text-zinc-300 hover:text-white px-3.5 py-2 rounded-lg hover:bg-zinc-800 transition"
                >
                  Masuk
                </button>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition transform hover:-translate-y-0.5 flex items-center space-x-1.5"
                >
                  <span>Mulai Gratis Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121215] border-b border-zinc-800 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <Link
            href="#fitur"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800 hover:text-orange-400"
          >
            Fitur
          </Link>
          <Link
            href="#solusi"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800 hover:text-orange-400"
          >
            Solusi
          </Link>
          <Link
            href="#simulator"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-orange-400 hover:bg-zinc-800"
          >
            Live Simulator
          </Link>
          <Link
            href="#harga"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800 hover:text-orange-400"
          >
            Harga
          </Link>
          <Link
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-zinc-200 hover:bg-zinc-800 hover:text-orange-400"
          >
            FAQ
          </Link>
          <div className="pt-4 border-t border-zinc-800 flex flex-col space-y-2">
            {isLoggedIn ? (
              <>
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-8 h-8 rounded-full object-cover border border-orange-500 bg-zinc-800"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-100 truncate">{displayName}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{profile?.email || profile?.kontak || 'Terdaftar'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-xs text-rose-400 font-semibold px-2.5 py-1 rounded bg-rose-950/30 border border-rose-800/40"
                  >
                    Keluar
                  </button>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5"
                >
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full text-center py-2.5 rounded-xl border border-zinc-800 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
                >
                  Masuk
                </button>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold shadow-md shadow-orange-500/25 flex items-center justify-center gap-1.5"
                >
                  <span>Mulai Gratis Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal Masuk di Landing Space */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-md p-6 sm:p-7 relative shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <h3 className="text-xl font-extrabold text-zinc-100">
                  Tata<span className="text-orange-500">Dana</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="text-zinc-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 mb-4">
              Masuk langsung dari landing space untuk mengakses dashboard finansial Anda.
            </p>

            {/* Alert Box Password Salah (Merah) */}
            {loginError && (
              <div className="bg-rose-950/40 border border-rose-500/80 rounded-xl p-3 text-rose-300 text-xs sm:text-sm mb-4 leading-relaxed">
                {loginError}
              </div>
            )}

            {/* Alert Box Akun Belum Terdaftar / Belum Verif (Kuning/Oranye) */}
            {loginWarning && (
              <div className="bg-amber-950/40 border border-amber-500/80 rounded-xl p-3 text-amber-200 text-xs sm:text-sm mb-4 leading-relaxed">
                <div>{loginWarning}</div>
                <div className="mt-2.5">
                  <Link
                    href="/register"
                    className="inline-block px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition"
                  >
                    Daftar & Verifikasi Akun &rarr;
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleLandingLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Nomor HP atau Alamat Email
                </label>
                <input
                  type="text"
                  value={loginContact}
                  onChange={(e) => {
                    setLoginContact(e.target.value);
                    clearLandingAlerts();
                  }}
                  placeholder="user@tatadana.com atau 081234567890"
                  required
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-zinc-300">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={openForgotModalFromLogin}
                    className="text-xs font-semibold text-orange-400 hover:text-orange-300"
                  >
                    Lupa Password?
                  </button>
                </div>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    clearLandingAlerts();
                  }}
                  placeholder="••••••••••••"
                  required
                  className={`w-full bg-zinc-900 border rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none ${
                    loginPassErrorBorder
                      ? 'border-rose-500 ring-2 ring-rose-500/50'
                      : 'border-zinc-800 focus:border-orange-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition"
              >
                Masuk ke Dashboard &rarr;
              </button>

              <button
                type="button"
                onClick={handleLandingDemoLogin}
                className="w-full py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-orange-500/30 text-amber-300 text-xs font-semibold transition"
              >
                🚀 1-Click Masuk Demo Sandbox
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-zinc-800 text-center text-xs text-zinc-400">
              Belum punya akun?{' '}
              <Link href="/register" className="text-orange-400 hover:underline font-bold">
                Daftar gratis di sini
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lupa Password di Landing Space */}
      {isForgotPwModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#121215] border border-zinc-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-100">🔐 Pemulihan Kata Sandi</h3>
              <button
                type="button"
                onClick={() => setIsForgotPwModalOpen(false)}
                className="text-zinc-400 hover:text-white text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {forgotError && (
              <div className="bg-rose-950/40 border border-rose-500/80 rounded-xl p-3 text-rose-300 text-xs mb-3">
                {forgotError}
              </div>
            )}
            {forgotSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/80 rounded-xl p-3 text-emerald-300 text-xs mb-3">
                {forgotSuccess}
              </div>
            )}

            {forgotStep === 1 ? (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">
                  Masukkan Email atau Nomor Kontak terdaftar untuk menerima kode OTP pemulihan.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email atau Nomor Kontak Terdaftar
                  </label>
                  <input
                    type="text"
                    value={forgotTarget}
                    onChange={(e) => setForgotTarget(e.target.value)}
                    placeholder="user@tatadana.com atau 081234567890"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPwModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 text-zinc-300 text-xs hover:bg-zinc-800 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={handleSendRecoveryOtp}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition"
                  >
                    Kirim Kode OTP Pemulihan
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="bg-orange-950/30 border border-orange-500/40 rounded-xl p-2.5 text-amber-300 text-xs">
                  💡 <strong>Kode OTP Demo:</strong> Masukkan kode{' '}
                  <span className="bg-black/50 px-1.5 py-0.5 rounded font-mono font-bold text-white">
                    123456
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Kode OTP 6-Digit
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-center text-lg font-mono tracking-widest text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={forgotNewPass}
                    onChange={(e) => setForgotNewPass(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={forgotConfirmPass}
                    onChange={(e) => setForgotConfirmPass(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    &larr; Kembali
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitResetPassword}
                    className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition"
                  >
                    Simpan Kata Sandi Baru
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
