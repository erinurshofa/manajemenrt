import React, { useState, useMemo } from 'react';
import { Printer, Calendar, FileSpreadsheet, CheckCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Warga, ProfilRt, MutasiRecord } from '../types';
import { hitungRekapitulasiBulanan, NAMA_BULAN, formatTanggalIndo, unduhCsv } from '../utils/calculations';

interface LaporanBulananProps {
  daftarWarga: Warga[];
  daftarMutasi: MutasiRecord[];
  profilRt: ProfilRt;
}

export const LaporanBulanan: React.FC<LaporanBulananProps> = ({
  daftarWarga,
  daftarMutasi,
  profilRt,
}) => {
  const today = new Date();
  const [selectedBulan, setSelectedBulan] = useState<number>(today.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState<number>(today.getFullYear());

  // Automatic calculation of monthly recapitulation
  const rekap = useMemo(() => {
    return hitungRekapitulasiBulanan(daftarWarga, daftarMutasi, selectedTahun, selectedBulan);
  }, [daftarWarga, daftarMutasi, selectedTahun, selectedBulan]);

  const handlePrint = () => {
    window.print();
  };

  const handlePrevMonth = () => {
    if (selectedBulan === 1) {
      setSelectedBulan(12);
      setSelectedTahun(prev => prev - 1);
    } else {
      setSelectedBulan(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedBulan === 12) {
      setSelectedBulan(1);
      setSelectedTahun(prev => prev + 1);
    } else {
      setSelectedBulan(prev => prev + 1);
    }
  };

  const setBulanIni = () => {
    setSelectedBulan(today.getMonth() + 1);
    setSelectedTahun(today.getFullYear());
  };

  // Format tanggal pelaporan (akhir bulan atau hari ini jika bulan berjalan)
  const tanggalPelaporan = useMemo(() => {
    const isCurrentMonth = selectedBulan === today.getMonth() + 1 && selectedTahun === today.getFullYear();
    if (isCurrentMonth) {
      return formatTanggalIndo(today.toISOString().split('T')[0]);
    }
    // Last day of selected month
    const lastDay = new Date(selectedTahun, selectedBulan, 0);
    return formatTanggalIndo(lastDay.toISOString().split('T')[0]);
  }, [selectedBulan, selectedTahun, today]);

  return (
    <div className="space-y-6">
      {/* Control Panel (Hidden during Print) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>Rekapitulasi Data Penduduk Bulanan Otomatis</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Sistem menghitung angka penduduk awal, mutasi lahir/mati/datang/pindah, dan akhir bulan secara otomatis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-unduh-csv-bulan"
              onClick={() => unduhCsv(daftarWarga, `rekap-warga-${selectedTahun}-${String(selectedBulan).padStart(2, '0')}.csv`)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Unduh CSV</span>
            </button>

            <button
              id="btn-cetak-laporan"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Print Laporan</span>
            </button>
          </div>
        </div>

        {/* Month & Year Selectors */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600"
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <select
                id="select-bulan-laporan"
                value={selectedBulan}
                onChange={e => setSelectedBulan(Number(e.target.value))}
                className="px-3 py-2 text-sm font-medium bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {NAMA_BULAN.map((nama, idx) => (
                  <option key={nama} value={idx + 1}>
                    {nama}
                  </option>
                ))}
              </select>

              <select
                id="select-tahun-laporan"
                value={selectedTahun}
                onChange={e => setSelectedTahun(Number(e.target.value))}
                className="px-3 py-2 text-sm font-medium bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026, 2027].map(tahun => (
                  <option key={tahun} value={tahun}>
                    {tahun}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleNextMonth}
              className="p-2 border border-slate-200 rounded-md hover:bg-slate-50 text-slate-600"
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={setBulanIni}
              className="px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
            >
              Bulan Sekarang
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Format siap cetak A4 otomatis disesuaikan di lembar bawah</span>
          </div>
        </div>
      </div>

      {/* Printable Sheet (Standard Indonesian RT Monthly Recapitulation Format) */}
      <div
        id="lembar-laporan-resmi"
        className="print-page bg-white p-6 sm:p-10 rounded-xl border border-slate-300 shadow-sm max-w-4xl mx-auto"
      >
        {/* Kop Surat Resmi RT */}
        <div className="border-b-4 border-double border-slate-900 pb-3 text-center">
          <h3 className="text-sm font-bold tracking-wider uppercase text-slate-800">
            PEMERINTAH {profilRt.kotaKabupaten.toUpperCase()}
          </h3>
          <h3 className="text-sm font-bold tracking-wider uppercase text-slate-800">
            KECAMATAN {profilRt.kecamatan.toUpperCase()} - KELURAHAN {profilRt.desaKelurahan.toUpperCase()}
          </h3>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-wide uppercase text-slate-950 mt-1">
            RUKUN TETANGGA {profilRt.nomorRt} / RUKUN WARGA {profilRt.nomorRw}
          </h2>
          <p className="text-xs text-slate-600 mt-1 italic">
            Sekretariat: Kelurahan {profilRt.desaKelurahan}, Kec. {profilRt.kecamatan}, {profilRt.kotaKabupaten}, {profilRt.provinsi} {profilRt.kodePos}
          </p>
        </div>

        {/* Title of the Report */}
        <div className="text-center my-6">
          <h1 className="text-base sm:text-lg font-bold uppercase text-slate-950 underline underline-offset-4">
            LAPORAN REKAPITULASI DATA PERUBAHAN PENDUDUK BULANAN
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-800 mt-1">
            Periode: Bulan <span className="font-bold">{rekap.namaBulan}</span> Tahun <span className="font-bold">{rekap.periodeTahun}</span>
          </p>
          <p className="text-[11px] font-mono text-slate-500 mt-0.5">
            No: {rekap.periodeBulan.toString().padStart(2, '0')}/RT.{profilRt.nomorRt}-RW.{profilRt.nomorRw}/{rekap.periodeTahun}
          </p>
        </div>

        {/* Bagian 1: Tabel Rekapitulasi Pokok Penduduk Bulanan */}
        <div className="mb-6">
          <h4 className="text-xs sm:text-sm font-bold uppercase text-slate-900 mb-2">
            I. REKAPITULASI JUMLAH DAN MUTASI PENDUDUK
          </h4>
          <table className="print-table w-full text-xs border-collapse border border-slate-900 text-slate-900">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th rowSpan={2} className="border border-slate-900 p-2 w-10">NO</th>
                <th rowSpan={2} className="border border-slate-900 p-2">URAIAN KEPENDUDUKAN</th>
                <th colSpan={3} className="border border-slate-900 p-2">JUMLAH JIWA</th>
                <th rowSpan={2} className="border border-slate-900 p-2 w-28">KETERANGAN</th>
              </tr>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-900 p-1 w-16">L</th>
                <th className="border border-slate-900 p-1 w-16">P</th>
                <th className="border border-slate-900 p-1 w-20">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Penduduk Awal */}
              <tr className="bg-slate-50/50">
                <td className="border border-slate-900 p-2 text-center font-bold">1</td>
                <td className="border border-slate-900 p-2 font-bold">Penduduk Awal Bulan</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.awalLaki}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.awalPerempuan}</td>
                <td className="border border-slate-900 p-2 text-center font-bold">{rekap.awalTotal}</td>
                <td className="border border-slate-900 p-2 text-xs text-slate-600">Per tgl 1 {rekap.namaBulan}</td>
              </tr>

              {/* 2. Tambah - Lahir */}
              <tr>
                <td className="border border-slate-900 p-2 text-center">2</td>
                <td className="border border-slate-900 p-2 pl-6">a. Kelahiran (Lahir)</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.lahirLaki}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.lahirPerempuan}</td>
                <td className="border border-slate-900 p-2 text-center font-semibold">{rekap.lahirTotal}</td>
                <td className="border border-slate-900 p-2 text-xs text-slate-600">+ Jiwa</td>
              </tr>

              {/* 3. Tambah - Pindah Masuk */}
              <tr>
                <td className="border border-slate-900 p-2 text-center">3</td>
                <td className="border border-slate-900 p-2 pl-6">b. Datang / Pindah Masuk</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.masukLaki}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.masukPerempuan}</td>
                <td className="border border-slate-900 p-2 text-center font-semibold">{rekap.masukTotal}</td>
                <td className="border border-slate-900 p-2 text-xs text-slate-600">+ Jiwa</td>
              </tr>

              {/* Total Tambah */}
              <tr className="bg-emerald-50/40 font-semibold">
                <td className="border border-slate-900 p-2 text-center font-bold"></td>
                <td className="border border-slate-900 p-2 font-bold text-emerald-900">JUMLAH PENAMBAHAN</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.lahirLaki + rekap.masukLaki}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.lahirPerempuan + rekap.masukPerempuan}</td>
                <td className="border border-slate-900 p-2 text-center font-bold text-emerald-900">
                  {rekap.lahirTotal + rekap.masukTotal}
                </td>
                <td className="border border-slate-900 p-2 text-xs text-slate-600">Lahir + Masuk</td>
              </tr>

              {/* 4. Kurang - Kematian */}
              <tr>
                <td className="border border-slate-900 p-2 text-center">4</td>
                <td className="border border-slate-900 p-2 pl-6">a. Kematian (Meninggal)</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.matiLaki}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.matiPerempuan}</td>
                <td className="border border-slate-900 p-2 text-center font-semibold">{rekap.matiTotal}</td>
                <td className="border border-slate-900 p-2 text-xs text-slate-600">- Jiwa</td>
              </tr>

              {/* 5. Kurang - Pindah Keluar */}
              <tr>
                <td className="border border-slate-900 p-2 text-center">5</td>
                <td className="border border-slate-900 p-2 pl-6">b. Pindah Keluar</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.keluarLaki}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.keluarPerempuan}</td>
                <td className="border border-slate-900 p-2 text-center font-semibold">{rekap.keluarTotal}</td>
                <td className="border border-slate-900 p-2 text-xs text-slate-600">- Jiwa</td>
              </tr>

              {/* Total Kurang */}
              <tr className="bg-rose-50/40 font-semibold">
                <td className="border border-slate-900 p-2 text-center font-bold"></td>
                <td className="border border-slate-900 p-2 font-bold text-rose-900">JUMLAH PENGURANGAN</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.matiLaki + rekap.keluarLaki}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.matiPerempuan + rekap.keluarPerempuan}</td>
                <td className="border border-slate-900 p-2 text-center font-bold text-rose-900">
                  {rekap.matiTotal + rekap.keluarTotal}
                </td>
                <td className="border border-slate-900 p-2 text-xs text-slate-600">Mati + Keluar</td>
              </tr>

              {/* 6. Penduduk Akhir Bulan */}
              <tr className="bg-slate-200/80 font-bold">
                <td className="border border-slate-900 p-2 text-center font-bold">6</td>
                <td className="border border-slate-900 p-2 font-bold text-slate-950">PENDUDUK AKHIR BULAN</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.akhirLaki}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.akhirPerempuan}</td>
                <td className="border border-slate-900 p-2 text-center font-extrabold text-slate-950">
                  {rekap.akhirTotal}
                </td>
                <td className="border border-slate-900 p-2 text-xs text-slate-800 font-bold">Jiwa Terdaftar</td>
              </tr>

              {/* 7. Total Kepala Keluarga (KK) */}
              <tr className="bg-slate-100 font-bold">
                <td className="border border-slate-900 p-2 text-center">7</td>
                <td className="border border-slate-900 p-2 font-bold" colSpan={3}>
                  JUMLAH KEPALA KELUARGA (KK) AKTIF
                </td>
                <td className="border border-slate-900 p-2 text-center font-extrabold text-blue-900">
                  {rekap.totalKk}
                </td>
                <td className="border border-slate-900 p-2 text-xs font-bold text-slate-800">Kartu Keluarga (KK)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bagian 2: Distribusi Kelompok Umur */}
        <div className="mb-6">
          <h4 className="text-xs sm:text-sm font-bold uppercase text-slate-900 mb-2">
            II. DISTRIBUSI PENDUDUK BERDASARKAN KELOMPOK USIA
          </h4>
          <table className="print-table w-full text-xs border-collapse border border-slate-900 text-slate-900">
            <thead>
              <tr className="bg-slate-100 font-bold text-center">
                <th className="border border-slate-900 p-2">Kategori Usia</th>
                <th className="border border-slate-900 p-2 w-32">Rentang Usia</th>
                <th className="border border-slate-900 p-2 w-20">Laki-Laki</th>
                <th className="border border-slate-900 p-2 w-20">Perempuan</th>
                <th className="border border-slate-900 p-2 w-24">Jumlah Total</th>
                <th className="border border-slate-900 p-2 w-24">Persentase</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Balita</td>
                <td className="border border-slate-900 p-2 text-center">0 - 4 Tahun</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.balitaL}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.balitaP}</td>
                <td className="border border-slate-900 p-2 text-center font-bold">{rekap.balitaL + rekap.balitaP}</td>
                <td className="border border-slate-900 p-2 text-center text-slate-600">
                  {rekap.akhirTotal > 0 ? (((rekap.balitaL + rekap.balitaP) / rekap.akhirTotal) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Anak-Anak & Remaja</td>
                <td className="border border-slate-900 p-2 text-center">5 - 17 Tahun</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.anakL}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.anakP}</td>
                <td className="border border-slate-900 p-2 text-center font-bold">{rekap.anakL + rekap.anakP}</td>
                <td className="border border-slate-900 p-2 text-center text-slate-600">
                  {rekap.akhirTotal > 0 ? (((rekap.anakL + rekap.anakP) / rekap.akhirTotal) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Usia Produktif / Kerja</td>
                <td className="border border-slate-900 p-2 text-center">18 - 59 Tahun</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.produktifL}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.produktifP}</td>
                <td className="border border-slate-900 p-2 text-center font-bold">
                  {rekap.produktifL + rekap.produktifP}
                </td>
                <td className="border border-slate-900 p-2 text-center text-slate-600">
                  {rekap.akhirTotal > 0 ? (((rekap.produktifL + rekap.produktifP) / rekap.akhirTotal) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr>
                <td className="border border-slate-900 p-2 font-medium">Lansia (Lanjut Usia)</td>
                <td className="border border-slate-900 p-2 text-center">60+ Tahun</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.lansiaL}</td>
                <td className="border border-slate-900 p-2 text-center">{rekap.lansiaP}</td>
                <td className="border border-slate-900 p-2 text-center font-bold">{rekap.lansiaL + rekap.lansiaP}</td>
                <td className="border border-slate-900 p-2 text-center text-slate-600">
                  {rekap.akhirTotal > 0 ? (((rekap.lansiaL + rekap.lansiaP) / rekap.akhirTotal) * 100).toFixed(1) : 0}%
                </td>
              </tr>
              <tr className="bg-slate-100 font-bold text-center">
                <td className="border border-slate-900 p-2 font-bold" colSpan={2}>
                  TOTAL PENDUDUK
                </td>
                <td className="border border-slate-900 p-2">{rekap.akhirLaki}</td>
                <td className="border border-slate-900 p-2">{rekap.akhirPerempuan}</td>
                <td className="border border-slate-900 p-2 font-extrabold">{rekap.akhirTotal}</td>
                <td className="border border-slate-900 p-2">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bagian 3: Rincian Mutasi / Peristiwa Kependudukan Bulan Ini */}
        <div className="mb-8">
          <h4 className="text-xs sm:text-sm font-bold uppercase text-slate-900 mb-2">
            III. RINCIAN PERISTIWA MUTASI BULAN {rekap.namaBulan.toUpperCase()} {rekap.periodeTahun}
          </h4>
          {rekap.daftarMutasi.length === 0 ? (
            <div className="border border-dashed border-slate-400 p-3 text-center text-xs text-slate-600 italic">
              Tidak ada catatan mutasi penduduk (kelahiran, kematian, pindah masuk, atau pindah keluar) pada bulan {rekap.namaBulan} {rekap.periodeTahun}.
            </div>
          ) : (
            <table className="print-table w-full text-xs border-collapse border border-slate-900 text-slate-900">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-900 p-2 w-10">No</th>
                  <th className="border border-slate-900 p-2 w-28">Tanggal</th>
                  <th className="border border-slate-900 p-2">Nama Warga</th>
                  <th className="border border-slate-900 p-2 w-36">NIK / No KK</th>
                  <th className="border border-slate-900 p-2 w-12 text-center">JK</th>
                  <th className="border border-slate-900 p-2 w-28 text-center">Jenis Mutasi</th>
                  <th className="border border-slate-900 p-2">Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {rekap.daftarMutasi.map((m, idx) => (
                  <tr key={m.id}>
                    <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-900 p-2 text-center">{formatTanggalIndo(m.tanggal)}</td>
                    <td className="border border-slate-900 p-2 font-bold">{m.nama}</td>
                    <td className="border border-slate-900 p-2 font-mono text-[11px]">
                      <div>NIK: {m.nik}</div>
                      <div className="text-slate-600">KK: {m.noKk}</div>
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-bold">{m.jenisKelamin}</td>
                    <td className="border border-slate-900 p-2 text-center font-semibold">
                      {m.jenisMutasi.replace('_', ' ')}
                    </td>
                    <td className="border border-slate-900 p-2 text-xs">{m.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bagian 4: Lembar Tanda Tangan & Pengesahan Resmi */}
        <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 text-xs text-slate-900">
          <div className="text-center">
            <p className="font-medium text-slate-700">Mengetahui,</p>
            <p className="font-bold">Sekretaris RT {profilRt.nomorRt}</p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">(Tanda Tangan & Stempel)</span>
            </div>
            <p className="font-bold underline text-slate-950">{profilRt.namaSekretaris}</p>
            <p className="text-[11px] text-slate-600">Sekretaris RT</p>
          </div>

          <div className="text-center">
            <p className="font-medium text-slate-700">
              {profilRt.desaKelurahan}, {tanggalPelaporan}
            </p>
            <p className="font-bold">Ketua RT {profilRt.nomorRt} / RW {profilRt.nomorRw}</p>
            <div className="h-20 flex items-center justify-center">
              <span className="text-[10px] text-slate-300 italic">(Tanda Tangan & Stempel)</span>
            </div>
            <p className="font-bold underline text-slate-950">{profilRt.namaKetuaRt}</p>
            <p className="text-[11px] text-slate-600">Ketua RT {profilRt.nomorRt}</p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-3 border-t border-dotted border-slate-400 text-[10px] text-slate-500 flex justify-between">
          <span>Dicetak otomatis melalui Aplikasi Pengelola Data Warga RT</span>
          <span>Dicetak pada: {new Date().toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
};
