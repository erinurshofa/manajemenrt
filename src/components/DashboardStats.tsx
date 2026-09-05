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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 no-print">
      {/* Total Warga */}
      <div
        onClick={() => onNavigateToTab('warga')}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
            Total Warga
          </p>
          <div className="w-2 h-2 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalWarga}</p>
        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span>Jiwa terdaftar</span>
          <span>•</span>
          <span className="text-blue-600 font-medium">Buku Induk</span>
        </div>
      </div>

      {/* Kepala Keluarga */}
      <div
        onClick={() => onNavigateToTab('kk')}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
            Kepala Keluarga
          </p>
          <div className="w-2 h-2 rounded-full bg-slate-400 group-hover:scale-125 transition-transform" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900">{daftarKk.length}</p>
        <p className="mt-1 text-xs text-slate-500">
          Rata-rata {(totalWarga / Math.max(1, daftarKk.length)).toFixed(1)} jiwa / KK
        </p>
      </div>

      {/* Laki-laki */}
      <div
        onClick={() => onNavigateToTab('warga')}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
            Laki-laki
          </p>
          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
            L
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalLaki}</p>
        <p className="mt-1 text-xs text-slate-500">
          {totalWarga > 0 ? Math.round((totalLaki / totalWarga) * 100) : 0}% dari total warga
        </p>
      </div>

      {/* Perempuan */}
      <div
        onClick={() => onNavigateToTab('warga')}
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
            Perempuan
          </p>
          <span className="px-1.5 py-0.5 bg-pink-100 text-pink-700 rounded text-[10px] font-bold">
            P
          </span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-slate-900">{totalPerempuan}</p>
        <p className="mt-1 text-xs text-slate-500">
          {totalWarga > 0 ? Math.round((totalPerempuan / totalWarga) * 100) : 0}% dari total warga
        </p>
      </div>
    </div>
  );
};
