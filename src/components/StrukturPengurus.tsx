import React, { useState, useMemo } from 'react';
import {
  Users,
  UserCheck,
  Phone,
  MapPin,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Shield,
  X,
  CheckCircle,
  Briefcase,
  Award,
} from 'lucide-react';
import { PengurusRt, ProfilRt, Warga, UserSession } from '../types';
import { useConfirm } from '../context/NotificationContext';
import { canManagePengurus } from '../utils/permissions';

interface StrukturPengurusProps {
  daftarPengurus: PengurusRt[];
  profilRt: ProfilRt;
  daftarWarga: Warga[];
  onTambahPengurus: (pengurus: PengurusRt) => void;
  onEditPengurus: (pengurus: PengurusRt) => void;
  onHapusPengurus: (id: string) => void;
  currentUser?: UserSession | null;
}

export const StrukturPengurus: React.FC<StrukturPengurusProps> = ({
  daftarPengurus,
  profilRt,
  daftarWarga,
  onTambahPengurus,
  onEditPengurus,
  onHapusPengurus,
  currentUser,
}) => {
  const canManage = canManagePengurus(currentUser?.role);
  const isAdmin = canManage;
  const confirmDialog = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PengurusRt | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [jabatan, setJabatan] = useState('Seksi Keamanan & Ketertiban');
  const [nik, setNik] = useState('');
  const [noHp, setNoHp] = useState('');
  const [alamat, setAlamat] = useState('');
  const [periode, setPeriode] = useState('2024 - 2029');
  const [tugasPokok, setTugasPokok] = useState('');

  const handleOpenAdd = () => {
    setEditingItem(null);
    setNama('');
    setJabatan('Seksi Keamanan & Ketertiban');
    setNik('');
    setNoHp('');
    setAlamat('');
    setPeriode('2024 - 2029');
    setTugasPokok('');
    setModalOpen(true);
  };

  const handleOpenEdit = (p: PengurusRt) => {
    setEditingItem(p);
    setNama(p.nama);
    setJabatan(p.jabatan);
    setNik(p.nik || '');
    setNoHp(p.noHp);
    setAlamat(p.alamat || '');
    setPeriode(p.periode);
    setTugasPokok(p.tugasPokok || '');
    setModalOpen(true);
  };

  const handleSelectFromWarga = (wId: string) => {
    const w = daftarWarga.find(item => item.id === wId);
    if (w) {
      setNama(w.nama);
      setNik(w.nik);
      setAlamat(`${w.alamat}, RT ${w.rt}/RW ${w.rw}`);
      if (w.noHp) setNoHp(w.noHp);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !jabatan.trim()) return;

    if (editingItem) {
      const updated: PengurusRt = {
        ...editingItem,
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        nik: nik.trim() || undefined,
        noHp: noHp.trim(),
        alamat: alamat.trim() || undefined,
        periode: periode.trim(),
        tugasPokok: tugasPokok.trim() || undefined,
      };
      onEditPengurus(updated);
    } else {
      const newPengurus: PengurusRt = {
        id: `p-${Date.now()}`,
        nama: nama.trim(),
        jabatan: jabatan.trim(),
        nik: nik.trim() || undefined,
        noHp: noHp.trim(),
        alamat: alamat.trim() || undefined,
        periode: periode.trim(),
        tugasPokok: tugasPokok.trim() || undefined,
      };
      onTambahPengurus(newPengurus);
    }

    setModalOpen(false);
  };

  // Penentuan urutan hierarki resmi SK Pengurus RT (Ketua RT selalu paling atas)
  const getJabatanRank = (jabatan: string): number => {
    const j = (jabatan || '').toLowerCase().trim();
    if (
      j.startsWith('ketua rt') ||
      j === 'ketua' ||
      (j.includes('ketua') && !j.includes('wakil') && !j.includes('seksi'))
    ) {
      return 1; // Paling atas: Ketua RT
    }
    if (j.includes('wakil')) {
      return 2; // Wakil Ketua RT
    }
    if (j.includes('sekretaris') || j.includes('sekre')) {
      return 3; // Sekretaris RT
    }
    if (j.includes('bendahara') || j.includes('benda') || j.includes('keuangan')) {
      return 4; // Bendahara RT
    }
    if (j.includes('keamanan') || j.includes('ronda') || j.includes('trantib') || j.includes('ketertiban')) {
      return 5;
    }
    if (j.includes('pembangunan') || j.includes('sarpras') || j.includes('sarana')) {
      return 6;
    }
    if (j.includes('sosial') || j.includes('pkk') || j.includes('pemberdayaan')) {
      return 7;
    }
    if (j.includes('kerohanian') || j.includes('keagamaan')) {
      return 8;
    }
    if (j.includes('pemuda') || j.includes('olahraga') || j.includes('karang taruna')) {
      return 9;
    }
    if (j.includes('humas') || j.includes('komunikasi') || j.includes('informasi')) {
      return 10;
    }
    return 20; // Seksi lainnya
  };

  // Pastikan daftar pengurus selalu mengedepankan Ketua RT di baris No. 1
  const sortedPengurus = useMemo(() => {
    let list = [...daftarPengurus];
    const hasKetua = list.some(p => {
      const j = (p.jabatan || '').toLowerCase();
      return j.includes('ketua') && !j.includes('wakil') && !j.includes('seksi');
    });

    // Jika belum ada pengurus dengan jabatan Ketua RT, gunakan data dari Profil RT jika tersedia
    if (!hasKetua && profilRt.namaKetuaRt) {
      const fallbackKetua: PengurusRt = {
        id: 'p-profil-ketua',
        nama: profilRt.namaKetuaRt,
        jabatan: `Ketua RT (Pimpinan RT ${profilRt.nomorRt || '02'})`,
        noHp: profilRt.nomorKontak || '-',
        alamat: `RT ${profilRt.nomorRt || '02'} / RW ${profilRt.nomorRw || '04'}, ${profilRt.desaKelurahan || 'Gasem Raya'}`,
        periode: '2024 - 2029',
        tugasPokok: 'Memimpin dan mengkoordinasikan penyelenggaraan ketertiban, pelayanan administrasi warga, serta program kemasyarakatan.',
      };
      list = [fallbackKetua, ...list];
    }

    return list.sort((a, b) => {
      const rankA = getJabatanRank(a.jabatan);
      const rankB = getJabatanRank(b.jabatan);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.nama.localeCompare(b.nama);
    });
  }, [daftarPengurus, profilRt]);

  // Group by leadership tier
  const ketua = sortedPengurus.find(p => {
    const j = (p.jabatan || '').toLowerCase();
    return j.includes('ketua') && !j.includes('wakil') && !j.includes('seksi');
  }) || sortedPengurus[0];
  const wakil = sortedPengurus.find(p => p.jabatan.toLowerCase().includes('wakil'));
  const sekretaris = sortedPengurus.find(p => p.jabatan.toLowerCase().includes('sekretaris'));
  const bendahara = sortedPengurus.find(p => p.jabatan.toLowerCase().includes('bendahara'));

  const seksiLain = sortedPengurus.filter(p => {
    const j = p.jabatan.toLowerCase();
    return !j.includes('ketua') && !j.includes('sekretaris') && !j.includes('bendahara');
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Susunan Nama & Struktur Pengurus RT {profilRt.namaAplikasi || 'GasemRaya'}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar jajaran pengurus Rukun Tetangga {profilRt.nomorRt} / RW {profilRt.nomorRw} periode {ketua?.periode || '2024 - 2029'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-md shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Cetak SK Pengurus</span>
          </button>

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pengurus</span>
            </button>
          )}
        </div>
      </div>

      {/* Organizational Chart Hierarchy Cards */}
      <div className="space-y-6 no-print">
        {/* Tier 1: Ketua RT */}
        {ketua && (
          <div className="flex justify-center">
            <div className="w-full max-w-md bg-white rounded-xl border-2 border-blue-600 p-5 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider uppercase">
                Pimpinan RT
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
                    {ketua.jabatan}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    {ketua.nama}
                  </h3>
                  {ketua.nik && (
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      NIK: {ketua.nik}
                    </span>
                  )}
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(ketua)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded transition-colors"
                      title="Ubah data pengurus"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold text-slate-800">{ketua.noHp}</span>
                </div>
                {ketua.alamat && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ketua.alamat}</span>
                  </div>
                )}
                {ketua.tugasPokok && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
                    "{ketua.tugasPokok}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tier 2: Sekretaris & Bendahara */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {sekretaris && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded">
                    {sekretaris.jabatan}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(sekretaris)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2.5">
                  {sekretaris.nama}
                </h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{sekretaris.noHp}</span>
                </p>
                {sekretaris.alamat && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{sekretaris.alamat}</span>
                  </p>
                )}
              </div>
              {sekretaris.tugasPokok && (
                <p className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  {sekretaris.tugasPokok}
                </p>
              )}
            </div>
          )}

          {bendahara && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                    {bendahara.jabatan}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(bendahara)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2.5">
                  {bendahara.nama}
                </h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{bendahara.noHp}</span>
                </p>
                {bendahara.alamat && (
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{bendahara.alamat}</span>
                  </p>
                )}
              </div>
              {bendahara.tugasPokok && (
                <p className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  {bendahara.tugasPokok}
                </p>
              )}
            </div>
          )}

          {wakil && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                    {wakil.jabatan}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => handleOpenEdit(wakil)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-2.5">{wakil.nama}</h4>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{wakil.noHp}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tier 3: Koordinator Seksi / Bidang */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Koordinator Seksi & Bidang Operasional
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {seksiLain.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between hover:shadow-xs transition-shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {p.jabatan}
                    </span>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Ubah"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={async () => {
                            const setuju = await confirmDialog({
                              title: 'Hapus Pengurus RT',
                              message: `Apakah Anda yakin ingin menghapus pengurus "${p.nama}" (${p.jabatan})?`,
                              variant: 'danger',
                              confirmText: 'Ya, Hapus Pengurus',
                              cancelText: 'Batal',
                            });
                            if (setuju) {
                              onHapusPengurus(p.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mt-2">{p.nama}</h4>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{p.noHp}</span>
                  </p>
                  {p.alamat && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{p.alamat}</span>
                    </p>
                  )}
                </div>

                {p.tugasPokok && (
                  <p className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 italic">
                    {p.tugasPokok}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Printable Sheet: SK Penetapan & Bagan Susunan Pengurus RT GasemRaya */}
      <div
        id="lembar-cetak-pengurus"
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
            SUSUNAN NAMA DAN STRUKTUR PENGURUS RT
          </h3>
          <p className="text-xs text-slate-700 mt-1 font-semibold">
            Masa Bakti: Periode {ketua?.periode || '2024 - 2029'}
          </p>
        </div>

        {/* Tabel Cetak Pengurus */}
        <table className="print-table w-full text-xs border-collapse border border-slate-900 text-slate-900">
          <thead>
            <tr className="bg-slate-100 font-bold text-center">
              <th className="border border-slate-900 p-2 w-8">No</th>
              <th className="border border-slate-900 p-2 w-48 text-left">Jabatan</th>
              <th className="border border-slate-900 p-2 text-left">Nama Lengkap</th>
              <th className="border border-slate-900 p-2 w-32">Nomor HP / Kontak</th>
              <th className="border border-slate-900 p-2">Tugas Pokok & Wewenang</th>
            </tr>
          </thead>
          <tbody>
            {sortedPengurus.map((item, idx) => (
              <tr key={item.id} className={idx === 0 ? 'bg-amber-50/50 font-semibold' : ''}>
                <td className="border border-slate-900 p-2 text-center font-bold">{idx + 1}</td>
                <td className="border border-slate-900 p-2 font-bold">{item.jabatan}</td>
                <td className="border border-slate-900 p-2 font-medium">
                  <div>{item.nama}</div>
                  {item.alamat && <div className="text-[10px] text-slate-600 font-normal">{item.alamat}</div>}
                </td>
                <td className="border border-slate-900 p-2 text-center font-mono">{item.noHp}</td>
                <td className="border border-slate-900 p-2 text-justify">{item.tugasPokok || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Kolom Tanda Tangan */}
        <div className="mt-10 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-slate-600">Mengetahui,</p>
            <p className="font-bold text-slate-900 mt-0.5">Ketua RW {profilRt.nomorRw}</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 underline">( Ketua RW {profilRt.nomorRw} )</p>
          </div>
          <div>
            <p className="text-slate-600">{profilRt.kotaKabupaten}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold text-slate-900 mt-0.5">Ketua RT {profilRt.nomorRt} GasemRaya</p>
            <div className="h-16"></div>
            <p className="font-bold text-slate-900 underline">{profilRt.namaKetuaRt}</p>
          </div>
        </div>
      </div>

      {/* Modal Tambah / Edit Pengurus */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>{editingItem ? 'Ubah Data Pengurus RT' : 'Tambah Pengurus RT GasemRaya'}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
              {/* Optional Quick Select from Warga */}
              {!editingItem && (
                <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-100">
                  <label className="block text-xs font-semibold text-blue-900 mb-1">
                    Pilih Cepat dari Data Warga RT:
                  </label>
                  <select
                    onChange={e => handleSelectFromWarga(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Ketik manual atau pilih warga terdaftar --</option>
                    {daftarWarga.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.nama} (NIK: {w.nik}) - {w.alamat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Bambang Supriyanto, S.T."
                  value={nama}
                  onChange={e => setNama(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jabatan <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: Bendahara RT / Seksi Keamanan"
                    value={jabatan}
                    onChange={e => setJabatan(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Periode Masa Bakti <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: 2024 - 2029"
                    value={periode}
                    onChange={e => setPeriode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Misal: 0812-3456-7890"
                    value={noHp}
                    onChange={e => setNoHp(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NIK (Opsional)
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 digit NIK"
                    value={nik}
                    onChange={e => setNik(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full px-3 py-2 text-sm font-mono bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Rumah di RT GasemRaya
                </label>
                <input
                  type="text"
                  placeholder="Misal: Jl. Melati No. 12"
                  value={alamat}
                  onChange={e => setAlamat(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Tugas Pokok & Wewenang
                </label>
                <textarea
                  rows={2}
                  placeholder="Tanggung jawab utama pengurus..."
                  value={tugasPokok}
                  onChange={e => setTugasPokok(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

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
                  <span>Simpan Pengurus</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
