import React, { useState, useMemo } from 'react';
import { Paperclip, X } from 'lucide-react';
import { TransaksiKas, ProfilRt, Warga, UserSession } from '../types';
import { KasSummaryCards } from './kas/KasSummaryCards';
import { KasFilterBar } from './kas/KasFilterBar';
import { KasTable } from './kas/KasTable';
import { ModalFormKas } from './kas/ModalFormKas';
import { canManageKas } from '../utils/permissions';

interface BukuKasKeuanganProps {
  daftarKas: TransaksiKas[];
  profilRt: ProfilRt;
  daftarWarga: Warga[];
  onTambahKas: (transaksi: TransaksiKas) => void;
  onHapusKas: (id: string) => void;
  currentUser?: UserSession | null;
}

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
  const canManage = canManageKas(currentUser?.role);
  const isAdmin = canManage;
  const [modalOpen, setModalOpen] = useState(false);
  const [previewBukti, setPreviewBukti] = useState<{ url: string; nama: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterJenis, setFilterJenis] = useState<'SEMUA' | 'PEMASUKAN' | 'PENGELUARAN'>('SEMUA');
  const [filterBulan, setFilterBulan] = useState<number>(new Date().getMonth() + 1);
  const [filterTahun, setFilterTahun] = useState<number>(new Date().getFullYear());
  const [semuaPeriode, setSemuaPeriode] = useState(false);

  // Filtered list
  const filteredKas = useMemo(() => {
    return daftarKas.filter(item => {
      const searchMatch =
        item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nomorBukti && item.nomorBukti.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.namaWarga && item.namaWarga.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.noKk && item.noKk.includes(searchTerm));

      if (!searchMatch) return false;

      if (filterJenis !== 'SEMUA' && item.jenis !== filterJenis) return false;

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
      {/* 1. Summary Cards */}
      <KasSummaryCards
        saldoKasSaatIni={saldoKasSaatIni}
        totalPemasukanFiltered={totalPemasukanFiltered}
        totalPengeluaranFiltered={totalPengeluaranFiltered}
        semuaPeriode={semuaPeriode}
        namaBulan={NAMA_BULAN[filterBulan - 1]}
        filterTahun={filterTahun}
        formatRupiah={formatRupiah}
      />

      {/* 2. Control Bar (Filters, Actions, Search) */}
      <KasFilterBar
        namaAplikasi={profilRt.namaAplikasi}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterJenis={filterJenis}
        setFilterJenis={setFilterJenis}
        filterBulan={filterBulan}
        setFilterBulan={setFilterBulan}
        filterTahun={filterTahun}
        setFilterTahun={setFilterTahun}
        semuaPeriode={semuaPeriode}
        setSemuaPeriode={setSemuaPeriode}
        namaBulanList={NAMA_BULAN}
        isAdmin={isAdmin}
        onUnduhCsv={unduhCsv}
        onPrint={handlePrint}
        onOpenModal={() => setModalOpen(true)}
      />

      {/* 3. Transactions Table */}
      <KasTable
        filteredKas={filteredKas}
        isAdmin={isAdmin}
        onHapusKas={onHapusKas}
        onPreviewBukti={setPreviewBukti}
        formatRupiah={formatRupiah}
        totalPemasukanFiltered={totalPemasukanFiltered}
        totalPengeluaranFiltered={totalPengeluaranFiltered}
      />

      {/* 4. Printable Sheet: Format Buku Kas Resmi RT */}
      <div
        id="lembar-cetak-kas"
        className="print-page bg-white p-6 sm:p-10 rounded-xl border border-slate-300 shadow-sm max-w-4xl mx-auto"
      >
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

        <div className="my-6 text-center">
          <h3 className="text-base font-bold text-slate-900 uppercase underline tracking-wide">
            BUKU KAS UMUM & LAPORAN PERTANGGUNGJAWABAN KEUANGAN RT
          </h3>
          <p className="text-xs text-slate-700 mt-1">
            Periode: {semuaPeriode ? 'Seluruh Transaksi Pembukuan' : `${NAMA_BULAN[filterBulan - 1]} ${filterTahun}`}
          </p>
        </div>

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

      {/* 5. Modal Form Tambah Transaksi */}
      <ModalFormKas
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        daftarWarga={daftarWarga}
        onTambahKas={onTambahKas}
        namaAplikasi={profilRt.namaAplikasi}
      />

      {/* 6. Modal Preview Bukti Lampiran */}
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
