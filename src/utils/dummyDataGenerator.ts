import { Warga, MutasiRecord, TransaksiKas, DokumenRt, PengurusRt } from '../types';

/**
 * Menghasilkan kumpulan data warga dummy realistis untuk keperluan testing dan benchmarking UI.
 */
export function generateDummyWarga(): Warga[] {
  const timestamp = Date.now();
  const sampleData: Omit<Warga, 'id'>[] = [
    {
      nik: '3374101205800001',
      noKk: '3374100101800001',
      nama: 'Bambang Sudarmono, S.T.',
      tempatLahir: 'Semarang',
      tanggalLahir: '1980-05-12',
      jenisKelamin: 'L',
      agama: 'Islam',
      pendidikan: 'S1',
      pekerjaan: 'Karyawan Swasta',
      statusPerkawinan: 'Kawin',
      hubunganKeluarga: 'KEPALA KELUARGA',
      alamat: 'Jl. Gasem Raya Indah No. 12',
      rt: '02',
      rw: '04',
      statusKependudukan: 'Tetap',
      statusKehidupan: 'Hidup',
      tanggalDaftar: '2024-01-15',
      noHp: '081234567890',
    },
    {
      nik: '3374105408820002',
      noKk: '3374100101800001',
      nama: 'Hj. Endang Sri Lestari, S.Pd.',
      tempatLahir: 'Kudus',
      tanggalLahir: '1982-08-14',
      jenisKelamin: 'P',
      agama: 'Islam',
      pendidikan: 'S1',
      pekerjaan: 'Guru',
      statusPerkawinan: 'Kawin',
      hubunganKeluarga: 'ISTRI',
      alamat: 'Jl. Gasem Raya Indah No. 12',
      rt: '02',
      rw: '04',
      statusKependudukan: 'Tetap',
      statusKehidupan: 'Hidup',
      tanggalDaftar: '2024-01-15',
      noHp: '081398765432',
    },
    {
      nik: '3374101503100003',
      noKk: '3374100101800001',
      nama: 'Muhammad Rizky Pratama',
      tempatLahir: 'Semarang',
      tanggalLahir: '2010-03-15',
      jenisKelamin: 'L',
      agama: 'Islam',
      pendidikan: 'SMP',
      pekerjaan: 'Pelajar/Mahasiswa',
      statusPerkawinan: 'Belum Kawin',
      hubunganKeluarga: 'ANAK',
      alamat: 'Jl. Gasem Raya Indah No. 12',
      rt: '02',
      rw: '04',
      statusKependudukan: 'Tetap',
      statusKehidupan: 'Hidup',
      tanggalDaftar: '2024-01-15',
    },
    {
      nik: '3374101101750004',
      noKk: '3374100101750002',
      nama: 'Dr. Hendra Gunawan, Sp.PD.',
      tempatLahir: 'Solo',
      tanggalLahir: '1975-01-11',
      jenisKelamin: 'L',
      agama: 'Kristen',
      pendidikan: 'S2',
      pekerjaan: 'Dokter',
      statusPerkawinan: 'Kawin',
      hubunganKeluarga: 'KEPALA KELUARGA',
      alamat: 'Jl. Gasem Raya Kav. 18',
      rt: '02',
      rw: '04',
      statusKependudukan: 'Tetap',
      statusKehidupan: 'Hidup',
      tanggalDaftar: '2024-02-01',
      noHp: '081223344556',
    },
    {
      nik: '3374105206770005',
      noKk: '3374100101750002',
      nama: 'dr. Sylvia Anggraini',
      tempatLahir: 'Yogyakarta',
      tanggalLahir: '1977-06-12',
      jenisKelamin: 'P',
      agama: 'Kristen',
      pendidikan: 'S1',
      pekerjaan: 'Dokter',
      statusPerkawinan: 'Kawin',
      hubunganKeluarga: 'ISTRI',
      alamat: 'Jl. Gasem Raya Kav. 18',
      rt: '02',
      rw: '04',
      statusKependudukan: 'Tetap',
      statusKehidupan: 'Hidup',
      tanggalDaftar: '2024-02-01',
      noHp: '081233445566',
    },
    {
      nik: '3374102009650006',
      noKk: '3374100101650003',
      nama: 'H. Ahmad Syukron, M.Ag.',
      tempatLahir: 'Demak',
      tanggalLahir: '1965-09-20',
      jenisKelamin: 'L',
      agama: 'Islam',
      pendidikan: 'S2',
      pekerjaan: 'PNS/Dosen',
      statusPerkawinan: 'Kawin',
      hubunganKeluarga: 'KEPALA KELUARGA',
      alamat: 'Jl. Gasem Raya Indah No. 24',
      rt: '02',
      rw: '04',
      statusKependudukan: 'Tetap',
      statusKehidupan: 'Hidup',
      tanggalDaftar: '2024-02-10',
      noHp: '081555666777',
    },
    {
      nik: '3374106511680007',
      noKk: '3374100101650003',
      nama: 'Hj. Nur Hidayati',
      tempatLahir: 'Kendal',
      tanggalLahir: '1968-11-25',
      jenisKelamin: 'P',
      agama: 'Islam',
      pendidikan: 'SMA',
      pekerjaan: 'Mengurus Rumah Tangga',
      statusPerkawinan: 'Kawin',
      hubunganKeluarga: 'ISTRI',
      alamat: 'Jl. Gasem Raya Indah No. 24',
      rt: '02',
      rw: '04',
      statusKependudukan: 'Tetap',
      statusKehidupan: 'Hidup',
      tanggalDaftar: '2024-02-10',
    },
    {
      nik: '3374100504000008',
      noKk: '3374100101650003',
      nama: 'Aisyah Rahmawati, S.Kom.',
      tempatLahir: 'Semarang',
      tanggalLahir: '2000-04-05',
      jenisKelamin: 'P',
      agama: 'Islam',
      pendidikan: 'S1',
      pekerjaan: 'Software Engineer',
      statusPerkawinan: 'Belum Kawin',
      hubunganKeluarga: 'ANAK',
      alamat: 'Jl. Gasem Raya Indah No. 24',
      rt: '02',
      rw: '04',
      statusKependudukan: 'Tetap',
      statusKehidupan: 'Hidup',
      tanggalDaftar: '2024-02-10',
      noHp: '081288990011',
    },
  ];

  return sampleData.map((item, idx) => ({
    ...item,
    id: `dummy-w-${timestamp}-${idx}`,
  }));
}

