# ☁️ Panduan Integrasi & Kolaborasi Google Drive RT 02 Gasem Raya

Panduan resmi tata kelola, setup kredensial, dan konfigurasi kolaborasi cloud storage Google Drive untuk Sistem Manajemen RT 02 Gasem Raya.

---

## 📑 Daftar Isi
1. [Konsep Dasar & Arsitektur Kolaborasi](#-konsep-dasar--arsitektur-kolaborasi)
2. [Langkah 1: Membuat Akun Google Resmi RT](#-langkah-1-membuat-akun-google-resmi-rt)
3. [Langkah 2: Menyiapkan Folder Bersama & Hak Akses](#-langkah-2-menyiapkan-folder-bersama--hak-akses)
4. [Langkah 3: Konfigurasi Google Cloud Console (OAuth Client ID)](#-langkah-3-konfigurasi-google-cloud-console-oauth-client-id)
5. [Langkah 4: Memasang Kredensial ke Berkas .env](#-langkah-4-memasang-kredensial-ke-berkas-env)
6. [Alur Penggunaan Harian di Aplikasi](#-alur-penggunaan-harian-di-aplikasi)
7. [Perbandingan: Google Drive vs Supabase Storage](#-perbandingan-google-drive-vs-supabase-storage)
8. [Troubleshooting & Solusi Kendala Populer](#-troubleshooting--solusi-kendala-populer)

---

## 💡 Konsep Dasar & Arsitektur Kolaborasi

Secara teknis, Google Drive terikat pada **akun perorangan**. Jika Pengurus A login dengan email pribadinya (`budi@gmail.com`), maka berkas yang diunggah masuk ke Drive pribadi Budi. Pengurus B (`siti@gmail.com`) tidak akan bisa melihat berkas tersebut kecuali folder penyimpanan telah dikonfigurasi sebagai **Folder Bersama (Shared Folder)**.

### Strategi Terbaik untuk Organisasi RT:
```mermaid
flowchart TD
    subgraph Akun_Pusat [Akun Resmi Lembaga RT]
        GAccount[rt02gasemraya@gmail.com\nKuota Gratis 15 GB]
        FolderMaster[📁 FOLDER UTAMA RT 02 GASEM RAYA]
    end

    subgraph Akses_Pengurus [Akses Pengurus - Peran: EDITOR]
        Ketua[Pak RT: Upload & Backup DB]
        Sekretaris[Sekretaris: Arsip Surat & SK]
        Bendahara[Bendahara: Laporan Keuangan]
    end

    subgraph Akses_Warga [Akses Warga & Tamu - Peran: VIEWER]
        Warga1[Warga: Baca AD/ART]
        Warga2[Warga: Unduh Formulir RT]
        Warga3[Warga: Lihat Foto Dokumentasi]
    end

    GAccount --> FolderMaster
    FolderMaster -->|Hak Editor| Akses_Pengurus
    FolderMaster -->|Hak Pelihat / Link Publik| Akses_Warga
```

Dengan pola ini:
- **Pengurus** memiliki wewenang untuk menambah, mengubah, dan mencadangkan data.
- **Warga** dapat langsung melihat dan mengunduh berkas tanpa risiko file terhapus atau tertimpa.
- Saat terjadi regenerasi kepengurusan RT, arsip digital tetap aman di akun resmi RT tanpa tercampur aset pribadi.

---

## 📬 Langkah 1: Membuat Akun Google Resmi RT

1. Buka halaman pendaftaran Google: [https://accounts.google.com/signup](https://accounts.google.com/signup).
2. Buat akun baru khusus kelembagaan RT, misalnya:
   - **Nama Depan**: `RT 02 RW 04`
   - **Nama Belakang**: `Gasem Raya`
   - **Email**: `rt02gasemraya@gmail.com` (atau nama lain yang disepakati).
3. Simpan kata sandi dan nomor pemulihan akun di buku catatan inventaris kepengurusan RT.

---

## 📁 Langkah 2: Menyiapkan Folder Bersama & Hak Akses

1. Buka [Google Drive](https://drive.google.com) dan login menggunakan akun RT (`rt02gasemraya@gmail.com`).
2. Klik tombol **+ Baru (+ New)** -> Pilih **Folder Baru (New Folder)**.
3. Beri nama: **`📁 ARSIP RT 02 GASEM RAYA`**.
4. Klik kanan pada folder tersebut -> pilih **Bagikan (Share)** -> **Bagikan (Share)**:
   - **Untuk Warga Umum (Melihat & Mengunduh)**:
     - Di bagian *Akses Umum (General Access)*, ubah dari *Dibatasi (Restricted)* menjadi **"Siapa saja yang memiliki link" (Anyone with the link)**.
     - Setel peran di sebelah kanannya sebagai: **Pelihat (Viewer)**.
   - **Untuk Jajaran Pengurus (Bisa Mengunggah & Menghapus)**:
     - Di kolom input *Tambahkan orang atau grup*, masukkan alamat email pengurus (Ketua, Sekretaris, Bendahara).
     - Setel perannya sebagai: **Editor**.
     - Klik **Kirim (Send)**.

---

## 🔑 Langkah 3: Konfigurasi Google Cloud Console (OAuth Client ID)

Agar aplikasi web Anda diizinkan membaca dan mengirim berkas ke Google Drive, Anda perlu mendaftarkan aplikasi di Google Cloud Platform (GCP):

### 1. Buat Project Baru
1. Kunjungi [Google Cloud Console](https://console.cloud.google.com/).
2. Login dengan akun RT (`rt02gasemraya@gmail.com`).
3. Di bilah navigasi atas, klik pemilih project -> klik **New Project**.
4. Masukkan nama: `Manajemen-RT-Gasem-Raya` -> Klik **Create**.

### 2. Aktifkan Google Drive API
1. Buka menu navigasi kiri (garis tiga) -> **APIs & Services** -> **Library**.
2. Di kolom pencarian ketik `Google Drive API` -> Klik hasilnya.
3. Klik tombol **Enable (Aktifkan)**.

### 3. Setup Layar Persetujuan (OAuth Consent Screen)
1. Buka **APIs & Services** -> **OAuth consent screen**.
2. Pilih User Type: **External** -> Klik **Create**.
3. Lengkapi formulir dasar:
   - **App name**: `Sistem RT 02 Gasem Raya`
   - **User support email**: `rt02gasemraya@gmail.com`
   - **Developer contact email**: `rt02gasemraya@gmail.com`
4. Klik **Save and Continue**.
5. Pada langkah **Scopes (Cakupan)**:
   - Klik **Add or Remove Scopes**.
   - Cari dan centang: `https://www.googleapis.com/auth/drive.file`
   > 💡 *Scope `drive.file` sangat aman karena hanya memberi akses pada berkas yang dibuat/dibuka oleh aplikasi ini, sehingga Google tidak menampilkan peringatan merah "Unverified App".*
   - Klik **Update** -> Klik **Save and Continue**.
6. Pada langkah **Test Users**:
   - Masukkan email pengurus yang akan menggunakan fitur ini (misal: email Ketua, Sekretaris, Bendahara).
   - Klik **Save and Continue**.

### 4. Dapatkan OAuth 2.0 Client ID
1. Buka **APIs & Services** -> **Credentials**.
2. Klik tombol **+ Create Credentials** -> Pilih **OAuth client ID**.
3. Application type: Pilih **Web application**.
4. Name: `Web Client RT Gasem`.
5. **Authorized JavaScript origins**:
   - Masukkan: `http://localhost:3000` (untuk pengujian lokal komputer).
   - Masukkan domain online Anda (jika sudah di-hosting, misal: `https://erinurshofa.github.io`).
6. **Authorized redirect URIs**:
   - Masukkan: `http://localhost:3000` (dan URL hosting online Anda).
7. Klik **Create**.
8. Salin string **Client ID** yang muncul (berakhiran `.apps.googleusercontent.com`).

---

## ⚙️ Langkah 4: Memasang Kredensial ke Berkas .env

Buka berkas `.env` di komputer Anda, lalu tempelkan Client ID yang Anda peroleh:

```env
# Google Drive Cloud Backup Integration
VITE_GOOGLE_CLIENT_ID="1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com"
VITE_GOOGLE_API_KEY=""
```

Setelah menyimpan berkas `.env`, muat ulang server development:
```bash
npm run dev
```

---

## 🖥️ Alur Penggunaan Harian di Aplikasi

Buka menu **Google Drive RT** pada bilah menu samping aplikasi:

### 1. Masuk Pertama Kali
- Klik tombol **"Masuk dengan Akun Google"**.
- Pilih akun Google resmi RT atau akun pengurus yang telah ditambahkan sebagai *Editor*.
- Sesi login disimpan secara aman di `sessionStorage` sehingga menekan tombol refresh (F5) **tidak akan memutuskan koneksi**.

### 2. Cadangkan Database RT (1-Klik Backup)
- Klik tombol **"Backup Data Warga (JSON/CSV)"** atau **"Backup Buku Kas"**.
- Sistem akan mengekspor seluruh rekaman data kependudukan atau kas secara instan ke folder Google Drive RT.

### 3. Mengunggah Berkas & Foto Kegiatan
- Klik tombol **"Unggah Berkas"**.
- Pilih berkas dokumen (PDF, Word, Excel) atau dokumentasi kegiatan warga (foto kerja bakti, perayaan 17 Agustus, rapat RT).
- Berkas otomatis terorganisir di dalam folder RT.

### 4. Pratinjau & Unduh
- Setiap berkas dilengkapi tombol **Buka (Pratinjau)** langsung di Google Drive Viewer.
- Tersedia tombol **Unduh** langsung untuk menyimpan salinan ke perangkat lokal.

---

## ⚖️ Perbandingan: Google Drive vs Supabase Storage

Aplikasi ini dilengkapi 2 jenis penyimpanan awan yang saling melengkapi:

| Kategori | Supabase Storage (`lampiran-rt`) | Google Drive RT |
|---|---|---|
| **Fungsi Utama** | Bukti kuitansi & nota transaksi kas harian | Backup database, dokumen AD/ART, SK, & foto kegiatan |
| **Kapasitas** | 1 GB (Gratis di Supabase) | 15 GB (Gratis dari Akun Google) |
| **Akses Pengguna** | Otomatis tampil di tabel kas tanpa login Google | Pengurus login Google, warga mengakses via tautan publik |
| **Format Berkas** | Gambar (JPG, PNG, WebP) terkompresi otomatis | Bebas (PDF, DOCX, XLSX, ZIP, Gambar, Video) |
| **Keamanan** | Diproteksi aturan Supabase RLS | Diproteksi Google Workspace Security & IAM |

---

## 🛠️ Troubleshooting & Solusi Kendala Populer

### 1. Error: *"Access blocked: This app's request is invalid"* (origin_mismatch)
- **Penyebab**: Alamat URL peramban Anda (misal `http://localhost:3000`) belum didaftarkan di Google Cloud Console.
- **Solusi**: Buka GCP Console -> Credentials -> Klik Client ID Anda -> Tambahkan URL persis ke bagian **Authorized JavaScript origins** dan **Authorized redirect URIs**.

### 2. Sesi Google Drive Terputus Setiap Kali Halaman di-Refresh
- **Solusi**: Pastikan Anda menggunakan kode terbaru di mana token akses disimpan di `sessionStorage` (`gasemraya_gdrive_token`). Sesi akan bertahan selama tab browser tidak ditutup.

### 3. Warga Mengeluh Tidak Bisa Mengunduh File
- **Penyebab**: Folder di Google Drive masih berstatus *Restricted (Dibatasi)*.
- **Solusi**: Buka Google Drive dengan akun RT -> Klik kanan folder -> Bagikan -> Pastikan Akses Umum disetel ke **"Siapa saja yang memiliki link" -> "Pelihat"**.
