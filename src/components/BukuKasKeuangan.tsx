import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Printer,
  FileSpreadsheet,
  Search,
  Calendar,
  Filter,
  Trash2,
  Paperclip,
  Eye,
  CheckCircle,
  X,
  FileText,
  Upload,
  Receipt,
  User,
  Home,
  Loader2,
} from 'lucide-react';
import { TransaksiKas, ProfilRt, Warga, UserSession } from '../types';
import { processAndUploadAttachment } from '../utils/imageCompressor';

interface BukuKasKeuanganProps {
  daftarKas: TransaksiKas[];
  profilRt: ProfilRt;
  daftarWarga: Warga[];
  onTambahKas: (transaksi: TransaksiKas) => void;
  onHapusKas: (id: string) => void;
  currentUser?: UserSession | null;
}

const KATEGORI_PEMASUKAN = [
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

const KATEGORI_PENGELUARAN = [
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

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const BukuKasKeuangan: React.FC<BukuKasKeuanganProps> = ({
  daftarKas,
  profilRt,
  daftarWarga,
  onTambahKas,
  onHapusKas,
  currentUser,
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'pengurus';
  const [modalOpen, setModalOpen] = useState(false);
  const [previewBukti, setPreviewBukti] = useState<{ url: string; nama: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<'SEMUA' | 'PEMASUKAN' | 'PENGELUARAN'>('SEMUA');
  const [filterBulan, setFilterBulan] = useState<number>(new Date().getMonth() + 1);
  const [filterTahun, setFilterTahun] = useState<number>(new Date().getFullYear());
  const [semuaPeriode, setSemuaPeriode] = useState(false);

  // Form State
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

  // Handle Form File Upload dengan kompresi otomatis & Supabase Storage
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

  // Switch category list when jenis changes
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
    setModalOpen(false);

    // Reset Form
    setNominalStr('');
    setKeterangan('');
    setNomorBukti('');
    setSelectedWargaId('');
    setNamaWargaManual('');
    setFileBuktiData(undefined);
    setFileBuktiNama(undefined);
  };

  // Filtered list
  const filteredKas = useMemo(() => {
    return daftarKas.filter(item => {
      // Search
      const searchMatch =
        item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nomorBukti && item.nomorBukti.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.namaWarga && item.namaWarga.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.noKk && item.noKk.includes(searchTerm));

      if (!searchMatch) return false;

      // Jenis
      if (filterJenis !== 'SEMUA' && item.jenis !== filterJenis) return false;

      // Periode
      if (!semuaPeriode) {
        const [thnStr, blnStr] = item.tanggal.split('-');
        if (Number(thnStr) !== filterTahun || Number(blnStr) !== filterBulan) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  }, [daftarKas, searchTerm, filterJenis, filterBulan, filterTahun, semuaPeriode]);

  // Calculations for total & balance
  const totalPemasukanAll = useMemo(() => {
    return daftarKas
      .filter(k => k.jenis === 'PEMASUKAN')
      .reduce((acc, curr) => acc + curr.nominal, 0);
  }, [daftarKas]);

  const totalPengeluaranAll = useMemo(() => {
    return daftarKas
      .filter(k => k.jenis === 'PENGELUARAN')
      .reduce((acc, curr) => acc + curr.nominal, 0);
  }, [daftarKas]);

  const saldoKasSaatIni = totalPemasukanAll - totalPengeluaranAll;

  // Calculations for filtered period
  const totalPemasukanFiltered = useMemo(() => {
    return filteredKas
      .filter(k => k.jenis === 'PEMASUKAN')
      .reduce((acc, curr) => acc + curr.nominal, 0);
  }, [filteredKas]);

  const totalPengeluaranFiltered = useMemo(() => {
    return filteredKas
      .filter(k => k.jenis === 'PENGELUARAN')
      .reduce((acc, curr) => acc + curr.nominal, 0);
  }, [filteredKas]);

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  const handlePrint = () => {
    window.print();
  };

  const unduhCsv = () => {
    const headers = ['No', 'Tanggal', 'No. Bukti', 'Jenis', 'Kategori', 'Nama Warga / Pihak', 'No. KK', 'Keterangan', 'Nominal (Rp)'];
    const rows = filteredKas.map((t, idx) => [
      idx + 1,
      t.tanggal,
      `"${t.nomorBukti || '-'}"`,
      t.jenis,
      `"${t.kategori}"`,
      `"${t.namaWarga || '-'}"`,
      `"${t.noKk || '-'}"`,
      `"${t.keterangan.replace(/"/g, '""')}"`,
      t.jenis === 'PEMASUKAN' ? t.nominal : -t.nominal,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `buku-kas-rt-${profilRt.namaAplikasi || 'GasemRaya'}-${filterTahun}-${String(filterBulan).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Section Summary Cards */}
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
              {semuaPeriode ? 'Total Semua Pemasukan' : `Pemasukan (${NAMA_BULAN[filterBulan - 1]} ${filterTahun})`}
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
              {semuaPeriode ? 'Total Semua Pengeluaran' : `Pengeluaran (${NAMA_BULAN[filterBulan - 1]} ${filterTahun})`}
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

      {/* Control Bar (Filters, Actions, Search) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              <span>Buku Kas & Pembukuan Keuangan RT {profilRt.namaAplikasi || 'GasemRaya'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola pencatatan iuran warga, pengeluaran operasional lingkungan, lampiran bukti nota, dan laporan keuangan transparan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={unduhCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Unduh CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Cetak Buku Kas</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setModalOpen(true)}
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
                  {NAMA_BULAN.map((nama, idx) => (
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

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tanggal & No. Bukti</th>
                <th className="py-3.5 px-4">Arus</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Keterangan & Pihak</th>
                <th className="py-3.5 px-4 text-right">Nominal</th>
                <th className="py-3.5 px-4 text-center">Bukti / Nota</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredKas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold">Belum ada transaksi kas pada periode ini</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik "Catat Transaksi Kas" untuk membukukan pemasukan atau pengeluaran baru.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredKas.map(t => {
                  const isPemasukan = t.jenis === 'PEMASUKAN';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Tanggal & No. Bukti */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{t.tanggal}</div>
                        <div className="text-[11px] font-mono text-slate-400">{t.nomorBukti || '-'}</div>
                      </td>

                      {/* Arus Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isPemasukan ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <TrendingUp className="w-3 h-3" />
                            <span>Pemasukan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            <TrendingDown className="w-3 h-3" />
                            <span>Pengeluaran</span>
                          </span>
                        )}
                      </td>

                      {/* Kategori */}
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {t.kategori}
                      </td>

                      {/* Keterangan & Warga */}
                      <td className="py-3 px-4">
                        <div className="text-slate-900 font-medium line-clamp-2">{t.keterangan}</div>
                        {(t.namaWarga || t.noKk) && (
                          <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1">
                            {t.namaWarga && (
                              <span className="font-semibold text-blue-700">{t.namaWarga}</span>
                            )}
                            {t.noKk && <span className="font-mono">({t.noKk})</span>}
                          </div>
                        )}
                      </td>

                      {/* Nominal */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <span
                          className={`font-bold font-mono text-sm ${
                            isPemasukan ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isPemasukan ? '+' : '-'} {formatRupiah(t.nominal)}
                        </span>
                      </td>

                      {/* Bukti Nota Attachment */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {t.fileBukti ? (
                          <button
                            onClick={() =>
                              setPreviewBukti({
                                url: t.fileBukti!,
                                nama: t.fileBuktiNama || 'Bukti Transaksi',
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors"
                            title="Lihat lampiran bukti kwitansi/nota"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Lampiran</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isAdmin ? (
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan transaksi "${t.keterangan}"?`)) {
                                onHapusKas(t.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Hapus transaksi ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {filteredKas.length > 0 && (
              <tfoot className="bg-slate-50 border-t border-slate-200 font-semibold text-xs text-slate-900">
                <tr>
                  <td colSpan={4} className="py-3 px-4">
                    TOTAL PERIODE INI ({filteredKas.length} Transaksi)
                  </td>
                  <td className="py-3 px-4 text-right font-mono">
                    <div className="text-emerald-700">Masuk: +{formatRupiah(totalPemasukanFiltered)}</div>
                    <div className="text-rose-700">Keluar: -{formatRupiah(totalPengeluaranFiltered)}</div>
                    <div className="text-slate-900 pt-1 border-t border-slate-200">
                      Selisih: {formatRupiah(totalPemasukanFiltered - totalPengeluaranFiltered)}
                    </div>
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Printable Sheet: Format Buku Kas Resmi RT GasemRaya */}
      <div
        id="lembar-cetak-kas"
        className="print-page bg-white p-6 sm:p-10 rounded-xl border border-slate-300 shadow-sm max-w-4xl mx-auto"
      >
        {/* Kop Surat RT */}
        <div className="border-b-4 border-double border-slate-900 pb-3 text-center">
          <h3 className="text-sm font-bold tracking-wider uppercase text-slate-800">
            PEMERINTAH {profilRt.kotaKabupaten.toUpperCase()}
          </h3>
          <h3 className="text-sm font-bold tracking-wider uppercase text-slate-800">
            KECAMATAN {profilRt.kecamatan.toUpperCase()} - KELURAHAN {profilRt.desaKelurahan.toUpperCase()}
          </h3>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-wide uppercase text-slate-950 mt-1">
            RUKUN TETANGGA {profilRt.nomorRt} / RUKUN WARGA {profilRt.nomorRw} "{profilRt.namaAplikasi || 'GASEMRAYA'}"
          </h2>
          <p className="text-xs text-slate-600 mt-1 italic">
            Sekretariat: Kelurahan {profilRt.desaKelurahan}, Kec. {profilRt.kecamatan}, {profilRt.kotaKabupaten}
          </p>
        </div>

        {/* Judul Laporan Kas */}
        <div className="my-6 text-center">
          <h3 className="text-base font-bold text-slate-900 uppercase underline tracking-wide">
            BUKU KAS UMUM & LAPORAN PERTANGGUNGJAWABAN KEUANGAN RT
          </h3>
          <p className="text-xs text-slate-700 mt-1">
            Periode: {semuaPeriode ? 'Seluruh Transaksi Pembukuan' : `${NAMA_BULAN[filterBulan - 1]} ${filterTahun}`}
          </p>
        </div>

        {/* Ringkasan Kas */}
        <div className="mb-6 grid grid-cols-3 gap-2 text-xs border border-slate-900 p-3 bg-slate-50 font-medium">
          <div>
            <span className="block text-slate-600">Total Pemasukan:</span>
            <span className="font-bold text-slate-900">{formatRupiah(totalPemasukanFiltered)}</span>
          </div>
          <div>
            <span className="block text-slate-600">Total Pengeluaran:</span>
            <span className="font-bold text-slate-900">{formatRupiah(totalPengeluaranFiltered)}</span>
          </div>
          <div>
            <span className="block text-slate-600">Saldo Akhir Periode:</span>
            <span className="font-extrabold text-slate-950">
              {formatRupiah(totalPemasukanFiltered - totalPengeluaranFiltered)}
            </span>
          </div>
        </div>

        {/* Tabel Cetak */}
        <table className="print-table w-full text-xs border-collapse border border-slate-900 text-slate-900">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th className="border border-slate-900 p-2 w-8">No</th>
              <th className="border border-slate-900 p-2 w-24">Tanggal</th>
              <th className="border border-slate-900 p-2 w-24">No. Bukti</th>
              <th className="border border-slate-900 p-2">Keterangan / Pos Anggaran</th>
              <th className="border border-slate-900 p-2 w-28 text-right">Pemasukan (Rp)</th>
              <th className="border border-slate-900 p-2 w-28 text-right">Pengeluaran (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {filteredKas.map((item, idx) => (
              <tr key={item.id}>
                <td className="border border-slate-900 p-1.5 text-center">{idx + 1}</td>
                <td className="border border-slate-900 p-1.5 text-center whitespace-nowrap">{item.tanggal}</td>
                <td className="border border-slate-900 p-1.5 font-mono text-[10px] text-center">{item.nomorBukti || '-'}</td>
                <td className="border border-slate-900 p-1.5">
                  <span className="font-semibold block">{item.kategori}</span>
                  <span>{item.keterangan}</span>
                  {item.namaWarga && <span className="italic block text-[10px]">Pihak: {item.namaWarga}</span>}
                </td>
                <td className="border border-slate-900 p-1.5 text-right font-mono">
                  {item.jenis === 'PEMASUKAN' ? formatRupiah(item.nominal) : '-'}
                </td>
                <td className="border border-slate-900 p-1.5 text-right font-mono">
                  {item.jenis === 'PENGELUARAN' ? formatRupiah(item.nominal) : '-'}
                </td>
              </tr>
            ))}
            <tr className="bg-slate-100 font-bold">
              <td colSpan={4} className="border border-slate-900 p-2 text-center uppercase">
                TOTAL KESELURUHAN
              </td>
              <td className="border border-slate-900 p-2 text-right font-mono">
                {formatRupiah(totalPemasukanFiltered)}
              </td>
              <td className="border border-slate-900 p-2 text-right font-mono">
                {formatRupiah(totalPengeluaranFiltered)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Kolom Tanda Tangan */}
        <div className="mt-10 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900 mt-0.5">Ketua RT {profilRt.nomorRt}</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 underline">{profilRt.namaKetuaRt}</p>
          </div>
          <div>
            <p className="text-slate-600">{profilRt.kotaKabupaten}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-900 mt-0.5">Bendahara RT</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 underline">{profilRt.namaBendahara || 'Bendahara RT'}</p>
          </div>
        </div>
      </div>

      {/* Modal Form Tambah Transaksi */}
      {modalOpen && (
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
                  Buku kas RT {profilRt.namaAplikasi || 'GasemRaya'}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
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
                  onClick={() => setModalOpen(false)}
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
      )}

      {/* Modal Preview Bukti Lampiran */}
      {previewBukti && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-blue-600" />
                <span>{previewBukti.nama}</span>
              </h4>
              <button
                onClick={() => setPreviewBukti(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-50 p-2 rounded-lg border border-slate-200">
              {previewBukti.url.startsWith('data:image') ? (
                <img
                  src={previewBukti.url}
                  alt="Bukti Nota"
                  className="max-h-[60vh] object-contain rounded"
                />
              ) : (
                <iframe
                  src={previewBukti.url}
                  title="Lampiran Dokumen"
                  className="w-full h-96 rounded"
                />
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a
                href={previewBukti.url}
                download={previewBukti.nama}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Unduh Berkas
              </a>
              <button
                onClick={() => setPreviewBukti(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
