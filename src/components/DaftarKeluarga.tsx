import React, { useState, useMemo } from 'react';
import { Home, Users, UserPlus, Printer, Search, Copy, Check, ChevronDown, ChevronRight, Award, Lock } from 'lucide-react';
import { KartuKeluargaData, Warga, UserSession } from '../types';
import { hitungUsia, formatTanggalIndo } from '../utils/calculations';
import { maskNik, maskNoKk } from '../utils/security';

interface DaftarKeluargaProps {
  daftarKk: KartuKeluargaData[];
  onTambahAnggotaKk: (noKk: string, alamat: string, rt: string, rw: string) => void;
  onCetakKk: (kk: KartuKeluargaData) => void;
  onEditWarga: (warga: Warga) => void;
  onLihatDetailWarga: (warga: Warga) => void;
  initialSelectedKk?: string;
  currentUser?: UserSession | null;
}

export const DaftarKeluarga: React.FC<DaftarKeluargaProps> = ({
  daftarKk,
  onTambahAnggotaKk,
  onCetakKk,
  onEditWarga,
  onLihatDetailWarga,
  initialSelectedKk,
  currentUser,
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'pengurus';
  const [searchTerm, setSearchTerm] = useState(initialSelectedKk || '');
  const [copiedKk, setCopiedKk] = useState<string | null>(null);
  const [expandedKk, setExpandedKk] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    daftarKk.forEach(kk => {
      map[kk.noKk] = true; // Expanded by default for ease of reading
    });
    return map;
  });

  const filteredKk = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return daftarKk;
    return daftarKk.filter(kk => {
      const matchKk = kk.noKk.includes(term);
      const matchKepala = kk.kepalaKeluarga?.nama.toLowerCase().includes(term);
      const matchAlamat = kk.alamat.toLowerCase().includes(term);
      const matchAnggota = kk.anggota.some(a => a.nama.toLowerCase().includes(term) || a.nik.includes(term));
      return matchKk || matchKepala || matchAlamat || matchAnggota;
    });
  }, [daftarKk, searchTerm]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKk(text);
    setTimeout(() => setCopiedKk(null), 2000);
  };

  const toggleExpand = (noKk: string) => {
    setExpandedKk(prev => ({
      ...prev,
      [noKk]: !prev[noKk],
    }));
  };

  return (
    <div className="space-y-4 no-print">
      {/* Header Info */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            <span>Pengelompokan Data Keluarga (Kartu Keluarga / KK)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data terhubung otomatis berdasarkan 16 digit Nomor KK. Total terdapat {daftarKk.length} Kartu Keluarga aktif di RT ini.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-kk"
            type="text"
            placeholder="Cari No KK, Kepala Keluarga, atau Anggota..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* List of Kartu Keluarga */}
      {filteredKk.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
          <Home className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="font-semibold text-base">Tidak menemukan data Kartu Keluarga</p>
          <p className="text-xs text-slate-400 mt-1">Coba bersihkan pencarian atau tambahkan warga dengan No KK baru.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredKk.map(kk => {
            const isExpanded = expandedKk[kk.noKk] !== false;
            const jumlahLaki = kk.anggota.filter(a => a.jenisKelamin === 'L').length;
            const jumlahPerempuan = kk.anggota.filter(a => a.jenisKelamin === 'P').length;

            return (
              <div
                key={kk.noKk}
                id={`card-kk-${kk.noKk}`}
                className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:border-blue-300"
              >
                {/* KK Card Header */}
                <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleExpand(kk.noKk)}
                        className="mt-1 p-1 hover:bg-slate-200 rounded text-slate-600 transition-colors"
                        title={isExpanded ? 'Tutup Rincian' : 'Buka Rincian'}
                      >
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                            Kartu Keluarga
                          </span>
                          <span className="text-base sm:text-lg font-mono font-bold text-slate-900 tracking-wider inline-flex items-center gap-1.5">
                            {!isAdmin && <Lock className="w-3.5 h-3.5 text-amber-600" />}
                            <span>{isAdmin ? kk.noKk : maskNoKk(kk.noKk)}</span>
                          </span>
                          <button
                            onClick={() => copyToClipboard(kk.noKk)}
                            className="text-slate-400 hover:text-slate-700 p-1"
                            title="Salin Nomor KK"
                          >
                            {copiedKk === kk.noKk ? (
                              <Check className="w-3.5 h-3.5 text-blue-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-600">
                          <span className="flex items-center gap-1 font-medium text-slate-900">
                            <Award className="w-3.5 h-3.5 text-blue-600" />
                            Kepala: {kk.kepalaKeluarga ? kk.kepalaKeluarga.nama : '(Belum ditentukan)'}
                          </span>
                          <span>•</span>
                          <span>{kk.alamat} (RT {kk.rt} / RW {kk.rw})</span>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">
                            {kk.anggota.length} Anggota ({jumlahLaki} L, {jumlahPerempuan} P)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions on this KK */}
                    <div className="flex items-center gap-2 pl-9 lg:pl-0">
                      <button
                        id={`btn-cetak-kk-${kk.noKk}`}
                        onClick={() => onCetakKk(kk)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md shadow-xs transition-colors"
                        title="Lihat dan cetak lembar format resmi Kartu Keluarga"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>Cetak Form KK</span>
                      </button>

                      {isAdmin && (
                        <button
                          id={`btn-tambah-anggota-kk-${kk.noKk}`}
                          onClick={() => onTambahAnggotaKk(kk.noKk, kk.alamat, kk.rt, kk.rw)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
                          title="Tambah anggota baru (anak, istri, dll) langsung ke nomor KK ini"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Tambah Anggota</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* KK Members List (Family Group Table) */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50/70 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500">
                        <tr>
                          <th className="py-2.5 px-4 font-semibold">Hubungan</th>
                          <th className="py-2.5 px-4 font-semibold">Nama Lengkap</th>
                          <th className="py-2.5 px-4 font-semibold">NIK</th>
                          <th className="py-2.5 px-4 font-semibold text-center">JK</th>
                          <th className="py-2.5 px-4 font-semibold">Tempat, Tgl Lahir</th>
                          <th className="py-2.5 px-4 font-semibold">Usia</th>
                          <th className="py-2.5 px-4 font-semibold">Pekerjaan</th>
                          <th className="py-2.5 px-4 font-semibold">Pendidikan</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {kk.anggota.map(warga => {
                          const usia = hitungUsia(warga.tanggalLahir);
                          const isKepala = warga.hubunganKeluarga === 'KEPALA KELUARGA';

                          return (
                            <tr key={warga.id} className="hover:bg-slate-50/60 transition-colors">
                              {/* Hubungan */}
                              <td className="py-2.5 px-4">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    isKepala
                                      ? 'bg-blue-100 text-blue-800'
                                      : warga.hubunganKeluarga === 'ISTRI'
                                      ? 'bg-purple-100 text-purple-800'
                                      : warga.hubunganKeluarga === 'ANAK'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {warga.hubunganKeluarga}
                                </span>
                              </td>

                              {/* Nama */}
                              <td className="py-2.5 px-4 font-bold text-slate-900">
                                {warga.nama}
                              </td>

                              {/* NIK */}
                              <td className="py-2.5 px-4 font-mono text-slate-600">
                                {isAdmin ? (
                                  <span>{warga.nik}</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-slate-400">
                                    <Lock className="w-3 h-3 text-amber-600" />
                                    <span>{maskNik(warga.nik)}</span>
                                  </span>
                                )}
                              </td>

                              {/* JK */}
                              <td className="py-2.5 px-4 text-center">
                                <span
                                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    warga.jenisKelamin === 'L' ? 'text-blue-700 bg-blue-50' : 'text-pink-700 bg-pink-50'
                                  }`}
                                >
                                  {warga.jenisKelamin === 'L' ? 'L' : 'P'}
                                </span>
                              </td>

                              {/* TTL */}
                              <td className="py-2.5 px-4 text-slate-800">
                                {warga.tempatLahir}, {formatTanggalIndo(warga.tanggalLahir)}
                              </td>

                              {/* Usia */}
                              <td className="py-2.5 px-4 text-slate-600 font-medium">
                                {usia} thn
                              </td>

                              {/* Pekerjaan */}
                              <td className="py-2.5 px-4 text-slate-600">
                                {warga.pekerjaan || '-'}
                              </td>

                              {/* Pendidikan */}
                              <td className="py-2.5 px-4 text-slate-600">
                                {warga.pendidikan || '-'}
                              </td>

                              {/* Aksi */}
                              <td className="py-2.5 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => onLihatDetailWarga(warga)}
                                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                                  >
                                    Detail
                                  </button>
                                  {isAdmin && (
                                    <>
                                      <span>•</span>
                                      <button
                                        onClick={() => onEditWarga(warga)}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                      >
                                        Edit
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
