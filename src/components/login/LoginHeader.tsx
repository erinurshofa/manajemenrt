import React from 'react';
import { Smartphone, KeyRound, Building2 } from 'lucide-react';
import { ProfilRt } from '../../types';
import { BatikLogo } from '../BatikLogo';

interface LoginHeaderProps {
  profilRt: ProfilRt;
  onOpenAndroidApk?: () => void;
  onScrollToLogin: () => void;
  isSupabaseConnected?: boolean;
  isSyncing?: boolean;
  onManualSync?: () => void;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({
  profilRt,
  onOpenAndroidApk,
  onScrollToLogin,
  isSupabaseConnected = false,
  isSyncing = false,
  onManualSync,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#2b1911]/95 backdrop-blur-md border-b border-amber-900/60 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Logo & Identitas RT */}
        <div className="flex items-center gap-3">
          <BatikLogo
            preset={profilRt.themeConfig?.preset || 'batik-soga'}
            logoConfig={profilRt.logoConfig}
            size="md"
            className="shadow-sm border border-amber-500/30"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-sm sm:base tracking-wide">
                {profilRt.namaAplikasi || 'GASEM RAYA'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                RT {profilRt.nomorRt || '02'} / RW {profilRt.nomorRw || '04'}
              </span>
            </div>
            <p className="text-[11px] text-amber-200/80 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
              <span>Kelurahan {profilRt.desaKelurahan || 'Gasem Raya'}, {profilRt.kotaKabupaten || 'Kota Semarang'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cloud Sync Status Pill */}
          {onManualSync && (
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer border active:scale-95 ${
                isSyncing
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  : isSupabaseConnected
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border-emerald-600/40'
                  : 'bg-stone-900/80 hover:bg-stone-800 text-stone-300 border-stone-700'
              }`}
              title="Status sinkronisasi database cloud Supabase. Klik untuk menyegarkan data."
            >
              <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : isSupabaseConnected ? 'bg-emerald-400' : 'bg-rose-500'}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Sinkron...' : isSupabaseConnected ? 'Cloud Aktif' : 'Offline'}
              </span>
            </button>
          )}

          {onOpenAndroidApk && (
            <button
              onClick={onOpenAndroidApk}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 border border-emerald-600/40 transition-colors shadow-2xs cursor-pointer"
              title="Panduan pasang aplikasi di Android (APK)"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pasang di HP (APK)</span>
            </button>
          )}

          <button
            onClick={onScrollToLogin}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-stone-950" />
            <span>Masuk ke Menu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
