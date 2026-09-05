import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, UserPlus, Eye, Edit2, Trash2, Home, CheckCircle2, AlertCircle, Users, Plus, ShieldCheck, Lock } from 'lucide-react';
import { Warga, JenisKelamin, StatusKependudukan, UserSession } from '../types';
import { hitungUsia, formatTanggalIndo, unduhCsv } from '../utils/calculations';
import { maskNik, maskNoKk } from '../utils/security';

interface DaftarWargaProps {
  daftarWarga: Warga[];
  onTambahWarga: () => void;
  onEditWarga: (warga: Warga) => void;
  onHapusWarga: (id: string, nama: string) => void;
  onLihatDetail: (warga: Warga) => void;
  onPilihKk: (noKk: string) => void;
  currentUser?: UserSession | null;
}

export const DaftarWarga: React.FC<DaftarWargaProps> = ({
  daftarWarga,
  onTambahWarga,
  onEditWarga,
  onHapusWarga,
  onLihatDetail,
  onPilihKk,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJk, setFilterJk] = useState<string>('semua');
  const [filterStatus, setFilterStatus] = useState<string>('semua');
  const [filterHubungan, setFilterHubungan] = useState<string>('semua');
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'pengurus';

  const filteredWarga = useMemo(() => {
    return daftarWarga.filter(w => {
      // Search term
      const term = searchTerm.toLowerCase();
      const matchSearch =
        w.nama.toLowerCase().includes(term) ||
        w.nik.includes(term) ||
        w.noKk.includes(term) ||
        w.tempatLahir.toLowerCase().includes(term) ||
        w.alamat.toLowerCase().includes(term);

      if (!matchSearch) return false;

      // Filter JK
      if (filterJk !== 'semua' && w.jenisKelamin !== filterJk) return false;

      // Filter Status Kependudukan
      if (filterStatus !== 'semua' && w.statusKependudukan !== filterStatus) return false;

      // Filter Hubungan
      if (filterHubungan !== 'semua' && w.hubunganKeluarga !== filterHubungan) return false;

      return true;
    });
  }, [daftarWarga, searchTerm, filterJk, filterStatus, filterHubungan]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden no-print">
      {/* Top Header & Search Controls */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h2 className="font-bold text-slate-800 text-base sm:text-lg">Buku Induk Kependudukan Warga</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Menampilkan {filteredWarga.length} dari total {daftarWarga.length} data warga tercatat
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-export-csv"
            onClick={() => unduhCsv(filteredWarga)}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
            title="Unduh format spreadsheet CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>

          {isAdmin && (
            <button
              id="btn-tambah-warga-table"
              onClick={onTambahWarga}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs sm:text-sm font-medium shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Warga</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 sm:px-6 sm:py-3.5 bg-white border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Box */}
        <div className="relative col-span-1 sm:col-span-2 lg:col-span-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-warga"
            type="text"
            placeholder="Cari warga (Nama, NIK, atau No. KK)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Jenis Kelamin */}
        <div>
          <select
            id="select-filter-jk"
            value={filterJk}
            onChange={e => setFilterJk(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Jenis Kelamin</option>
            <option value="L">Laki-laki (L)</option>
            <option value="P">Perempuan (P)</option>
          </select>
        </div>

        {/* Filter Status Kependudukan */}
        <div>
          <select
            id="select-filter-status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Status Warga</option>
            <option value="Tetap">Warga Tetap</option>
            <option value="Kontrak">Warga Kontrak</option>
            <option value="Domisili">Warga Domisili</option>
          </select>
        </div>

        {/* Filter Hubungan Keluarga */}
        <div>
          <select
            id="select-filter-hubungan"
            value={filterHubungan}
            onChange={e => setFilterHubungan(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="semua">Semua Hubungan KK</option>
            <option value="KEPALA KELUARGA">Kepala Keluarga</option>
            <option value="ISTRI">Istri</option>
            <option value="ANAK">Anak</option>
            <option value="ORANG TUA">Orang Tua</option>
          </select>
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-white sticky top-0 z-10 border-b border-slate-100">
            <tr className="text-slate-500 font-medium text-xs uppercase tracking-wider">
              <th className="px-6 py-4">No</th>
              <th className="px-6 py-4">Nama Lengkap</th>
              <th className="px-6 py-4">NIK</th>
              <th className="px-6 py-4">TTL (Usia)</th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">No. KK</th>
              <th className="px-6 py-4">Hubungan</th>
              <th className="px-6 py-4">Alamat</th>
              <th className="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredWarga.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-14 text-center">
                  <div className="max-w-md mx-auto p-6 rounded-2xl bg-amber-50/60 border border-amber-200 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-100/80 flex items-center justify-center text-amber-800 shadow-2xs">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-stone-900 text-sm">
                      {daftarWarga.length === 0 ? 'Data Warga Gasem Raya RT 02 Masih Kosong' : 'Tidak Ada Data Warga yang Cocok'}
                    </p>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {daftarWarga.length === 0
                        ? 'Data warga telah dikosongkan. Klik tombol "+ Tambah Warga" untuk mulai mendaftarkan warga baru Gasem Raya RT 02.'
                        : 'Coba sesuaikan kata kunci pencarian atau filter status yang dipilih.'}
                    </p>
                    {isAdmin && daftarWarga.length === 0 && (
                      <button
                        onClick={onTambahWarga}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-lg text-xs font-semibold shadow-sm hover:from-amber-800 hover:to-amber-950 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Warga Sekarang</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredWarga.map((warga, index) => {
                const usia = hitungUsia(warga.tanggalLahir);
                const isKepala = warga.hubunganKeluarga === 'KEPALA KELUARGA';
                const isAlternate = index % 2 === 1;

                return (
                  <tr
                    key={warga.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      warga.statusKehidupan !== 'Hidup'
                        ? 'bg-rose-50/40 text-slate-400'
                        : isAlternate
                        ? 'bg-blue-50/20'
                        : 'bg-white'
                    }`}
                  >
                    {/* No */}
                    <td className="px-6 py-4 font-medium text-slate-400 text-xs">{index + 1}</td>

                    {/* Nama Lengkap */}
                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{warga.nama}</span>
                        {warga.statusKehidupan !== 'Hidup' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-700">
                            {warga.statusKehidupan}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* NIK (Disensor jika bukan Admin/Pengurus untuk UU PDP) */}
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                      {isAdmin ? (
                        <span>{warga.nik}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-400" title="Disensor untuk perlindungan privasi data pribadi (UU PDP)">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span>{maskNik(warga.nik)}</span>
                        </span>
                      )}
                    </td>

                    {/* TTL & Usia */}
                    <td className="px-6 py-4 text-slate-600 text-xs whitespace-nowrap">
                      <div>{warga.tempatLahir}, {formatTanggalIndo(warga.tanggalLahir)}</div>
                      <div className="text-[11px] text-slate-400">({usia} thn)</div>
                    </td>

                    {/* Gender Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {warga.jenisKelamin === 'L' ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] font-bold tracking-wider">
                          LAKI-LAKI
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-[10px] font-bold tracking-wider">
                          PEREMPUAN
                        </span>
                      )}
                    </td>

                    {/* No KK as family link (Disensor jika bukan Admin/Pengurus) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => onPilihKk(warga.noKk)}
                        className="text-slate-500 font-mono italic hover:text-blue-600 transition-colors text-xs inline-flex items-center gap-1"
                        title="Klik untuk melihat seluruh anggota 1 KK ini"
                      >
                        {isAdmin ? (
                          <span>{warga.noKk}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <Lock className="w-3 h-3 text-amber-600" />
                            <span>{maskNoKk(warga.noKk)}</span>
                          </span>
                        )}
                      </button>
                    </td>

                    {/* Hubungan Keluarga */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          isKepala
                            ? 'bg-blue-100 text-blue-800 font-semibold'
                            : warga.hubunganKeluarga === 'ISTRI'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {warga.hubunganKeluarga}
                      </span>
                    </td>

                    {/* Alamat */}
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-[200px] truncate">
                      {warga.alamat} (RT {warga.rt})
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => onLihatDetail(warga)}
                          className="text-slate-400 hover:text-blue-600 font-medium text-xs transition-colors"
                        >
                          Detail
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => onEditWarga(warga)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="Ubah Data Warga"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onHapusWarga(warga.id, warga.nama)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Hapus Data Warga"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <p>Menampilkan {filteredWarga.length} dari {daftarWarga.length} warga</p>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 bg-white border border-slate-200 rounded text-slate-600 font-medium">
            Halaman 1
          </span>
        </div>
      </div>
    </div>
  );
};