/**
 * Menghasilkan transaksi kas dummy realistis
 */
export function generateDummyKas(): TransaksiKas[] {
  const timestamp = Date.now();
  return [
    {
      id: `dummy-k-${timestamp}-1`,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: 'Iuran Wajib Bulanan RT (Warga Blok A & B)',
      kategori: 'Iuran Warga',
      jenis: 'PEMASUKAN',
      nominal: 1250000,
    },
    {
      id: `dummy-k-${timestamp}-2`,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: 'Honor & Insentif Petugas Keamanan / Satpam Pos',
      kategori: 'Keamanan & Ronda',
      jenis: 'PENGELUARAN',
      nominal: 800000,
    },
    {
      id: `dummy-k-${timestamp}-3`,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: 'Peremajaan Lampu Sorot LED Lapangan & Pos Kamling',
      kategori: 'Sarana & Prasarana',
      jenis: 'PENGELUARAN',
      nominal: 350000,
    },
    {
      id: `dummy-k-${timestamp}-4`,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: 'Dana Sosial Warga Sakit (Keluarga Bpk. Bambang)',
      kategori: 'Sosial & Kematian',
      jenis: 'PENGELUARAN',
      nominal: 250000,
    },
    {
      id: `dummy-k-${timestamp}-5`,
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: 'Donasi Pembangunan Gapura RT dari Warga Donatur',
      kategori: 'Donasi / Sumbangan',
      jenis: 'PEMASUKAN',
      nominal: 2000000,
    },
  ];
}

/**
 * Menghasilkan data mutasi dummy realistis
 */
export function generateDummyMutasi(wargaList: Warga[]): MutasiRecord[] {
  const timestamp = Date.now();
  const targetWarga = wargaList[0] || {
    id: 'dummy-w-0',
    nama: 'Bambang Sudarmono',
    nik: '3374101205800001',
    noKk: '3374100101800001',
    jenisKelamin: 'L',
  };

  return [
    {
      id: `dummy-m-${timestamp}-1`,
      wargaId: targetWarga.id,
      nama: targetWarga.nama,
      nik: targetWarga.nik,
      noKk: targetWarga.noKk,
      jenisKelamin: targetWarga.jenisKelamin,
      jenisMutasi: 'Pindah_Masuk',
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: 'Pindah domisili resmi dari Boyolali ke RT 02 / RW 04',
    },
  ];
}

/**
 * Menghasilkan data arsip dokumen RT dummy realistis
 */
