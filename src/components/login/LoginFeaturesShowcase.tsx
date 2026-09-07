import React from 'react';
import {
  Lock,
  Users,
  Wallet,
  Printer,
  FileText,
  Building2,
  ShieldCheck,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Phone,
  KeyRound,
  LogIn,
  Smartphone,
} from 'lucide-react';
import { ProfilRt } from '../../types';
import { BatikLogo } from '../BatikLogo';

interface LoginFeaturesShowcaseProps {
  profilRt: ProfilRt;
  onScrollToLogin: () => void;
  onOpenAndroidApk?: () => void;
}

export const LoginFeaturesShowcase: React.FC<LoginFeaturesShowcaseProps> = ({
  profilRt,
  onScrollToLogin,
  onOpenAndroidApk,
}) => {
  return (
    <>
      {/* 1. MENU PREVIEW (DAFTAR MENU YANG TERSEDIA SETELAH LOGIN) */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3 h-3 text-amber-800" />
            <span>Daftar Menu Sistem Terkunci</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Menu yang Dapat Diakses Setelah Login
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            Setelah Anda masuk ke sistem, seluruh fasilitas administrasi berikut akan otomatis terbuka dan siap dipergunakan:
          </p>
        </div>

        {/* 6 Feature Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Menu 1: Warga & KK */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-amber-900 transition-colors">
                Kependudukan & Kartu Keluarga
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pencatatan NIK, nomor KK, status warga (tetap, domisili, kontrak), kelompok keluarga, dan filter data warga terstruktur.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-amber-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={onScrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 2: Kas Keuangan */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-emerald-900 transition-colors">
                Buku Kas Keuangan RT
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pencatatan iuran bulanan warga, rincian pengeluaran kas lingkungan, unggah foto kuitansi/nota, dan hitung saldo otomatis.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={onScrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 3: Cetak Surat & KK */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-blue-900 transition-colors">
                Layanan Cetak Surat & KK
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Penerbitan surat pengantar RT resmi berstempel dan cetak blangko Kartu Keluarga standar dinas siap cetak atau PDF.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-blue-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={onScrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 4: Arsip Dokumen & AD/ART */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-900 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-purple-900 transition-colors">
                Arsip Dokumen & AD/ART
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Penyimpanan digital aturan tata tertib lingkungan RT 02, surat edaran, notulen rapat warga, serta buku panduan warga.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-purple-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={onScrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 5: Mutasi Warga */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-900 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-rose-900 transition-colors">
                Mutasi Kependudukan
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Pencatatan data dinamis warga: kelahiran anak, warga wafat, warga baru pindah masuk, dan warga pindah keluar dari RT 02.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-rose-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={onScrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Menu 6: Susunan Pengurus RT */}
          <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 group-hover:text-teal-900 transition-colors">
                Struktur Organisasi Pengurus
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Daftar lengkap nama pengurus RT 02 (Ketua, Sekretaris, Bendahara, Seksi Keamanan, Seksi Kebersihan) dan nomor kontak.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-teal-900 font-semibold">
              <span className="flex items-center gap-1 text-[11px] text-stone-500">
                <Lock className="w-3 h-3 text-stone-400" /> Perlu Login
              </span>
              <button
                onClick={onScrollToLogin}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Buka Menu</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROFIL WILAYAH & INFORMASI LINGKUNGAN RT 02 */}
      <section className="bg-[#f4efe6] border-y border-stone-300/80 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5 text-amber-800" />
                <span>Wilayah Administratif RT {profilRt.nomorRt || '02'}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
                Rukun Tetangga {profilRt.nomorRt || '02'} / Rukun Warga {profilRt.nomorRw || '04'} Gasem Raya
              </h3>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Wilayah rukun tetangga yang berkomitmen mewujudkan lingkungan yang aman, tentram, bersih, dan transparan dalam pengelolaan keuangan serta pelayanan warga.
              </p>
              
              <div className="space-y-2 pt-2 text-xs text-stone-800">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Kelurahan: <strong>{profilRt.desaKelurahan || 'Tlogosari Wetan'}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Kecamatan: <strong>{profilRt.kecamatan || 'Pedurungan'}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Kota / Provinsi: <strong>{profilRt.kotaKabupaten || 'Kota Semarang'}, {profilRt.provinsi || 'Jawa Tengah'}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>Kontak Sekretariat RT: <strong>{profilRt.nomorKontak || '0812-3456-7890'}</strong></span>
                </div>
              </div>
            </div>

            {/* Pengurus Info Card */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-amber-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-800" />
                <span>Pengurus Inti RT {profilRt.nomorRt || '02'} Bertugas</span>
              </h4>
              <div className="divide-y divide-stone-100 text-xs text-stone-700">
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-stone-500">Ketua RT {profilRt.nomorRt || '02'}:</span>
                  <span className="font-bold text-stone-900">{profilRt.namaKetuaRt || 'Bpk. Ahmad Sucipto'}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-stone-500">Sekretaris:</span>
                  <span className="font-bold text-stone-900">{profilRt.namaSekretaris || 'Bpk. Budi Santoso'}</span>
                </div>
                <div className="py-2.5 flex justify-between items-center">
                  <span className="text-stone-500">Bendahara:</span>
                  <span className="font-bold text-stone-900">{profilRt.namaBendahara || 'Ibu Siti Rahmawati'}</span>
                </div>
              </div>
              
              <div className="pt-2">
                <button
                  onClick={onScrollToLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Masuk untuk Kelola Data Lingkungan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOOTER HALAMAN DEPAN */}
      <footer className="mt-auto bg-[#1b0c04] text-amber-200/70 py-8 px-4 sm:px-6 text-xs border-t border-amber-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <BatikLogo logoConfig={profilRt.logoConfig} size="sm" />
            <div>
              <p className="font-bold text-amber-100">
                Sistem Informasi Administrasi RT {profilRt.nomorRt || '02'} Gasem Raya
              </p>
              <p className="text-[11px] text-amber-200/60">
                Rukun Tetangga {profilRt.nomorRt || '02'} / Rukun Warga {profilRt.nomorRw || '04'} &bull; Kel. {profilRt.desaKelurahan || 'Tlogosari Wetan'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            {onOpenAndroidApk && (
              <button
                onClick={onOpenAndroidApk}
                className="hover:text-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Smartphone className="w-3 h-3" />
                <span>Pasang di HP (APK)</span>
              </button>
            )}
            <button
              onClick={onScrollToLogin}
              className="hover:text-amber-100 transition-colors flex items-center gap-1 text-amber-300 font-semibold cursor-pointer"
            >
              <LogIn className="w-3 h-3" />
              <span>Masuk Sistem</span>
            </button>
          </div>
        </div>
      </footer>
    </>
  );
};
