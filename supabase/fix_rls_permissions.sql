-- ==============================================================================
-- KEAMANAN RLS RESMI (ROW LEVEL SECURITY) RT GASEM RAYA 02
-- Kebijakan:
-- 1. Publik (Warga & Tamu) BISA MEMBACA (SELECT) data transparansi (warga, kas, dokumen, profil, mutasi, pengurus).
-- 2. HANYA Pengguna Terotentikasi (Admin / Pengurus yang login) yang BISA MENAMBAH/UBAH/HAPUS (INSERT, UPDATE, DELETE).
-- 3. Tabel kredensial (user_credentials) DIKUNCI TOTAL dari akses publik (anon).
-- 4. Supabase Storage lampiran-rt: Publik bisa melihat, tapi hanya pengurus terotentikasi yang bisa mengunggah / menghapus.
-- Jalankan di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

DO $$
BEGIN
    -- 1. Profil RT
    DROP POLICY IF EXISTS "Public can read profil_rt" ON public.profil_rt;
    DROP POLICY IF EXISTS "Authenticated can manage profil_rt" ON public.profil_rt;
    DROP POLICY IF EXISTS "Allow all for profil_rt" ON public.profil_rt;
    CREATE POLICY "Public can read profil_rt" ON public.profil_rt FOR SELECT USING (true);
    CREATE POLICY "Authenticated can manage profil_rt" ON public.profil_rt FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- 2. Data Warga
    DROP POLICY IF EXISTS "Public can read warga" ON public.warga;
    DROP POLICY IF EXISTS "Authenticated can manage warga" ON public.warga;
    DROP POLICY IF EXISTS "Allow all for warga" ON public.warga;
    CREATE POLICY "Public can read warga" ON public.warga FOR SELECT USING (true);
    CREATE POLICY "Authenticated can manage warga" ON public.warga FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- 3. Mutasi
    DROP POLICY IF EXISTS "Public can read mutasi" ON public.mutasi;
    DROP POLICY IF EXISTS "Authenticated can manage mutasi" ON public.mutasi;
    DROP POLICY IF EXISTS "Allow all for mutasi" ON public.mutasi;
    CREATE POLICY "Public can read mutasi" ON public.mutasi FOR SELECT USING (true);
    CREATE POLICY "Authenticated can manage mutasi" ON public.mutasi FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- 4. Transaksi Kas
    DROP POLICY IF EXISTS "Public can read transaksi_kas" ON public.transaksi_kas;
    DROP POLICY IF EXISTS "Authenticated can manage transaksi_kas" ON public.transaksi_kas;
    DROP POLICY IF EXISTS "Allow all for transaksi_kas" ON public.transaksi_kas;
    CREATE POLICY "Public can read transaksi_kas" ON public.transaksi_kas FOR SELECT USING (true);
    CREATE POLICY "Authenticated can manage transaksi_kas" ON public.transaksi_kas FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- 5. Dokumen RT
    DROP POLICY IF EXISTS "Public can read dokumen_rt" ON public.dokumen_rt;
    DROP POLICY IF EXISTS "Authenticated can manage dokumen_rt" ON public.dokumen_rt;
    DROP POLICY IF EXISTS "Allow all for dokumen_rt" ON public.dokumen_rt;
    CREATE POLICY "Public can read dokumen_rt" ON public.dokumen_rt FOR SELECT USING (true);
    CREATE POLICY "Authenticated can manage dokumen_rt" ON public.dokumen_rt FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- 6. Pengurus RT
    DROP POLICY IF EXISTS "Public can read pengurus_rt" ON public.pengurus_rt;
    DROP POLICY IF EXISTS "Authenticated can manage pengurus_rt" ON public.pengurus_rt;
    DROP POLICY IF EXISTS "Allow all for pengurus_rt" ON public.pengurus_rt;
    CREATE POLICY "Public can read pengurus_rt" ON public.pengurus_rt FOR SELECT USING (true);
    CREATE POLICY "Authenticated can manage pengurus_rt" ON public.pengurus_rt FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- 7. Kredensial (Dikunci Total dari Publik Anonim)
    DROP POLICY IF EXISTS "Authenticated can manage user_credentials" ON public.user_credentials;
    DROP POLICY IF EXISTS "Allow all for user_credentials" ON public.user_credentials;
    CREATE POLICY "Authenticated can manage user_credentials" ON public.user_credentials FOR ALL TO authenticated USING (true) WITH CHECK (true);

    -- 8. Storage lampiran-rt
    DROP POLICY IF EXISTS "Public can view attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated can upload attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated can delete attachments" ON storage.objects;
    DROP POLICY IF EXISTS "Public can manage attachments" ON storage.objects;

    CREATE POLICY "Public can view attachments" ON storage.objects
        FOR SELECT USING (bucket_id = 'lampiran-rt');

    CREATE POLICY "Authenticated can upload attachments" ON storage.objects
        FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lampiran-rt');

    CREATE POLICY "Authenticated can delete attachments" ON storage.objects
        FOR DELETE TO authenticated USING (bucket_id = 'lampiran-rt');
END $$;
