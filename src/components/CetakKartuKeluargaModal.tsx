import React from 'react';
import { X, Printer, Home, Shield } from 'lucide-react';
import { KartuKeluargaData, ProfilRt } from '../types';
import { formatTanggalIndo, hitungUsia } from '../utils/calculations';

interface CetakKartuKeluargaModalProps {
  isOpen: boolean;
  onClose: () => void;
  kkData: KartuKeluargaData | null;
  profilRt: ProfilRt;
}

export const CetakKartuKeluargaModal: React.FC<CetakKartuKeluargaModalProps> = ({
  isOpen,
  onClose,
  kkData,
  profilRt,
}) => {
  if (!isOpen || !kkData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Controls (no-print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 no-print">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-blue-600" />
              <span>Pratinjau Format Kartu Keluarga (KK)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Format standar data keluarga berdasarkan Nomor KK {kkData.noKk}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu Keluarga</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* KK Sheet Container */}
        <div className="overflow-y-auto p-4 sm:p-8 flex-1 bg-slate-100 flex justify-center">
          <div
            id="lembar-cetak-kk"
            className="print-page bg-white p-6 sm:p-8 border border-slate-300 shadow-sm w-full max-w-4xl text-slate-900 text-xs"
          >
            {/* Kop Kartu Keluarga */}
            <div className="text-center border-b-2 border-slate-900 pb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Shield className="w-6 h-6 text-slate-900" />
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-widest uppercase text-slate-950 font-serif">
                  KARTU KELUARGA
                </h1>
              </div>
              <p className="text-base sm:text-lg font-mono font-bold tracking-widest text-slate-900">
                No. {kkData.noKk}
              </p>
            </div>

            {/* Identitas Kepala Keluarga & Alamat */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 my-4 text-xs">
              <div>
                <div className="flex">
                  <span className="w-36 font-semibold">Nama Kepala Keluarga</span>
                  <span className="w-3">:</span>
                  <span className="font-bold uppercase">{kkData.kepalaKeluarga?.nama || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Alamat</span>
                  <span className="w-3">:</span>
                  <span>{kkData.alamat}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">RT / RW</span>
                  <span className="w-3">:</span>
                  <span className="font-mono">{kkData.rt} / {kkData.rw}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Kode Pos</span>
                  <span className="w-3">:</span>
                  <span className="font-mono">{profilRt.kodePos}</span>
                </div>
              </div>

              <div>
                <div className="flex">
                  <span className="w-36 font-semibold">Desa / Kelurahan</span>
                  <span className="w-3">:</span>
                  <span className="uppercase">{profilRt.desaKelurahan}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Kecamatan</span>
                  <span className="w-3">:</span>
                  <span className="uppercase">{profilRt.kecamatan}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Kabupaten / Kota</span>
                  <span className="w-3">:</span>
                  <span className="uppercase">{profilRt.kotaKabupaten}</span>
                </div>
                <div className="flex">
                  <span className="w-36 font-semibold">Provinsi</span>
                  <span className="w-3">:</span>
                  <span className="uppercase">{profilRt.provinsi}</span>
                </div>
              </div>
            </div>

            {/* Tabel I: Nama, NIK, JK, Tempat Lahir, Tgl Lahir, Agama, Pendidikan, Pekerjaan */}
            <div className="my-4">
              <h4 className="font-bold uppercase text-[11px] mb-1">DAFTAR ANGGOTA KELUARGA (1)</h4>
              <table className="print-table w-full text-[11px] border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-900 p-1.5 w-7">No</th>
                    <th className="border border-slate-900 p-1.5">Nama Lengkap</th>
                    <th className="border border-slate-900 p-1.5 w-36">NIK</th>
                    <th className="border border-slate-900 p-1.5 w-8">JK</th>
                    <th className="border border-slate-900 p-1.5">Tempat Lahir</th>
                    <th className="border border-slate-900 p-1.5 w-24">Tanggal Lahir</th>
                    <th className="border border-slate-900 p-1.5 w-16">Agama</th>
                    <th className="border border-slate-900 p-1.5">Pendidikan</th>
                    <th className="border border-slate-900 p-1.5">Jenis Pekerjaan</th>
                  </tr>
                </thead>
                <tbody>
                  {kkData.anggota.map((warga, idx) => (
                    <tr key={warga.id} className="text-center">
                      <td className="border border-slate-900 p-1.5">{idx + 1}</td>
                      <td className="border border-slate-900 p-1.5 text-left font-bold">{warga.nama}</td>
                      <td className="border border-slate-900 p-1.5 font-mono text-[10px]">{warga.nik}</td>
                      <td className="border border-slate-900 p-1.5 font-bold">{warga.jenisKelamin}</td>
                      <td className="border border-slate-900 p-1.5 text-left">{warga.tempatLahir}</td>
                      <td className="border border-slate-900 p-1.5">{formatTanggalIndo(warga.tanggalLahir)}</td>
                      <td className="border border-slate-900 p-1.5">{warga.agama}</td>
                      <td className="border border-slate-900 p-1.5 text-left">{warga.pendidikan || '-'}</td>
                      <td className="border border-slate-900 p-1.5 text-left">{warga.pekerjaan || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tabel II: Status Perkawinan, Hubungan Keluarga, Status Kependudukan */}
            <div className="my-4">
              <h4 className="font-bold uppercase text-[11px] mb-1">STATUS HUBUNGAN KELUARGA (2)</h4>
              <table className="print-table w-full text-[11px] border-collapse border border-slate-900">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-slate-900 p-1.5 w-7">No</th>
                    <th className="border border-slate-900 p-1.5">Status Perkawinan</th>
                    <th className="border border-slate-900 p-1.5">Status Hubungan Dalam Keluarga</th>
                    <th className="border border-slate-900 p-1.5 w-24">Gol. Darah</th>
                    <th className="border border-slate-900 p-1.5">Status Kependudukan</th>
                    <th className="border border-slate-900 p-1.5">Usia</th>
                  </tr>
                </thead>
                <tbody>
                  {kkData.anggota.map((warga, idx) => (
                    <tr key={`rel-${warga.id}`} className="text-center">
                      <td className="border border-slate-900 p-1.5">{idx + 1}</td>
                      <td className="border border-slate-900 p-1.5">{warga.statusPerkawinan}</td>
                      <td className="border border-slate-900 p-1.5 font-bold uppercase">{warga.hubunganKeluarga}</td>
                      <td className="border border-slate-900 p-1.5">{warga.golonganDarah || '-'}</td>
                      <td className="border border-slate-900 p-1.5">{warga.statusKependudukan}</td>
                      <td className="border border-slate-900 p-1.5 font-medium">{hitungUsia(warga.tanggalLahir)} thn</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pengesahan */}
            <div className="mt-8 pt-4 grid grid-cols-2 text-xs">
              <div className="text-center">
                <p className="font-semibold">KEPALA KELUARGA,</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">(Tanda Tangan)</span>
                </div>
                <p className="font-bold underline uppercase">{kkData.kepalaKeluarga?.nama || '...................'}</p>
              </div>

              <div className="text-center">
                <p>{profilRt.desaKelurahan}, {formatTanggalIndo(new Date().toISOString().split('T')[0])}</p>
                <p className="font-semibold">KETUA RT {profilRt.nomorRt} / RW {profilRt.nomorRw}</p>
                <div className="h-16 flex items-center justify-center">
                  <span className="text-[10px] text-slate-400 italic">(Tanda Tangan & Cap)</span>
                </div>
                <p className="font-bold underline uppercase">{profilRt.namaKetuaRt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
