import React, { useState } from 'react';
import {
  Globe,
  Copy,
  Check,
  X,
  ExternalLink,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Send,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { ProfilRt } from '../types';
import { BatikLogo } from './BatikLogo';

interface ShareOnlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  profilRt: ProfilRt;
}

export const ShareOnlineModal: React.FC<ShareOnlineModalProps> = ({
  isOpen,
  onClose,
  profilRt,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // The permanent public shared URL
  const publicUrl =
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_APP_URL || import.meta.env?.APP_URL)) ||
    (typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
      ? window.location.origin
      : 'https://manajemenrt.vercel.app/');

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareText = `Website Resmi RT ${profilRt.nomorRt || '02'} / RW ${profilRt.nomorRw || '04'} Gasem Raya: ${publicUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Website RT ${profilRt.nomorRt || '02'} Gasem Raya`,
          text: `Sistem Informasi & Administrasi RT ${profilRt.nomorRt || '02'} Gasem Raya Online`,
          url: publicUrl,
        });
      } catch (err) {
        console.log('Share dismissed', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      id="modal-share-online"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#fffdfa] w-full max-w-lg rounded-2xl shadow-2xl border border-amber-900/30 overflow-hidden text-stone-900 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#2a1307] via-[#3a1a0b] to-[#200d04] px-6 py-5 text-amber-100 flex items-center justify-between border-b border-amber-600/30">
          <div className="flex items-center gap-3">
            <BatikLogo config={profilRt.logoConfig} size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-white">
                  Link Website Online RT 02
                </h3>
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2 py-0.5 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE 24 JAM
                </span>
              </div>
              <p className="text-xs text-amber-200/70 mt-0.5">
                Dapat diakses siapapun melalui internet di seluruh dunia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-amber-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Status Alert */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950">
              <p className="font-bold text-emerald-900">
                Website Sudah Aktif dan Siap Dibagikan
              </p>
              <p className="mt-0.5 leading-relaxed text-emerald-800">
                Aplikasi telah dihosting di server Cloud Google dan memiliki tautan resmi yang dapat dibuka langsung tanpa instalasi tambahan.
              </p>
            </div>
          </div>

          {/* URL Box with Copy Button */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Alamat Link Website Resmi:
            </label>
            <div className="flex items-center gap-2 bg-stone-100 p-2 rounded-xl border border-stone-300">
              <Globe className="w-4 h-4 text-amber-700 shrink-0 ml-1" />
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="w-full bg-transparent text-xs font-mono text-stone-800 outline-none select-all font-semibold"
              />
              <button
                id="btn-copy-public-link"
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-2xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-700 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Sharing Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim ke WhatsApp Warga</span>
            </a>

            <button
              onClick={handleNativeShare}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Bagikan Tautan</span>
            </button>
          </div>

          {/* Compatibility Info */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-stone-700 space-y-2">
            <p className="font-bold text-amber-950 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>Petunjuk Akses bagi Warga & Pengurus:</span>
            </p>
            <ul className="space-y-1.5 text-stone-600 list-disc list-inside">
              <li>
                <strong>Warga Umum:</strong> Cukup buka link di browser HP (Chrome/Safari) untuk membaca informasi RT, pengurus, dan profil lingkungan di Halaman Depan.
              </li>
              <li>
                <strong>Pengurus / Admin RT:</strong> Masuk melalui formulir login menggunakan akun pengurus untuk mengelola data warga, kas, dan surat pengantar.
              </li>
              <li>
                <strong>Perangkat yang Didukung:</strong> HP Android, iPhone/iPad, Laptop, dan Komputer desktop.
              </li>
            </ul>
          </div>

          {/* Direct Open in New Tab Button */}
          <div className="pt-1 flex items-center justify-between border-t border-stone-200">
            <span className="text-[11px] text-stone-500">
              Membuka di jendela peramban mandiri
            </span>
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline py-1"
            >
              <span>Buka di Tab Baru</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
