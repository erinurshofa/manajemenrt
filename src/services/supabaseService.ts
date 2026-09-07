import { supabase, isSupabaseConfigured } from './supabaseClient';
import {
  Warga,
  MutasiRecord,
  TransaksiKas,
  DokumenRt,
  PengurusRt,
  ProfilRt,
  UserCredential,
} from '../types';
import { enqueueSync, getSyncQueue, popSyncQueueItem, removeSyncQueueItemByEntity } from './offlineStorage';

// ==========================================
// MAPPERS: TypeScript (camelCase) <-> DB (snake_case)
// ==========================================

export const mapWargaToDb = (w: Warga) => ({
  id: w.id,
  nik: w.nik,
  nama: w.nama,
  tempat_lahir: w.tempatLahir,
  tanggal_lahir: w.tanggalLahir,
  jenis_kelamin: w.jenisKelamin,
  no_kk: w.noKk,
  hubungan_keluarga: w.hubunganKeluarga,
  alamat: w.alamat,
  rt: w.rt,
  rw: w.rw,
  agama: w.agama,
  status_perkawinan: w.statusPerkawinan,
  pekerjaan: w.pekerjaan,
  status_kependudukan: w.statusKependudukan,
  status_kehidupan: w.statusKehidupan,
  tanggal_daftar: w.tanggalDaftar,
  tanggal_mutasi: w.tanggalMutasi || null,
  no_hp: w.noHp || null,
  golongan_darah: w.golonganDarah || null,
  pendidikan: w.pendidikan || null,
  catatan: w.catatan || null,
  updated_at: new Date().toISOString(),
});

export const mapDbToWarga = (row: any): Warga => ({
  id: row.id,
  nik: row.nik,
  nama: row.nama,
  tempatLahir: row.tempat_lahir,
  tanggalLahir: row.tanggal_lahir,
  jenisKelamin: row.jenis_kelamin,
  noKk: row.no_kk,
  hubunganKeluarga: row.hubungan_keluarga,
  alamat: row.alamat,
  rt: row.rt,
  rw: row.rw,
  agama: row.agama,
  statusPerkawinan: row.status_perkawinan,
  pekerjaan: row.pekerjaan,
  statusKependudukan: row.status_kependudukan,
  statusKehidupan: row.status_kehidupan,
  tanggalDaftar: row.tanggal_daftar,
  tanggalMutasi: row.tanggal_mutasi || undefined,
  noHp: row.no_hp || undefined,
  golonganDarah: row.golongan_darah || undefined,
  pendidikan: row.pendidikan || undefined,
  catatan: row.catatan || undefined,
});

export const mapMutasiToDb = (m: MutasiRecord) => ({
  id: m.id,
  warga_id: m.wargaId || null,
  nama: m.nama,
  nik: m.nik,
  no_kk: m.noKk,
  jenis_kelamin: m.jenisKelamin,
  jenis_mutasi: m.jenisMutasi,
  tanggal: m.tanggal,
  keterangan: m.keterangan || null,
});

export const mapDbToMutasi = (row: any): MutasiRecord => ({
  id: row.id,
  wargaId: row.warga_id || undefined,
  nama: row.nama,
  nik: row.nik,
  noKk: row.no_kk,
  jenisKelamin: row.jenis_kelamin,
  jenisMutasi: row.jenis_mutasi,
  tanggal: row.tanggal,
  keterangan: row.keterangan || '',
});

export const mapKasToDb = (k: TransaksiKas) => ({
  id: k.id,
  tanggal: k.tanggal,
  jenis: k.jenis,
  kategori: k.kategori,
  nominal: Number(k.nominal),
  keterangan: k.keterangan || '',
  nomor_bukti: k.nomorBukti || null,
  nama_warga: k.namaWarga || null,
  no_kk: k.noKk || null,
  file_bukti: k.fileBukti || null,
  file_bukti_nama: k.fileBuktiNama || null,
  file_bukti_tipe: k.fileBuktiTipe || null,
});

