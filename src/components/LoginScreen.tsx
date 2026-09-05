import React, { useState, useRef } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  LogIn,
  Info,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
  FileText,
  Printer,
  Building2,
  ArrowRight,
  MapPin,
  Phone,
  KeyRound,
  CheckCircle2,
  FolderLock,
  Calendar,
  Globe,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Send,
  Database,
  Sparkles,
} from 'lucide-react';
import { UserSession, ProfilRt } from '../types';
import { BatikLogo } from './BatikLogo';
import { loginWithSupabase } from '../services/supabaseAuth';

interface LoginScreenProps {
  profilRt: ProfilRt;
  onLoginSuccess: (session: UserSession) => void;
  onOpenAndroidApk?: () => void;
  onOpenShareOnline?: () => void;
  isSupabaseConnected?: boolean;
  tablesMissing?: boolean;
  onOpenSupabaseModal?: () => void;
  onOpenAiModal?: () => void;
  totalWarga?: number;
  totalKk?: number;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  profilRt,
  onLoginSuccess,
  onOpenAndroidApk,
  onOpenShareOnline,
  isSupabaseConnected = false,
  tablesMissing = false,
  onOpenSupabaseModal,
  onOpenAiModal,
  totalWarga = 25,
  totalKk = 9,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quickCopied, setQuickCopied] = useState(false);

  const loginCardRef = useRef<HTMLDivElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Canonical online URL for public access
  const appOnlineUrl =
    typeof window !== 'undefined' && window.location.origin.includes('run.app')
      ? window.location.origin
      : 'https://ais-pre-s6own22pswpzsw5acwwovb-454559885813.asia-east1.run.app';

  const handleQuickCopyLink = () => {
    navigator.clipboard.writeText(appOnlineUrl);
    setQuickCopied(true);
    setTimeout(() => setQuickCopied(false), 2500);
  };

  const shareText = `Website Resmi RT ${profilRt.nomorRt || '02'} / RW ${profilRt.nomorRw || '04'} Gasem Raya: ${appOnlineUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const scrollToLogin = () => {
    if (loginCardRef.current) {
      loginCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 400);
    }
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMessage('Silakan masukkan username atau email Anda');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Silakan masukkan password Anda');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithSupabase(cleanUsername, cleanPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        return;
      }

      // Fallback transisi kredensial resmi (termasuk gasem0204)
      if (cleanUsername.toLowerCase() === 'gasemraya02' && (cleanPassword === 'gasem0204' || cleanPassword === '0204' || cleanPassword === 'adminrt02')) {
        const session: UserSession = {
          nik: 'gasemraya02',
          nama: 'GASEM RAYA RT 02',
          role: 'admin',
          jabatan: 'Ketua RT (Admin RT 02)',
          noKk: '3276010101100002',
          alamat: 'Jl. Gasem Raya RT 02 / RW 04, Kel. Tlogosari Wetan, Kec. Pedurungan, Kota Semarang 50196',
          noHp: profilRt.nomorKontak || '0812-3456-7890',
          loginAt: new Date().toISOString(),
        };
        onLoginSuccess(session);
        return;
      }

      setErrorMessage(res.error || 'Username atau password salah. Silakan periksa kembali akun login Anda.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menghubungi server autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentDateFormatted = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-screen w-full bg-[#fbf8f3] text-stone-900 font-sans antialiased flex flex-col">
      {/* 1. TOP HEADER / BILAH UTAMA HALAMAN DEPAN */}
      <header className="sticky top-0 z-40 w-full bg-[#271207]/95 backdrop-blur-md text-amber-100 border-b border-amber-600/30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Logo & Identitas RT */}
          <div className="flex items-center gap-3">
            <BatikLogo config={profilRt.logoConfig} size="md" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold tracking-wider text-amber-200 uppercase font-serif">
                  RT {profilRt.nomorRt || '02'} / RW {profilRt.nomorRw || '04'} Gasem Raya
                </span>
                <span className="hidden md:inline-block text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-medium">
                  Portal Resmi
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 hidden sm:block">
                Kel. {profilRt.desaKelurahan || 'Tlogosari Wetan'}, Kec. {profilRt.kecamatan || 'Pedurungan'}, {profilRt.kotaKabupaten || 'Kota Semarang'}
              </p>
            </div>
          </div>

          {/* Quick Actions Header */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Bagikan Link Web Online Button */}
            {onOpenShareOnline ? (
              <button
                id="btn-header-share-online"
                onClick={onOpenShareOnline}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 transition-colors shadow-2xs cursor-pointer"
                title="Bagikan Tautan Website Online"
              >
                <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="hidden sm:inline">Link Online</span>
                <span className="sm:hidden">Link</span>
              </button>
            ) : (
              <button
                id="btn-header-share-online-copy"
                onClick={handleQuickCopyLink}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 transition-colors shadow-2xs cursor-pointer"
                title="Salin Link Website Online"
              >
                {quickCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="hidden sm:inline">Salin Link</span>
                    <span className="sm:hidden">Link</span>
                  </>
                )}
              </button>
            )}

            {/* APK Android Button */}
            {onOpenAndroidApk && (
              <button
                onClick={onOpenAndroidApk}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/40 transition-colors shadow-2xs"
                title="Panduan pasang aplikasi di Android (APK)"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pasang di HP (APK)</span>
              </button>
            )}

            {/* Asisten AI RT Button */}
            {onOpenAiModal && (
              <button
                onClick={onOpenAiModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Tanya Asisten Pintar RT Gasem Raya (Google Gemini AI)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span className="hidden sm:inline">Asisten AI</span>
              </button>
            )}

            {/* Supabase Cloud Status Button */}
            {onOpenSupabaseModal && (
              <button
                onClick={onOpenSupabaseModal}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors shadow-2xs cursor-pointer ${
                  isSupabaseConnected
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border-emerald-600/50'
                    : 'bg-stone-850/80 hover:bg-stone-800 text-stone-200 border-stone-600/50'
                }`}
                title={
                  isSupabaseConnected
                    ? 'Database Supabase Cloud Terhubung & Sinkron'
                    : 'Data tersimpan aman di perangkat (IndexedDB)'
                }
              >
                <Database className={`w-3.5 h-3.5 shrink-0 ${isSupabaseConnected ? 'text-emerald-400' : 'text-emerald-400'}`} />
                <span className="hidden md:inline">
                  {isSupabaseConnected ? 'Cloud Supabase' : 'Data Aman (Lokal)'}
                </span>
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-500'
                  }`}
                />
              </button>
            )}

            {/* Tombol Masuk ke Menu (Login) */}
            <button
              onClick={scrollToLogin}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-stone-950" />
              <span>Masuk ke Menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION & LOGIN CARD AREA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#271207] via-[#3a1a0b] to-[#1e0d05] text-amber-50 pt-8 sm:pt-12 pb-16 sm:pb-20 border-b-4 border-amber-600/40">
        {/* Subtle geometric batik backdrop */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:24px_24px]" />
        
        {/* Ambient warm glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Hero Text & Public Status */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-medium">
                <Calendar className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentDateFormatted}</span>
                <span className="text-amber-400">&bull;</span>
                <span className="font-semibold text-amber-300">Status: Halaman Depan (Log Out)</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-serif text-white tracking-tight leading-tight">
                Sistem Informasi & Administrasi{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
                  RT 02 Gasem Raya
                </span>
              </h1>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base text-amber-100/85 leading-relaxed max-w-2xl">
                Selamat datang di portal resmi rukun tetangga. Pusat pelayanan data warga, pembukuan kas keuangan terbuka, arsip dokumen peraturan, serta pencetakan surat pengantar resmi lingkungan RT 02 / RW 04 Gasem Raya.
              </p>

              {/* Tautan Web Online (Bisa Diakses Siapapun Melalui Internet) */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-900/50 via-stone-900/60 to-amber-950/60 border border-amber-400/40 text-xs shadow-lg backdrop-blur-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-amber-100 text-xs sm:text-sm">
                          Website Online & Siap Diakses di Internet
                        </span>
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          ONLINE
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200/70">
                        Bisa dibuka langsung oleh warga atau pengurus melalui browser HP & laptop
                      </p>
                    </div>
                  </div>
                </div>

                {/* Input Link Display & Copy Button */}
                <div className="flex items-center gap-2 bg-stone-950/80 p-2 rounded-xl border border-amber-500/30">
                  <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
                  <input
                    type="text"
                    readOnly
                    value={appOnlineUrl}
                    className="w-full bg-transparent text-[11px] sm:text-xs font-mono text-amber-200 outline-none select-all font-medium truncate"
                  />
                  <button
                    id="btn-hero-copy-online-link"
                    onClick={handleQuickCopyLink}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                      quickCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    }`}
                  >
                    {quickCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Direct Action Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-[11px] font-semibold border border-emerald-600/40 transition-colors shadow-2xs"
                  >
                    <Send className="w-3 h-3 text-emerald-300" />
                    <span>Kirim ke WhatsApp Warga</span>
                  </a>

                  {onOpenShareOnline && (
                    <button
                      onClick={onOpenShareOnline}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-amber-200 text-[11px] font-semibold border border-amber-400/30 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3 h-3 text-amber-300" />
                      <span>Opsi Berbagi</span>
                    </button>
                  )}

                  <a
                    href={appOnlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-amber-200 text-[11px] font-semibold border border-amber-400/30 transition-colors"
                  >
                    <span>Buka di Tab Baru</span>
                    <ExternalLink className="w-3 h-3 text-amber-300" />
                  </a>
                </div>
              </div>

              {/* Notice: Menu Terkunci / Diperlukan Login */}
              <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/30 text-xs text-amber-100/90 flex items-start gap-3 shadow-inner">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0 mt-0.5">
                  <FolderLock className="w-4.5 h-4.5" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-amber-200 text-sm flex items-center gap-1.5">
                    <span>Menu Sistem Terkunci</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-200">
                      Perlu Login
                    </span>
                  </p>
                  <p className="text-amber-200/80 leading-relaxed">
                    Untuk membuka menu Data Warga, Buku Kas, Surat Pengantar, AD/ART, dan mutasi kependudukan, Anda harus masuk (login) menggunakan akun resmi di panel sebelah.
                  </p>
                </div>
              </div>

              {/* Quick Stat Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="text-[11px] text-amber-200/70 uppercase tracking-wide block">
                    Warga Terdata
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-amber-200 font-mono">
                    {totalWarga} Jiwa
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                  <span className="text-[11px] text-amber-200/70 uppercase tracking-wide block">
                    Kepala Keluarga
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-amber-200 font-mono">
                    {totalKk} KK
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-amber-200/70 uppercase tracking-wide block">
                    Wilayah Layanan
                  </span>
                  <span className="text-sm font-bold text-amber-200 truncate block">
                    RT 02 / RW 04
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Integrated Login Card */}
            <div className="lg:col-span-5" ref={loginCardRef}>
              <div className="relative bg-[#fffdfa] rounded-2xl shadow-2xl border-2 border-amber-500/40 text-stone-900 overflow-hidden">
                
                {/* Header Card with Batik Accents */}
                <div className="px-6 pt-6 pb-5 bg-gradient-to-r from-[#2c1408] via-[#3e1d0d] to-[#250f05] text-amber-100 border-b border-amber-600/40 relative">
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow border border-amber-400/50 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide">
                        Masuk ke Menu Sistem
                      </h2>
                      <p className="text-xs text-amber-200/80">
                        Masukkan akun untuk membuka seluruh menu RT 02
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-4">
                  
                  {/* Alert Error */}
                  {errorMessage && (
                    <div
                      id="login-error-alert"
                      className="flex items-start gap-2.5 p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl animate-in fade-in"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Gagal Masuk</p>
                        <p className="mt-0.5">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Input Username */}
                    <div>
                      <label
                        htmlFor="input-username"
                        className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                      >
                        Username
                      </label>
                      <div className="relative">
                        <input
                          ref={usernameInputRef}
                          id="input-username"
                          type="text"
                          autoComplete="username"
                          value={username}
                          onChange={e => {
                            setUsername(e.target.value);
                            setErrorMessage(null);
                          }}
                          placeholder="Masukkan: gasemraya02"
                          className="w-full px-4 py-2.5 pl-10 text-sm font-medium bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                          required
                        />
                        <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Username resmi: <code className="font-bold text-amber-900 font-mono">gasemraya02</code>
                      </p>
                    </div>

                    {/* Input Password */}
                    <div>
                      <label
                        htmlFor="input-password"
                        className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                      >
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="input-password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          value={password}
                          onChange={e => {
                            setPassword(e.target.value);
                            setErrorMessage(null);
                          }}
                          placeholder="Masukkan password admin (min. 6 karakter)"
                          className="w-full px-4 py-2.5 pl-10 pr-10 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                          required
                        />
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
                          title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Sandi default pengurus: <code className="font-bold text-amber-900 font-mono">gasem0204</code> (min. 6 karakter)
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      id="btn-login-submit"
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl text-stone-950 font-bold text-sm shadow-md bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <LogIn className="w-4 h-4 text-stone-950" />
                      <span>Buka Kunci & Masuk ke Menu →</span>
                    </button>
                  </form>

                  {/* Keterangan Akun */}
                  <div className="pt-2">
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-stone-700 leading-relaxed flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                      <p>
                        Akses aman: Masuk menggunakan akun administrator RT 02 untuk membuka menu administrasi, kas, dan surat RT.
                      </p>
                    </div>
                  </div>

                  {/* Android App Button */}
                  {onOpenAndroidApk && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={onOpenAndroidApk}
                        className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Buka / Pasang di HP Android (APK)</span>
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. MENU PREVIEW (DAFTAR MENU YANG TERSEDIA SETELAH LOGIN) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3 text-amber-800" />
            <span>Daftar Menu Sistem Terkunci</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Menu yang Dapat Diakses Setelah Login
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Setelah Anda masuk ke sistem, seluruh fasilitas administrasi berikut akan otomatis terbuka dan siap dipergunakan:
          </p>
        </div>

        {/* 6 Feature Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Menu 1: Warga & KK */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors">
                Kependudukan & Kartu Keluarga
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pencatatan NIK, nomor KK, status warga (tetap, domisili, kontrak), kelompok keluarga, dan filter data warga terstruktur.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-amber-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={scrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 2: Kas Keuangan */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-900 transition-colors">
                Buku Kas Keuangan RT
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pencatatan iuran bulanan warga, rincian pengeluaran kas lingkungan, unggah foto kuitansi/nota, dan hitung saldo otomatis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={scrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 3: Cetak Surat & KK */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-blue-900 transition-colors">
                Layanan Cetak Surat & KK
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Penerbitan surat pengantar RT resmi berstempel dan cetak blangko Kartu Keluarga standar dinas siap cetak atau PDF.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-blue-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={scrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 4: Arsip Dokumen & AD/ART */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-purple-900 transition-colors">
                Arsip Dokumen & AD/ART
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Penyimpanan digital aturan tata tertib lingkungan RT 02, surat edaran, notulen rapat warga, serta buku panduan warga.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-purple-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={scrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 5: Mutasi Warga */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-rose-900 transition-colors">
                Mutasi Kependudukan
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pencatatan data dinamis warga: kelahiran anak, warga wafat, warga baru pindah masuk, dan warga pindah keluar dari RT 02.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-rose-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={scrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 6: Susunan Pengurus RT */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-teal-900 transition-colors">
                Struktur Organisasi Pengurus
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Daftar lengkap nama pengurus RT 02 (Ketua, Sekretaris, Bendahara, Seksi Keamanan, Seksi Kebersihan) dan nomor kontak.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-teal-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={scrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 4. PROFIL WILAYAH & INFORMASI LINGKUNGAN RT 02 */}
      <section className="bg-[#f4efe6] border-y border-stone-300/80 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>Wilayah Administratif RT 02</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                Rukun Tetangga 02 / Rukun Warga 04 Gasem Raya
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Wilayah rukun tetangga yang berkomitmen mewujudkan lingkungan yang aman, tentram, bersih, dan transparan dalam pengelolaan keuangan serta pelayanan warga.
              </p>
              
              <div className="space-y-2 pt-2 text-xs text-stone-800">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Kelurahan: <strong>{profilRt.desaKelurahan || 'Tlogosari Wetan'}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Kecamatan: <strong>{profilRt.kecamatan || 'Pedurungan'}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Kota / Provinsi: <strong>{profilRt.kotaKabupaten || 'Kota Semarang'}, {profilRt.provinsi || 'Jawa Tengah'}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Kontak Sekretariat RT: <strong>{profilRt.nomorKontak || '0812-3456-7890'}</strong></span>
                </div>
              </div>
            </div>

            {/* Pengurus Info Card */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-800" />
                <span>Pengurus Inti RT 02 Bertugas</span>
              </h4>
              <div className="divide-y divide-stone-100 text-xs text-stone-700">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-stone-500">Ketua RT 02:</span>
                  <span className="font-bold text-stone-900">{profilRt.namaKetuaRt || 'Bpk. Ahmad Sucipto'}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-stone-500">Sekretaris:</span>
                  <span className="font-bold text-stone-900">{profilRt.namaSekretaris || 'Bpk. Budi Santoso'}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-stone-500">Bendahara:</span>
                  <span className="font-bold text-stone-900">{profilRt.namaBendahara || 'Ibu Siti Rahmawati'}</span>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={scrollToLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Masuk untuk Kelola Data Lingkungan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER HALAMAN DEPAN */}
      <footer className="mt-auto bg-[#1b0c04] text-amber-200/70 py-8 px-4 sm:px-6 text-xs border-t border-amber-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <BatikLogo config={profilRt.logoConfig} size="sm" />
            <div>
              <p className="font-bold text-amber-100">
                Sistem Informasi Administrasi RT 02 Gasem Raya
              </p>
              <p className="text-[11px] text-amber-200/60">
                Rukun Tetangga 02 / Rukun Warga 04 &bull; Kel. {profilRt.desaKelurahan || 'Tlogosari Wetan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {onOpenAndroidApk && (
              <button
                onClick={onOpenAndroidApk}
                className="hover:text-amber-100 transition-colors flex items-center gap-1"
              >
                <Smartphone className="w-3 h-3" />
                <span>Pasang di HP (APK)</span>
              </button>
            )}
            <button
              onClick={scrollToLogin}
              className="hover:text-amber-100 transition-colors flex items-center gap-1 text-amber-300 font-semibold"
            >
              <LogIn className="w-3 h-3" />
              <span>Masuk Sistem</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
