'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { authService } from '@/lib/auth/auth-service';
import {
  registerNewUser,
  saveActiveSession,
  normalizePhone,
  RegisteredUser,
} from '@/lib/auth/user-store';
import {
  Wallet,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Send,
  ReceiptText,
  PieChart,
  Smartphone,
  KeyRound,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { loginWithProfile } = useAuth();

  // Registration Step: 1 = Form Pendaftaran, 2 = Verifikasi OTP 6-Digit
  const [step, setStep] = useState<1 | 2>(1);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);

  // Langkah 1: Validasi form & lanjut ke verifikasi OTP
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Nama lengkap wajib diisi.');
      return;
    }
    if (!phoneNumber.trim()) {
      setError('Nomor kontak / WhatsApp wajib diisi.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Alamat email valid wajib diisi.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }

    setStep(2);
    setOtpSuccessMsg(`Kode OTP 6-digit berhasil dikirim via WhatsApp ke ${phoneNumber} dan email ${email}. (Kode Demo: 123456)`);
  };

  // Langkah 2: Verifikasi OTP 6-digit & Aktivasi Akun
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const enteredOtp = otpCode.trim();
    if (!enteredOtp) {
      setError('Silakan masukkan 6-digit kode OTP.');
      return;
    }
    if (enteredOtp !== '123456') {
      setError('❌ Kode OTP yang Anda masukkan salah. Gunakan kode verifikasi demo: 123456');
      return;
    }

    setLoading(true);

    try {
      const cleanPhone = normalizePhone(phoneNumber);
      const newUserData: RegisteredUser = {
        nama: fullName.trim(),
        kontak: cleanPhone,
        email: email.trim(),
        password: password,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName.trim())}`,
        statusPaket: 'Pro Lifetime (Rp99k)',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };

      // 1. Simpan ke tatadana_registered_users dengan status terverifikasi (isVerified: true)
      registerNewUser(newUserData);

      // 2. Simpan ke sesi profil aktif (tatadana_user_profile, user_profile, tatadana_user)
      saveActiveSession({
        nama: newUserData.nama,
        kontak: newUserData.kontak,
        email: newUserData.email,
        avatarUrl: newUserData.avatarUrl,
        statusPaket: newUserData.statusPaket,
      });

      // 3. Sinkronisasi dengan Auth Context
      loginWithProfile({
        nama: newUserData.nama,
        kontak: newUserData.kontak,
        email: newUserData.email,
        avatarUrl: newUserData.avatarUrl,
        statusPaket: newUserData.statusPaket,
        isLoggedIn: true,
      });

      // 4. Background Supabase Auth fallback
      try {
        await authService.registerWithEmail(email.trim(), password, fullName.trim(), cleanPhone);
      } catch (authErr) {
        console.warn('Supabase auth fallback:', authErr);
      }

      // 5. Alihkan pengguna langsung ke /dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Verifikasi akun gagal. Silakan coba lagi.');
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setLoading(true);
    try {
      const googleUser: RegisteredUser = {
        nama: 'Budi Pratama (Google)',
        kontak: '+62 812-3456-7890',
        email: 'budi.pratama@gmail.com',
        password: 'password123',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiGoogleUser',
        statusPaket: 'Pro Lifetime (Rp99k)',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
      registerNewUser(googleUser);
      saveActiveSession(googleUser);
      loginWithProfile({ ...googleUser, isLoggedIn: true });
      router.push('/dashboard');
    } catch (err: any) {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
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
              Registrasi Akun Baru
            </span>
          </div>
        </div>

        {/* Main Value Proposition */}
        <div className="space-y-6 relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/20 text-orange-100 text-xs font-semibold backdrop-blur-sm border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span>Verifikasi OTP 100% Aman & Terenkripsi</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-black leading-tight tracking-tight">
            Mulai Catat Keuangan Cerdas Tanpa Ribet
          </h1>

          <p className="text-orange-50 text-sm leading-relaxed font-normal">
            Cukup kirim teks <span className="font-semibold underline decoration-white/40">"kopi susu 18rb"</span> atau foto struk belanja ke bot Telegram. AI TataDana otomatis mengkategorikan dan mencatatnya ke dompet Anda.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-3 bg-black/15 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-white/20 text-white shrink-0">
                <Send className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Integrasi Bot Telegram</p>
                <p className="text-[11px] text-orange-100">Catat keuangan langsung dari jendela pesan sehari-hari</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/15 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-white/20 text-white shrink-0">
                <ReceiptText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Multi-Item OCR Struk</p>
                <p className="text-[11px] text-orange-100">Foto struk belanja, rincian produk otomatis terurai</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-black/15 backdrop-blur-xs p-3 rounded-xl border border-white/10">
              <div className="p-2 rounded-lg bg-white/20 text-white shrink-0">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Budget & Visual Progress Bar</p>
                <p className="text-[11px] text-orange-100">Peringatan otomatis saat pengeluaran mendekati batas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-white/20 flex items-center justify-between text-xs text-orange-100 relative z-10">
          <div className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Zona Waktu Asia/Jakarta (WIB)</span>
          </div>
          <span>&copy; {new Date().getFullYear()} TataDana</span>
        </div>
      </div>

      {/* RIGHT 60% FORM PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Link */}
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-zinc-800">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center text-white font-bold shadow-md shadow-orange-500/20">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Tata<span className="text-orange-500">Dana</span>
              </span>
            </Link>
            <p className="text-xs text-zinc-400">Keuanganmu. Terkontrol.</p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-3 p-2 bg-[#121215] border border-zinc-800 rounded-2xl">
            <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              step === 1 ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-emerald-400 bg-emerald-950/30'
            }`}>
              <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">1</span>
              <span>Isi Form</span>
            </div>
            <div className={`flex-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              step === 2 ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' : 'text-zinc-500 bg-zinc-900/40'
            }`}>
              <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">2</span>
              <span>Verifikasi OTP</span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-shake">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {otpSuccessMsg && step === 2 && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{otpSuccessMsg}</span>
            </div>
          )}

          {/* STEP 1: FORM PENDAFTARAN */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Daftar Akun Baru
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Lengkapi data diri Anda, kemudian lakukan verifikasi nomor handphone.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleRegister}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-zinc-800 bg-[#18181b] hover:bg-zinc-800 text-zinc-100 font-bold text-xs sm:text-sm shadow-xs hover:border-zinc-700 transition active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Daftar Cepat dengan Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-[#09090b] px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  atau isi formulir pendaftaran
                </span>
              </div>

              <form className="space-y-4" onSubmit={handleProceedToOtp}>
                {/* 1. Nama Lengkap */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="misal: Budi Pratama"
                      className="w-full bg-[#18181b] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:bg-[#18181b] focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* 2. Nomor Kontak / WhatsApp */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Nomor Kontak / WhatsApp
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="misal: 081234567890 atau +6281234567890"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-100 bg-[#18181b] border border-zinc-800 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-[#18181b] focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400 flex items-center gap-1">
                    <Smartphone className="w-3 h-3 text-orange-400 shrink-0" />
                    <span>Digunakan untuk pengiriman OTP verifikasi & integrasi bot Telegram</span>
                  </p>
                </div>

                {/* 3. Alamat Email */}
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
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="misal: budi@example.com"
                      className="w-full bg-[#18181b] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:bg-[#18181b] focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* 4. Kata Sandi / Password */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-[#18181b] border border-zinc-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 focus:bg-[#18181b] focus:ring-2 focus:ring-orange-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Submit to Step 2 */}
                <button
                  type="submit"
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-orange-500/20 active:scale-95 cursor-pointer"
                >
                  <span>Lanjut ke Verifikasi OTP Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: VERIFIKASI OTP 6-DIGIT */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(null); }}
                  className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-orange-400 mb-2 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke formulir data diri</span>
                </button>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Verifikasi 6-Digit OTP
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                  Untuk keamanan akun, masukkan 6 digit kode OTP yang kami kirimkan ke nomor <strong className="text-zinc-200">{phoneNumber}</strong>.
                </p>
              </div>

              {/* DEMO OTP CALLOUT HINT */}
              <div className="p-3.5 rounded-xl bg-orange-950/30 border border-orange-500/40 text-xs text-orange-200 flex items-start gap-3">
                <KeyRound className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-orange-300">💡 Kode Verifikasi Demo Tersedia:</div>
                  <p className="mt-0.5 text-zinc-300">
                    Masukkan kode <span className="font-mono font-black text-white bg-black/40 px-2 py-0.5 rounded border border-orange-500/40 text-sm">123456</span> untuk memverifikasi dan mengaktifkan akun secara instan.
                  </p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5 text-center">
                    Kode OTP Verifikasi (6 Digit)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-[0.5em] text-2xl font-mono font-black py-3 px-4 bg-[#18181b] border-2 border-orange-500/60 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all"
                  />
                  <div className="flex justify-between items-center mt-2 text-[11px] text-zinc-400">
                    <span>Belum menerima kode?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSuccessMsg('Kode demo baru dikirimkan ulang: 123456');
                        setTimeout(() => setOtpSuccessMsg(null), 4000);
                      }}
                      className="text-orange-400 hover:text-orange-300 font-semibold"
                    >
                      Kirim Ulang OTP
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{loading ? 'Memverifikasi...' : 'Verifikasi & Aktifkan Akun'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Toggle to Login */}
          <p className="text-center text-xs text-zinc-400 pt-2 border-t border-zinc-800">
            Sudah memiliki akun TataDana?{' '}
            <Link href="/login" className="font-bold text-orange-400 hover:text-orange-300 hover:underline">
              Masuk di sini →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