export const mapDbToKas = (row: any): TransaksiKas => ({
  id: row.id,
  tanggal: row.tanggal,
  jenis: row.jenis,
  kategori: row.kategori,
  nominal: Number(row.nominal),
  keterangan: row.keterangan || '',
  nomorBukti: row.nomor_bukti || undefined,
  namaWarga: row.nama_warga || undefined,
  noKk: row.no_kk || undefined,
  fileBukti: row.file_bukti || undefined,
  fileBuktiNama: row.file_bukti_nama || undefined,
  fileBuktiTipe: row.file_bukti_tipe || undefined,
});

export const mapDokumenToDb = (d: DokumenRt) => ({
  id: d.id,
  judul: d.judul,
  kategori: d.kategori,
  nomor_surat: d.nomorSurat || null,
  tanggal: d.tanggal,
  deskripsi: d.deskripsi || '',
  nama_file: d.namaFile,
  ukuran_file: d.ukuranFile || null,
  tipe_file: d.tipeFile,
  konten_teks: d.kontenTeks || null,
  file_data: d.fileData || null,
  is_protected: Boolean(d.isProtected),
});

export const mapDbToDokumen = (row: any): DokumenRt => ({
  id: row.id,
  judul: row.judul,
  kategori: row.kategori,
  nomorSurat: row.nomor_surat || undefined,
  tanggal: row.tanggal,
  deskripsi: row.deskripsi || '',
  namaFile: row.nama_file,
  ukuranFile: row.ukuran_file || undefined,
  tipeFile: row.tipe_file,
  kontenTeks: row.konten_teks || undefined,
  fileData: row.file_data || undefined,
  isProtected: Boolean(row.is_protected),
});

export const mapPengurusToDb = (p: PengurusRt) => ({
  id: p.id,
  nama: p.nama,
  jabatan: p.jabatan,
  nik: p.nik || null,
  no_hp: p.noHp,
  alamat: p.alamat || null,
  periode: p.periode,
  tugas_pokok: p.tugasPokok || null,
});

export const mapDbToPengurus = (row: any): PengurusRt => ({
  id: row.id,
  nama: row.nama,
  jabatan: row.jabatan,
  nik: row.nik || undefined,
  noHp: row.no_hp || '',
  alamat: row.alamat || undefined,
  periode: row.periode,
  tugasPokok: row.tugas_pokok || undefined,
});

export const mapProfilToDb = (p: ProfilRt) => ({
  id: 'default',
  nomor_rt: p.nomorRt,
  nomor_rw: p.nomorRw,
  desa_kelurahan: p.desaKelurahan,
  kecamatan: p.kecamatan,
  kota_kabupaten: p.kotaKabupaten,
  provinsi: p.provinsi,
  kode_pos: p.kodePos,
  nama_ketua_rt: p.namaKetuaRt,
  nama_sekretaris: p.namaSekretaris,
  nama_bendahara: p.namaBendahara || null,
  nama_aplikasi: p.namaAplikasi || 'Gasem Raya RT 02',
  nomor_kontak: p.nomorKontak,
  logo_config: p.logoConfig || {},
  theme_config: p.themeConfig || {},
  updated_at: new Date().toISOString(),
});

export const mapDbToProfil = (row: any, fallback: ProfilRt): ProfilRt => {
  if (!row) return fallback;
  return {
    nomorRt: row.nomor_rt || fallback.nomorRt,
    nomorRw: row.nomor_rw || fallback.nomorRw,
    desaKelurahan: row.desa_kelurahan || fallback.desaKelurahan,
    kecamatan: row.kecamatan || fallback.kecamatan,
    kotaKabupaten: row.kota_kabupaten || fallback.kotaKabupaten,
    provinsi: row.provinsi || fallback.provinsi,
    kodePos: row.kode_pos || fallback.kodePos,
    namaKetuaRt: row.nama_ketua_rt || fallback.namaKetuaRt,
    namaSekretaris: row.nama_sekretaris || fallback.namaSekretaris,
    namaBendahara: row.nama_bendahara || fallback.namaBendahara,
    namaAplikasi: row.nama_aplikasi || fallback.namaAplikasi,
    nomorKontak: row.nomor_kontak || fallback.nomorKontak,
    logoConfig: row.logo_config || fallback.logoConfig,
    themeConfig: row.theme_config || fallback.themeConfig,
  };
};