export function generateDummyDokumen(): DokumenRt[] {
  const timestamp = Date.now();
  return [
    {
      id: `dummy-d-${timestamp}-1`,
      judul: 'Surat Edaran Kerja Bakti Lingkungan & PSN DBD Menjelang Musim Hujan',
      kategori: 'Surat Edaran',
      nomorSurat: '05/SE-RT02/X/2024',
      tanggal: '2024-10-12',
      deskripsi: 'Pemberitahuan gotong royong massal pembersihan selokan, pemangkasan dahan pohon, dan antisipasi jentik nyamuk.',
      namaFile: 'SE_KerjaBakti_PSN_DBD_RT02.pdf',
      ukuranFile: '195 KB',
      tipeFile: 'pdf',
      isProtected: false,
      kontenTeks: `SURAT EDARAN
Nomor: 05/SE-RT02/X/2024
Tentang: Kegiatan Kerja Bakti Lingkungan & Pemberantasan Sarang Nyamuk (PSN) DBD

Kepada Yth.
Bapak/Ibu Warga Gasem Raya RT 02 / RW 04

Dalam rangka mengantisipasi musim hujan dan mencegah penyebaran wabah Demam Berdarah Dengue (DBD), Pengurus RT 02 mengimbau seluruh warga untuk hadir dan berpartisipasi aktif dalam kegiatan gotong royong:
- Hari/Tanggal : Minggu, 20 Oktober 2024
- Waktu : Pukul 06.30 WIB s/d selesai
- Titik Kumpul : Pos Kamling Utama RT 02
- Agenda : Pembersihan saluran drainase, penimbunan genangan air liar, pemangkasan dahan rimbun.

Demikian surat edaran ini disampaikan untuk menjadi perhatian bersama.

Pengurus RT 02 Gasem Raya`,
    },
    {
      id: `dummy-d-${timestamp}-2`,
      judul: 'Formulir Standar Surat Pengantar Administrasi Warga RT 02',
      kategori: 'Formulir',
      nomorSurat: '01/FORM-PENGANTAR/2024',
      tanggal: '2024-03-01',
      deskripsi: 'Template resmi surat keterangan pengantar RT untuk pengurusan KTP-el, KK baru, SKCK kepolisian, maupun domisili kelurahan.',
      namaFile: 'Form_Surat_Pengantar_RT02.doc',
      ukuranFile: '120 KB',
      tipeFile: 'doc',
      isProtected: false,
      kontenTeks: `SURAT PENGANTAR RT
Nomor: ..... / SP-RT02 / RW04 / .....

Yang bertanda tangan di bawah ini Ketua RT 02 / RW 04 Kelurahan Tlogosari Wetan, menerangkan bahwa:
Nama : ........................................
NIK : ........................................
Tempat/Tgl Lahir : ........................................
Pekerjaan : ........................................
Alamat : ........................................

Orang tersebut di atas adalah benar-benar warga penduduk RT 02 / RW 04 dan surat pengantar ini diberikan untuk keperluan administrasi resmi.`,
    },
    {
      id: `dummy-d-${timestamp}-3`,
      judul: 'SK Pengesahan Susunan Pengurus RT 02 Periode 2024 - 2029',
      kategori: 'SK Pengurus',
      nomorSurat: '18/SK-KEL/TW/2024',
      tanggal: '2024-01-20',
      deskripsi: 'Surat Keputusan penetapan resmi lembaga kemasyarakatan rukun tetangga yang disahkan oleh Kepala Kelurahan Tlogosari Wetan.',
      namaFile: 'SK_Pengurus_RT02_2024_2029.pdf',
      ukuranFile: '310 KB',
      tipeFile: 'pdf',
      isProtected: true,
      kontenTeks: `KEPUTUSAN LURAH TLOGOSARI WETAN
NOMOR: 18/SK-KEL/TW/2024
TENTANG
PENGUKUHAN SUSUNAN PENGURUS RUKUN TETANGGA 02 RUKUN WARGA 04
KELURAHAN TLOGOSARI WETAN KECAMATAN PEDURUNGAN KOTA SEMARANG
MASA BHAKTI 2024 - 2029

Menetapkan susunan kepengurusan RT 02 / RW 04 untuk menjalankan pelayanan warga secara transparan dan amanah.`,
    },
    {
      id: `dummy-d-${timestamp}-4`,
      judul: 'Laporan Pertanggungjawaban Kas & Neraca Keuangan Tahunan RT 02',
      kategori: 'Laporan Keuangan',
      nomorSurat: '02/LPJ-KEU/GR02/2024',
      tanggal: '2024-12-31',
      deskripsi: 'Laporan audit kas terbuka penerimaan iuran bulanan, pengeluaran ronda, dan saldo akhir tahun anggaran kas RT.',
      namaFile: 'LPJ_Keuangan_Tahunan_RT02.pdf',
      ukuranFile: '420 KB',
      tipeFile: 'pdf',
      isProtected: false,
      kontenTeks: `LAPORAN PERTANGGUNGJAWABAN KEUANGAN KAS RT 02
TAHUN ANGGARAN 2024
Total Penerimaan Kas : Rp 24.500.000,-
Total Realisasi Belanja : Rp 18.250.000,-
Saldo Sisa Lebih Pembiayaan (SILPA) : Rp 6.250.000,-

Disahkan oleh Ketua RT 02 & Bendahara Kas.`,
    },
    {
      id: `dummy-d-${timestamp}-5`,
      judul: 'Berita Acara Musyawarah Warga Penyesuaian Iuran & Peremajaan CCTV',
      kategori: 'Peraturan RT',
      nomorSurat: '04/BA-MUSY/RT02/2024',
      tanggal: '2024-05-18',
      deskripsi: 'Notulensi mufakat warga mengenai pemasangan 4 titik CCTV lingkungan dan pengadaan peralatan tenda duka.',
      namaFile: 'Notulen_Musyawarah_Warga_CCTV.pdf',
      ukuranFile: '165 KB',
      tipeFile: 'text',
      isProtected: false,
      kontenTeks: `BERITA ACARA MUSYAWARAH WARGA RT 02
Pada hari Sabtu, 18 Mei 2024 bertempat di Balai Pertemuan Warga, telah disepakati:
1. Pemasangan 4 unit kamera CCTV pemantau jalan masuk.
2. Pengalokasian dana kas RT untuk pemeliharaan rutin portal otomatis.`,
    },
  ];
}

