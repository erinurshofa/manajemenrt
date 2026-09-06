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
    }
  };

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const isAdminOrPengurus = currentUser?.role === 'admin' || currentUser?.role === 'pengurus';

  return (
    <header className="h-16 bg-[#fffcf7] border-b border-stone-200/90 flex items-center justify-between px-3 sm:px-6 shrink-0 sticky top-0 z-20 no-print shadow-xs">
      {/* Left: Mobile Menu & Current Context */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base font-bold font-serif text-stone-900 leading-tight truncate flex items-center gap-2">
            <span>{getTabTitle()}</span>
            <span
              className="hidden lg:inline-block w-2 h-2 rounded-full"
              style={{ backgroundColor: theme.warnaUtama }}
            />
          </h2>
          <p className="text-xs text-stone-500 hidden sm:block truncate">
            RT {profilRt.nomorRt} / RW {profilRt.nomorRw} • Kel. {profilRt.desaKelurahan}, Kec. {profilRt.kecamatan}
          </p>
        </div>
      </div>

      {/* Right: Quick Action Buttons & Authentication Pill */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Print quick button */}
        {activeTab !== 'laporan' && onOpenCetakLaporan && (
          <button
            onClick={onOpenCetakLaporan}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg shadow-2xs hover:bg-stone-50 transition-colors text-stone-700"
          >
            <Printer className="w-3.5 h-3.5 text-amber-700" />
            <span>Cetak Rekap</span>
          </button>
        )}

        {/* Change Theme & Logo (for Admin / Pengurus) */}
        {isAdminOrPengurus && onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border transition-all shadow-2xs"
            style={{
              backgroundColor: `${theme.warnaUtama}15`,
              borderColor: `${theme.warnaUtama}50`,
              color: '#78350f',
            }}
            title="Kustomisasi Logo dan Palet Warna Batik RT"
          >
            <Palette className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">Ubah Tema & Logo</span>
          </button>
        )}

        {/* Buka di HP Android / APK Button */}
        {onOpenAndroidApk && (
          <button
            id="btn-top-android-apk"
            onClick={onOpenAndroidApk}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-300 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Pasang di HP Android / Dapatkan Berkas APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Pasang di HP (APK)</span>
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

        {/* Database Supabase Cloud Status Button */}
        {onOpenSupabaseModal && (
          <button
            id="btn-top-supabase-status"
            onClick={onOpenSupabaseModal}
            className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-2xs cursor-pointer active:scale-95 ${
              isSupabaseConnected
                ? 'bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border-emerald-300'
                : 'bg-stone-100 hover:bg-stone-200/90 text-stone-800 border-stone-300'
            }`}
            title={
              isSupabaseConnected
                ? 'Database Cloud Supabase: Terhubung & Sinkron'
                : 'Data tersimpan aman di perangkat (IndexedDB)'
            }
          >
            <Database className={`w-3.5 h-3.5 shrink-0 ${isSupabaseConnected ? 'text-emerald-700' : 'text-stone-600'}`} />
            <span className="hidden sm:inline">
              {isSupabaseConnected ? 'Cloud Supabase' : 'Data Aman (Lokal)'}
            </span>
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                isSupabaseConnected ? 'bg-emerald-500' : 'bg-emerald-600'
              }`}
            />
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

