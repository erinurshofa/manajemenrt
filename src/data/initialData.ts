import {
  Warga,
  ProfilRt,
  MutasiRecord,
  TransaksiKas,
  DokumenRt,
  PengurusRt,
  PresetTemaBatik,
  ThemeConfig,
  LogoConfig,
  UserCredential,
} from '../types';

export const THEME_PRESETS: Record<
  PresetTemaBatik,
  {
    id: PresetTemaBatik;
    name: string;
    description: string;
    warnaUtama: string; // Aksen Emas / Sorotan
    warnaSidebar: string; // Warna dasar Sidebar
    warnaHeader: string; // Warna Header
    warnaSecondary: string;
    labelBadge: string;
  }
> = {
  'batik-soga': {
    id: 'batik-soga',
    name: 'Batik Soga Klasik (Default)',
    description: 'Cita rasa adiluhung cokelat soga tanah pusaka, ornamen emas keraton dan krem gading.',
    warnaUtama: '#c59239', // Batik Gold
    warnaSidebar: '#27150c', // Dark Soga Wood
    warnaHeader: '#361e12',
    warnaSecondary: '#d4af37',
    labelBadge: 'Klasik Soga Solo/Jogja',
  },
  'batik-megamendung': {
    id: 'batik-megamendung',
    name: 'Batik Mega Mendung (Cirebon)',
    description: 'Nuansa biru indigo pesisir dengan gradasi malam teduh dan aksen awan keperakan.',
    warnaUtama: '#38bdf8',
    warnaSidebar: '#0b162c',
    warnaHeader: '#14254b',
    warnaSecondary: '#60a5fa',
    labelBadge: 'Indigo Cirebon',
  },
  'batik-parang': {
    id: 'batik-parang',
    name: 'Batik Parang Kencana (Terracotta)',
    description: 'Keberanian motif parang dengan perpaduan tembaga tempa, tanah merah, dan emas tua.',
    warnaUtama: '#d97706',
    warnaSidebar: '#2e1208',
    warnaHeader: '#451c0e',
    warnaSecondary: '#f59e0b',
    labelBadge: 'Terracotta Tembaga',
  },
  'batik-hijau': {
    id: 'batik-hijau',
    name: 'Batik Hijau Pesisiran (Pekalongan)',
    description: 'Kesejukan daun jati pesisir utara berpadu kuning kunyit dan hijau lumut asri.',
    warnaUtama: '#10b981',
    warnaSidebar: '#072417',
    warnaHeader: '#0e3a27',
    warnaSecondary: '#34d399',
    labelBadge: 'Pesisir Pekalongan',
  },
  'batik-marun': {
    id: 'batik-marun',
    name: 'Batik Sekar Jagad Marun',
    description: 'Kemewahan kain sekar jagad dengan merah marun pekat dan sulaman emas keraton.',
    warnaUtama: '#f43f5e',
    warnaSidebar: '#290a14',
    warnaHeader: '#410e20',
    warnaSecondary: '#fb7185',
    labelBadge: 'Marun Sekar Jagad',
  },
  'kustom': {
    id: 'kustom',
    name: 'Warna Pilihan Kustom',
    description: 'Warna bebas yang ditentukan oleh Pengurus / Admin RT.',
    warnaUtama: '#c59239',
    warnaSidebar: '#27150c',
    warnaHeader: '#361e12',
    warnaSecondary: '#d4af37',
    labelBadge: 'Kustom Pengurus',
  },
};

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: 'batik-soga',
  warnaUtama: '#c59239', // Batik Gold
  warnaSidebar: '#27150c', // Deep Soga Wood
  warnaHeader: '#361e12',
  tampilkanMotifBatik: true,
};

export const DEFAULT_LOGO_CONFIG: LogoConfig = {
  tipe: 'emblem-keraton',
  monogramText: 'GR',
  subText: 'RT 02',
};

export const DEFAULT_PROFIL_RT: ProfilRt = {
  nomorRt: '02',
  nomorRw: '04',
  desaKelurahan: 'Tlogosari Wetan',
  kecamatan: 'Pedurungan',
  kotaKabupaten: 'Kota Semarang',
  provinsi: 'Jawa Tengah',
  kodePos: '50196',
  namaKetuaRt: 'GASEM RAYA RT 02',
  namaSekretaris: 'Sekretaris RT 02',
  namaBendahara: 'Bendahara RT 02',
  namaAplikasi: 'Gasem Raya RT 02',
  nomorKontak: '0812-3456-7890',
  themeConfig: DEFAULT_THEME_CONFIG,
  logoConfig: DEFAULT_LOGO_CONFIG,
};

// Kredensial tidak di-hardcode di kode program. 
// Akun dikelola secara dinamis via database / IndexedDB, atau dibootstrap melalui variabel lingkungan .env
const envAdminUser = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_INITIAL_ADMIN_USER || import.meta.env?.VITE_ADMIN_USER)) || '';
const envAdminPass = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_INITIAL_ADMIN_PASS || import.meta.env?.VITE_ADMIN_PASSWORD)) || '';

