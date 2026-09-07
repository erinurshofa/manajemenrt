import React, { useState, useRef } from 'react';
import { UserSession, ProfilRt, UserCredential, UserRole } from '../types';
import { loginWithSupabase } from '../services/supabaseAuth';
import { LoginHeader } from './login/LoginHeader';
import { LoginHeroBanner } from './login/LoginHeroBanner';
import { LoginFormCard } from './login/LoginFormCard';
import { LoginFeaturesShowcase } from './login/LoginFeaturesShowcase';

interface LoginScreenProps {
  profilRt: ProfilRt;
  onLoginSuccess: (session: UserSession) => void;
  onOpenAndroidApk?: () => void;
  onOpenShareOnline?: () => void;
  totalWarga?: number;
  totalKk?: number;
  credentials?: UserCredential[];
  onTambahCredential?: (cred: UserCredential) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  profilRt,
  onLoginSuccess,
  onOpenAndroidApk,
  onOpenShareOnline,
  totalWarga = 25,
  totalKk = 9,
  credentials,
  onTambahCredential,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quickCopied, setQuickCopied] = useState(false);

  // Keamanan Akses: Hanya jika basis data benar-benar kosong (0 akun) inisialisasi perdana dibuka
  const hasAccounts = Boolean(credentials && credentials.length > 0);

  const [setupNik, setSetupNik] = useState('');
  const [setupNama, setSetupNama] = useState('');
  const [setupPass, setSetupPass] = useState('');
  const [setupConfirm, setSetupConfirm] = useState('');
  const [setupRole, setSetupRole] = useState<UserRole>('ketua_rt');
  const [setupShowPass, setSetupShowPass] = useState(false);

  const loginCardRef = useRef<HTMLDivElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Canonical online URL for public access
  const appOnlineUrl =
    (typeof import.meta !== 'undefined' && (import.meta.env?.APP_URL || import.meta.env?.VITE_APP_URL)) ||
    (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
      ? window.location.origin
      : 'https://manajemenrt.vercel.app/');

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

    try {
      const res = await loginWithSupabase(cleanUsername, cleanPassword);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        return;
      }

      // 1. Cek terhadap daftar akun pengguna tersimpan di Database / IndexedDB
      if (credentials && credentials.length > 0) {
        const matched = credentials.find(
          c => c.nik.toLowerCase() === cleanUsername.toLowerCase() && c.password === cleanPassword
        );
        if (matched) {
          const session: UserSession = {
            nik: matched.nik,
            nama: matched.nama,
            role: matched.role,
            jabatan: matched.jabatan || 'Pengurus RT 02',
            alamat: `RT ${profilRt.nomorRt || '02'} / RW ${profilRt.nomorRw || '04'}, ${profilRt.desaKelurahan || 'Gasem Raya'}`,
            noHp: matched.noHp || profilRt.nomorKontak,
            loginAt: new Date().toISOString(),
          };
          onLoginSuccess(session);
          return;
        }
      }

      // 2. Cek variabel lingkungan .env opsional jika dikonfigurasi
      const envAdminUser = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_INITIAL_ADMIN_USER || import.meta.env?.VITE_ADMIN_USER)) || '';
      const envAdminPass = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_INITIAL_ADMIN_PASS || import.meta.env?.VITE_ADMIN_PASSWORD)) || '';
      if (envAdminUser && envAdminPass && cleanUsername.toLowerCase() === envAdminUser.toLowerCase() && cleanPassword === envAdminPass) {
        const session: UserSession = {
          nik: envAdminUser,
          nama: 'Administrator Sistem',
          role: 'developer',
          jabatan: 'System Administrator & Developer',
          alamat: `RT ${profilRt.nomorRt || '02'} / RW ${profilRt.nomorRw || '04'}, ${profilRt.desaKelurahan || 'Gasem Raya'}`,
          noHp: profilRt.nomorKontak,
          loginAt: new Date().toISOString(),
        };
        onLoginSuccess(session);
        return;
      }

      setErrorMessage('Username atau kata sandi tidak cocok. Silakan periksa kembali kredensial Anda.');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal memproses otentikasi masuk.');
    }
  };

  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNik = setupNik.trim();
    const cleanNama = setupNama.trim();
    const cleanPass = setupPass.trim();

    if (!cleanNik || !cleanNama || !cleanPass) {
      setErrorMessage('Semua bidang formulir wajib diisi.');
      return;
    }

    if (cleanPass.length < 4) {
      setErrorMessage('Kata sandi minimal 4 karakter demi keamanan.');
      return;
    }

    if (cleanPass !== setupConfirm.trim()) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok. Ulangi pengetikan.');
      return;
    }

    const newCred: UserCredential = {
      id: `cred-${Date.now()}`,
      nik: cleanNik,
      password: cleanPass,
      nama: cleanNama,
      role: setupRole,
      jabatan: setupRole === 'developer' ? 'Superadmin & System Engineer' : 'Ketua RT (Pimpinan)',
      noHp: profilRt.nomorKontak,
      createdAt: new Date().toISOString().split('T')[0],
    };

    if (onTambahCredential) {
      onTambahCredential(newCred);
    }

    const session: UserSession = {
      nik: newCred.nik,
      nama: newCred.nama,
      role: newCred.role,
      jabatan: newCred.jabatan || 'Pengurus RT 02',
      alamat: `RT ${profilRt.nomorRt || '02'} / RW ${profilRt.nomorRw || '04'}`,
      noHp: newCred.noHp,
      loginAt: new Date().toISOString(),
    };

    onLoginSuccess(session);
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-800 antialiased selection:bg-amber-500 selection:text-white">
      {/* 1. TOP STICKY BAR */}
      <LoginHeader
        profilRt={profilRt}
        onOpenAndroidApk={onOpenAndroidApk}
        onScrollToLogin={scrollToLogin}
      />

      {/* 2. HERO SECTION & LOGIN CARD AREA */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#271207] via-[#3a1a0b] to-[#1e0d05] text-amber-50 pt-8 sm:pt-12 pb-16 sm:pb-20 border-b-4 border-amber-600/40">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Hero Text & Public Links */}
            <LoginHeroBanner
              profilRt={profilRt}
              currentDateFormatted={currentDateFormatted}
              appOnlineUrl={appOnlineUrl}
              quickCopied={quickCopied}
              onQuickCopyLink={handleQuickCopyLink}
              whatsappUrl={whatsappUrl}
              onOpenShareOnline={onOpenShareOnline}
            />

            {/* Right Column: Integrated Login Card */}
            <LoginFormCard
              loginCardRef={loginCardRef}
              usernameInputRef={usernameInputRef}
              hasAccounts={hasAccounts}
              username={username}
              setUsername={setUsername}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              onSubmit={handleSubmit}
              setupNik={setupNik}
              setSetupNik={setSetupNik}
              setupNama={setupNama}
              setSetupNama={setSetupNama}
              setupPass={setupPass}
              setSetupPass={setSetupPass}
              setupConfirm={setupConfirm}
              setSetupConfirm={setSetupConfirm}
              setupRole={setupRole}
              setSetupRole={setSetupRole}
              setupShowPass={setupShowPass}
              setSetupShowPass={setSetupShowPass}
              onSetupSubmit={handleSetupSubmit}
              onOpenAndroidApk={onOpenAndroidApk}
            />
          </div>
        </div>
      </section>

      {/* 3. MENU PREVIEW & FEATURES SHOWCASE */}
      <LoginFeaturesShowcase
        profilRt={profilRt}
        onScrollToLogin={scrollToLogin}
        onOpenAndroidApk={onOpenAndroidApk}
      />
    </div>
  );
};
