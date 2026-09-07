import React, { useState } from 'react';
import { TransaksiKas, Warga } from '../../types';
import { Wallet, TrendingUp, TrendingDown, X, CheckCircle, Loader2, Upload, Paperclip } from 'lucide-react';
import { processAndUploadAttachment } from '../../utils/imageCompressor';

export const KATEGORI_PEMASUKAN = [
  'Iuran Warga Bulanan',
  'Iuran Warga Baru',
  'Iuran Sampah & Kebersihan',
  'Iuran Keamanan / Jaga Malam',
  'Donasi / Sumbangan Warga',
  'Dana Sosial Kematian',
  'Bantuan Kas Kelurahan / RW',
  'Sewa Lapangan / Tenda RT',
  'Saldo Awal',
  'Lain-lain',
];

export const KATEGORI_PENGELUARAN = [
  'Operasional & Kebersihan',
  'Petugas Sampah & Kebersihan',
  'Keamanan & Siskamling',
  'Perbaikan Fasilitas & Lampu Jalan',
  'Konsumsi Kerja Bakti',
  'Kegiatan Warga & PHBN / 17 Agustus',
  'Santunan Duka & Sosial',
  'Administrasi, ATK & Fotokopi',
  'Perawatan Pos Ronda & Portal',
  'Lain-lain',
];

interface ModalFormKasProps {
  isOpen: boolean;
  onClose: () => void;
  daftarWarga: Warga[];
  onTambahKas: (transaksi: TransaksiKas) => void;
  namaAplikasi?: string;
}

export const ModalFormKas: React.FC<ModalFormKasProps> = ({
  isOpen,
  onClose,
  daftarWarga,
  onTambahKas,
  namaAplikasi = 'GasemRaya',
}) => {
  const [jenis, setJenis] = useState<'PEMASUKAN' | 'PENGELUARAN'>('PEMASUKAN');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kategori, setKategori] = useState('Iuran Warga Bulanan');
  const [nominalStr, setNominalStr] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [nomorBukti, setNomorBukti] = useState('');
  const [selectedWargaId, setSelectedWargaId] = useState('');
  const [namaWargaManual, setNamaWargaManual] = useState('');
  const [fileBuktiData, setFileBuktiData] = useState<string | undefined>(undefined);
  const [fileBuktiNama, setFileBuktiNama] = useState<string | undefined>(undefined);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileBuktiNama(file.name);
    setIsProcessingFile(true);
    try {
      const res = await processAndUploadAttachment(file, 'bukti-kas');
      setFileBuktiData(res.url);
    } catch (err) {
      console.warn('Gagal memproses berkas bukti:', err);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleJenisChange = (newJenis: 'PEMASUKAN' | 'PENGELUARAN') => {
    setJenis(newJenis);
    setKategori(newJenis === 'PEMASUKAN' ? KATEGORI_PEMASUKAN[0] : KATEGORI_PENGELUARAN[0]);
  };

  const handleSelectWarga = (wId: string) => {
    setSelectedWargaId(wId);
    const w = daftarWarga.find(item => item.id === wId);
    if (w) {
      setNamaWargaManual(w.nama);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNominal = Number(nominalStr.replace(/[^0-9]/g, ''));
    if (!cleanNominal || cleanNominal <= 0) return;

    const w = daftarWarga.find(item => item.id === selectedWargaId);

    const newTx: TransaksiKas = {
      id: `kas-${Date.now()}`,
      tanggal,
      jenis,
      kategori,
      nominal: cleanNominal,
      keterangan: keterangan.trim(),
      nomorBukti: nomorBukti.trim() || `${jenis === 'PEMASUKAN' ? 'BKM' : 'BKK'}-${Date.now().toString().slice(-4)}`,
      namaWarga: namaWargaManual.trim() || (w ? w.nama : undefined),
      noKk: w ? w.noKk : undefined,
      fileBukti: fileBuktiData,
      fileBuktiNama: fileBuktiNama,
    };

    onTambahKas(newTx);
    onClose();

    // Reset Form
    setNominalStr('');
    setKeterangan('');
    setNomorBukti('');
    setSelectedWargaId('');
    setNamaWargaManual('');
    setFileBuktiData(undefined);
    setFileBuktiNama(undefined);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <span>Pencatatan Transaksi Kas RT</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Buku kas RT {namaAplikasi}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Toggle Jenis */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Jenis Arus Kas <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleJenisChange('PEMASUKAN')}
                className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 border transition-all ${
                  jenis === 'PEMASUKAN'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Pemasukan (+)</span>
              </button>
              <button
                type="button"
                onClick={() => handleJenisChange('PENGELUARAN')}
                className={`py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg flex items-center justify-center gap-2 border transition-all ${
                  jenis === 'PENGELUARAN'
                    ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Pengeluaran (-)</span>
              </button>
            </div>
          </div>

          {/* Tanggal & Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nominal (Rupiah) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 250.000"
                  value={nominalStr}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    if (val) {
                      setNominalStr(new Intl.NumberFormat('id-ID').format(Number(val)));
                    } else {
                      setNominalStr('');
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2 text-sm font-bold text-slate-900 bg-slate-100 border-none rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Transaksi <span className="text-rose-500">*</span>
            </label>
            <select
              value={kategori}
              onChange={e => setKategori(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(jenis === 'PEMASUKAN' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN).map(kat => (
                <option key={kat} value={kat}>
                  {kat}
                </option>
              ))}
            </select>
          </div>

          {/* No Bukti / Kwitansi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Bukti / Kwitansi / Nota (Opsional)
            </label>
            <input
              type="text"
              placeholder="Misal: KWT-0912 / NOTA-042"
              value={nomorBukti}
              onChange={e => setNomorBukti(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Keterangan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Keterangan Lengkap <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="Rincian peruntukan atau keterangan iuran..."
              value={keterangan}
              onChange={e => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Hubungkan dengan Warga / No KK (Jika Iuran) */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2.5">
            <span className="text-xs font-semibold text-slate-800 block">
              Pihak Pembayar / Penerima (Opsional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Pilih Warga Terdaftar:</label>
                <select
                  value={selectedWargaId}
                  onChange={e => handleSelectWarga(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Bebas / Non-Warga --</option>
                  {daftarWarga.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.nama} (KK: {w.noKk})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-0.5">Atau Ketik Nama Pihak:</label>
                <input
                  type="text"
                  placeholder="Nama orang / toko..."
                  value={namaWargaManual}
                  onChange={e => setNamaWargaManual(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Upload Bukti Nota / Kwitansi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lampirkan Foto Bukti / Kwitansi / Nota (Opsional)
            </label>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md cursor-pointer transition-colors">
                {isProcessingFile ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>{isProcessingFile ? 'Mengompres...' : fileBuktiNama ? 'Ganti Berkas' : 'Pilih Berkas Foto/Nota'}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  disabled={isProcessingFile}
                  className="hidden"
                />
              </label>
              {fileBuktiNama && (
                <span className="text-xs text-blue-700 font-medium truncate max-w-xs flex items-center gap-1">
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>{fileBuktiNama}</span>
                </span>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
