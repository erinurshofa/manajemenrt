import React, { useState } from 'react';
import { History, Plus, Calendar, AlertTriangle, UserMinus, Baby, LogIn, LogOut, Trash2 } from 'lucide-react';
import { MutasiRecord, Warga, JenisMutasi, UserSession } from '../types';
import { formatTanggalIndo } from '../utils/calculations';

interface MutasiManagerProps {
  daftarMutasi: MutasiRecord[];
  daftarWarga: Warga[];
  onTambahMutasi: (mutasi: MutasiRecord, updateWargaStatus?: { wargaId: string; status: 'Meninggal' | 'Pindah Keluar' }) => void;
  onHapusMutasi: (id: string) => void;
  currentUser?: UserSession | null;
}

export const MutasiManager: React.FC<MutasiManagerProps> = ({
  daftarMutasi,
  daftarWarga,
  onTambahMutasi,
  onHapusMutasi,
  currentUser,
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'pengurus';
  const [showForm, setShowForm] = useState(false);
  const [jenisMutasi, setJenisMutasi] = useState<JenisMutasi>('Lahir');
  const [selectedWargaId, setSelectedWargaId] = useState('');
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [noKk, setNoKk] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [keterangan, setKeterangan] = useState('');

  // Handle selecting an existing citizen for Meninggal / Pindah Keluar
  const handleSelectWarga = (wargaId: string) => {
    setSelectedWargaId(wargaId);
    const warga = daftarWarga.find(w => w.id === wargaId);
    if (warga) {
      setNama(warga.nama);
      setNik(warga.nik);
      setNoKk(warga.noKk);
      setJenisKelamin(warga.jenisKelamin);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !tanggal) return;

    const newRecord: MutasiRecord = {
      id: `m-${Date.now()}`,
      wargaId: selectedWargaId || undefined,
      nama: nama.trim(),
      nik: nik.trim(),
      noKk: noKk.trim(),
      jenisKelamin,
      jenisMutasi,
      tanggal,
      keterangan: keterangan.trim() || `Pencatatan peristiwa ${jenisMutasi.replace('_', ' ')}`,
    };

    let updateStatus: { wargaId: string; status: 'Meninggal' | 'Pindah Keluar' } | undefined = undefined;
    if (selectedWargaId && (jenisMutasi === 'Meninggal' || jenisMutasi === 'Pindah_Keluar')) {
      updateStatus = {
        wargaId: selectedWargaId,
        status: jenisMutasi === 'Meninggal' ? 'Meninggal' : 'Pindah Keluar',
      };
    }

    onTambahMutasi(newRecord, updateStatus);
    setShowForm(false);
    // Reset
    setNama('');
    setNik('');
    setNoKk('');
    setKeterangan('');
    setSelectedWargaId('');
  };

  const getBadgeColor = (jenis: JenisMutasi) => {
    switch (jenis) {
      case 'Lahir':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pindah_Masuk':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Meninggal':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Pindah_Keluar':
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getIcon = (jenis: JenisMutasi) => {
    switch (jenis) {
      case 'Lahir':
        return <Baby className="w-4 h-4 text-emerald-600" />;
      case 'Pindah_Masuk':
        return <LogIn className="w-4 h-4 text-blue-600" />;
      case 'Meninggal':
        return <UserMinus className="w-4 h-4 text-rose-600" />;
      case 'Pindah_Keluar':
        return <LogOut className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-4 no-print">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            <span>Buku Mutasi & Peristiwa Kependudukan</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Catatan peristiwa lahir, mati, pindah masuk, dan pindah keluar yang menjadi dasar otomatis perhitungan laporan bulanan.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Mutasi Peristiwa</span>
          </button>
        )}
      </div>

      {/* Form Tambah Mutasi */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-in fade-in">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <span>Formulir Pencatatan Mutasi Kependudukan</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Jenis Mutasi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Peristiwa</label>
                <select
                  value={jenisMutasi}
                  onChange={e => {
                    const val = e.target.value as JenisMutasi;
                    setJenisMutasi(val);
                    if (val === 'Lahir' || val === 'Pindah_Masuk') {
                      setSelectedWargaId('');
                    }
                  }}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="Lahir">Kelahiran (Bayi Lahir)</option>
                  <option value="Pindah_Masuk">Pindah Datang / Masuk</option>
                  <option value="Meninggal">Kematian (Meninggal Dunia)</option>
                  <option value="Pindah_Keluar">Pindah Keluar dari RT</option>
                </select>
              </div>

              {/* Tanggal Peristiwa */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Peristiwa</label>
                <input
                  type="date"
                  value={tanggal}
                  onChange={e => setTanggal(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  value={jenisKelamin}
                  onChange={e => setJenisKelamin(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>
            </div>

            {/* If Meninggal or Pindah Keluar, offer quick picker from existing living citizens */}
            {(jenisMutasi === 'Meninggal' || jenisMutasi === 'Pindah_Keluar') && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Pilih Warga Terdaftar (Status akan otomatis diperbarui):
                </label>
                <select
                  value={selectedWargaId}
                  onChange={e => handleSelectWarga(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-rose-300 rounded-lg"
                >
                  <option value="">-- Pilih dari Warga Aktif --</option>
                  {daftarWarga
                    .filter(w => w.statusKehidupan === 'Hidup')
                    .map(w => (
                      <option key={w.id} value={w.id}>
                        {w.nama} - NIK: {w.nik} (KK: {w.noKk})
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Nama & Identitas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Warga</label>
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIK</label>
                <input
                  type="text"
                  placeholder="16 digit NIK"
                  value={nik}
                  onChange={e => setNik(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor KK</label>
                <input
                  type="text"
                  placeholder="16 digit No KK"
                  value={noKk}
                  onChange={e => setNoKk(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Keterangan / Penyebab / Daerah Asal / Tujuan
              </label>
              <input
                type="text"
                placeholder="Contoh: Lahir di RSUD / Pindah ke Jakarta / Sakit di usia lanjut"
                value={keterangan}
                onChange={e => setKeterangan(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
              >
                Simpan Mutasi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Mutasi */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Jenis Peristiwa</th>
                <th className="py-3 px-4">Nama Warga</th>
                <th className="py-3 px-4">NIK & No KK</th>
                <th className="py-3 px-4 text-center">JK</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daftarMutasi.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada riwayat peristiwa kependudukan tercatat
                  </td>
                </tr>
              ) : (
                daftarMutasi.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                      {formatTanggalIndo(item.tanggal)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getBadgeColor(
                          item.jenisMutasi
                        )}`}
                      >
                        {getIcon(item.jenisMutasi)}
                        <span>{item.jenisMutasi.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{item.nama}</td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div>{item.nik || '-'}</div>
                      <div className="text-slate-400">{item.noKk ? `KK: ${item.noKk}` : ''}</div>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">{item.jenisKelamin}</td>
                    <td className="py-3 px-4 text-slate-600">{item.keterangan}</td>
                    <td className="py-3 px-4 text-right">
                      {isAdmin ? (
                        <button
                          onClick={() => onHapusMutasi(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Hapus Catatan Mutasi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
