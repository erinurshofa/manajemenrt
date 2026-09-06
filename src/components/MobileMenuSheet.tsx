import React from 'react';
import {
  X,
  BookOpen,
  Cloud,
  UserCheck,
  FileText,
  History,
  Palette,
  Settings,
  Sparkles,
  Smartphone,
  Globe,
  Database,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react';
import { TabId } from './Sidebar';
import { ProfilRt, UserSession } from '../types';

interface MobileMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  profilRt: ProfilRt;
  currentUser?: UserSession | null;
  onOpenThemeModal?: () => void;
  onOpenSettings?: () => void;
  onOpenAndroidApk?: () => void;
  onOpenShareOnline?: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenAiModal?: () => void;
  onLogout?: () => void;
  isSupabaseConnected?: boolean;
}

export const MobileMenuSheet: React.FC<MobileMenuSheetProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  profilRt,
  currentUser,
  onOpenThemeModal,
  onOpenSettings,
  onOpenAndroidApk,
  onOpenShareOnline,
  onOpenSupabaseModal,
  onOpenAiModal,
  onLogout,
  isSupabaseConnected = false,
}) => {
  if (!isOpen) return null;

  const isAdminOrPengurus = currentUser?.role === 'admin' || currentUser?.role === 'pengurus';

  const menuSections = [
    {
      title: 'Fitur Dokumen & Cloud',
      items: [
        {
          id: 'drive' as TabId,
          label: 'Google Drive RT 02',
          desc: 'Arsip cloud publik, drag & drop, salin & unduh berkas',
          icon: Cloud,
          color: 'from-blue-600 to-indigo-700',
          badge: 'Cloud',
          onClick: () => {
            onSelectTab('drive');
            onClose();
          },
        },
        {
          id: 'dokumen' as TabId,
          label: 'Arsip Dokumen & AD/ART',
          desc: 'Peraturan RT, surat keputusan, dan pedoman warga',
          icon: BookOpen,
          color: 'from-amber-600 to-amber-800',
          onClick: () => {
            onSelectTab('dokumen');
            onClose();
          },
        },
      ],
    },
    {
      title: 'Kependudukan & Laporan',
      items: [
        {
          id: 'pengurus' as TabId,
          label: 'Struktur Pengurus RT',
          desc: 'Ketua, sekretaris, bendahara, dan seksi bidang',
          icon: UserCheck,
          color: 'from-emerald-600 to-teal-700',
          onClick: () => {
            onSelectTab('pengurus');
            onClose();
          },
        },
        {
          id: 'laporan' as TabId,
          label: 'Rekapitulasi Bulanan',
          desc: 'Laporan demografi statistik, cetak & ekspor PDF',
          icon: FileText,
          color: 'from-rose-600 to-red-700',
          onClick: () => {
            onSelectTab('laporan');
            onClose();
          },
        },
        {
          id: 'mutasi' as TabId,
          label: 'Mutasi Penduduk',
          desc: 'Catatan peristiwa lahir, meninggal, pindah masuk & keluar',
          icon: History,
          color: 'from-purple-600 to-violet-700',
          onClick: () => {
            onSelectTab('mutasi');
            onClose();
          },
        },
      ],
    },
    {
      title: 'Alat Cerdas & Konektivitas',
      items: [
        {
          id: 'ai',
          label: 'Asisten AI RT (Gemini)',
          desc: 'Konsultasi surat, aduan warga, dan tanya-jawab cerdas',
          icon: Sparkles,
          color: 'from-amber-500 via-yellow-500 to-amber-600',
          badge: 'Cerdas',
          onClick: () => {
            onClose();
            if (onOpenAiModal) onOpenAiModal();
          },
        },
        {
          id: 'apk',
          label: 'Pasang di HP (Unduh APK)',
          desc: 'Akses cepat seperti aplikasi Android langsung di ponsel',
          icon: Smartphone,
          color: 'from-emerald-500 to-teal-600',
          badge: 'Android',
          onClick: () => {
            onClose();
            if (onOpenAndroidApk) onOpenAndroidApk();
          },
        },
        {
          id: 'share',
          label: 'Bagikan Link Web Online',
          desc: 'Salin tautan atau kirim link website RT lewat WhatsApp',
          icon: Globe,
          color: 'from-sky-500 to-blue-600',
          onClick: () => {
            onClose();
            if (onOpenShareOnline) onOpenShareOnline();
          },
        },
        {
          id: 'supabase',
          label: isSupabaseConnected ? 'Database Cloud Supabase' : 'Penyimpanan Data Lokal',
          desc: isSupabaseConnected ? 'Terhubung & tersinkronisasi otomatis' : 'Tersimpan aman di perangkat (IndexedDB)',
          icon: Database,
          color: isSupabaseConnected ? 'from-emerald-600 to-emerald-800' : 'from-stone-500 to-stone-700',
          badge: isSupabaseConnected ? 'Online' : 'Lokal',
          onClick: () => {
            onClose();
            if (onOpenSupabaseModal) onOpenSupabaseModal();
          },
        },
      ],
    },
    ...(isAdminOrPengurus
      ? [
          {
            title: 'Pengaturan Khusus Pengurus',
            items: [
              {
                id: 'theme',
                label: 'Kustomisasi Tema & Logo Batik',
                desc: 'Ubah warna tema batik dan lambang resmi RT',
                icon: Palette,
                color: 'from-amber-700 to-amber-900',
                onClick: () => {
                  onClose();
                  if (onOpenThemeModal) onOpenThemeModal();
                },
              },
              {
                id: 'settings',
                label: 'Pengaturan Wilayah RT',
                desc: 'Nama RT, RW, Kelurahan, Kecamatan, dan Kota',
                icon: Settings,
                color: 'from-stone-700 to-stone-900',
                onClick: () => {
                  onClose();
                  if (onOpenSettings) onOpenSettings();
                },
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs transition-opacity animate-in fade-in-0 duration-200"
        onClick={onClose}
      />

      {/* Sheet Container */}
      <div className="relative z-10 bg-white rounded-t-3xl shadow-2xl border-t border-amber-900/20 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300 pb-safe">
        {/* Pull Indicator & Header */}
        <div className="pt-3 pb-2 px-6 border-b border-stone-100 flex flex-col items-center">
          <div className="w-12 h-1.5 rounded-full bg-stone-300 mb-3" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 font-serif font-bold text-sm">
                RT
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 leading-tight">
                  Menu Lengkap RT 02 Gasem Raya
                </h3>
                <p className="text-[11px] text-stone-500">
                  Akses seluruh berkas, administrasi, dan pengaturan
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Card */}
        {currentUser && (
          <div className="px-5 py-3 bg-stone-50/90 border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-800 to-amber-600 text-white font-bold flex items-center justify-center shadow-xs text-sm">
                {currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-900 truncate">
                  {currentUser.nama}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    {currentUser.role === 'admin' ? 'Administrator RT' : currentUser.role === 'pengurus' ? 'Pengurus RT' : 'Warga RT'}
                  </span>
                  <span className="text-[10px] text-stone-500 truncate">
                    {currentUser.jabatan}
                  </span>
                </div>
              </div>
            </div>

            {onLogout && (
              <button
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Keluar</span>
              </button>
            )}
          </div>
        )}

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {menuSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-400 px-2">
                {section.title}
              </div>
              <div className="space-y-1">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={item.onClick}
                      className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer tap-bounce ${
                        isActive
                          ? 'bg-amber-50/90 border-amber-300 shadow-2xs'
                          : 'bg-white hover:bg-stone-50 border-stone-200/80 shadow-2xs'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shrink-0 shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-bold bg-amber-100 text-amber-900 border border-amber-200">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
