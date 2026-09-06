export type JenisKelamin = 'L' | 'P';

export type HubunganKeluarga = 
  | 'KEPALA KELUARGA'
  | 'ISTRI'
  | 'ANAK'
  | 'ORANG TUA'
  | 'FAMILI LAIN'
  | 'LAINNYA';

export type StatusKependudukan = 'Tetap' | 'Kontrak' | 'Domisili';
export type StatusKehidupan = 'Hidup' | 'Meninggal' | 'Pindah Keluar';

export type Agama = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu' | 'Lainnya';
export type StatusPerkawinan = 'Belum Kawin' | 'Kawin' | 'Cerai Hidup' | 'Cerai Mati';

export interface Warga {
  id: string;
  nik: string; // 16 digit
  nama: string;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  jenisKelamin: JenisKelamin;
  noKk: string; // 16 digit
  hubunganKeluarga: HubunganKeluarga;
  alamat: string;
  rt: string;
  rw: string;
  agama: Agama;
  statusPerkawinan: StatusPerkawinan;
  pekerjaan: string;
  statusKependudukan: StatusKependudukan;
  statusKehidupan: StatusKehidupan;
  tanggalDaftar: string; // YYYY-MM-DD
  tanggalMutasi?: string; // Jika meninggal atau pindah keluar
  noHp?: string;
  golonganDarah?: 'A' | 'B' | 'AB' | 'O' | '-';
  pendidikan?: string;
  catatan?: string;
}

export interface KartuKeluargaData {
  noKk: string;
  kepalaKeluarga: Warga | null;
  alamat: string;
  rt: string;
  rw: string;
  anggota: Warga[];
}

export type JenisMutasi = 'Lahir' | 'Meninggal' | 'Pindah_Masuk' | 'Pindah_Keluar';

export interface MutasiRecord {
  id: string;
  wargaId?: string;
  nama: string;
  nik: string;
  noKk: string;
  jenisKelamin: JenisKelamin;
  jenisMutasi: JenisMutasi;
  tanggal: string; // YYYY-MM-DD
  keterangan: string;
}

export type PresetTemaBatik = 
  | 'batik-soga'        // Cokelat Soga & Emas Kraton (Default)
  | 'batik-megamendung' // Biru Indigo Cirebon
  | 'batik-parang'      // Terracotta & Tembaga Kencana
  | 'batik-hijau'       // Hijau Zamrud Pesisir
  | 'batik-marun'       // Marun Sekar Jagad
  | 'kustom';

export type LogoType = 'emblem-keraton' | 'gunungan' | 'padi-kapas' | 'monogram' | 'custom-image';

export interface LogoConfig {
  tipe: LogoType;
  customImageDataUrl?: string;
  monogramText?: string;
  subText?: string;
}

export interface ThemeConfig {
  preset: PresetTemaBatik;
  warnaUtama: string;    // Accent / gold color (misal: #c59239)
  warnaSidebar: string;  // Background sidebar (misal: #2b1911)
  warnaHeader: string;   // Background header / border
  tampilkanMotifBatik: boolean;
}

export type UserRole =
  | 'developer'
  | 'ketua_rt'
  | 'sekretaris'
  | 'bendahara'
  | 'pengurus'
  | 'warga'
  | 'admin';

export interface UserSession {
  nik: string;
  nama: string;
  role: UserRole;
  jabatan: string;
  noKk?: string;
  alamat?: string;
  noHp?: string;
  loginAt?: string;
}

export interface UserCredential {
  id?: string;
  nik: string;
  password: string;
  nama: string;
  role: UserRole;
  jabatan?: string;
  noHp?: string;
  createdAt?: string;
}

export interface ProfilRt {
  nomorRt: string;
  nomorRw: string;
  desaKelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  provinsi: string;
  kodePos: string;
  namaKetuaRt: string;
  namaSekretaris: string;
  namaBendahara?: string;
  namaAplikasi?: string;
  nomorKontak: string;
  logoConfig?: LogoConfig;
  themeConfig?: ThemeConfig;
}

export type JenisKas = 'PEMASUKAN' | 'PENGELUARAN';

export interface TransaksiKas {
  id: string;
  tanggal: string; // YYYY-MM-DD
  jenis: JenisKas;
  kategori: string;
  nominal: number;
  keterangan: string;
  nomorBukti?: string;
  namaWarga?: string;
  noKk?: string;
  fileBukti?: string; // Data URL / Base64 / link
  fileBuktiNama?: string;
  fileBuktiTipe?: string;
}

export interface DokumenRt {
  id: string;
  judul: string;
  kategori: 'AD/ART' | 'Peraturan RT' | 'Surat Edaran' | 'Formulir' | 'SK Pengurus' | 'Laporan Keuangan' | 'Lainnya';
  nomorSurat?: string;
  tanggal: string; // YYYY-MM-DD
  deskripsi: string;
  namaFile: string;
  ukuranFile?: string;
  tipeFile: 'pdf' | 'doc' | 'image' | 'text';
  kontenTeks?: string; // Teks lengkap dokumen jika berupa dokumen teks (seperti AD/ART resmi)
  fileData?: string; // Base64 data URL
  isProtected?: boolean; // Berkas baku RT
}

export interface PengurusRt {
  id: string;
  nama: string;
  jabatan: string;
  nik?: string;
  noHp: string;
  alamat?: string;
  periode: string; // Misal: 2024 - 2029
  tugasPokok?: string;
}

export interface RekapitulasiBulanan {
  periodeBulan: number; // 1 - 12
  periodeTahun: number; // e.g. 2026
  namaBulan: string;
  
  // Awal bulan
  awalLaki: number;
  awalPerempuan: number;
  awalTotal: number;

  // Mutasi bulan ini
  lahirLaki: number;
  lahirPerempuan: number;
  lahirTotal: number;

  masukLaki: number;
  masukPerempuan: number;
  masukTotal: number;

  matiLaki: number;
  matiPerempuan: number;
  matiTotal: number;

  keluarLaki: number;
  keluarPerempuan: number;
  keluarTotal: number;

  // Akhir bulan
  akhirLaki: number;
  akhirPerempuan: number;
  akhirTotal: number;

  // KK
  totalKk: number;

  // Distribusi umur akhir bulan
  balitaL: number; // 0 - 4
  balitaP: number;
  anakL: number;   // 5 - 17
  anakP: number;
  produktifL: number; // 18 - 59
  produktifP: number;
  lansiaL: number; // 60+
  lansiaP: number;

  // Mutasi detail
  daftarMutasi: MutasiRecord[];
}
