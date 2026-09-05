import React, { useState, useRef } from 'react';
import {
  X,
  Palette,
  Image as ImageIcon,
  Check,
  Upload,
  RotateCcw,
  Sparkles,
  Sliders,
  Shield,
  Trash2,
} from 'lucide-react';
import {
  ProfilRt,
  ThemeConfig,
  LogoConfig,
  PresetTemaBatik,
  LogoType,
} from '../types';
import { THEME_PRESETS, DEFAULT_THEME_CONFIG, DEFAULT_LOGO_CONFIG } from '../data/initialData';
import { BatikLogo } from './BatikLogo';

interface PengaturanTemaLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profilRt: ProfilRt;
  onSaveThemeAndLogo: (theme: ThemeConfig, logo: LogoConfig) => void;
}

export const PengaturanTemaLogoModal: React.FC<PengaturanTemaLogoModalProps> = ({
  isOpen,
  onClose,
  profilRt,
  onSaveThemeAndLogo,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'logo' | 'warna'>('warna');
  
  // Local state for draft changes
  const [draftTheme, setDraftTheme] = useState<ThemeConfig>(() => {
    return profilRt.themeConfig || DEFAULT_THEME_CONFIG;
  });

  const [draftLogo, setDraftLogo] = useState<LogoConfig>(() => {
    return profilRt.logoConfig || DEFAULT_LOGO_CONFIG;
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Preset selection
  const handleSelectPreset = (presetKey: PresetTemaBatik) => {
    const presetData = THEME_PRESETS[presetKey];
    setDraftTheme(prev => ({
      ...prev,
      preset: presetKey,
      warnaUtama: presetData.warnaUtama,
      warnaSidebar: presetData.warnaSidebar,
      warnaHeader: presetData.warnaHeader,
    }));
  };

  // Handle Custom File Upload for Logo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (PNG, JPG, SVG, atau WEBP).');
      return;
    }

    // Limit to 2MB for base64 storage
    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file gambar maksimal 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      const result = event.target?.result as string;
      setDraftLogo(prev => ({
        ...prev,
        tipe: 'custom-image',
        customImageDataUrl: result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSaveThemeAndLogo(draftTheme, draftLogo);
    onClose();
  };

  const handleResetToDefault = () => {
    if (confirm('Kembalikan tema dan logo ke standar Batik Soga Klasik?')) {
      setDraftTheme(DEFAULT_THEME_CONFIG);
      setDraftLogo(DEFAULT_LOGO_CONFIG);
    }
  };

  const logoOptions: { id: LogoType; label: string; desc: string }[] = [
    {
      id: 'emblem-keraton',
      label: 'Emblem Keraton Tradisional',
      desc: 'Ornamen ukir klasik lingkaran emas keraton Jawa',
    },
    {
      id: 'gunungan',
      label: 'Gunungan Wayang Pusaka',
      desc: 'Siluet gunungan pohon hayat perlambang kehidupan warga',
    },
    {
      id: 'padi-kapas',
      label: 'Lambang Padi & Kapas',
      desc: 'Simbol kemakmuran, kerukunan, dan gotong royong',
    },
    {
      id: 'monogram',
      label: 'Monogram Huruf Modern',
      desc: 'Inisial nama RT dengan bingkai aksen emas',
    },
    {
      id: 'custom-image',
      label: 'Unggah Gambar / Logo Sendiri',
      desc: 'Gunakan lambang resmi kelurahan/RT dari file komputer',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-[#fffdf9] rounded-2xl shadow-2xl border border-amber-800/30 overflow-hidden text-stone-900 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#2c160c] via-[#3d1e10] to-[#25120a] text-amber-100 flex items-center justify-between border-b-2 border-amber-600/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white tracking-wide flex items-center gap-2">
                <span>Pengaturan Tema Batik & Logo RT</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-sans font-semibold border border-amber-400/30">
                  Admin & Pengurus
                </span>
              </h2>
              <p className="text-xs text-amber-200/80">
                Ubah identitas visual, ornamen batik, warna aksen, dan logo aplikasi GasemRaya
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Mini Preview Bar */}
        <div className="px-6 py-3 bg-stone-100/90 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase text-stone-500 tracking-wider">
              Pratinjau Langsung:
            </span>
            <div
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl shadow-sm border"
              style={{
                backgroundColor: draftTheme.warnaSidebar,
                borderColor: `${draftTheme.warnaUtama}50`,
              }}
            >
              <BatikLogo config={draftLogo} size="sm" />
              <div>
                <p className="text-xs font-extrabold text-white leading-tight">
                  {profilRt.namaAplikasi || 'GasemRaya'}
                </p>
                <p className="text-[10px]" style={{ color: draftTheme.warnaUtama }}>
                  RT {profilRt.nomorRt} / RW {profilRt.nomorRw}
                </p>
              </div>
            </div>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab('warna')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'warna'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-amber-600" />
              <span>Warna Tema Batik</span>
            </button>
            <button
              onClick={() => setActiveSubTab('logo')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'logo'
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Pilihan Logo RT</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: WARNA TEMA BATIK */}
          {activeSubTab === 'warna' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
                  1. Pilih Palet Preset Batik Nusantara
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(Object.keys(THEME_PRESETS) as PresetTemaBatik[])
                    .filter(key => key !== 'kustom')
                    .map(key => {
                      const p = THEME_PRESETS[key];
                      const isSelected = draftTheme.preset === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleSelectPreset(key)}
                          className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/50'
                              : 'border-stone-200 hover:border-amber-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <span className="text-xs font-bold text-stone-900 block">
                                {p.name}
                              </span>
                              <span className="text-[10px] text-amber-800 font-medium">
                                {p.labelBadge}
                              </span>
                            </div>
                            {isSelected && (
                              <span className="p-1 rounded-full bg-amber-600 text-white shrink-0">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-stone-500 mb-3 line-clamp-2">
                            {p.description}
                          </p>

                          {/* Color Swatch Bar */}
                          <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-stone-100">
                            <span
                              className="w-5 h-5 rounded-md border border-black/20 shrink-0 shadow-xs"
                              style={{ backgroundColor: p.warnaSidebar }}
                              title="Warna Sidebar"
                            />
                            <span
                              className="w-5 h-5 rounded-md border border-black/20 shrink-0 shadow-xs"
                              style={{ backgroundColor: p.warnaHeader }}
                              title="Warna Header"
                            />
                            <span
                              className="w-5 h-5 rounded-md border border-black/20 shrink-0 shadow-xs"
                              style={{ backgroundColor: p.warnaUtama }}
                              title="Warna Emas/Aksen"
                            />
                            <span className="text-[10px] text-stone-400 font-mono ml-auto">
                              {p.warnaUtama}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Kustomisasi Mandiri Color Picker */}
              <div className="pt-4 border-t border-stone-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span>2. Penyesuaian Warna Mandiri (Color Picker)</span>
                  </label>
                  <span className="text-[11px] text-stone-500">
                    Mode: <strong className="text-amber-800">{draftTheme.preset}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Warna Utama / Aksen Emas */}
                  <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">Warna Aksen Emas</span>
                      <input
                        type="color"
                        value={draftTheme.warnaUtama}
                        onChange={e =>
                          setDraftTheme(prev => ({
                            ...prev,
                            warnaUtama: e.target.value,
                            preset: 'kustom',
                          }))
                        }
                        className="w-7 h-7 rounded border cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={draftTheme.warnaUtama}
                      onChange={e =>
                        setDraftTheme(prev => ({
                          ...prev,
                          warnaUtama: e.target.value,
                          preset: 'kustom',
                        }))
                      }
                      className="w-full text-xs font-mono px-2 py-1 bg-stone-50 border rounded uppercase"
                    />
                  </div>

                  {/* Warna Sidebar */}
                  <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">Latar Sidebar</span>
                      <input
                        type="color"
                        value={draftTheme.warnaSidebar}
                        onChange={e =>
                          setDraftTheme(prev => ({
                            ...prev,
                            warnaSidebar: e.target.value,
                            preset: 'kustom',
                          }))
                        }
                        className="w-7 h-7 rounded border cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={draftTheme.warnaSidebar}
                      onChange={e =>
                        setDraftTheme(prev => ({
                          ...prev,
                          warnaSidebar: e.target.value,
                          preset: 'kustom',
                        }))
                      }
                      className="w-full text-xs font-mono px-2 py-1 bg-stone-50 border rounded uppercase"
                    />
                  </div>

                  {/* Warna Header */}
                  <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-800">Latar Header</span>
                      <input
                        type="color"
                        value={draftTheme.warnaHeader}
                        onChange={e =>
                          setDraftTheme(prev => ({
                            ...prev,
                            warnaHeader: e.target.value,
                            preset: 'kustom',
                          }))
                        }
                        className="w-7 h-7 rounded border cursor-pointer"
                      />
                    </div>
                    <input
                      type="text"
                      value={draftTheme.warnaHeader}
                      onChange={e =>
                        setDraftTheme(prev => ({
                          ...prev,
                          warnaHeader: e.target.value,
                          preset: 'kustom',
                        }))
                      }
                      className="w-full text-xs font-mono px-2 py-1 bg-stone-50 border rounded uppercase"
                    />
                  </div>
                </div>

                {/* Motif Batik Watermark Toggle */}
                <div className="mt-3 flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                  <div>
                    <span className="text-xs font-bold text-amber-950 block">
                      Tampilkan Ornamen Watermark Batik
                    </span>
                    <span className="text-[11px] text-amber-800">
                      Menampilkan motif halus Kawung / Parang pada panel navigasi dan kartu
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={draftTheme.tampilkanMotifBatik}
                    onChange={e =>
                      setDraftTheme(prev => ({ ...prev, tampilkanMotifBatik: e.target.checked }))
                    }
                    className="w-4 h-4 text-amber-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PILIHAN LOGO RT */}
          {activeSubTab === 'logo' && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2.5">
                  1. Pilih Model Lambang / Logo RT
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {logoOptions.map(opt => {
                    const isSelected = draftLogo.tipe === opt.id;
                    const previewConfig: LogoConfig = {
                      ...draftLogo,
                      tipe: opt.id,
                    };

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDraftLogo(prev => ({ ...prev, tipe: opt.id }))}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/50'
                            : 'border-stone-200 hover:border-amber-300 bg-white'
                        }`}
                      >
                        <BatikLogo config={previewConfig} size="md" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-stone-900 block truncate">
                              {opt.label}
                            </span>
                            {isSelected && (
                              <span className="p-0.5 rounded-full bg-amber-600 text-white shrink-0 ml-1">
                                <Check className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detail Logo Config */}
              <div className="pt-4 border-t border-stone-200 space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                  2. Konfigurasi Khusus Logo
                </label>

                {/* Upload File if custom-image is selected */}
                {draftLogo.tipe === 'custom-image' && (
                  <div className="p-4 bg-amber-50/60 border border-dashed border-amber-400 rounded-xl space-y-3">
                    <div className="flex items-center gap-3">
                      {draftLogo.customImageDataUrl ? (
                        <img
                          src={draftLogo.customImageDataUrl}
                          alt="Pratinjau Logo"
                          className="w-14 h-14 object-cover rounded-xl border border-amber-300 shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-stone-200 flex items-center justify-center text-stone-400">
                          <Upload className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-stone-800">
                          Unggah File Logo Gambar RT
                        </p>
                        <p className="text-[11px] text-stone-500">
                          Format PNG transparan, JPG, atau SVG (Maksimal 2 MB)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih Berkas Logo</span>
                      </button>
                      {draftLogo.customImageDataUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setDraftLogo(prev => ({
                              ...prev,
                              customImageDataUrl: undefined,
                              tipe: 'emblem-keraton',
                            }))
                          }
                          className="px-2.5 py-1.5 text-red-700 hover:bg-red-50 rounded-lg text-xs font-medium flex items-center gap-1 border border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Gambar</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Monogram Text Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Inisial Monogram Huruf Logo
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={draftLogo.monogramText || 'GR'}
                      onChange={e =>
                        setDraftLogo(prev => ({
                          ...prev,
                          monogramText: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="Contoh: GR atau 04"
                      className="w-full px-3 py-2 text-sm uppercase font-mono font-bold bg-white border border-stone-300 rounded-lg"
                    />
                    <p className="text-[10px] text-stone-500 mt-1">
                      Ditampilkan di dalam lambang keraton atau monogram
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Sub-Teks Label Logo RT
                    </label>
                    <input
                      type="text"
                      value={draftLogo.subText || `RT ${profilRt.nomorRt} / RW ${profilRt.nomorRw}`}
                      onChange={e =>
                        setDraftLogo(prev => ({
                          ...prev,
                          subText: e.target.value,
                        }))
                      }
                      placeholder="Contoh: RT 02 / RW 04"
                      className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-stone-100/90 border-t border-stone-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset Batik Soga Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 hover:from-amber-800 hover:to-amber-950 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>Terapkan Tema & Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
