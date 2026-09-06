import React from 'react';
import {
  Users,
  Home,
  FileText,
  History,
  Settings,
  ShieldCheck,
  X,
  Wallet,
  BookOpen,
  UserCheck,
  Palette,
  LogIn,
  LogOut,
  User,
  Smartphone,
  Cloud,
} from 'lucide-react';
import { ProfilRt, UserSession } from '../types';
import { BatikLogo } from './BatikLogo';

export type TabId = 'warga' | 'kk' | 'kas' | 'dokumen' | 'drive' | 'pengurus' | 'laporan' | 'mutasi';

interface SidebarProps {
  profilRt: ProfilRt;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onOpenAddWarga?: () => void;
  currentUser?: UserSession | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onOpenThemeModal?: () => void;
  onOpenAndroidApk?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  profilRt,
  activeTab,
  setActiveTab,
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenThemeModal,
  onOpenAndroidApk,
}) => {
  const theme = profilRt.themeConfig || {
    preset: 'batik-soga',
    warnaUtama: '#c59239',
    warnaSidebar: '#27150c',
    warnaHeader: '#361e12',
    tampilkanMotifBatik: true,
  };

  const navItems = [
    {
      id: 'warga' as const,
      label: 'Data Warga',
      icon: Users,
    },
    {
      id: 'kk' as const,
      label: 'Kartu Keluarga',
      icon: Home,
    },
    {
      id: 'kas' as const,
      label: 'Buku Kas RT',
      icon: Wallet,
      badge: 'Kas',
    },
    {
      id: 'dokumen' as const,
      label: 'Arsip & AD/ART',
      icon: BookOpen,
    },
    {
      id: 'drive' as const,
      label: 'Google Drive RT',
      icon: Cloud,
      badge: 'Cloud',
    },
    {
      id: 'pengurus' as const,
      label: 'Pengurus RT',
      icon: UserCheck,
    },
    {
      id: 'laporan' as const,
      label: 'Rekapitulasi',
      icon: FileText,
    },
    {
      id: 'mutasi' as const,
      label: 'Mutasi Penduduk',
      icon: History,
    },
  ];

  const isAdminOrPengurus = currentUser?.role === 'admin' || currentUser?.role === 'pengurus';

  const userInitials = currentUser?.nama
    ? currentUser.nama
        .split(' ')
        .map(w => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'GR';

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        style={{ backgroundColor: theme.warnaSidebar }}
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 text-amber-100 flex-col shrink-0 transform transition-transform duration-200 ease-in-out no-print border-r border-amber-900/40 shadow-xl ${
          isMobileOpen ? 'flex translate-x-0' : 'hidden md:flex -translate-x-full md:translate-x-0'
        }`}
      >
        {/* Subtle traditional batik kawung pattern SVG watermark */}
        {theme.tampilkanMotifBatik && (
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${theme.warnaUtama} 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />
        )}

        <div className="p-5 flex-1 overflow-y-auto relative z-10">
          {/* Logo & RT Identity */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-amber-900/40">
            <div className="flex items-center gap-3">
              <BatikLogo config={profilRt.logoConfig} size="md" />
              <div>
                <h1 className="text-white font-serif font-black text-lg leading-tight tracking-wide">
                  {profilRt.namaAplikasi || 'GasemRaya'}
                </h1>
                <p className="text-xs" style={{ color: theme.warnaUtama }}>
                  RT {profilRt.nomorRt} / RW {profilRt.nomorRw}
                </p>
              </div>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="md:hidden p-1.5 text-amber-200/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all text-left ${
                    isActive
                      ? 'shadow-md border'
                      : 'text-amber-100/80 hover:text-white hover:bg-white/10'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${theme.warnaUtama}25`,
                          borderColor: `${theme.warnaUtama}60`,
                          color: '#fff',
                        }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: isActive ? theme.warnaUtama : undefined }}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${theme.warnaUtama}20`,
                        borderColor: `${theme.warnaUtama}50`,
                        color: theme.warnaUtama,
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Admin Customization Button */}
          {isAdminOrPengurus && onOpenThemeModal && (
            <div className="mt-6 pt-4 border-t border-amber-900/30">
              <button
                onClick={onOpenThemeModal}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 border border-amber-500/30 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span>Ubah Logo & Tema Batik</span>
                </div>
                <span className="text-[10px] bg-amber-600/40 text-amber-100 px-1.5 py-0.5 rounded font-mono">
                  Admin
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Pasang di HP Android (APK) Shortcut */}
        {onOpenAndroidApk && (
          <div className="px-3 pb-2 relative z-10">
            <button
              id="btn-sidebar-android-apk"
              onClick={onOpenAndroidApk}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-950/60 to-teal-950/60 hover:from-emerald-900/80 hover:to-teal-900/80 text-emerald-200 border border-emerald-600/40 hover:border-emerald-500/60 transition-all flex items-center justify-between shadow-2xs group cursor-pointer"
              title="Pasang di HP Android / Dapatkan File APK"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Buka di HP (APK)</span>
              </div>
              <span className="text-[10px] bg-emerald-700/50 text-emerald-100 px-1.5 py-0.5 rounded font-mono">
                Android
              </span>
            </button>
          </div>
        )}

        {/* User Session Card at Bottom */}
        <div className="mt-auto p-4 border-t border-amber-900/40 bg-black/25 relative z-10">
          {currentUser ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-sm"
                    style={{
                      backgroundColor: `${theme.warnaUtama}40`,
                      borderColor: theme.warnaUtama,
                    }}
                  >
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p
                      id="sidebar-user-name"
                      title={currentUser.nama}
                      className="text-xs text-white font-bold truncate tracking-wide"
                    >
                      {currentUser.nama}
                    </p>
                    <p className="text-[10px] flex items-center gap-1 text-amber-200/80 truncate">
                      <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{currentUser.jabatan}</span>
                    </p>
                  </div>
                </div>

                <button
                  id="btn-sidebar-settings"
                  onClick={onOpenSettings}
                  className="p-1.5 text-amber-200/80 hover:text-white hover:bg-white/15 rounded-lg transition-all shrink-0 hover:scale-105"
                  title="Pengaturan Wilayah RT"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>

              {/* Action buttons: Logout */}
              {onLogout && (
                <div className="pt-2">
                  <button
                    id="btn-sidebar-logout"
                    onClick={onLogout}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 border border-rose-800/40 transition-all flex items-center justify-center gap-1.5 shadow-2xs hover:text-white"
                    title="Keluar dari sistem"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Keluar (Log Out)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-amber-200/80">Belum masuk sesi</p>
              <button
                onClick={onOpenLogin}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-300" />
                <span>Masuk Sistem (NIK)</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