// ==========================================
// SUPABASE OPERATIONS WITH GRACEFUL FALLBACK
// ==========================================

export interface SupabaseSyncResult {
  isConfigured: boolean;
  isConnected: boolean;
  tablesMissing?: boolean;
  error?: string;
}

export const checkSupabaseConnection = async (): Promise<SupabaseSyncResult> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { isConfigured: false, isConnected: false };
  }
  try {
    const { error } = await supabase.from('profil_rt').select('id').limit(1);
    if (error) {
      const isTableMissing =
        error.code === 'PGRST205' ||
        error.message?.includes('Could not find the table') ||
        error.message?.includes('relation "public.profil_rt" does not exist') ||
        error.code === '42P01';

      console.warn('Supabase ping status:', error.message);
      return {
        isConfigured: true,
        isConnected: false,
        tablesMissing: isTableMissing,
        error: isTableMissing
          ? 'Tabel database belum dibuat di Supabase. Jalankan skrip supabase/schema.sql di SQL Editor Supabase.'
          : error.message,
      };
    }
    return { isConfigured: true, isConnected: true };
  } catch (err: any) {
    return { isConfigured: true, isConnected: false, error: err?.message || 'Connection failed' };
  }
};

export const fetchAllFromSupabase = async (fallback: {
  profilRt: ProfilRt;
  daftarWarga: Warga[];
  daftarMutasi: MutasiRecord[];
  daftarKas: TransaksiKas[];
  daftarDokumen: DokumenRt[];
  daftarPengurus: PengurusRt[];
  credentials: UserCredential[];
}) => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const [
      { data: profilRows },
      { data: wargaRows },
      { data: mutasiRows },
      { data: kasRows },
      { data: dokumenRows },
      { data: pengurusRows },
      { data: credRows },
    ] = await Promise.all([
      supabase.from('profil_rt').select('*').limit(1),
      supabase.from('warga').select('*').order('created_at', { ascending: false }),
      supabase.from('mutasi').select('*').order('tanggal', { ascending: false }),
      supabase.from('transaksi_kas').select('*').order('tanggal', { ascending: false }),
      supabase.from('dokumen_rt').select('*').order('tanggal', { ascending: false }),
      supabase.from('pengurus_rt').select('*'),
      supabase.from('user_credentials').select('*'),
    ]);

    return {
      profilRt: profilRows && profilRows.length > 0 ? mapDbToProfil(profilRows[0], fallback.profilRt) : fallback.profilRt,
      daftarWarga: Array.isArray(wargaRows) ? wargaRows.map(mapDbToWarga) : fallback.daftarWarga,
      daftarMutasi: Array.isArray(mutasiRows) ? mutasiRows.map(mapDbToMutasi) : fallback.daftarMutasi,
      daftarKas: Array.isArray(kasRows) ? kasRows.map(mapDbToKas) : fallback.daftarKas,
      daftarDokumen: Array.isArray(dokumenRows) ? dokumenRows.map(mapDbToDokumen) : fallback.daftarDokumen,
      daftarPengurus: Array.isArray(pengurusRows) ? pengurusRows.map(mapDbToPengurus) : fallback.daftarPengurus,
      credentials: credRows && credRows.length > 0 ? credRows.map((c: any) => ({
        id: c.id || `cred-${c.nik}`,
        nik: c.nik,
        password: c.password,
        nama: c.nama,
        role: c.role,
        jabatan: c.jabatan,
        noHp: c.no_hp || c.nohp || c.noHp,
        createdAt: c.created_at || c.createdAt || new Date().toISOString().split('T')[0],
      })) : fallback.credentials,
    };
  } catch (err) {
    console.error('Failed to fetch from Supabase:', err);
    return null;
  }
};

