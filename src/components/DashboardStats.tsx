import React from 'react';
import { Users, Home, Activity } from 'lucide-react';
import { Warga, KartuKeluargaData } from '../types';
import { hitungUsia } from '../utils/calculations';

interface DashboardStatsProps {
  daftarWarga: Warga[];
  daftarKk: KartuKeluargaData[];
  totalMutasiBulanIni: number;
  onNavigateToTab: (tab: 'warga' | 'kk' | 'laporan' | 'mutasi') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  daftarWarga,
  daftarKk,
  totalMutasiBulanIni,
  onNavigateToTab,
}) => {
  const wargaHidup = daftarWarga.filter(w => w.statusKehidupan === 'Hidup');
  const totalWarga = wargaHidup.length;
  const totalLaki = wargaHidup.filter(w => w.jenisKelamin === 'L').length;
  const totalPerempuan = wargaHidup.filter(w => w.jenisKelamin === 'P').length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 no-print">
      {/* Total Warga */}
      <div
        onClick={() => onNavigateToTab('warga')}
        className="relative overflow-hidden bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 active:scale-[0.98] transition-all cursor-pointer group"
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">
            Total Warga
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalWarga}</p>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">Jiwa</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">Terdaftar di Buku Induk</span>
        </div>
      </div>

      {/* Kepala Keluarga */}
      <div
        onClick={() => onNavigateToTab('kk')}
        className="relative overflow-hidden bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-amber-300 dark:hover:border-amber-700 active:scale-[0.98] transition-all cursor-pointer group"
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">
            Keluarga
          </p>
          <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-md text-[10px] font-bold">
            KK
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{daftarKk.length}</p>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">KK</span>
        </div>
        <p className="mt-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
          Rata-rata {(totalWarga / Math.max(1, daftarKk.length)).toFixed(1)} jiwa / KK
        </p>
      </div>

      {/* Laki-laki */}
      <div
        onClick={() => onNavigateToTab('warga')}
        className="relative overflow-hidden bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 active:scale-[0.98] transition-all cursor-pointer group"
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">
            Laki-laki
          </p>
          <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-md text-[10px] font-bold">
            ♂ L
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalLaki}</p>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            {totalWarga > 0 ? Math.round((totalLaki / totalWarga) * 100) : 0}%
          </span>
        </div>
        <p className="mt-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
          Warga Laki-laki
        </p>
      </div>

      {/* Perempuan */}
      <div
        onClick={() => onNavigateToTab('warga')}
        className="relative overflow-hidden bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700 active:scale-[0.98] transition-all cursor-pointer group"
      >
        <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider">
            Perempuan
          </p>
          <span className="px-1.5 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-md text-[10px] font-bold">
            ♀ P
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{totalPerempuan}</p>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            {totalWarga > 0 ? Math.round((totalPerempuan / totalWarga) * 100) : 0}%
          </span>
        </div>
        <p className="mt-1.5 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
          Warga Perempuan
        </p>
      </div>
    </div>
  );
};