export const INITIAL_CREDENTIALS: UserCredential[] = (envAdminUser && envAdminPass)
  ? [
      {
        id: 'cred-env-root',
        nik: envAdminUser,
        password: envAdminPass,
        nama: 'Administrator Sistem',
        role: 'developer',
        jabatan: 'System Administrator & Developer',
        createdAt: '2026-09-01',
      },
    ]
  : [];

// Data Warga telah dikosongkan sesuai permintaan pengguna
export const INITIAL_WARGA: Warga[] = [];

// Catatan Mutasi kependudukan awal kosong
export const INITIAL_MUTASI: MutasiRecord[] = [];

export const INITIAL_PENGURUS: PengurusRt[] = [
  {
    id: 'p-01',
    nama: 'GASEM RAYA RT 02',
    jabatan: 'Ketua RT (Admin)',
    nik: 'GASEMRAYA02',
    noHp: '0812-3456-7890',
    alamat: 'Jl. Gasem Raya RT 02 / RW 04, Kel. Tlogosari Wetan, Kec. Pedurungan, Kota Semarang 50196',
    periode: '2024 - 2029',
    tugasPokok: 'Memimpin dan mengkoordinasikan penyelenggaraan ketertiban, pelayanan administrasi warga, dan program kemasyarakatan Gasem Raya RT 02.',
  },
];

export const INITIAL_DOKUMEN: DokumenRt[] = [
  {
    id: 'dok-01',
    judul: 'Anggaran Dasar & Anggaran Rumah Tangga (AD/ART) Gasem Raya RT 02',
    kategori: 'AD/ART',
    nomorSurat: '01/AD-ART/RT.02-RW.04/2024',
    tanggal: '2024-01-15',
    deskripsi: 'Pedoman pokok landasan hukum, hak & kewajiban warga, iuran, kepengurusan, dan mekanisme musyawarah warga Gasem Raya RT 02.',
    namaFile: 'AD_ART_GasemRaya_RT02_Resmi.pdf',
    ukuranFile: '245 KB',
    tipeFile: 'pdf',
    isProtected: true,
    kontenTeks: `ANGGARAN DASAR DAN ANGGARAN RUMAH TANGGA (AD/ART)
RUKUN TETANGGA (RT) 02 / RW 04 "GASEM RAYA"
KELURAHAN TLOGOSARI WETAN, KECAMATAN PEDURUNGAN, KOTA SEMARANG 50196

BAB I : NAMA, TEMPAT KEDUDUKAN, DAN SIFAT
Pasal 1: Organisasi ini bernama Rukun Tetangga 02 Rukun Warga 04 disingkat Gasem Raya RT 02.
Pasal 2: Gasem Raya RT 02 berkedudukan di wilayah Kelurahan Tlogosari Wetan, Kecamatan Pedurungan, Kota Semarang 50196.
Pasal 3: Gasem Raya RT 02 bersifat kekeluargaan, musyawarah untuk mufakat, gotong royong, nirlaba, dan independen.

BAB II : AZAS DAN TUJUAN
Pasal 4: Gasem Raya RT 02 berazaskan Pancasila dan Undang-Undang Dasar 1945.
Pasal 5: Memelihara kerukunan hidup bertetangga, memelihara ketertiban & keamanan lingkungan, serta mewujudkan kebersihan lingkungan yang asri dan beradab.

BAB III : HAK DAN KEWAJIBAN WARGA
Pasal 6 (Kewajiban Warga):
1. Setiap warga wajib melapor kepada Pengurus RT (1x24 jam) bila membawa tamu menginap atau terjadi mutasi kependudukan.
2. Membayar iuran wajib kas bulanan RT, kebersihan sampah, dan keamanan tepat waktu.
3. Ikut serta secara aktif dalam kegiatan kerja bakti dan musyawarah warga.

Ditetapkan di: Kota Semarang
Musyawarah Warga Gasem Raya RT 02`,
  },
  {
    id: 'dok-02',
    judul: 'Tata Tertib & Peraturan Keamanan Lingkungan Gasem Raya RT 02',
    kategori: 'Peraturan RT',
    nomorSurat: '02/PER-RT/GR02/2024',
    tanggal: '2024-02-01',
    deskripsi: 'Peraturan jam malam portal lingkungan, ketentuan tamu menginap, aturan parkir kendaraan, dan siskamling warga.',
    namaFile: 'Peraturan_Lingkungan_GasemRaya_RT02.pdf',
    ukuranFile: '180 KB',
    tipeFile: 'pdf',
    kontenTeks: `TATA TERTIB LINGKUNGAN GASEM RAYA RT 02:
1. Portal utama ditutup pukul 23.00 WIB dan dibuka kembali pukul 05.00 WIB untuk keselamatan lingkungan.
2. Tamu 1x24 jam wajib lapor RT/petugas keamanan.
3. Dilarang memarkir kendaraan sembarangan yang menghalangi laju mobil pemadam kebakaran.
4. Pembuangan sampah wajib di tempat sampah tertutup yang disediakan di depan rumah.`,
  },
];

export const INITIAL_KAS: TransaksiKas[] = [
  {
    id: 'kas-001',
    tanggal: '2026-09-01',
    jenis: 'PEMASUKAN',
    kategori: 'Saldo Awal',
    nominal: 0,
    keterangan: 'Saldo awal kas Gasem Raya RT 02',
    nomorBukti: 'BKM-001',
  },
];
