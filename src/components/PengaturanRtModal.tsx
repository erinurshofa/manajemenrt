import React, { useState } from 'react';
import { X, Settings, Save, RotateCcw, Download, Upload, Check, Palette } from 'lucide-react';
import { ProfilRt, Warga, MutasiRecord, TransaksiKas, DokumenRt, PengurusRt } from '../types';
import { useConfirm, useToast } from '../context/NotificationContext';

interface PengaturanRtModalProps {
  isOpen: boolean;
  onClose: () => void;
  profilRt: ProfilRt;
  onSaveProfil: (profil: ProfilRt) => void;
  onResetData: () => void;
  daftarWarga: Warga[];
  daftarMutasi: MutasiRecord[];
  daftarKas?: TransaksiKas[];
  daftarDokumen?: DokumenRt[];
  daftarPengurus?: PengurusRt[];
  onOpenThemeModal?: () => void;
  onImportData: (
    warga: Warga[],
    mutasi: MutasiRecord[],
    profil: ProfilRt,
    kas?: TransaksiKas[],
    dokumen?: DokumenRt[],
    pengurus?: PengurusRt[]
  ) => void;
}

export const PengaturanRtModal: React.FC<PengaturanRtModalProps> = ({
  isOpen,
  onClose,
  profilRt,
  onSaveProfil,
  onResetData,
  daftarWarga,
  daftarMutasi,
  daftarKas = [],
  daftarDokumen = [],
  daftarPengurus = [],
  onOpenThemeModal,
  onImportData,
}) => {
  const confirmDialog = useConfirm();
  const toast = useToast();

  const [form, setForm] = useState<ProfilRt>(profilRt);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (field: keyof ProfilRt, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSaveProfil(form);
    setSavedSuccess(true);
    toast.success('Pengaturan profil RT berhasil disimpan!');
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  const handleExportData = () => {
    const backupData = {
      profilRt: form,
      daftarWarga,
      daftarMutasi,
      daftarKas,
      daftarDokumen,
      daftarPengurus,
      exportDate: new Date().toISOString(),
      version: '1.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cadangan_data_rt_gasem_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('File cadangan JSON berhasil diunduh.');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.daftarWarga && Array.isArray(json.daftarWarga)) {
          onImportData(
            json.daftarWarga,
            json.daftarMutasi || [],
            json.profilRt || form,
            json.daftarKas,
            json.daftarDokumen,
            json.daftarPengurus
          );
          toast.success('Data GasemRaya berhasil dipulihkan dari cadangan!');
          onClose();
        } else {
          toast.error('Format file cadangan tidak valid.');
        }
      } catch (err) {
        toast.error('Gagal membaca file JSON cadangan.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-600" />
              <span>Pengaturan Wilayah & Pejabat RT</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pengaturan ini akan digunakan pada kop surat dan tanda tangan laporan bulanan resmi.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-sm text-slate-700">
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor RT</label>
              <input
                type="text"
                value={form.nomorRt}
                onChange={e => setForm({ ...form, nomorRt: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nomor RW</label>
              <input
                type="text"
                value={form.nomorRw}
                onChange={e => setForm({ ...form, nomorRw: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Desa / Kelurahan</label>
              <input
                type="text"
                value={form.desaKelurahan}
                onChange={e => setForm({ ...form, desaKelurahan: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kecamatan</label>
              <input
                type="text"
                value={form.kecamatan}
                onChange={e => setForm({ ...form, kecamatan: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={form.kotaKabupaten}
                onChange={e => setForm({ ...form, kotaKabupaten: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Pos</label>
              <input
                type="text"
                value={form.kodePos}
                onChange={e => setForm({ ...form, kodePos: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Pejabat Pengurus & Nama Lingkungan
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Aplikasi / Paguyuban RT</label>
                <input
                  type="text"
                  value={form.namaAplikasi || 'GasemRaya'}
                  onChange={e => setForm({ ...form, namaAplikasi: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white font-semibold"
                  placeholder="GasemRaya"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ketua RT</label>
                  <input
                    type="text"
                    value={form.namaKetuaRt}
                    onChange={e => setForm({ ...form, namaKetuaRt: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Sekretaris RT</label>
                  <input
                    type="text"
                    value={form.namaSekretaris}
                    onChange={e => setForm({ ...form, namaSekretaris: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Bendahara RT</label>
                  <input
                    type="text"
                    value={form.namaBendahara || ''}
                    onChange={e => setForm({ ...form, namaBendahara: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                    placeholder="Hj. Ratna Sari, S.E."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tema Batik & Logo RT Section */}
          {onOpenThemeModal && (
            <div className="pt-2 border-t border-slate-200">
              <div className="p-3.5 bg-amber-50/80 border border-amber-300/80 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-amber-700" />
                    <span>Tema Batik & Logo RT GasemRaya</span>
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Preset batik (Soga, Mega Mendung, Parang, dll.), unggah logo custom, & warna aksen.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenThemeModal();
                  }}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  Buka Kustomisasi
                </button>
              </div>
            </div>
          )}

          {/* Backup & Restore Section */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Cadangan Data (Backup & Pemulihan)
            </h4>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Cadangan JSON</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Pulihkan dari JSON</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>

              <button
                type="button"
                onClick={async () => {
                  const setuju = await confirmDialog({
                    title: 'Reset ke Data Bawaan',
                    message: 'Kembalikan semua data ke contoh awal RT?',
                    details: 'Peringatan: Seluruh data yang belum dicadangkan akan hilang.',
                    variant: 'danger',
                    confirmText: 'Ya, Reset Data',
                    cancelText: 'Batal',
                  });
                  if (setuju) {
                    onResetData();
                    toast.info('Data berhasil dikembalikan ke contoh awal.');
                    onClose();
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors ml-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs transition-colors"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Tersimpan!' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
