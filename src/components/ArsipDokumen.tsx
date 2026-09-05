import React, { useState, useMemo } from 'react';
import {
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  Plus,
  BookOpen,
  Printer,
  X,
  FileCheck,
  Shield,
  FileCode,
  Paperclip,
  Cloud,
  Loader2,
} from 'lucide-react';
import { DokumenRt, ProfilRt, UserSession } from '../types';
import { processAndUploadAttachment } from '../utils/imageCompressor';

interface ArsipDokumenProps {
  daftarDokumen: DokumenRt[];
  profilRt: ProfilRt;
  onTambahDokumen: (dokumen: DokumenRt) => void;
  onHapusDokumen: (id: string) => void;
  onNavigateToDrive?: () => void;
  currentUser?: UserSession | null;
}

export const ArsipDokumen: React.FC<ArsipDokumenProps> = ({
  daftarDokumen,
  profilRt,
  onTambahDokumen,
  onHapusDokumen,
  onNavigateToDrive,
  currentUser,
}) => {
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'pengurus';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('SEMUA');
  const [modalUploadOpen, setModalUploadOpen] = useState(false);
  const [bacaDokumen, setBacaDokumen] = useState<DokumenRt | null>(null);

  // Form State for new Document Upload
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
    setModalUploadOpen(false);

    // Reset Form
    setJudul('');
    setNomorSurat('');
    setDeskripsi('');
    setNamaFile('');
    setFileData(undefined);
    setKontenTeks('');
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

      return true;
    });
  }, [daftarDokumen, searchTerm, selectedKategori]);

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
      alert(`Mengunduh arsip dokumen ${doc.namaFile}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Arsip Dokumen RT & Berkas AD / ART</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pusat penyimpanan berkas Anggaran Dasar & Anggaran Rumah Tangga (AD/ART), surat edaran, formulir, dan peraturan resmi RT GasemRaya.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToDrive && (
            <button
              id="btn-goto-drive-from-docs"
              onClick={onNavigateToDrive}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-colors"
              title="Buka Google Drive RT"
            >
              <Cloud className="w-4 h-4 text-amber-700" />
              <span>Google Drive RT</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setModalUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Berkas / AD ART</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['SEMUA', 'AD/ART', 'Peraturan RT', 'Formulir', 'SK Pengurus', 'Laporan Keuangan', 'Lainnya'].map(kat => (
              <button
                key={kat}
                onClick={() => setSelectedKategori(kat)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  selectedKategori === kat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {kat === 'SEMUA' ? 'Semua Berkas' : kat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul, nomor surat, atau kata kunci..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-100 border-none rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
        {filteredDokumen.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-700">Tidak ada dokumen ditemukan</p>
            <p className="text-xs mt-1">Coba ganti kata kunci pencarian atau unggah dokumen baru.</p>
          </div>
        ) : (
          filteredDokumen.map(doc => {
            const isAdArt = doc.kategori === 'AD/ART';
            return (
              <div
                key={doc.id}
                className={`bg-white rounded-xl border p-5 shadow-sm transition-all hover:shadow-md flex flex-col justify-between ${
                  isAdArt ? 'border-blue-300 ring-1 ring-blue-100' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded ${
                          isAdArt
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {doc.kategori}
                      </span>
                      {doc.isProtected && (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          <span>Resmi RT</span>
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">{doc.tanggal}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug">
                    {doc.judul}
                  </h3>

                  {doc.nomorSurat && (
                    <p className="text-xs font-mono text-slate-500 mt-1">
                      No: {doc.nomorSurat}
                    </p>
                  )}

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {doc.deskripsi}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span className="font-mono">{doc.ukuranFile || 'PDF'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setBacaDokumen(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      title="Baca teks dan rincian berkas"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Baca / Lihat</span>
                    </button>

                    <button
                      onClick={() => handleDownload(doc)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      title="Unduh berkas"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </button>

                    {!doc.isProtected && isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm(`Hapus berkas "${doc.judul}"?`)) {
                            onHapusDokumen(doc.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
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

      {/* Modal Upload Berkas Baru */}
      {modalUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Unggah Berkas / Dokumen RT</span>
              </h3>
              <button
                onClick={() => setModalUploadOpen(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Judul Dokumen <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: AD/ART Perubahan 2026 / Peraturan Siskamling"
                  value={judul}
                  onChange={e => setJudul(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={kategori}
                    onChange={e => setKategori(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tanggal Terbit
                  </label>
                  <input
                    type="date"
                    value={tanggal}
                    onChange={e => setTanggal(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Surat / SK (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Misal: 05/SK-RT/GR/2026"
                  value={nomorSurat}
                  onChange={e => setNomorSurat(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deskripsi / Keterangan Berkas
                </label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan isi dokumen atau peraturan..."
                  value={deskripsi}
                  onChange={e => setDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* File Attachment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pilih File Berkas (PDF, DOC, Gambar, dll)
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
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
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-blue-600" />
                    )}
                    <span className="text-xs font-semibold text-blue-700">
                      {isProcessingFile ? 'Sedang memproses & mengompres...' : namaFile ? namaFile : 'Klik untuk pilih file dari perangkat'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Mendukung PDF, DOC, DOCX, PNG, JPG, TXT (Otomatis Kompres)
                    </span>
                  </label>
                </div>
              </div>

              {/* Text content alternative */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Atau Masukkan Teks Lengkap Dokumen / AD ART:
                </label>
                <textarea
                  rows={3}
                  placeholder="Salin teks pasal-pasal AD/ART atau surat di sini jika tidak menggunakan file..."
                  value={kontenTeks}
                  onChange={e => setKontenTeks(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-100 border-none rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalUploadOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
                >
                  Simpan Dokumen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Baca & Pratinjau Dokumen (Termasuk AD/ART Resmi) */}
      {bacaDokumen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[88vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    {bacaDokumen.kategori}
                  </span>
                  <span className="text-xs text-slate-500">{bacaDokumen.tanggal}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {bacaDokumen.judul}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="p-1.5 text-slate-600 hover:bg-slate-200 rounded transition-colors"
                  title="Cetak dokumen ini"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBacaDokumen(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {bacaDokumen.nomorSurat && (
                <div className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 p-2.5 rounded">
                  Nomor: {bacaDokumen.nomorSurat}
                </div>
              )}

              <p className="text-xs text-slate-600 italic bg-blue-50/60 p-3 rounded border border-blue-100">
                {bacaDokumen.deskripsi}
              </p>

              {/* If full text exists (like AD/ART) */}
              {bacaDokumen.kontenTeks ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                  {bacaDokumen.kontenTeks}
                </div>
              ) : bacaDokumen.fileData && bacaDokumen.tipeFile === 'image' ? (
                <div className="flex justify-center p-4 bg-slate-50 rounded-lg">
                  <img src={bacaDokumen.fileData} alt={bacaDokumen.judul} className="max-h-96 rounded object-contain" />
                </div>
              ) : bacaDokumen.fileData && bacaDokumen.tipeFile === 'pdf' ? (
                <iframe src={bacaDokumen.fileData} title={bacaDokumen.judul} className="w-full h-96 rounded border" />
              ) : (
                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                  <p className="font-semibold text-sm">Berkas Digital: {bacaDokumen.namaFile}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Silakan klik tombol "Unduh Berkas" di bawah untuk membuka dokumen lengkap di perangkat Anda.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-xs text-slate-400 font-mono">
                Berkas: {bacaDokumen.namaFile} ({bacaDokumen.ukuranFile || 'Standar'})
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(bacaDokumen)}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen</span>
                </button>
                <button
                  onClick={() => setBacaDokumen(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-md"
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
