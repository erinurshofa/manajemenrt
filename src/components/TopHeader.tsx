import React from 'react';
import {
  Menu,
  Plus,
  Printer,
  Settings,
  Palette,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Globe,
  Database,
  Terminal,
} from 'lucide-react';
import { ProfilRt, UserSession } from '../types';
import { TabId } from './Sidebar';

interface TopHeaderProps {
  profilRt: ProfilRt;
  activeTab: TabId;
  onOpenAddWarga: () => void;
  onOpenSettings: () => void;
  onOpenCetakLaporan?: () => void;
  onToggleMobileMenu?: () => void;
  currentUser?: UserSession | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenThemeModal?: () => void;
  onOpenAndroidApk?: () => void;
  onOpenShareOnline?: () => void;
  isSupabaseConnected?: boolean;
  tablesMissing?: boolean;
  onOpenSupabaseModal?: () => void;
  onOpenAiModal?: () => void;
  onOpenDevTools?: () => void;
  isDeveloperUser?: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profilRt,
  activeTab,
  onOpenAddWarga,
  onOpenSettings,
  onOpenCetakLaporan,
  onToggleMobileMenu,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenThemeModal,
  onOpenAndroidApk,
  onOpenShareOnline,
  isSupabaseConnected = false,
  tablesMissing = false,
  onOpenSupabaseModal,
  onOpenAiModal,
  onOpenDevTools,
  isDeveloperUser = false,
}) => {
  const theme = profilRt.themeConfig || {
    preset: 'batik-soga',
    warnaUtama: '#c59239',
    warnaSidebar: '#27150c',
    warnaHeader: '#361e12',
    tampilkanMotifBatik: true,
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'warga':
        return 'Buku Induk Data Warga';
      case 'kk':
        return 'Daftar Kartu Keluarga';
      case 'kas':
        return 'Buku Kas & Pembukuan Keuangan RT';
      case 'dokumen':
        return 'Arsip Dokumen RT & Berkas AD / ART';
      case 'pengurus':
        return 'Nama & Susunan Struktur Pengurus RT';
      case 'laporan':
        return 'Rekapitulasi Kependudukan Bulanan';
      case 'mutasi':
        return 'Catatan Mutasi & Peristiwa Kependudukan';
      case 'pengguna':
        return 'Matriks Hak Akses Peran & Manajemen Pengguna';
    }
  };

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const isAdminOrPengurus =
    currentUser?.role &&
    (currentUser.role === 'admin' ||
      currentUser.role === 'pengurus' ||
      currentUser.role === 'developer' ||
      currentUser.role === 'ketua_rt' ||
      currentUser.role === 'sekretaris' ||
      currentUser.role === 'bendahara');

  const showDevButton = Boolean(
    onOpenDevTools && (isDeveloperUser || currentUser?.role === 'developer')
  );

  return (
    <header
      style={{ backgroundColor: theme.warnaHeader }}
      className="text-white px-3 sm:px-6 py-2.5 sm:py-3 shadow-md flex items-center justify-between gap-2 shrink-0 border-b border-amber-900/40 no-print"
    >
      {/* Kiri: Judul Halaman Aktif & Hamburger Mobile */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 -ml-1 text-amber-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base md:text-lg font-bold truncate leading-tight tracking-tight text-white drop-shadow-2xs">
              {getTabTitle()}
            </h1>
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
              RT 02 / RW 04
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-amber-200/80 truncate">
            {profilRt.namaRt} &bull; Periode {currentDate}
          </p>
        </div>
      </div>

      {/* Kanan: Aksi Cepat & Profil User */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Supabase Realtime Status Pill Button (Hanya tampil untuk Developer) */}
        {(isDeveloperUser || currentUser?.role === 'developer') && onOpenSupabaseModal && (
          <button
            id="btn-top-supabase-status"
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer border active:scale-95 ${
              isSupabaseConnected
                ? tablesMissing
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
            }`}
            title="Cek Status Database Cloud Supabase"
          >
            <Database
              className={`w-3.5 h-3.5 shrink-0 ${
                isSupabaseConnected
                  ? tablesMissing
                    ? 'text-amber-600 animate-pulse'
                    : 'text-emerald-600'
                  : 'text-rose-600'
              }`}
            />
            <span className="hidden xs:inline sm:inline">
              {isSupabaseConnected
                ? tablesMissing
                  ? 'Siapkan Tabel'
                  : 'Cloud Aktif'
                : 'Cloud Offline'}
            </span>
          </button>
        )}

        {/* Bagikan Link Online Button */}
        {onOpenShareOnline && (
          <button
            id="btn-top-share-online"
            onClick={onOpenShareOnline}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-300 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Salin & Bagikan Link Website Online"
          >
            <Globe className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>Bagikan Link Web</span>
          </button>
        )}

        {/* Developer Tools Button (Exclusive for developer) */}
        {showDevButton && (
          <button
            id="btn-top-devtools"
            onClick={onOpenDevTools}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-violet-950 bg-gradient-to-r from-violet-200 via-purple-200 to-indigo-200 hover:from-violet-300 hover:to-indigo-300 border border-violet-400/80 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Buka Panel Developer Tools & Diagnostik Sistem"
          >
            <Terminal className="w-3.5 h-3.5 text-violet-800" />
            <span className="hidden xs:inline sm:inline">DevTools</span>
          </button>
        )}

        {/* Asisten AI RT Button (Google Gemini) */}
        {onOpenAiModal && (
          <button
            id="btn-top-ai-assistant"
            onClick={onOpenAiModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-500 border border-amber-400/80 shadow-xs transition-all cursor-pointer active:scale-95"
            title="Buka Asisten Cerdas AI (Konsultasi Warga & Surat RT)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-900 animate-spin-slow" />
            <span className="hidden xs:inline sm:inline">Asisten AI</span>
          </button>
        )}

        {/* Tambah Warga Button (accessible on desktop, on mobile handled by FAB) */}
        {isAdminOrPengurus && (
          <button
            id="btn-top-add-warga"
            onClick={onOpenAddWarga}
            className="hidden sm:flex text-white px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold items-center gap-1.5 shadow-sm transition-all bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Warga</span>
          </button>
        )}

        {/* User Account Pill & Logout */}
        {currentUser ? (
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-100/90 border border-stone-200 text-left shadow-2xs"
              title={`Masuk sebagai: ${currentUser.nama} (${currentUser.jabatan})`}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-2xs shrink-0"
                style={{ backgroundColor: theme.warnaSidebar }}
              >
                {currentUser.nama.charAt(0)}
              </div>
              <div className="hidden sm:block leading-tight text-left">
                <p className="text-[11px] font-bold text-stone-900 truncate max-w-[130px]">
                  {currentUser.nama}
                </p>
                <p className="text-[9px] text-amber-800 font-semibold uppercase">
                  {currentUser.role === 'admin' ? 'Admin RT' : currentUser.role === 'pengurus' ? 'Pengurus' : 'Warga'}
                </p>
              </div>
            </div>

            {onLogout && (
              <button
                id="btn-header-logout"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/90 border border-rose-200 transition-all shadow-2xs active:scale-95"
                title="Keluar dari sistem (Log out)"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        ) : (
          <button
            id="btn-header-login"
            onClick={onOpenLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-amber-900 bg-amber-100/90 hover:bg-amber-200/90 border border-amber-300 transition-colors shadow-2xs"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-700" />
            <span>Masuk</span>
          </button>
        )}

        {/* Settings button */}
        {isAdminOrPengurus && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            title="Pengaturan Wilayah RT"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};

