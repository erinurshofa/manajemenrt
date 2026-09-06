import React from 'react';
import {
  Users,
  Home,
  Wallet,
  LayoutGrid,
  Plus,
  Sparkles,
  Cloud,
} from 'lucide-react';
import { TabId } from './Sidebar';
import { ProfilRt, UserSession } from '../types';

interface MobileBottomNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  onOpenAddWarga: () => void;
  onOpenMenuSheet: () => void;
  onOpenAiModal?: () => void;
  currentUser?: UserSession | null;
  profilRt: ProfilRt;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddWarga,
  onOpenMenuSheet,
  onOpenAiModal,
  currentUser,
  profilRt,
}) => {
  const theme = profilRt.themeConfig || {
    warnaUtama: '#c59239',
    warnaSidebar: '#27150c',
  };

  const isAdminOrPengurus = currentUser?.role === 'admin' || currentUser?.role === 'pengurus';
  const isSecondaryActive = ['dokumen', 'drive', 'pengurus', 'laporan', 'mutasi'].includes(activeTab);

  return (
    <nav
      aria-label="Navigasi Seluler"
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/92 backdrop-blur-xl border-t border-stone-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-safe transition-all"
    >
      <div className="h-16 px-2 flex items-center justify-around relative max-w-lg mx-auto">
        {/* 1. Tab: Warga */}
        <button
          onClick={() => setActiveTab('warga')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all tap-bounce cursor-pointer ${
            activeTab === 'warga' ? 'text-amber-800' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <div
              className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'warga' ? 'bg-amber-100/90 scale-105' : 'bg-transparent'
              }`}
            >
              <Users className={`w-4 h-4 ${activeTab === 'warga' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            </div>
          </div>
          <span className={`text-[10px] tracking-tight leading-none mt-0.5 ${
            activeTab === 'warga' ? 'font-bold text-amber-900' : 'font-medium'
          }`}>
            Warga
          </span>
        </button>

        {/* 2. Tab: Kartu Keluarga */}
        <button
          onClick={() => setActiveTab('kk')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all tap-bounce cursor-pointer ${
            activeTab === 'kk' ? 'text-amber-800' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <div
              className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'kk' ? 'bg-amber-100/90 scale-105' : 'bg-transparent'
              }`}
            >
              <Home className={`w-4 h-4 ${activeTab === 'kk' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            </div>
          </div>
          <span className={`text-[10px] tracking-tight leading-none mt-0.5 ${
            activeTab === 'kk' ? 'font-bold text-amber-900' : 'font-medium'
          }`}>
            Keluarga
          </span>
        </button>

        {/* 3. Center Floating Action Button (FAB) */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-6">
          <button
            onClick={isAdminOrPengurus ? onOpenAddWarga : onOpenAiModal}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-900 via-amber-800 to-amber-600 text-white shadow-lg shadow-amber-900/35 border-2 border-white flex items-center justify-center active:scale-90 transition-all cursor-pointer group"
            title={isAdminOrPengurus ? 'Tambah Data Warga Baru' : 'Tanya Asisten AI'}
          >
            {isAdminOrPengurus ? (
              <Plus className="w-6 h-6 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
            ) : (
              <Sparkles className="w-6 h-6 animate-pulse" />
            )}
          </button>
          <span className="text-[9px] font-bold text-amber-900 tracking-tight leading-none mt-1">
            {isAdminOrPengurus ? '+ Warga' : 'Tanya AI'}
          </span>
        </div>

        {/* 4. Tab: Kas RT */}
        <button
          onClick={() => setActiveTab('kas')}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all tap-bounce cursor-pointer ${
            activeTab === 'kas' ? 'text-amber-800' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <div
              className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                activeTab === 'kas' ? 'bg-amber-100/90 scale-105' : 'bg-transparent'
              }`}
            >
              <Wallet className={`w-4 h-4 ${activeTab === 'kas' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            </div>
          </div>
          <span className={`text-[10px] tracking-tight leading-none mt-0.5 ${
            activeTab === 'kas' ? 'font-bold text-amber-900' : 'font-medium'
          }`}>
            Kas RT
          </span>
        </button>

        {/* 5. Tab: Menu Lengkap */}
        <button
          onClick={onOpenMenuSheet}
          className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all tap-bounce cursor-pointer ${
            isSecondaryActive ? 'text-amber-800' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <div className="relative">
            <div
              className={`w-9 h-7 rounded-xl flex items-center justify-center transition-all ${
                isSecondaryActive ? 'bg-amber-100/90 scale-105' : 'bg-transparent'
              }`}
            >
              <LayoutGrid className={`w-4 h-4 ${isSecondaryActive ? 'stroke-[2.5] text-amber-800' : 'stroke-2'}`} />
            </div>
            {isSecondaryActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-600 border border-white" />
            )}
          </div>
          <span className={`text-[10px] tracking-tight leading-none mt-0.5 ${
            isSecondaryActive ? 'font-bold text-amber-900' : 'font-medium'
          }`}>
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
};
