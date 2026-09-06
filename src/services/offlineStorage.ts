/**
 * Layanan Penyimpanan Lokal Tangguh (IndexedDB)
 * Berfungsi sebagai basis data lokal berkecepatan tinggi agar data TIDAK HILANG saat refresh (F5),
 * serta mendukung antrean sinkronisasi (sync queue) otomatis ke Supabase Cloud saat online.
 */

import {
  Warga,
  MutasiRecord,
  TransaksiKas,
  DokumenRt,
  PengurusRt,
  ProfilRt,
  UserCredential,
} from '../types';

const DB_NAME = 'gasem_raya_rt02_db';
const DB_VERSION = 1;

export interface SyncQueueItem {
  id: string;
  timestamp: number;
  table: string;
  action: 'UPSERT' | 'DELETE';
  payload: any;
}

export interface LocalRtDatabase {
  profilRt?: ProfilRt;
  daftarWarga?: Warga[];
  daftarMutasi?: MutasiRecord[];
  daftarKas?: TransaksiKas[];
  daftarDokumen?: DokumenRt[];
  daftarPengurus?: PengurusRt[];
  credentials?: UserCredential[];
  syncQueue?: SyncQueueItem[];
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB tidak didukung oleh browser ini.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      const stores = [
        'profil_rt',
        'warga',
        'mutasi',
        'transaksi_kas',
        'dokumen_rt',
        'pengurus_rt',
        'credentials',
        'sync_queue',
      ];

      stores.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          if (storeName === 'profil_rt') {
            db.createObjectStore(storeName, { keyPath: 'id' });
          } else if (storeName === 'sync_queue') {
            db.createObjectStore(storeName, { keyPath: 'id' });
          } else {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Simpan seluruh koleksi data ke IndexedDB secara atomic
 */
export async function saveCollectionToIndexedDb(
  storeName: string,
  items: any[]
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);

    // Bersihkan data lama lalu masukkan yang terbaru
    store.clear();
    items.forEach(item => {
      if (item && typeof item === 'object') {
        const key = item.id || item.nik || item.username || item.nomorRt || `item-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
        store.put({ id: key, ...item });
      }
    });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`Gagal menyimpan koleksi ke IndexedDB (${storeName}):`, err);
  }
}

/**
 * Simpan 1 item tunggal (misal Profil RT)
 */
export async function saveSingleItemToIndexedDb(
  storeName: string,
  item: any
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    if (item && typeof item === 'object') {
      const key = item.id || 'default_profil';
      store.put({ id: key, ...item });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn(`Gagal menyimpan item ke IndexedDB (${storeName}):`, err);
  }
}

/**
 * Baca seluruh koleksi dari IndexedDB
 */
export async function loadCollectionFromIndexedDb<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn(`Gagal membaca dari IndexedDB (${storeName}):`, err);
    return [];
  }
}

/**
 * Baca seluruh basis data lokal saat aplikasi pertama kali dibuka
 */
export async function loadAllLocalData(): Promise<LocalRtDatabase> {
  try {
    const [
      profilList,
      daftarWarga,
      daftarMutasi,
      daftarKas,
      daftarDokumen,
      daftarPengurus,
      credentials,
      syncQueue,
    ] = await Promise.all([
      loadCollectionFromIndexedDb<ProfilRt>('profil_rt'),
      loadCollectionFromIndexedDb<Warga>('warga'),
      loadCollectionFromIndexedDb<MutasiRecord>('mutasi'),
      loadCollectionFromIndexedDb<TransaksiKas>('transaksi_kas'),
      loadCollectionFromIndexedDb<DokumenRt>('dokumen_rt'),
      loadCollectionFromIndexedDb<PengurusRt>('pengurus_rt'),
      loadCollectionFromIndexedDb<UserCredential>('credentials'),
      loadCollectionFromIndexedDb<SyncQueueItem>('sync_queue'),
    ]);

    return {
      profilRt: profilList.length > 0 ? profilList[0] : undefined,
      daftarWarga: daftarWarga.length > 0 ? daftarWarga : undefined,
      daftarMutasi: daftarMutasi.length > 0 ? daftarMutasi : undefined,
      daftarKas: daftarKas.length > 0 ? daftarKas : undefined,
      daftarDokumen: daftarDokumen.length > 0 ? daftarDokumen : undefined,
      daftarPengurus: daftarPengurus.length > 0 ? daftarPengurus : undefined,
      credentials: credentials.length > 0 ? credentials : undefined,
      syncQueue,
    };
  } catch (e) {
    console.warn('Gagal memuat seluruh basis data lokal:', e);
    return {};
  }
}

/**
 * Tambahkan aksi ke antrean sinkronisasi (Sync Queue) untuk diproses saat online
 */
export async function enqueueSync(
  table: string,
  action: 'UPSERT' | 'DELETE',
  payload: any
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');

    const item: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      table,
      action,
      payload,
    };

    store.put(item);
  } catch (err) {
    console.warn('Gagal menambahkan antrean sinkronisasi:', err);
  }
}

/**
 * Ambil dan bersihkan antrean sinkronisasi yang telah berhasil dikirim ke server
 */
export async function popSyncQueueItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    store.delete(id);
  } catch (err) {
    console.warn('Gagal menghapus item sync queue:', err);
  }
}

/**
 * Dapatkan seluruh item yang sedang mengantre di antrean sinkronisasi
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  return loadCollectionFromIndexedDb<SyncQueueItem>('sync_queue');
}

/**
 * Bersihkan seluruh antrean sinkronisasi
 */
export async function clearSyncQueue(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    store.clear();
  } catch (err) {
    console.warn('Gagal membersihkan antrean sinkronisasi:', err);
  }
}

