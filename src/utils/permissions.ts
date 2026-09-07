import { UserRole } from '../types';

export interface RoleInfo {
  role: UserRole;
  title: string;
  badgeLabel: string;
  badgeClass: string;
  description: string;
  iconName: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleInfo> = {
  developer: {
    role: 'developer',
    title: 'Developer / Superadmin',
    badgeLabel: 'Root / Developer',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300',
    description: 'Akses teknis mutlak (Full Root), audit basis data, konfigurasi integrasi cloud, dan dev diagnostics.',
    iconName: 'Code2',
  },
  ketua_rt: {
    role: 'ketua_rt',
    title: 'Ketua RT (Pimpinan)',
    badgeLabel: 'Ketua RT',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300',
    description: 'Pimpinan tertinggi lingkungan, pengesahan laporan, penentu kebijakan AD/ART, dan struktur kepengurusan.',
    iconName: 'Crown',
  },
  sekretaris: {
    role: 'sekretaris',
    title: 'Sekretaris RT',
    badgeLabel: 'Sekretaris',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/50 dark:text-blue-300',
    description: 'Admin kependudukan utama, pengelola buku induk warga, kartu keluarga, mutasi, dan arsip dokumen resmi.',
    iconName: 'FileText',
  },
  bendahara: {
    role: 'bendahara',
    title: 'Bendahara RT',
    badgeLabel: 'Bendahara',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300',
    description: 'Admin keuangan RT, pencatatan kas masuk/keluar, bukti kwitansi/nota belanja, dan pelaporan kas.',
    iconName: 'Wallet',
  },
  pengurus: {
    role: 'pengurus',
    title: 'Pengurus Bidang / Seksi',
    badgeLabel: 'Pengurus Seksi',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-300',
    description: 'Pelaksana bidang keamanan, kebersihan, humas, dan sosial lingkungan RT.',
    iconName: 'ShieldCheck',
  },
  warga: {
    role: 'warga',
    title: 'Warga Lingkungan RT',
    badgeLabel: 'Warga RT',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300 dark:bg-stone-800 dark:text-stone-300',
    description: 'Masyarakat warga terdaftar dengan akses KK sendiri, transparansi kas, dan layanan asisten AI.',
    iconName: 'User',
  },
  admin: {
    role: 'admin',
    title: 'Administrator RT (Legacy)',
    badgeLabel: 'Admin RT',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300',
    description: 'Peran administratif umum dengan hak akses setara pimpinan.',
    iconName: 'ShieldCheck',
  },
};

export const isDeveloper = (role?: UserRole): boolean => role === 'developer';

export const isAdminOrLeader = (role?: UserRole): boolean =>
  role === 'developer' || role === 'ketua_rt' || role === 'admin';

export const canManageWarga = (role?: UserRole): boolean =>
  role === 'developer' || role === 'ketua_rt' || role === 'sekretaris' || role === 'admin';

export const canManageMutasi = (role?: UserRole): boolean =>
  role === 'developer' || role === 'ketua_rt' || role === 'sekretaris' || role === 'admin';

export const canManageKas = (role?: UserRole): boolean =>
  role === 'developer' || role === 'ketua_rt' || role === 'bendahara' || role === 'admin';

export const canManageDokumen = (role?: UserRole): boolean =>
  role === 'developer' || role === 'ketua_rt' || role === 'sekretaris' || role === 'bendahara' || role === 'admin';

export const canManagePengurus = (role?: UserRole): boolean =>
  role === 'developer' || role === 'ketua_rt' || role === 'admin';

export const canManageUsers = (role?: UserRole): boolean =>
  role === 'developer' || role === 'ketua_rt' || role === 'admin';

export const canAccessDeveloperTools = (role?: UserRole): boolean =>
  role === 'developer';

export const canEditSettings = (role?: UserRole): boolean =>
  role === 'developer' || role === 'ketua_rt' || role === 'admin';

export interface MatrixRow {
  modul: string;
  kategori: string;
  deskripsi: string;
  developer: string;
  ketua_rt: string;
  sekretaris: string;
  bendahara: string;
  pengurus: string;
  warga: string;
}

export const PERMISSION_MATRIX_DATA: MatrixRow[] = [
  {
    modul: 'Buku Induk Warga & KK',
    kategori: 'Kependudukan',
    deskripsi: 'Tambah, edit, hapus, dan lihat data warga serta nomor Kartu Keluarga',
    developer: 'Full CRUD',
    ketua_rt: 'Full CRUD',
    sekretaris: 'Full CRUD',
    bendahara: 'Lihat (Cek Iuran)',
    pengurus: 'Lihat Terbatas',
    warga: 'Lihat KK Sendiri',
  },
  {
    modul: 'Mutasi Penduduk',
    kategori: 'Kependudukan',
    deskripsi: 'Pencatatan peristiwa lahir, meninggal, pindah datang & keluar',
    developer: 'Full CRUD',
    ketua_rt: 'Review & Sahkan',
    sekretaris: 'Full CRUD',
    bendahara: 'Hanya Baca',
    pengurus: 'Hanya Baca',
    warga: 'Lapor Mutasi',
  },
  {
    modul: 'Buku Kas & Keuangan RT',
    kategori: 'Keuangan',
    deskripsi: 'Input pemasukan, pengeluaran, upload kwitansi, dan saldo kas',
    developer: 'Full CRUD',
    ketua_rt: 'Audit & Sahkan',
    sekretaris: 'Hanya Baca',
    bendahara: 'Full CRUD',
    pengurus: 'Hanya Baca',
    warga: 'Transparansi Ringkasan',
  },
  {
    modul: 'Arsip Dokumen & AD/ART',
    kategori: 'Administrasi',
    deskripsi: 'Peraturan RT, formulir pengantar, surat keputusan, dan pedoman',
    developer: 'Full CRUD',
    ketua_rt: 'Full Control',
    sekretaris: 'Full CRUD',
    bendahara: 'Upload Laporan Kas',
    pengurus: 'Hanya Baca',
    warga: 'Dokumen Publik',
  },
  {
    modul: 'Google Drive RT (Cloud)',
    kategori: 'Administrasi',
    deskripsi: 'Penyimpanan berkas terbuka cloud, upload, salin, dan unduh',
    developer: 'Full Control',
    ketua_rt: 'Full Akses',
    sekretaris: 'Full Akses',
    bendahara: 'Upload Bukti Kas',
    pengurus: 'Akses Terbuka',
    warga: 'Akses Terbuka',
  },
  {
    modul: 'Rekapitulasi Kependudukan',
    kategori: 'Laporan',
    deskripsi: 'Statistik piramida usia bulanan, cetak lembar RT ke RW/Kelurahan',
    developer: 'Cetak & Ekspor',
    ketua_rt: 'Otorisasi & TTD',
    sekretaris: 'Generate & Cetak',
    bendahara: 'Hanya Baca',
    pengurus: 'Hanya Baca',
    warga: '-',
  },
  {
    modul: 'Struktur Organisasi Pengurus',
    kategori: 'Organisasi',
    deskripsi: 'Bagan dan susunan jabatan pengurus RT periode aktif',
    developer: 'Full CRUD',
    ketua_rt: 'Tetapkan & Kelola',
    sekretaris: 'Bantu Input',
    bendahara: 'Hanya Baca',
    pengurus: 'Hanya Baca',
    warga: 'Informasi Publik',
  },
  {
    modul: 'Pengaturan RT & Tema Batik',
    kategori: 'Konfigurasi',
    deskripsi: 'Nama wilayah RT/RW, logo resmi, dan palet warna motif batik',
    developer: 'Full Config',
    ketua_rt: 'Akses Penuh',
    sekretaris: 'Hanya Baca',
    bendahara: 'Hanya Baca',
    pengurus: '-',
    warga: '-',
  },
  {
    modul: 'Manajemen Akun & Hak Akses',
    kategori: 'Sistem',
    deskripsi: 'Kelola pengguna, kata sandi, dan pembagian peran RBAC',
    developer: 'Superadmin (Root)',
    ketua_rt: 'Kelola Akun RT',
    sekretaris: '-',
    bendahara: '-',
    pengurus: '-',
    warga: '-',
  },
  {
    modul: 'Developer Tools & Database Audit',
    kategori: 'Sistem',
    deskripsi: 'Diagnostik sistem, kuota penyimpanan lokal, dan reset/seed data',
    developer: 'Full Akses',
    ketua_rt: '-',
    sekretaris: '-',
    bendahara: '-',
    pengurus: '-',
    warga: '-',
  },
];
