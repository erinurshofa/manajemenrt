-- ==============================================================================
-- PERBAIKAN IZIN RLS (ROW LEVEL SECURITY) SUPABASE RT GASEM RAYA 02
-- Masalah: Aplikasi di Vercel terhubung menggunakan Anon Key (role 'anon').
-- Jika RLS hanya mengizinkan 'authenticated', maka operasi INSERT / UPDATE / DELETE
-- ditolak oleh Supabase (403 Forbidden / RLS violation), sehingga data tersimpan
-- sebentar di memori browser lalu hilang saat di-refresh dari Supabase Cloud.
--
-- Solusi: Skrip ini membuka izin penuh (ALL: SELECT, INSERT, UPDATE, DELETE)
-- untuk tabel operasional RT dan storage, sehingga aplikasi web di Vercel & lokal
-- dapat menyimpan dan menyinkronkan data warga secara permanen.
--
-- CARA MENJALANKAN:
-- 1. Buka Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Pilih Project Anda -> menu "SQL Editor"
-- 3. Klik "New Query", paste seluruh skrip ini, lalu klik tombol "Run".
-- ==============================================================================

DO $$
BEGIN
    -- 1. Profil RT
    DROP POLICY IF EXISTS "Public can read profil_rt" ON public.profil_rt;
    DROP POLICY IF EXISTS "Authenticated can manage profil_rt" ON public.profil_rt;
    DROP POLICY IF EXISTS "Allow all for profil_rt" ON public.profil_rt;
    CREATE POLICY "Allow all for profil_rt" ON public.profil_rt 
        FOR ALL USING (true) WITH CHECK (true);

    -- 2. Data Warga
    DROP POLICY IF EXISTS "Public can read warga" ON public.warga;
    DROP POLICY IF EXISTS "Authenticated can manage warga" ON public.warga;
    DROP POLICY IF EXISTS "Allow all for warga" ON public.warga;
    CREATE POLICY "Allow all for warga" ON public.warga 
        FOR ALL USING (true) WITH CHECK (true);

    -- 3. Mutasi
    DROP POLICY IF EXISTS "Public can read mutasi" ON public.mutasi;
    DROP POLICY IF EXISTS "Authenticated can manage mutasi" ON public.mutasi;
    DROP POLICY IF EXISTS "Allow all for mutasi" ON public.mutasi;
    CREATE POLICY "Allow all for mutasi" ON public.mutasi 
        FOR ALL USING (true) WITH CHECK (true);

    -- 4. Transaksi Kas
    DROP POLICY IF EXISTS "Public can read transaksi_kas" ON public.transaksi_kas;
    DROP POLICY IF EXISTS "Authenticated can manage transaksi_kas" ON public.transaksi_kas;
    DROP POLICY IF EXISTS "Allow all for transaksi_kas" ON public.transaksi_kas;
    CREATE POLICY "Allow all for transaksi_kas" ON public.transaksi_kas 
        FOR ALL USING (true) WITH CHECK (true);

    -- 5. Dokumen RT
    DROP POLICY IF EXISTS "Public can read dokumen_rt" ON public.dokumen_rt;
    DROP POLICY IF EXISTS "Authenticated can manage dokumen_rt" ON public.dokumen_rt;
    DROP POLICY IF EXISTS "Allow all for dokumen_rt" ON public.dokumen_rt;
    CREATE POLICY "Allow all for dokumen_rt" ON public.dokumen_rt 
        FOR ALL USING (true) WITH CHECK (true);

    -- 6. Pengurus RT
    DROP POLICY IF EXISTS "Public can read pengurus_rt" ON public.pengurus_rt;
    DROP POLICY IF EXISTS "Authenticated can manage pengurus_rt" ON public.pengurus_rt;
    DROP POLICY IF EXISTS "Allow all for pengurus_rt" ON public.pengurus_rt;
    CREATE POLICY "Allow all for pengurus_rt" ON public.pengurus_rt 
        FOR ALL USING (true) WITH CHECK (true);

    -- 7. Kredensial Pengguna
    DROP POLICY IF EXISTS "Authenticated can manage user_credentials" ON public.user_credentials;
    DROP POLICY IF EXISTS "Allow all for user_credentials" ON public.user_credentials;
    CREATE POLICY "Allow all for user_credentials" ON public.user_credentials 
        FOR ALL USING (true) WITH CHECK (true);

    -- 8. Storage lampiran-rt
    DROP POLICY IF EXISTS "Public can view attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated can upload attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated can delete attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Public can manage attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Allow all for storage lampiran-rt" ON storage.objects;

    CREATE POLICY "Allow all for storage lampiran-rt" ON storage.objects
        FOR ALL USING (bucket_id = 'lampiran-rt') WITH CHECK (bucket_id = 'lampiran-rt');
END $$;