/**
 * Menghasilkan data struktur pengurus RT dummy realistis
 */
export function generateDummyPengurus(): PengurusRt[] {
  const timestamp = Date.now();
  return [
    {
      id: `dummy-p-${timestamp}-1`,
      nama: 'Ir. Joko Wahyudi, M.T.',
      jabatan: 'Wakil Ketua RT',
      nik: '3374101806740001',
      noHp: '0812-4455-6677',
      alamat: 'Jl. Gasem Raya No. 04',
      periode: '2024 - 2029',
      tugasPokok: 'Membantu tugas operasional Ketua RT dan memimpin musyawarah warga saat Ketua RT berhalangan hadir.',
    },
    {
      id: `dummy-p-${timestamp}-2`,
      nama: 'Drs. Supriyanto',
      jabatan: 'Sekretaris RT',
      nik: '3374100904780002',
      noHp: '0813-8899-0011',
      alamat: 'Jl. Gasem Raya No. 08',
      periode: '2024 - 2029',
      tugasPokok: 'Mengelola ketatausahaan, registrasi kependudukan, arsip persuratan, dan notulensi musyawarah warga.',
    },
    {
      id: `dummy-p-${timestamp}-3`,
      nama: 'Dra. Hj. Siti Rochmah',
      jabatan: 'Bendahara RT',
      nik: '3374105102810003',
      noHp: '0815-6677-8899',
      alamat: 'Jl. Gasem Raya Kav. 14',
      periode: '2024 - 2029',
      tugasPokok: 'Menghimpun iuran warga, membukukan arus kas pemasukan dan pengeluaran, serta menyusun laporan kas bulanan.',
    },
    {
      id: `dummy-p-${timestamp}-4`,
      nama: 'Sutrisno Budiman',
      jabatan: 'Seksi Keamanan & Ronda',
      nik: '3374102511790004',
      noHp: '0857-1122-3344',
      alamat: 'Jl. Gasem Raya No. 19',
      periode: '2024 - 2029',
      tugasPokok: 'Mengkoordinasikan jadwal siskamling ronda malam warga, operasional portal pos kamling, dan ketertiban lingkungan.',
    },
    {
      id: `dummy-p-${timestamp}-5`,
      nama: 'Agus Setiawan, S.T.',
      jabatan: 'Seksi Pembangunan & Sarpras',
      nik: '3374101407830005',
      noHp: '0818-9900-1122',
      alamat: 'Jl. Gasem Raya Blok B No. 02',
      periode: '2024 - 2029',
      tugasPokok: 'Memelihara lampu penerangan jalan, saluran drainase air, fasilitas umum, dan inventaris barang milik RT.',
    },
    {
      id: `dummy-p-${timestamp}-6`,
      nama: 'Ibu Ratna Dewi, S.Pd.',
      jabatan: 'Seksi Sosial, PKK & Pemberdayaan',
      nik: '3374106209850006',
      noHp: '0821-3344-5566',
      alamat: 'Jl. Gasem Raya No. 27',
      periode: '2024 - 2029',
      tugasPokok: 'Mengkoordinasikan kegiatan senam sehat warga, posyandu lansia & balita, serta penyaluran dana sosial warga sakit/duka.',
    },
  ];
}
