import React from 'react';
import { Wallet, FileSpreadsheet, Printer, Plus, Search } from 'lucide-react';

interface KasFilterBarProps {
  namaAplikasi?: string;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterJenis: 'SEMUA' | 'PEMASUKAN' | 'PENGELUARAN';
  setFilterJenis: (jenis: 'SEMUA' | 'PEMASUKAN' | 'PENGELUARAN') => void;
  filterBulan: number;
  setFilterBulan: (bulan: number) => void;
  filterTahun: number;
  setFilterTahun: (tahun: number) => void;
  semuaPeriode: boolean;
  setSemuaPeriode: (val: boolean) => void;
  namaBulanList: string[];
  isAdmin: boolean;
  onUnduhCsv: () => void;
  onPrint: () => void;
  onOpenModal: () => void;
}

export const KasFilterBar: React.FC<KasFilterBarProps> = ({
  namaAplikasi = 'GasemRaya',
  searchTerm,
  setSearchTerm,
  filterJenis,
  setFilterJenis,
  filterBulan,
  setFilterBulan,
  filterTahun,
  setFilterTahun,
  semuaPeriode,
  setSemuaPeriode,
  namaBulanList,
  isAdmin,
  onUnduhCsv,
  onPrint,
  onOpenModal,
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <span>Buku Kas & Pembukuan Keuangan RT {namaAplikasi}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Kelola pencatatan iuran warga, pengeluaran operasional lingkungan, lampiran bukti nota, dan laporan keuangan transparan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onUnduhCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-600" />
            <span>Unduh CSV</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak Buku Kas</span>
          </button>

          {isAdmin && (
            <button
              onClick={onOpenModal}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Transaksi Kas</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Periode Month / Year */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setSemuaPeriode(false)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                !semuaPeriode ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan
            </button>
            <button
              onClick={() => setSemuaPeriode(true)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                semuaPeriode ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Periode
            </button>
          </div>

          {!semuaPeriode && (
            <div className="flex items-center gap-2">
              <select
                value={filterBulan}
                onChange={e => setFilterBulan(Number(e.target.value))}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {namaBulanList.map((nama, idx) => (
                  <option key={nama} value={idx + 1}>
                    {nama}
                  </option>
                ))}
              </select>

              <select
                value={filterTahun}
                onChange={e => setFilterTahun(Number(e.target.value))}
                className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026, 2027].map(th => (
                  <option key={th} value={th}>
                    {th}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filter Jenis */}
          <select
            value={filterJenis}
            onChange={e => setFilterJenis(e.target.value as any)}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="SEMUA">Semua Arus Kas</option>
            <option value="PEMASUKAN">Hanya Pemasukan (+)</option>
            <option value="PENGELUARAN">Hanya Pengeluaran (-)</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari keterangan, no bukti, atau warga..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100 border-none rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
