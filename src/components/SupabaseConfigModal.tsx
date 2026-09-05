import React, { useState } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Server,
  Cloud,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileCode,
} from 'lucide-react';
import { isSupabaseConfigured } from '../services/supabaseClient';
import schemaSql from '../../supabase/schema.sql?raw';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  tablesMissing?: boolean;
  errorMessage?: string;
  onRefreshConnection: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  tablesMissing = false,
  errorMessage,
  onRefreshConnection,
}) => {
  const [copiedSqlContent, setCopiedSqlContent] = useState(false);
  const isConfigured = isSupabaseConfigured();

  if (!isOpen) return null;

  const rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const matchProjectRef = rawUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectRef = matchProjectRef ? matchProjectRef[1] : '';
  const sqlEditorUrl = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}/sql/new`
    : 'https://supabase.com/dashboard';

  const handleCopySqlContent = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopiedSqlContent(true);
    setTimeout(() => setCopiedSqlContent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-[#fffcf8] border border-amber-200/80 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-amber-100 flex items-center gap-2">
                <span>Database Cloud Supabase</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-sans font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PostgreSQL
                </span>
              </h3>
              <p className="text-xs text-stone-300">
                Penyimpanan data warga, kartu keluarga, & kas RT secara online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-stone-700 text-sm">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 ${
              isConnected
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : tablesMissing
                ? 'bg-amber-50 border-amber-300 text-amber-950'
                : isConfigured
                ? 'bg-blue-50 border-blue-200 text-blue-900'
                : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}
          >
            {isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : tablesMissing ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-stone-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold text-sm">
                  {isConnected
                    ? 'Terhubung Aktif ke Supabase'
                    : tablesMissing
                    ? 'Koneksi Berhasil, Namun Tabel Belum Dibuat'
                    : isConfigured
                    ? 'Kredensial .env Terdeteksi'
                    : 'Kredensial Belum Dikonfigurasi'}
                </p>
                <button
                  onClick={onRefreshConnection}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-white/90 border border-stone-300 hover:bg-white text-stone-700 transition-colors cursor-pointer shadow-2xs"
                  title="Cek ulang koneksi"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Cek Ulang</span>
                </button>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isConnected
                  ? 'Semua data warga, mutasi, kas, dan dokumen tersimpan langsung di database Supabase Cloud tanpa penyimpanan lokal.'
                  : tablesMissing
                  ? 'Proyek Supabase Anda berhasil terhubung! Anda hanya perlu menyalin dan menjalankan skrip SQL schema sekali saja di SQL Editor Supabase.'
                  : errorMessage || 'Silakan periksa kredensial Supabase di berkas .env Anda.'}
              </p>
            </div>
          </div>

          {/* Action Box if Tables Missing */}
          {tablesMissing && (
            <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-xl space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-950 text-xs sm:text-sm">
                <FileCode className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Langkah Terakhir: Jalankan Skrip SQL di Supabase</span>
              </div>
              <p className="text-xs text-amber-900/90 leading-relaxed">
                Klik tombol di bawah untuk menyalin seluruh skrip tabel ke clipboard, lalu tempel (*paste*) dan klik <strong>RUN</strong> di SQL Editor Supabase Anda:
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleCopySqlContent}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  {copiedSqlContent ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Skrip SQL Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Salin Seluruh Skrip SQL (schema.sql)</span>
                    </>
                  )}
                </button>

                <a
                  href={sqlEditorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white border border-amber-300 hover:bg-amber-50 text-amber-950 transition-colors shadow-2xs"
                >
                  <span>Buka SQL Editor Supabase</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Panduan Pembuatan */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-stone-900 flex items-center gap-2 text-xs sm:text-sm">
              <Layers className="w-4 h-4 text-amber-800" />
              <span>Detail Konfigurasi Supabase:</span>
            </h4>

            <div className="p-3 rounded-xl bg-white border border-stone-200 text-xs space-y-2">
              <div className="flex justify-between items-center text-stone-600">
                <span>URL Proyek:</span>
                <code className="font-mono text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {rawUrl ? rawUrl.replace(/^https:\/\//, '') : 'Belum diisi'}
                </code>
              </div>
              <div className="flex justify-between items-center text-stone-600">
                <span>Penyimpanan Lokal:</span>
                <span className="font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  Dinonaktifkan (Murni Supabase Cloud)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 flex justify-between items-center">
          <span className="text-xs text-stone-500">
            {isConnected ? '✓ Database Cloud Siap Digunakan' : 'Menunggu eksekusi skrip SQL di Supabase'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