/**
 * Seeding data awal ke Supabase jika database di Supabase masih kosong
 */
export const seedInitialDataToSupabase = async (data: {
  profilRt: ProfilRt;
  daftarWarga: Warga[];
  daftarMutasi: MutasiRecord[];
  daftarKas: TransaksiKas[];
  daftarDokumen: DokumenRt[];
  daftarPengurus: PengurusRt[];
  credentials: UserCredential[];
}) => {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    // Check if system is completely fresh by checking profil_rt (NOT warga)
    const { count, error: countErr } = await supabase.from('profil_rt').select('*', { count: 'exact', head: true });
    if (countErr) throw countErr;

    if (count === 0) {
      console.log('Seeding initial data to Supabase...');
      // 1. Profil
      await supabase.from('profil_rt').upsert(mapProfilToDb(data.profilRt));
      // 2. Warga (hanya jika data awal memang ada)
      if (data.daftarWarga && data.daftarWarga.length > 0) {
        await supabase.from('warga').upsert(data.daftarWarga.map(mapWargaToDb));
      }
      // 3. Mutasi
      if (data.daftarMutasi && data.daftarMutasi.length > 0) {
        await supabase.from('mutasi').upsert(data.daftarMutasi.map(mapMutasiToDb));
      }
      // 4. Kas
      if (data.daftarKas && data.daftarKas.length > 0) {
        await supabase.from('transaksi_kas').upsert(data.daftarKas.map(mapKasToDb));
      }
      // 5. Dokumen
      if (data.daftarDokumen && data.daftarDokumen.length > 0) {
        await supabase.from('dokumen_rt').upsert(data.daftarDokumen.map(mapDokumenToDb));
      }
      // 6. Pengurus
      if (data.daftarPengurus && data.daftarPengurus.length > 0) {
        await supabase.from('pengurus_rt').upsert(data.daftarPengurus.map(mapPengurusToDb));
      }
      // 7. Credentials
      if (data.credentials && data.credentials.length > 0) {
        await supabase.from('user_credentials').upsert(
          data.credentials.map((c) => ({
            nik: c.nik,
            password: c.password,
            nama: c.nama,
            role: c.role,
            jabatan: c.jabatan || null,
          }))
        );
      }
      console.log('Initial data successfully seeded to Supabase!');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Error seeding data to Supabase:', err);
    return false;
  }
};

// ==========================================
// ENTITY-SPECIFIC OPERATIONS (SYNC WITH OFFLINE QUEUE)
// ==========================================

export const syncWargaUpsert = async (warga: Warga) => {
  const dbRecord = mapWargaToDb(warga);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('warga', 'UPSERT', dbRecord);
    return;
  }
  try {
    const { error } = await supabase.from('warga').upsert(dbRecord);
    if (error) {
      console.warn('Gagal sync warga ke cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('warga', 'UPSERT', dbRecord);
    }
  } catch (e) {
    console.error('Supabase sync error (warga upsert):', e);
    await enqueueSync('warga', 'UPSERT', dbRecord);
  }
};

export const syncWargaDelete = async (id: string) => {
  await removeSyncQueueItemByEntity('warga', id);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('warga', 'DELETE', { id });
    return;
  }
  try {
    const { error } = await supabase.from('warga').delete().eq('id', id);
    if (error) {
      console.warn('Gagal hapus warga di cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('warga', 'DELETE', { id });
    }
  } catch (e) {
    console.error('Supabase sync error (warga delete):', e);
    await enqueueSync('warga', 'DELETE', { id });
  }
};

