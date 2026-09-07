import React, { useState, useMemo } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  BookOpen,
  Printer,
  X,
  Shield,
  Paperclip,
  Cloud,
  Loader2,
  Edit3,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { DokumenRt, ProfilRt, UserSession } from '../types';
import { processAndUploadAttachment } from '../utils/imageCompressor';
import { canManageDokumen } from '../utils/permissions';
import { useConfirm, useToast } from '../context/NotificationContext';

interface ArsipDokumenProps {
  daftarDokumen: DokumenRt[];
  profilRt: ProfilRt;
  onTambahDokumen: (dokumen: DokumenRt) => void;
  onEditDokumen?: (dokumen: DokumenRt) => void;
  onHapusDokumen: (id: string) => void;
  onNavigateToDrive?: () => void;
  currentUser?: UserSession | null;
}

export const ArsipDokumen: React.FC<ArsipDokumenProps> = ({
  daftarDokumen,
  profilRt,
  onTambahDokumen,
  onEditDokumen,
  onHapusDokumen,
  onNavigateToDrive,
  currentUser,
}) => {
  // Blindspot 1 Fix: Gunakan canManageDokumen agar Ketua RT, Sekretaris, Bendahara, Developer, & Admin dapat mengelola
  const canManage = canManageDokumen(currentUser?.role);
  const confirmDialog = useConfirm();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('SEMUA');
  const [selectedTahun, setSelectedTahun] = useState<string>('SEMUA');
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
  const [bacaDokumen, setBacaDokumen] = useState<DokumenRt | null>(null);
  const [editingDoc, setEditingDoc] = useState<DokumenRt | null>(null);

  // Form State for new or edited Document
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<DokumenRt['kategori']>('AD/ART');
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [deskripsi, setDeskripsi] = useState('');
  const [namaFile, setNamaFile] = useState('');
  const [fileData, setFileData] = useState<string | undefined>(undefined);
  const [ukuranFile, setUkuranFile] = useState<string>('0 KB');
  const [tipeFile, setTipeFile] = useState<'pdf' | 'doc' | 'image' | 'text'>('pdf');
  const [kontenTeks, setKontenTeks] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isLargeFile, setIsLargeFile] = useState(false);

  // Filter Tahun Terbit
  const daftarTahun = useMemo(() => {
    const years = new Set<string>();
    daftarDokumen.forEach(doc => {
      if (doc.tanggal) {
        const y = doc.tanggal.split('-')[0];
        if (y && y.length === 4) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [daftarDokumen]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingDoc(null);
    setJudul('');
    setKategori('AD/ART');
    setNomorSurat('');
    setTanggal(new Date().toISOString().split('T')[0]);
    setDeskripsi('');
    setNamaFile('');
    setFileData(undefined);
    setUkuranFile('0 KB');
    setTipeFile('pdf');
    setKontenTeks('');
    setIsLargeFile(false);
    setModalUploadOpen(true);
  };

  // Blindspot 3 Fix: Buka Modal Edit / Revisi Dokumen & AD/ART
  const handleOpenEdit = (doc: DokumenRt) => {
    setEditingDoc(doc);
    setJudul(doc.judul);
    setKategori(doc.kategori);
    setNomorSurat(doc.nomorSurat || '');
    setTanggal(doc.tanggal || new Date().toISOString().split('T')[0]);
    setDeskripsi(doc.deskripsi || '');
    setNamaFile(doc.namaFile || '');
    setFileData(doc.fileData);
    setUkuranFile(doc.ukuranFile || '120 KB');
    setTipeFile(doc.tipeFile || 'pdf');
    setKontenTeks(doc.kontenTeks || '');
    setIsLargeFile(false);
    setModalUploadOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNamaFile(file.name);

    // Tentukan tipe berkas
    if (file.type.includes('pdf')) {
      setTipeFile('pdf');
    } else if (file.type.includes('image')) {
      setTipeFile('image');
    } else if (file.type.includes('text')) {
      setTipeFile('text');
    } else {
      setTipeFile('doc');
    }

    // Blindspot 2 Fix: Peringatan jika file > 2MB
    const fileSizeMb = file.size / (1024 * 1024);
    setIsLargeFile(fileSizeMb > 2);

    setIsProcessingFile(true);
    try {
      const res = await processAndUploadAttachment(file, 'dokumen-rt');
      setFileData(res.url);
      setUkuranFile(res.fileSizeKb > 1024 ? `${(res.fileSizeKb / 1024).toFixed(1)} MB` : `${res.fileSizeKb} KB`);
    } catch (err) {
      console.warn('Gagal memproses lampiran dokumen:', err);
      const kb = Math.round(file.size / 1024);
      setUkuranFile(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) return;

    if (editingDoc) {
      // Update Dokumen yang Ada
      const updatedDoc: DokumenRt = {
        ...editingDoc,
        judul: judul.trim(),
        kategori,
        nomorSurat: nomorSurat.trim() || undefined,
        tanggal,
        deskripsi: deskripsi.trim() || `Dokumen resmi ${kategori} RT GasemRaya`,
        namaFile: namaFile || editingDoc.namaFile || `${judul.replace(/\s+/g, '_')}.pdf`,
        ukuranFile: ukuranFile || editingDoc.ukuranFile || '120 KB',
        tipeFile,
        fileData: fileData !== undefined ? fileData : editingDoc.fileData,
        kontenTeks: kontenTeks.trim() || undefined,
      };

      if (onEditDokumen) {
        onEditDokumen(updatedDoc);
      } else {
        onTambahDokumen(updatedDoc);
      }

      // Update pembaca jika dokumen yang sama sedang dibuka
      if (bacaDokumen?.id === editingDoc.id) {
        setBacaDokumen(updatedDoc);
      }
    } else {
      // Tambah Dokumen Baru
      const newDoc: DokumenRt = {
        id: `dok-${Date.now()}`,
        judul: judul.trim(),
        kategori,
        nomorSurat: nomorSurat.trim() || undefined,
        tanggal,
        deskripsi: deskripsi.trim() || `Dokumen resmi ${kategori} RT GasemRaya`,
        namaFile: namaFile || `${judul.replace(/\s+/g, '_')}.pdf`,
        ukuranFile: ukuranFile || '120 KB',
        tipeFile,
        fileData,
        kontenTeks: kontenTeks.trim() || undefined,
      };

      onTambahDokumen(newDoc);
    }

    setModalUploadOpen(false);
    setEditingDoc(null);

    // Reset Form
    setJudul('');
    setNomorSurat('');
    setDeskripsi('');
    setNamaFile('');
    setFileData(undefined);
    setKontenTeks('');
    setIsLargeFile(false);
  };

  const filteredDokumen = useMemo(() => {
    return daftarDokumen.filter(doc => {
      const matchSearch =
        doc.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.nomorSurat && doc.nomorSurat.toLowerCase().includes(searchTerm.toLowerCase())) ||
        doc.kategori.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (selectedKategori !== 'SEMUA' && doc.kategori !== selectedKategori) {
        return false;
      }

      // Blindspot 5 Fix: Filter Tahun Terbit
      if (selectedTahun !== 'SEMUA' && !doc.tanggal.startsWith(selectedTahun)) {
        return false;
      }

      return true;
    });
  }, [daftarDokumen, searchTerm, selectedKategori, selectedTahun]);

  const handleDownload = (doc: DokumenRt) => {
    if (doc.fileData) {
      const a = document.createElement('a');
      a.href = doc.fileData;
      a.download = doc.namaFile;
      a.click();
    } else if (doc.kontenTeks) {
      const blob = new Blob([doc.kontenTeks], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.namaFile.endsWith('.txt') ? doc.namaFile : `${doc.namaFile}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      toast.info(`Mengunduh arsip berkas "${doc.namaFile}"`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-700" />
            <span>Arsip Dokumen RT & Berkas AD / ART</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Pusat penyimpanan berkas Anggaran Dasar & Anggaran Rumah Tangga (AD/ART), surat edaran, formulir, dan peraturan resmi RT Gasem Raya.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToDrive && (
            <button
              id="btn-goto-drive-from-docs"
              onClick={onNavigateToDrive}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
              title="Buka Google Drive RT"
            >
              <Cloud className="w-4 h-4 text-amber-700" />
              <span>Google Drive RT</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Berkas Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs, Tahun & Search */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['SEMUA', 'AD/ART', 'Peraturan RT', 'Surat Edaran', 'Formulir', 'SK Pengurus', 'Laporan Keuangan', 'Lainnya'].map(kat => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  selectedKategori === kat
                    ? 'bg-amber-800 text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                {kat === 'SEMUA' ? 'Semua Kategori' : kat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter Tahun Terbit Dropdown */}
            {daftarTahun.length > 0 && (
              <div className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg border border-stone-200 text-xs">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <select
                  value={selectedTahun}
                  onChange={e => setSelectedTahun(e.target.value)}
                  className="bg-transparent text-stone-700 font-semibold focus:outline-none cursor-pointer text-xs"
                >
                  <option value="SEMUA">Semua Tahun</option>
                  {daftarTahun.map(y => (
                    <option key={y} value={y}>
                      Tahun {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Bar */}
            <div className="w-full sm:w-64 relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari judul, nomor surat..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-stone-100 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        {filteredDokumen.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-stone-200 text-stone-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-stone-300" />
            <p className="font-semibold text-stone-700">Tidak ada dokumen ditemukan</p>
            <p className="text-xs mt-1">Coba ganti kata kunci pencarian atau unggah dokumen baru.</p>
          </div>
        ) : (
          filteredDokumen.map(doc => {
            const isAdArt = doc.kategori === 'AD/ART';
            return (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl border p-5 shadow-2xs transition-all hover:shadow-md flex flex-col justify-between ${
                  isAdArt ? 'border-amber-400 ring-1 ring-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white' : 'border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                          isAdArt
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {doc.kategori}
                      </span>
                      {doc.isProtected && (
                        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>Dokumen Baku RT</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 font-medium">{doc.tanggal}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-stone-900 mt-2.5 leading-snug">
                    {doc.judul}
                  </h3>

                  {doc.nomorSurat && (
                    <p className="text-xs font-mono text-stone-500 mt-1">
                      No: {doc.nomorSurat}
                    </p>
                  )}

                  <p className="text-xs text-stone-600 mt-2 line-clamp-3 leading-relaxed">
                    {doc.deskripsi}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-stone-400">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="font-mono text-[11px]">{doc.ukuranFile || 'PDF / Teks'}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setBacaDokumen(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                      title="Baca teks dan rincian berkas"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Baca</span>
                    </button>

                    <button
                      onClick={() => handleDownload(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                      title="Unduh berkas"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>

                    {/* Blindspot 3 Fix: Tombol Edit / Revisi untuk Role Pengurus */}
                    {canManage && (
                      <button
                        onClick={() => handleOpenEdit(doc)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                        title={doc.isProtected ? 'Amandemen / Revisi Teks AD-ART' : 'Edit rincian dokumen'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    {!doc.isProtected && canManage && (
                      <button
                        onClick={async () => {
                          const setuju = await confirmDialog({
                            title: 'Hapus Berkas Dokumen',
                            message: `Apakah Anda yakin ingin menghapus dokumen "${doc.judul}"?`,
                            variant: 'danger',
                            confirmText: 'Ya, Hapus Dokumen',
                            cancelText: 'Batal',
                          });
                          if (setuju) {
                            onHapusDokumen(doc.id);
                          }
                        }}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus berkas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Form Upload / Edit Dokumen */}
      {modalUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                {editingDoc ? (
                  <>
                    <Edit3 className="w-5 h-5 text-amber-700" />
                    <span>{editingDoc.isProtected ? 'Amandemen / Revisi AD/ART RT' : 'Edit Dokumen Arsip RT'}</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-amber-700" />
                    <span>Unggah Berkas / Dokumen RT Baru</span>
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setModalUploadOpen(false);
                  setEditingDoc(null);
                }}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Judul Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AD/ART Amandemen 2026 / Peraturan Siskamling"
                  value={judul}
                  onChange={e => setJudul(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={kategori}
                    onChange={e => setKategori(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600 cursor-pointer"
                  >
                    <option value="AD/ART">AD/ART</option>
                    <option value="Peraturan RT">Peraturan RT</option>
                    <option value="Surat Edaran">Surat Edaran</option>
                    <option value="Formulir">Formulir</option>
                    <option value="SK Pengurus">SK Pengurus</option>
                    <option value="Laporan Keuangan">Laporan Keuangan</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nomor Surat / SK (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: 05/SK-RT/GR/2026"
                  value={nomorSurat}
                  onChange={e => setNomorSurat(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Deskripsi / Keterangan Dokumen
                </label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan isi dokumen atau peraturan hasil musyawarah warga..."
                  value={deskripsi}
                  onChange={e => setDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pilih File Berkas (PDF, DOC, Gambar, dll)
                </label>
                <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center hover:bg-stone-50 transition-colors">
                  <input
                    type="file"
                    id="input-file-doc"
                    onChange={handleFileChange}
                    disabled={isProcessingFile}
                    className="hidden"
                  />
                  <label
                    htmlFor="input-file-doc"
                    className="cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    {isProcessingFile ? (
                      <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-amber-700" />
                    )}
                    <span className="text-xs font-bold text-amber-900">
                      {isProcessingFile ? 'Sedang memproses & mengompres...' : namaFile ? namaFile : 'Klik untuk memilih berkas baru'}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      Mendukung PDF, DOC, DOCX, PNG, JPG, TXT (Otomatis Kompres)
                    </span>
                  </label>
                </div>

                {/* Blindspot 2 Warning: Peringatan Berkas Besar */}
                {isLargeFile && (
                  <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Ukuran Berkas Lebih dari 2 MB</p>
                      <p className="mt-0.5 text-stone-600 leading-relaxed text-[11px]">
                        Menyimpan berkas besar secara offline dapat memperlambat browser warga. Disarankan untuk mengunggah ke menu <strong>Google Drive RT</strong>, lalu masukkan ringkasannya di kolom teks di bawah.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Text content (AD/ART atau teks naskah resmi) */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Naskah Teks Lengkap Dokumen / Pasal-Pasal AD ART:
                </label>
                <textarea
                  rows={4}
                  placeholder="Salin teks pasal-pasal AD/ART atau naskah peraturan di sini agar dapat dibaca langsung..."
                  value={kontenTeks}
                  onChange={e => setKontenTeks(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setModalUploadOpen(false);
                    setEditingDoc(null);
                  }}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold text-stone-600 hover:bg-stone-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessingFile}
                  className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {editingDoc ? 'Simpan Perubahan' : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Baca & Pratinjau Dokumen (Lengkap dengan Kop Surat Resmi RT saat Cetak) */}
      {bacaDokumen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/90">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md">
                    {bacaDokumen.kategori}
                  </span>
                  <span className="text-xs text-stone-500 font-medium">{bacaDokumen.tanggal}</span>
                  {bacaDokumen.isProtected && (
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Dokumen Baku RT</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-stone-900 mt-1">
                  {bacaDokumen.judul}
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {canManage && (
                  <button
                    onClick={() => {
                      const d = bacaDokumen;
                      setBacaDokumen(null);
                      handleOpenEdit(d);
                    }}
                    className="p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                    title="Edit / Revisi Naskah Dokumen Ini"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="Cetak Dokumen Resmi"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBacaDokumen(null)}
                  className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content / Printable Document Area */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Blindspot 4 Fix: Kop Surat Resmi RT Gasem Raya */}
              <div className="border-b-2 border-double border-stone-800 pb-3 mb-3 text-center">
                <p className="text-[11px] uppercase tracking-widest font-semibold text-stone-600">
                  Rukun Tetangga {profilRt.nomorRt || '02'} / Rukun Warga {profilRt.nomorRw || '04'}
                </p>
                <h2 className="text-base sm:text-lg font-black uppercase text-stone-900 tracking-wide">
                  PENGURUS LINGKUNGAN GASEM RAYA
                </h2>
                <p className="text-[11px] text-stone-600">
                  Kel. {profilRt.desaKelurahan || 'Tlogosari Wetan'}, Kec. {profilRt.kecamatan || 'Pedurungan'}, {profilRt.kotaKabupaten || 'Kota Semarang'} {profilRt.kodePos || '50196'}
                </p>
                <p className="text-[10px] text-stone-500">
                  Sekretariat: {profilRt.nomorKontak || '0812-3456-7890'} | Dokumen Administrasi Resmi Lingkungan
                </p>
              </div>

              {bacaDokumen.nomorSurat && (
                <div className="text-xs font-mono font-bold text-stone-700 bg-stone-100 p-2.5 rounded-lg border border-stone-200">
                  Nomor Surat / Naskah: {bacaDokumen.nomorSurat}
                </div>
              )}

              <p className="text-xs text-stone-700 italic bg-amber-50/70 p-3 rounded-xl border border-amber-200 leading-relaxed">
                {bacaDokumen.deskripsi}
              </p>

              {/* Naskah Teks (AD/ART atau Peraturan RT) */}
              {bacaDokumen.kontenTeks ? (
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 leading-relaxed font-mono whitespace-pre-wrap">
                  {bacaDokumen.kontenTeks}
                </div>
              ) : bacaDokumen.fileData && bacaDokumen.tipeFile === 'image' ? (
                <div className="flex justify-center p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <img src={bacaDokumen.fileData} alt={bacaDokumen.judul} className="max-h-96 rounded object-contain" />
                </div>
              ) : bacaDokumen.fileData && bacaDokumen.tipeFile === 'pdf' ? (
                <iframe src={bacaDokumen.fileData} title={bacaDokumen.judul} className="w-full h-96 rounded-xl border border-stone-200" />
              ) : (
                <div className="p-8 text-center text-stone-500 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <FileText className="w-10 h-10 mx-auto text-stone-400" />
                  <p className="font-bold text-sm text-stone-800">Berkas Lampiran Digital: {bacaDokumen.namaFile}</p>
                  <p className="text-xs text-stone-500">
                    Klik tombol "Unduh Dokumen" di bawah untuk membuka naskah lengkap pada perangkat Anda.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-stone-200 flex items-center justify-between bg-stone-50">
              <span className="text-xs text-stone-500 font-mono text-[11px]">
                Berkas: {bacaDokumen.namaFile} ({bacaDokumen.ukuranFile || 'Standar'})
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(bacaDokumen)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 rounded-xl transition-colors cursor-pointer active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen</span>
                </button>
                <button
                  onClick={() => setBacaDokumen(null)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-200 rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
