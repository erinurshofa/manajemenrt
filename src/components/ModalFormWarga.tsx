import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, AlertCircle, Calendar, Home, CheckCircle2 } from 'lucide-react';
import { Warga, JenisKelamin, HubunganKeluarga, Agama, StatusPerkawinan, StatusKependudukan, KartuKeluargaData } from '../types';
import { hitungUsia } from '../utils/calculations';

interface ModalFormWargaProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warga: Warga, catatMutasi?: { jenis: 'Lahir' | 'Pindah_Masuk'; tanggal: string; keterangan: string }) => void;
  initialData?: Warga | null;
  daftarKk: KartuKeluargaData[];
  prefilledKk?: {
    noKk: string;
    alamat: string;
    rt: string;
    rw: string;
  } | null;
}

export const ModalFormWarga: React.FC<ModalFormWargaProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  daftarKk,
  prefilledKk,
}) => {
  const [nama, setNama] = useState('');
  const [nik, setNik] = useState('');
  const [tempatLahir, setTempatLahir] = useState('');
  const [tanggalLahir, setTanggalLahir] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>('L');
  const [noKk, setNoKk] = useState('');
  const [hubunganKeluarga, setHubunganKeluarga] = useState<HubunganKeluarga>('KEPALA KELUARGA');
  const [alamat, setAlamat] = useState('');
  const [rt, setRt] = useState('02');
  const [rw, setRw] = useState('04');
  const [agama, setAgama] = useState<Agama>('Islam');
  const [statusPerkawinan, setStatusPerkawinan] = useState<StatusPerkawinan>('Belum Kawin');
  const [pekerjaan, setPekerjaan] = useState('');
  const [pendidikan, setPendidikan] = useState('SMA/SMK');
  const [statusKependudukan, setStatusKependudukan] = useState<StatusKependudukan>('Tetap');
  const [noHp, setNoHp] = useState('');
  const [golonganDarah, setGolonganDarah] = useState<'A' | 'B' | 'AB' | 'O' | '-'>('-');
  const [catatan, setCatatan] = useState('');

  // Mutasi recording checkbox for new entries
  const [catatMutasi, setCatatMutasi] = useState(false);
  const [jenisMutasiOtomatis, setJenisMutasiOtomatis] = useState<'Lahir' | 'Pindah_Masuk'>('Pindah_Masuk');
  const [tanggalMutasiOtomatis, setTanggalMutasiOtomatis] = useState(new Date().toISOString().split('T')[0]);
  const [keteranganMutasi, setKeteranganMutasi] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setNama(initialData.nama || '');
      setNik(initialData.nik || '');
      setTempatLahir(initialData.tempatLahir || '');
      setTanggalLahir(initialData.tanggalLahir || '');
      setJenisKelamin(initialData.jenisKelamin || 'L');
      setNoKk(initialData.noKk || '');
      setHubunganKeluarga(initialData.hubunganKeluarga || 'KEPALA KELUARGA');
      setAlamat(initialData.alamat || '');
      setRt(initialData.rt || '02');
      setRw(initialData.rw || '04');
      setAgama(initialData.agama || 'Islam');
      setStatusPerkawinan(initialData.statusPerkawinan || 'Belum Kawin');
      setPekerjaan(initialData.pekerjaan || '');
      setPendidikan(initialData.pendidikan || 'SMA/SMK');
      setStatusKependudukan(initialData.statusKependudukan || 'Tetap');
      setNoHp(initialData.noHp || '');
      setGolonganDarah(initialData.golonganDarah || '-');
      setCatatan(initialData.catatan || '');
      setCatatMutasi(false);
    } else if (prefilledKk) {
      setNama('');
      setNik('');
      setTempatLahir('');
      setTanggalLahir('');
      setJenisKelamin('L');
      setNoKk(prefilledKk.noKk);
      setHubunganKeluarga('ANAK');
      setAlamat(prefilledKk.alamat);
      setRt(prefilledKk.rt);
      setRw(prefilledKk.rw);
      setAgama('Islam');
      setStatusPerkawinan('Belum Kawin');
      setPekerjaan('');
      setPendidikan('SD/MI');
      setStatusKependudukan('Tetap');
      setNoHp('');
      setGolonganDarah('-');
      setCatatan('');
      setCatatMutasi(true);
      setJenisMutasiOtomatis('Lahir');
    } else {
      setNama('');
      setNik('');
      setTempatLahir('');
      setTanggalLahir('');
      setJenisKelamin('L');
      setNoKk('');
      setHubunganKeluarga('KEPALA KELUARGA');
      setAlamat('Jl. Gasem Raya No. ');
      setRt('02');
      setRw('04');
      setAgama('Islam');
      setStatusPerkawinan('Kawin');
      setPekerjaan('');
      setPendidikan('SMA/SMK');
      setStatusKependudukan('Tetap');
      setNoHp('');
      setGolonganDarah('-');
      setCatatan('');
      setCatatMutasi(false);
    }
    setErrors({});
  }, [initialData, prefilledKk, isOpen]);

  // When selecting existing KK, autofill address & RT/RW
  const handleSelectExistingKk = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value;
    if (selected) {
      setNoKk(selected);
      const kk = daftarKk.find(k => k.noKk === selected);
      if (kk) {
        setAlamat(kk.alamat);
        setRt(kk.rt);
        setRw(kk.rw);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!nama.trim()) {
      newErrors.nama = 'Nama lengkap wajib diisi';
    }

    const cleanNik = nik.replace(/\D/g, '');
    if (!cleanNik) {
      newErrors.nik = 'NIK wajib diisi';
    } else if (cleanNik.length !== 16) {
      newErrors.nik = `NIK harus 16 digit (saat ini ${cleanNik.length} digit)`;
    }

    const cleanKk = noKk.replace(/\D/g, '');
    if (!cleanKk) {
      newErrors.noKk = 'Nomor KK wajib diisi';
    } else if (cleanKk.length !== 16) {
      newErrors.noKk = `Nomor KK harus 16 digit (saat ini ${cleanKk.length} digit)`;
    }

    if (!tempatLahir.trim()) {
      newErrors.tempatLahir = 'Tempat lahir wajib diisi';
    }

    if (!tanggalLahir) {
      newErrors.tanggalLahir = 'Tanggal lahir wajib diisi';
    }

    if (!alamat.trim()) {
      newErrors.alamat = 'Alamat lengkap wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const wargaData: Warga = {
      id: initialData ? initialData.id : `w-${Date.now()}`,
      nama: nama.trim(),
      nik: nik.replace(/\D/g, ''),
      tempatLahir: tempatLahir.trim(),
      tanggalLahir,
      jenisKelamin,
      noKk: noKk.replace(/\D/g, ''),
      hubunganKeluarga,
      alamat: alamat.trim(),
      rt: rt.trim() || '02',
      rw: rw.trim() || '04',
      agama,
      statusPerkawinan,
      pekerjaan: pekerjaan.trim() || 'Belum/Tidak Bekerja',
      pendidikan,
      statusKependudukan,
      statusKehidupan: initialData ? initialData.statusKehidupan : 'Hidup',
      tanggalDaftar: initialData ? initialData.tanggalDaftar : (catatMutasi ? tanggalMutasiOtomatis : new Date().toISOString().split('T')[0]),
      noHp: noHp.trim(),
      golonganDarah,
      catatan: catatan.trim(),
    };

    const mutasiData = !initialData && catatMutasi
      ? {
          jenis: jenisMutasiOtomatis,
          tanggal: tanggalMutasiOtomatis,
          keterangan: keteranganMutasi.trim() || (jenisMutasiOtomatis === 'Lahir' ? 'Kelahiran baru' : 'Pindah masuk ke RT'),
        }
      : undefined;

    onSave(wargaData, mutasiData);
    onClose();
  };

  if (!isOpen) return null;

  const currentAge = tanggalLahir ? hitungUsia(tanggalLahir) : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <span>{initialData ? 'Perbarui Data Warga' : 'Pendaftaran Warga Baru'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data kependudukan lengkap terhubung dengan Nomor Kartu Keluarga (KK).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Section 1: Identitas Pokok & Keluarga */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>1. Hubungan Keluarga & No. KK</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {/* No KK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Kartu Keluarga (KK) <span className="text-rose-500">*</span>
                </label>
                <div className="space-y-1.5">
                  <input
                    id="input-form-nokk"
                    type="text"
                    maxLength={16}
                    placeholder="Contoh: 3276010508080001 (16 digit)"
                    value={noKk}
                    onChange={e => setNoKk(e.target.value.replace(/\D/g, ''))}
                    className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 ${
                      errors.noKk ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{noKk.length}/16 digit</span>
                    {daftarKk.length > 0 && (
                      <select
                        onChange={handleSelectExistingKk}
                        className="text-xs text-emerald-700 bg-transparent border-0 hover:underline cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Pilih dari KK Terdaftar...
                        </option>
                        {daftarKk.map(k => (
                          <option key={k.noKk} value={k.noKk}>
                            {k.noKk} - {k.kepalaKeluarga?.nama || 'KK'}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                {errors.noKk && <p className="text-xs text-rose-500 mt-1">{errors.noKk}</p>}
              </div>

              {/* Hubungan Keluarga */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hubungan dalam Keluarga <span className="text-rose-500">*</span>
                </label>
                <select
                  id="select-form-hubungan"
                  value={hubunganKeluarga}
                  onChange={e => setHubunganKeluarga(e.target.value as HubunganKeluarga)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="KEPALA KELUARGA">KEPALA KELUARGA</option>
                  <option value="ISTRI">ISTRI</option>
                  <option value="ANAK">ANAK</option>
                  <option value="ORANG TUA">ORANG TUA</option>
                  <option value="FAMILI LAIN">FAMILI LAIN</option>
                  <option value="LAINNYA">LAINNYA</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Menentukan posisi dalam lembar Kartu Keluarga dan silsilah RT.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Data Pribadi Warga */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>2. Biodata Pribadi Warga</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap (Sesuai KTP/Akta) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-form-nama"
                  type="text"
                  placeholder="Contoh: Bambang Supriyanto"
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                    errors.nama ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
                {errors.nama && <p className="text-xs text-rose-500 mt-1">{errors.nama}</p>}
              </div>

              {/* NIK */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  NIK (Nomor Induk Kependudukan) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-form-nik"
                  type="text"
                  maxLength={16}
                  placeholder="Contoh: 3276011205750001"
                  value={nik}
                  onChange={e => setNik(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-mono focus:ring-2 focus:ring-emerald-500 ${
                    errors.nik ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Harus 16 digit angka</span>
                  <span>{nik.length}/16</span>
                </div>
                {errors.nik && <p className="text-xs text-rose-500 mt-0.5">{errors.nik}</p>}
              </div>

              {/* Jenis Kelamin */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Kelamin <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="jk"
                      value="L"
                      checked={jenisKelamin === 'L'}
                      onChange={() => setJenisKelamin('L')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Laki-laki (L)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="jk"
                      value="P"
                      checked={jenisKelamin === 'P'}
                      onChange={() => setJenisKelamin('P')}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Perempuan (P)</span>
                  </label>
                </div>
              </div>

              {/* Tempat Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-form-tempatlahir"
                  type="text"
                  placeholder="Contoh: Jakarta / Solo"
                  value={tempatLahir}
                  onChange={e => setTempatLahir(e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                    errors.tempatLahir ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
                {errors.tempatLahir && <p className="text-xs text-rose-500 mt-1">{errors.tempatLahir}</p>}
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Lahir <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-form-tanggallahir"
                  type="date"
                  value={tanggalLahir}
                  onChange={e => setTanggalLahir(e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                    errors.tanggalLahir ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
                {currentAge !== null && (
                  <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                    Usia saat ini: {currentAge} tahun {currentAge < 5 ? '(Balita)' : currentAge >= 60 ? '(Lansia)' : ''}
                  </p>
                )}
                {errors.tanggalLahir && <p className="text-xs text-rose-500 mt-1">{errors.tanggalLahir}</p>}
              </div>

              {/* Agama */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Agama</label>
                <select
                  id="select-form-agama"
                  value={agama}
                  onChange={e => setAgama(e.target.value as Agama)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              {/* Status Perkawinan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Perkawinan</label>
                <select
                  id="select-form-perkawinan"
                  value={statusPerkawinan}
                  onChange={e => setStatusPerkawinan(e.target.value as StatusPerkawinan)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              {/* Pekerjaan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pekerjaan</label>
                <input
                  id="input-form-pekerjaan"
                  type="text"
                  placeholder="Contoh: Karyawan Swasta / PNS / Pedagang"
                  value={pekerjaan}
                  onChange={e => setPekerjaan(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Pendidikan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Pendidikan Terakhir</label>
                <select
                  id="select-form-pendidikan"
                  value={pendidikan}
                  onChange={e => setPendidikan(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Belum/Tidak Sekolah">Belum/Tidak Sekolah</option>
                  <option value="SD/MI">SD/MI</option>
                  <option value="SMP/MTs">SMP/MTs</option>
                  <option value="SMA/SMK">SMA/SMK</option>
                  <option value="Diploma I/II/III">Diploma I/II/III</option>
                  <option value="S1/Sarjana">S1/Sarjana</option>
                  <option value="S2/Magister">S2/Magister</option>
                  <option value="S3/Doktor">S3/Doktor</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Domisili & Kontak */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span>3. Domisili & Status Kependudukan RT</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Rumah Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  id="input-form-alamat"
                  type="text"
                  placeholder="Contoh: Jl. Melati No. 12 Blok B"
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                    errors.alamat ? 'border-rose-500' : 'border-slate-300'
                  }`}
                />
                {errors.alamat && <p className="text-xs text-rose-500 mt-1">{errors.alamat}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">RT</label>
                <input
                  type="text"
                  value={rt}
                  onChange={e => setRt(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-center font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">RW</label>
                <input
                  type="text"
                  value={rw}
                  onChange={e => setRw(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-center font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status Kependudukan</label>
                <select
                  value={statusKependudukan}
                  onChange={e => setStatusKependudukan(e.target.value as StatusKependudukan)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Tetap">Warga Tetap</option>
                  <option value="Kontrak">Warga Kontrak / Kost</option>
                  <option value="Domisili">Surat Domisili Sementara</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor HP / WA</label>
                <input
                  type="tel"
                  placeholder="Contoh: 08123456789"
                  value={noHp}
                  onChange={e => setNoHp(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Golongan Darah</label>
                <select
                  value={golonganDarah}
                  onChange={e => setGolonganDarah(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="-">Tidak Tahu / -</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Pencatatan Mutasi Otomatis (Hanya untuk penambahan baru) */}
          {!initialData && (
            <div className="border-t border-slate-200 pt-4">
              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={catatMutasi}
                  onChange={e => setCatatMutasi(e.target.checked)}
                  className="mt-1 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block">
                    Catat sebagai Mutasi Masuk / Kelahiran Bulan Ini
                  </span>
                  <span className="text-slate-600">
                    Centang jika ini merupakan peristiwa warga baru (bayi baru lahir atau warga baru pindah masuk ke RT) agar otomatis dihitung dalam Laporan Rekapitulasi Penduduk Bulanan.
                  </span>
                </div>
              </label>

              {catatMutasi && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Jenis Peristiwa</label>
                    <select
                      value={jenisMutasiOtomatis}
                      onChange={e => setJenisMutasiOtomatis(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    >
                      <option value="Lahir">Kelahiran (Bayi Lahir)</option>
                      <option value="Pindah_Masuk">Pindah Masuk dari Luar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tanggal Peristiwa</label>
                    <input
                      type="date"
                      value={tanggalMutasiOtomatis}
                      onChange={e => setTanggalMutasiOtomatis(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Keterangan / Asal</label>
                    <input
                      type="text"
                      placeholder="Contoh: Dari Bandung / RSUD"
                      value={keteranganMutasi}
                      onChange={e => setKeteranganMutasi(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md transition-colors"
            >
              Batal
            </button>
            <button
              id="btn-submit-warga"
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Data Warga</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
