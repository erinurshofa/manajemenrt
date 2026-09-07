import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';

interface KasSummaryCardsProps {
  saldoKasSaatIni: number;
  totalPemasukanFiltered: number;
  totalPengeluaranFiltered: number;
  semuaPeriode: boolean;
  namaBulan: string;
  filterTahun: number;
  formatRupiah: (angka: number) => string;
}

export const KasSummaryCards: React.FC<KasSummaryCardsProps> = ({
  saldoKasSaatIni,
  totalPemasukanFiltered,
  totalPengeluaranFiltered,
  semuaPeriode,
  namaBulan,
  filterTahun,
  formatRupiah,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 no-print">
      {/* Card Saldo Kas Saat Ini */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Saldo Kas RT Saat Ini
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {formatRupiah(saldoKasSaatIni)}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Akumulasi seluruh kas aktif RT GasemRaya
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
          <Wallet className="w-6 h-6" />
        </div>
      </div>

      {/* Card Total Pemasukan */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {semuaPeriode ? 'Total Semua Pemasukan' : `Pemasukan (${namaBulan} ${filterTahun})`}
          </span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {formatRupiah(totalPemasukanFiltered)}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Iuran warga, donasi, & dana kas</span>
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      {/* Card Total Pengeluaran */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {semuaPeriode ? 'Total Semua Pengeluaran' : `Pengeluaran (${namaBulan} ${filterTahun})`}
          </span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">
            {formatRupiah(totalPengeluaranFiltered)}
          </span>
          <span className="text-[11px] text-rose-600 mt-1 block flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Operasional, lampu, & kebersihan</span>
          </span>
        </div>
        <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
          <TrendingDown className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
