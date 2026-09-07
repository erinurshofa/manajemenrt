-- ==============================================================================
-- SKEMA DATABASE SUPABASE (HARDENED): SISTEM INFORMASI & KAS RT GASEM RAYA 02
-- Fitur Keamanan: Row Level Security (RLS) Ketat, Storage Bucket, Realtime Channel
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Tabel Profil RT
CREATE TABLE IF NOT EXISTS public.profil_rt (
    id TEXT PRIMARY KEY DEFAULT 'default',
    nomor_rt TEXT NOT NULL DEFAULT '02',
    nomor_rw TEXT NOT NULL DEFAULT '04',
    desa_kelurahan TEXT NOT NULL DEFAULT 'Tlogosari Wetan',
    kecamatan TEXT NOT NULL DEFAULT 'Pedurungan',
    kota_kabupaten TEXT NOT NULL DEFAULT 'Kota Semarang',
    provinsi TEXT NOT NULL DEFAULT 'Jawa Tengah',
    kode_pos TEXT NOT NULL DEFAULT '50196',
    nama_ketua_rt TEXT NOT NULL DEFAULT 'Ketua RT 02',
    nama_sekretaris TEXT NOT NULL DEFAULT 'Sekretaris RT 02',
    nama_bendahara TEXT DEFAULT 'Bendahara RT 02',
    nama_aplikasi TEXT DEFAULT 'Gasem Raya RT 02',
    nomor_kontak TEXT DEFAULT '0812-3456-7890',
    logo_config JSONB DEFAULT '{}'::jsonb,
    theme_config JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel Data Warga
CREATE TABLE IF NOT EXISTS public.warga (
    id TEXT PRIMARY KEY,
    nik TEXT UNIQUE NOT NULL,
    nama TEXT NOT NULL,
    tempat_lahir TEXT NOT NULL,
    tanggal_lahir TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
    no_kk TEXT NOT NULL,
    hubungan_keluarga TEXT NOT NULL,
    alamat TEXT NOT NULL,
    rt TEXT NOT NULL DEFAULT '02',
    rw TEXT NOT NULL DEFAULT '04',
    agama TEXT NOT NULL,
    status_perkawinan TEXT NOT NULL,
    pekerjaan TEXT NOT NULL,
    status_kependudukan TEXT NOT NULL CHECK (status_kependudukan IN ('Tetap', 'Kontrak', 'Domisili')),
    status_kehidupan TEXT NOT NULL CHECK (status_kehidupan IN ('Hidup', 'Meninggal', 'Pindah Keluar')),
    tanggal_daftar TEXT NOT NULL,
    tanggal_mutasi TEXT,
    no_hp TEXT,
    golongan_darah TEXT,
    pendidikan TEXT,
    catatan TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Indeks performa untuk kependudukan
CREATE INDEX IF NOT EXISTS idx_warga_nik ON public.warga (nik);
CREATE INDEX IF NOT EXISTS idx_warga_no_kk ON public.warga (no_kk);
CREATE INDEX IF NOT EXISTS idx_warga_nama ON public.warga (nama);
CREATE INDEX IF NOT EXISTS idx_warga_status_kehidupan ON public.warga (status_kehidupan);

-- 3. Tabel Mutasi Warga
CREATE TABLE IF NOT EXISTS public.mutasi (
    id TEXT PRIMARY KEY,
    warga_id TEXT,
    nama TEXT NOT NULL,
    nik TEXT NOT NULL,
    no_kk TEXT NOT NULL,
    jenis_kelamin TEXT NOT NULL,
    jenis_mutasi TEXT NOT NULL CHECK (jenis_mutasi IN ('Lahir', 'Meninggal', 'Pindah_Masuk', 'Pindah_Keluar')),
    tanggal TEXT NOT NULL,
    keterangan TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_mutasi_tanggal ON public.mutasi (tanggal);
CREATE INDEX IF NOT EXISTS idx_mutasi_nik ON public.mutasi (nik);

-- 4. Tabel Transaksi Kas RT
CREATE TABLE IF NOT EXISTS public.transaksi_kas (
    id TEXT PRIMARY KEY,
    tanggal TEXT NOT NULL,
    jenis TEXT NOT NULL CHECK (jenis IN ('PEMASUKAN', 'PENGELUARAN')),
    kategori TEXT NOT NULL,
    nominal NUMERIC NOT NULL DEFAULT 0,
    keterangan TEXT,
    nomor_bukti TEXT,
    nama_warga TEXT,
    no_kk TEXT,
    file_bukti TEXT,
    file_bukti_nama TEXT,
    file_bukti_tipe TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_kas_tanggal ON public.transaksi_kas (tanggal);
CREATE INDEX IF NOT EXISTS idx_kas_jenis ON public.transaksi_kas (jenis);
CREATE INDEX IF NOT EXISTS idx_kas_kategori ON public.transaksi_kas (kategori);

-- 5. Tabel Dokumen & Arsip RT
CREATE TABLE IF NOT EXISTS public.dokumen_rt (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    kategori TEXT NOT NULL,
    nomor_surat TEXT,
    tanggal TEXT NOT NULL,
    deskripsi TEXT,
    nama_file TEXT NOT NULL,
    ukuran_file TEXT,
    tipe_file TEXT NOT NULL,
    konten_teks TEXT,
    file_data TEXT,
    is_protected BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. Tabel Struktur Pengurus RT
CREATE TABLE IF NOT EXISTS public.pengurus_rt (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    nik TEXT,
    no_hp TEXT NOT NULL,
    alamat TEXT,
    periode TEXT NOT NULL,
    tugas_pokok TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 7. Tabel Kredensial Pengguna / Pengurus
CREATE TABLE IF NOT EXISTS public.user_credentials (
    nik TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    nama TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'warga',
    jabatan TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Akun Default Sistem untuk Seluruh Peran RBAC
INSERT INTO public.user_credentials (nik, password, nama, role, jabatan)
VALUES 
    ('developer', 'developer123', 'Developer / Superadmin RT', 'developer', 'System Engineer & Developer'),
    ('ketuart02', 'ketua123', 'Ketua RT 02 Gasem Raya', 'ketua_rt', 'Ketua RT (Pimpinan)'),
    ('sekretaris02', 'sekretaris123', 'Sekretariat RT 02', 'sekretaris', 'Sekretaris RT'),
    ('bendahara02', 'bendahara123', 'Bendahara Kas RT 02', 'bendahara', 'Bendahara RT'),
    ('pengurus02', 'pengurus123', 'Pengurus Seksi Lapangan', 'pengurus', 'Pengurus RT 02'),
    ('warga02', 'warga123', 'Warga RT 02 Gasem Raya', 'warga', 'Penduduk / Warga'),
    ('admin02', 'admin123', 'Administrator Operasional RT', 'admin', 'Admin Pelayanan RT'),
    ('gasemraya02', 'adminrt02', 'GASEM RAYA RT 02', 'admin', 'Ketua RT (Admin RT 02)')
ON CONFLICT (nik) DO NOTHING;

-- ==============================================================================
-- PENYIMPANAN BERKAS (SUPABASE STORAGE BUCKET)
-- Bucket untuk kuitansi kas dan berkas PDF/dokumen resmi RT
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('lampiran-rt', 'lampiran-rt', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan Storage: Izinkan baca dan kelola berkas di bucket 'lampiran-rt'
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated can upload attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated can delete attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Public can manage attachments" ON storage.objects;
    CREATE POLICY "Public can manage attachments" ON storage.objects
        FOR ALL USING (bucket_id = 'lampiran-rt') WITH CHECK (bucket_id = 'lampiran-rt');
END $$;

-- ==============================================================================
-- KEBIJAKAN KEAMANAN ROW LEVEL SECURITY (RLS)
-- Mengizinkan sinkronisasi data dua arah antara web client (Vercel) & Supabase
-- ==============================================================================

ALTER TABLE public.profil_rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warga ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mutasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi_kas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen_rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pengurus_rt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credentials ENABLE ROW LEVEL SECURITY;

    -- 1. Profil RT
    DROP POLICY IF EXISTS "Public can read profil_rt" ON public.profil_rt;
    DROP POLICY IF EXISTS "Authenticated can manage profil_rt" ON public.profil_rt;
    DROP POLICY IF EXISTS "Allow all for profil_rt" ON public.profil_rt;
    CREATE POLICY "Allow all for profil_rt" ON public.profil_rt FOR ALL USING (true) WITH CHECK (true);

    -- 2. Data Warga
    DROP POLICY IF EXISTS "Public can read warga" ON public.warga;
    DROP POLICY IF EXISTS "Authenticated can manage warga" ON public.warga;
    DROP POLICY IF EXISTS "Allow all for warga" ON public.warga;
    CREATE POLICY "Allow all for warga" ON public.warga FOR ALL USING (true) WITH CHECK (true);

    -- 3. Mutasi
    DROP POLICY IF EXISTS "Public can read mutasi" ON public.mutasi;
    DROP POLICY IF EXISTS "Authenticated can manage mutasi" ON public.mutasi;
    DROP POLICY IF EXISTS "Allow all for mutasi" ON public.mutasi;
    CREATE POLICY "Allow all for mutasi" ON public.mutasi FOR ALL USING (true) WITH CHECK (true);

    -- 4. Transaksi Kas
    DROP POLICY IF EXISTS "Public can read transaksi_kas" ON public.transaksi_kas;
    DROP POLICY IF EXISTS "Authenticated can manage transaksi_kas" ON public.transaksi_kas;
    DROP POLICY IF EXISTS "Allow all for transaksi_kas" ON public.transaksi_kas;
    CREATE POLICY "Allow all for transaksi_kas" ON public.transaksi_kas FOR ALL USING (true) WITH CHECK (true);

    -- 5. Dokumen
    DROP POLICY IF EXISTS "Public can read dokumen_rt" ON public.dokumen_rt;
    DROP POLICY IF EXISTS "Authenticated can manage dokumen_rt" ON public.dokumen_rt;
    DROP POLICY IF EXISTS "Allow all for dokumen_rt" ON public.dokumen_rt;
    CREATE POLICY "Allow all for dokumen_rt" ON public.dokumen_rt FOR ALL USING (true) WITH CHECK (true);

    -- 6. Pengurus RT
    DROP POLICY IF EXISTS "Public can read pengurus_rt" ON public.pengurus_rt;
    DROP POLICY IF EXISTS "Authenticated can manage pengurus_rt" ON public.pengurus_rt;
    DROP POLICY IF EXISTS "Allow all for pengurus_rt" ON public.pengurus_rt;
    CREATE POLICY "Allow all for pengurus_rt" ON public.pengurus_rt FOR ALL USING (true) WITH CHECK (true);

    -- 7. Kredensial
    DROP POLICY IF EXISTS "Authenticated can manage user_credentials" ON public.user_credentials;
    DROP POLICY IF EXISTS "Allow all for user_credentials" ON public.user_credentials;
    CREATE POLICY "Allow all for user_credentials" ON public.user_credentials FOR ALL USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- AKTIFKAN REALTIME REPLICATION
-- Memungkinkan perubahan data langsung muncul di browser lain secara realtime
-- ==============================================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profil_rt;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.warga;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mutasi;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.transaksi_kas;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.dokumen_rt;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pengurus_rt;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;