export const syncMutasiUpsert = async (mutasi: MutasiRecord) => {
  const dbRecord = mapMutasiToDb(mutasi);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('mutasi', 'UPSERT', dbRecord);
    return;
  }
  try {
    const { error } = await supabase.from('mutasi').upsert(dbRecord);
    if (error) {
      console.warn('Gagal sync mutasi ke cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('mutasi', 'UPSERT', dbRecord);
    }
  } catch (e) {
    console.error('Supabase sync error (mutasi upsert):', e);
    await enqueueSync('mutasi', 'UPSERT', dbRecord);
  }
};

export const syncMutasiDelete = async (id: string) => {
  await removeSyncQueueItemByEntity('mutasi', id);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('mutasi', 'DELETE', { id });
    return;
  }
  try {
    const { error } = await supabase.from('mutasi').delete().eq('id', id);
    if (error) {
      console.warn('Gagal hapus mutasi di cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('mutasi', 'DELETE', { id });
    }
  } catch (e) {
    console.error('Supabase sync error (mutasi delete):', e);
    await enqueueSync('mutasi', 'DELETE', { id });
  }
};

export const syncKasUpsert = async (kas: TransaksiKas) => {
  const dbRecord = mapKasToDb(kas);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('transaksi_kas', 'UPSERT', dbRecord);
    return;
  }
  try {
    const { error } = await supabase.from('transaksi_kas').upsert(dbRecord);
    if (error) {
      console.warn('Gagal sync kas ke cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('transaksi_kas', 'UPSERT', dbRecord);
    }
  } catch (e) {
    console.error('Supabase sync error (kas upsert):', e);
    await enqueueSync('transaksi_kas', 'UPSERT', dbRecord);
  }
};

export const syncKasDelete = async (id: string) => {
  await removeSyncQueueItemByEntity('transaksi_kas', id);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('transaksi_kas', 'DELETE', { id });
    return;
  }
  try {
    const { error } = await supabase.from('transaksi_kas').delete().eq('id', id);
    if (error) {
      console.warn('Gagal hapus kas di cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('transaksi_kas', 'DELETE', { id });
    }
  } catch (e) {
    console.error('Supabase sync error (kas delete):', e);
    await enqueueSync('transaksi_kas', 'DELETE', { id });
  }
};

export const syncDokumenUpsert = async (dok: DokumenRt) => {
  const dbRecord = mapDokumenToDb(dok);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('dokumen_rt', 'UPSERT', dbRecord);
    return;
  }
  try {
    const { error } = await supabase.from('dokumen_rt').upsert(dbRecord);
    if (error) {
      console.warn('Gagal sync dokumen ke cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('dokumen_rt', 'UPSERT', dbRecord);
    }
  } catch (e) {
    console.error('Supabase sync error (dokumen upsert):', e);
    await enqueueSync('dokumen_rt', 'UPSERT', dbRecord);
  }
};

export const syncDokumenDelete = async (id: string) => {
  await removeSyncQueueItemByEntity('dokumen_rt', id);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('dokumen_rt', 'DELETE', { id });
    return;
  }
  try {
    const { error } = await supabase.from('dokumen_rt').delete().eq('id', id);
    if (error) {
      console.warn('Gagal hapus dokumen di cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('dokumen_rt', 'DELETE', { id });
    }
  } catch (e) {
    console.error('Supabase sync error (dokumen delete):', e);
    await enqueueSync('dokumen_rt', 'DELETE', { id });
  }
};

export const syncPengurusUpsert = async (p: PengurusRt) => {
  const dbRecord = mapPengurusToDb(p);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('pengurus_rt', 'UPSERT', dbRecord);
    return;
  }
  try {
    const { error } = await supabase.from('pengurus_rt').upsert(dbRecord);
    if (error) {
      console.warn('Gagal sync pengurus ke cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('pengurus_rt', 'UPSERT', dbRecord);
    }
  } catch (e) {
    console.error('Supabase sync error (pengurus upsert):', e);
    await enqueueSync('pengurus_rt', 'UPSERT', dbRecord);
  }
};

