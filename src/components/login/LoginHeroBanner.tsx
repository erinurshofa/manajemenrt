import React from 'react';
import { Calendar, Globe, Check, Copy, Send, Share2, ExternalLink, FolderLock } from 'lucide-react';
import { ProfilRt } from '../../types';

interface LoginHeroBannerProps {
  profilRt: ProfilRt;
  currentDateFormatted: string;
  appOnlineUrl: string;
  quickCopied: boolean;
  onQuickCopyLink: () => void;
  whatsappUrl: string;
  onOpenShareOnline?: () => void;
}

export const LoginHeroBanner: React.FC<LoginHeroBannerProps> = ({
  profilRt,
  currentDateFormatted,
  appOnlineUrl,
  quickCopied,
  onQuickCopyLink,
  whatsappUrl,
  onOpenShareOnline,
}) => {
  return (
    <div className="lg:col-span-7 space-y-5">
      {/* Status Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-medium">
        <Calendar className="w-3.5 h-3.5 text-amber-300" />
        <span>{currentDateFormatted}</span>
        <span className="text-amber-400">&bull;</span>
        <span className="font-semibold text-amber-300">Status: Halaman Depan (Log Out)</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-serif text-white tracking-tight leading-tight">
        Sistem Informasi & Administrasi{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400">
          RT {profilRt.nomorRt || '02'} Gasem Raya
        </span>
      </h1>

      {/* Sub-headline */}
      <p className="text-sm sm:text-base text-amber-100/85 leading-relaxed max-w-2xl">
        Selamat datang di portal resmi rukun tetangga. Pusat pelayanan data warga, pembukuan kas keuangan terbuka, arsip dokumen peraturan, serta pencetakan surat pengantar resmi lingkungan RT {profilRt.nomorRt || '02'} / RW {profilRt.nomorRw || '04'} Gasem Raya.
      </p>

      {/* Tautan Web Online */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-900/50 via-stone-900/60 to-amber-950/60 border border-amber-400/40 text-xs shadow-lg backdrop-blur-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-100 text-xs sm:text-sm">
                  Website Online & Siap Diakses di Internet
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70">
                Bisa dibuka langsung oleh warga atau pengurus melalui browser HP & laptop
              </p>
            </div>
          </div>
        </div>

        {/* Input Link Display & Copy Button */}
        <div className="flex items-center gap-2 bg-stone-950/80 p-2 rounded-xl border border-amber-500/30">
          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
          <input
            type="text"
            readOnly
            value={appOnlineUrl}
            className="w-full bg-transparent text-[11px] sm:text-xs font-mono text-amber-200 outline-none select-all font-medium truncate"
          />
          <button
            id="btn-hero-copy-online-link"
            onClick={onQuickCopyLink}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 ${
              quickCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
            }`}
          >
            {quickCopied ? (
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

        {/* Direct Action Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 text-[11px] font-semibold border border-emerald-600/40 transition-colors shadow-2xs"
          >
            <Send className="w-3 h-3 text-emerald-300" />
            <span>Kirim ke WhatsApp Warga</span>
          </a>

          {onOpenShareOnline && (
            <button
              onClick={onOpenShareOnline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-amber-200 text-[11px] font-semibold border border-amber-400/30 transition-colors cursor-pointer"
            >
              <Share2 className="w-3 h-3 text-amber-300" />
              <span>Opsi Berbagi</span>
            </button>
          )}

          <a
            href={appOnlineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-amber-200 text-[11px] font-semibold border border-amber-400/30 transition-colors"
          >
            <span>Buka di Tab Baru</span>
            <ExternalLink className="w-3 h-3 text-amber-300" />
          </a>
        </div>
      </div>

      {/* Notice: Menu Terkunci / Diperlukan Login */}
      <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-500/30 text-xs text-amber-100/90 flex items-start gap-3 shadow-inner">
        <FolderLock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-200">
            Akses Menu & Data Warga Dilindungi Hak Akses (RBAC)
          </p>
          <p className="text-amber-200/80 leading-relaxed">
            Data kependudukan warga RT 02 dilindungi sesuai standar privasi UU Perlindungan Data Pribadi (UU PDP). Silakan masukkan NIK/Username dan Password pada formulir di sebelah kanan untuk masuk ke aplikasi.
          </p>
        </div>
      </div>
    </div>
  );
};
