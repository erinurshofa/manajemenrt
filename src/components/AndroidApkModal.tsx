import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { ProfilRt } from '../types';
import { BatikLogo } from './BatikLogo';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  profilRt: ProfilRt;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallPrompt: () => Promise<boolean>;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  profilRt,
  isInstallable,
  isInstalled,
  onInstallPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<'webapk' | 'builder'>('webapk');
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (!isOpen) return null;

  // Use the canonical production/shared URL if available or window.location.origin
  const appUrl =
    (typeof import.meta !== 'undefined' && (import.meta.env?.APP_URL || import.meta.env?.VITE_APP_URL)) ||
    (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
      ? window.location.origin
      : 'https://manajemenrt.vercel.app/');

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await onInstallPrompt();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto font-sans">
      <div className="relative w-full max-w-xl my-6 bg-[#fffcf7] rounded-2xl shadow-2xl border border-amber-800/30 overflow-hidden text-stone-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Traditional Theme */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-r from-[#291308] via-[#3e1e10] to-[#200d04] text-amber-100 border-b-2 border-amber-600/40">
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#e5b85a_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-amber-200/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md border border-amber-400/40 shrink-0">
              <Smartphone className="w-6 h-6 text-amber-100" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30 mb-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                <span>Siap untuk Android & PWA</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide">
                Buka Aplikasi di HP Android (APK)
              </h2>
              <p className="text-xs text-amber-200/80">
                Sistem {profilRt.namaAplikasi || 'Gasem Raya RT 02'} dalam genggaman
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4 relative z-10 border-b border-amber-800/60 pb-1">
            <button
              onClick={() => setActiveTab('webapk')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'webapk'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                  : 'text-amber-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Cara 1: Pasang Langsung (WebAPK)</span>
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'builder'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-bold'
                  : 'text-amber-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cara 2: Buat File APK (.apk)</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* URL Box with Copy Button */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-stone-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Tautan Aplikasi RT 02:
              </span>
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:text-amber-950 bg-amber-200/60 hover:bg-amber-200 px-2 py-0.5 rounded-md transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white border border-amber-200/80 text-xs font-mono text-stone-700 break-all select-all">
              {appUrl}
            </div>
            <p className="text-[11px] text-stone-600">
              💡 Kirim tautan di atas ke WhatsApp HP Anda, lalu buka menggunakan <strong>Google Chrome</strong> di Android.
            </p>
          </div>

          {activeTab === 'webapk' && (
            <div className="space-y-4">
              {/* Direct Install Button if browser supports it */}
              {isInstallable && !isInstalled && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-200" />
                      Browser Mendukung Instalasi 1-Klik!
                    </h3>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      Tekan tombol untuk langsung memasang ikon aplikasi di HP Anda.
                    </p>
                  </div>
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white text-emerald-900 font-bold text-xs shadow hover:bg-emerald-50 transition-all flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Download className="w-4 h-4 text-emerald-700" />
                    <span>{installing ? 'Memproses...' : 'Pasang di Android Sekarang'}</span>
                  </button>
                </div>
              )}

              {isInstalled && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <p className="font-medium">
                    Aplikasi ini sudah terpasang di perangkat Anda sebagai WebAPK/PWA!
                  </p>
                </div>
              )}

              {/* Step-by-step Guide for Android Chrome */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 mb-3 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>Langkah Pasang di HP Android (Hanya 10 Detik)</span>
                </h4>

                <div className="space-y-3">
                  <div className="flex gap-3 p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-amber-800 text-amber-100 font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="text-xs text-stone-700">
                      <p className="font-semibold text-stone-900">Buka Tautan di Google Chrome Android</p>
                      <p className="mt-0.5 text-stone-600">
                        Buka link aplikasi di atas menggunakan aplikasi browser <strong>Google Chrome</strong> di HP Android.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-amber-800 text-amber-100 font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div className="text-xs text-stone-700">
                      <p className="font-semibold text-stone-900">Ketuk Tombol Menu Titik Tiga (⋮)</p>
                      <p className="mt-0.5 text-stone-600">
                        Di pojok kanan atas layar Google Chrome, ketuk ikon <strong>menu titik tiga (⋮)</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-amber-800 text-amber-100 font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </div>
                    <div className="text-xs text-stone-700">
                      <p className="font-semibold text-stone-900">
                        Pilih &ldquo;Instal Aplikasi&rdquo; atau &ldquo;Tambahkan ke Layar Utama&rdquo;
                      </p>
                      <p className="mt-0.5 text-stone-600">
                        Cari opsi menu bertuliskan <strong>&ldquo;Instal Aplikasi&rdquo;</strong> (atau <em>Tambahkan ke Layar Utama</em>).
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 p-3 rounded-xl bg-white border border-stone-200/80 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-amber-800 text-amber-100 font-bold text-xs flex items-center justify-center shrink-0">
                      4
                    </div>
                    <div className="text-xs text-stone-700">
                      <p className="font-semibold text-stone-900">Selesai! Aplikasi Muncul di Menu HP</p>
                      <p className="mt-0.5 text-stone-600">
                        Sistem Android akan otomatis mengemas aplikasi menjadi <strong>WebAPK resmi</strong>. Ikon batik RT 02 akan muncul di layar utama dan beroperasi mandiri layar penuh (layaknya APK dari Play Store) tanpa address bar!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kelebihan WebAPK */}
              <div className="p-3 rounded-xl bg-stone-100/80 border border-stone-200 text-[11px] text-stone-700 space-y-1">
                <p className="font-bold text-stone-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Kelebihan Menggunakan Cara Ini:
                </p>
                <ul className="list-disc pl-4 space-y-0.5 text-stone-600">
                  <li>Tidak perlu izinkan &ldquo;Sumber Tidak Dikenal&rdquo; seperti file APK mentah.</li>
                  <li>Otomatis terupdate setiap ada pembaruan data tanpa install ulang.</li>
                  <li>Sangat ringan (&lt; 2 MB) dan tidak membebani memori HP Android.</li>
                  <li>Dapat dibuka secara offline untuk melihat arsip data yang telah tersimpan.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'builder' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1.5">
                <p className="font-bold flex items-center gap-1 text-amber-900">
                  <Info className="w-4 h-4 text-amber-700" />
                  Tentang Pembuatan File Mentah .APK
                </p>
                <p className="text-stone-700 leading-relaxed">
                  Aplikasi ini sudah dilengkapi <strong>Web App Manifest standar Android</strong> dan ikon resolusi tinggi (192px & 512px). Anda dapat mengonversinya menjadi berkas <code>.apk</code> mandiri yang siap di-install (sideload) menggunakan alat resmi <strong>PWABuilder</strong> (dikembangkan oleh Microsoft):
                </p>
              </div>

              {/* PWABuilder Instructions */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-amber-700" />
                      Langkah Buat APK dengan PWABuilder:
                    </span>
                    <a
                      href={`https://www.pwabuilder.com?url=${encodeURI(appUrl)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors"
                    >
                      <span>Buka PWABuilder</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <ol className="text-xs text-stone-700 list-decimal pl-4 space-y-1.5 leading-relaxed">
                    <li>
                      Klik tombol <strong>Buka PWABuilder</strong> di atas atau kunjungi <code>pwabuilder.com</code>.
                    </li>
                    <li>
                      Pastikan URL aplikasi sudah terisi: <code>{appUrl}</code> lalu klik <strong>Start</strong>.
                    </li>
                    <li>
                      PWABuilder akan memvalidasi Manifest RT 02 (skor hijau/sukses).
                    </li>
                    <li>
                      Klik tombol <strong>&ldquo;Package for Stores&rdquo;</strong> &rarr; pilih <strong>Android</strong>.
                    </li>
                    <li>
                      Klik <strong>Generate Package</strong> &rarr; Unduh file ZIP berisi berkas <code>.apk</code> Android bertandatangan (signed APK).
                    </li>
                    <li>
                      Kirim file <code>.apk</code> tersebut ke HP Android Anda dan pasang secara langsung!
                    </li>
                  </ol>
                </div>

                {/* Android Package Specifications */}
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                  <p className="font-bold text-stone-800">Spesifikasi Manifest Android Siap Pakai:</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-white p-2 rounded border border-stone-200">
                      <span className="text-stone-400 block text-[9px] uppercase">Nama Aplikasi</span>
                      <span className="text-amber-900 font-semibold">Gasem Raya RT 02</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-stone-200">
                      <span className="text-stone-400 block text-[9px] uppercase">Short Name</span>
                      <span className="text-amber-900 font-semibold">GasemRaya02</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-stone-200">
                      <span className="text-stone-400 block text-[9px] uppercase">Package ID</span>
                      <span className="text-stone-700">com.gasemraya02.app</span>
                    </div>
                    <div className="bg-white p-2 rounded border border-stone-200">
                      <span className="text-stone-400 block text-[9px] uppercase">Display Mode</span>
                      <span className="text-stone-700">Standalone (Full Screen)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="pt-2 flex items-center justify-between border-t border-stone-200">
            <div className="flex items-center gap-2">
              <BatikLogo config={profilRt.logoConfig} size="sm" />
              <span className="text-xs text-stone-600 font-medium">
                RT {profilRt.nomorRt}/RW {profilRt.nomorRw} Gasem Raya
              </span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