export const syncPengurusDelete = async (id: string) => {
  await removeSyncQueueItemByEntity('pengurus_rt', id);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('pengurus_rt', 'DELETE', { id });
    return;
  }
  try {
    const { error } = await supabase.from('pengurus_rt').delete().eq('id', id);
    if (error) {
      console.warn('Gagal hapus pengurus di cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('pengurus_rt', 'DELETE', { id });
    }
  } catch (e) {
    console.error('Supabase sync error (pengurus delete):', e);
    await enqueueSync('pengurus_rt', 'DELETE', { id });
  }
};

export const syncProfilRtUpsert = async (profil: ProfilRt) => {
  const dbRecord = mapProfilToDb(profil);
  if (!isSupabaseConfigured() || !supabase) {
    await enqueueSync('profil_rt', 'UPSERT', dbRecord);
    return;
  }
  try {
    const { error } = await supabase.from('profil_rt').upsert(dbRecord);
    if (error) {
      console.warn('Gagal sync profil ke cloud, dialihkan ke antrean offline:', error.message);
      await enqueueSync('profil_rt', 'UPSERT', dbRecord);
    }
  } catch (e) {
    console.error('Supabase sync error (profil upsert):', e);
    await enqueueSync('profil_rt', 'UPSERT', dbRecord);
  }
};

export const syncCredentialUpsert = async (cred: UserCredential) => {
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('user_credentials').upsert({
      nik: cred.nik,
      password: cred.password,
      nama: cred.nama,
      role: cred.role,
      jabatan: cred.jabatan || null,
    });
  } catch (e) {
    console.error('Supabase sync error (credential upsert):', e);
  }
};

export const syncCredentialDelete = async (nik: string) => {
  await removeSyncQueueItemByEntity('user_credentials', nik);
  if (!isSupabaseConfigured() || !supabase) return;
  try {
    await supabase.from('user_credentials').delete().eq('nik', nik);
  } catch (e) {
    console.error('Supabase sync error (credential delete):', e);
  }
};

// ==========================================
// OFFLINE QUEUE RECONCILIATION
// ==========================================

/**
 * Kirim seluruh antrean perubahan data offline yang tertunda ke Supabase Cloud
 */
export const flushOfflineSyncQueue = async (): Promise<number> => {
  if (!isSupabaseConfigured() || !supabase) return 0;
  try {
    const queue = await getSyncQueue();
    if (!queue || queue.length === 0) return 0;

    console.log(`[Sync] Mengirim ${queue.length} perubahan data offline ke Supabase...`);
    let processedCount = 0;

    for (const item of queue) {
      try {
        if (item.action === 'UPSERT') {
          const { error } = await supabase.from(item.table).upsert(item.payload);
          if (error) {
            console.warn(`[Sync] Gagal memproses item antrean ${item.id}:`, error.message);
            continue;
          }
        } else if (item.action === 'DELETE') {
          const { error } = await supabase.from(item.table).delete().eq('id', item.payload.id);
          if (error) {
            console.warn(`[Sync] Gagal menghapus item antrean ${item.id}:`, error.message);
            continue;
          }
        }
        await popSyncQueueItem(item.id);
        processedCount++;
      } catch (itemErr) {
        console.warn(`[Sync] Kesalahan saat memproses item ${item.id}:`, itemErr);
      }
    }

    if (processedCount > 0) {
      console.log(`[Sync] Sukses mensinkronisasikan ${processedCount} perubahan offline ke Cloud!`);
    }
    return processedCount;
  } catch (err) {
    console.warn('Gagal memproses antrean offline:', err);
    return 0;
  }
};

// ==========================================
// SUPABASE REALTIME SUBSCRIPTION
// ==========================================

/**
 * Langganan perubahan data realtime dari Supabase agar sinkron antar-perangkat secara instan
 */
export const subscribeToRealtimeChanges = (onUpdate: (table: string) => void): (() => void) => {
  if (!isSupabaseConfigured() || !supabase) return () => {};

  try {
    const channel = supabase
      .channel('rtgasem-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
        onUpdate(payload.table);
      })
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Gagal mendaftar langganan realtime Supabase:', err);
    return () => {};
  }
};

