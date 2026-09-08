import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Warga,
  MutasiRecord,
  ProfilRt,
  TransaksiKas,
  DokumenRt,
  PengurusRt,
  UserSession,
  UserCredential,
} from '../types';
import {
  checkSupabaseConnection,
  fetchAllFromSupabase,
  seedInitialDataToSupabase,
  flushOfflineSyncQueue,
  subscribeToRealtimeChanges,
} from '../services/supabaseService';
import {
  loadAllLocalData,
  saveCollectionToIndexedDb,
  saveSingleItemToIndexedDb,
} from '../services/offlineStorage';
import { INITIAL_CREDENTIALS } from '../data/initialData';

interface UseRtSyncProps {
  daftarWarga: Warga[];
  setDaftarWarga: React.Dispatch<React.SetStateAction<Warga[]>>;
  daftarMutasi: MutasiRecord[];
  setDaftarMutasi: React.Dispatch<React.SetStateAction<MutasiRecord[]>>;
  daftarKas: TransaksiKas[];
  setDaftarKas: React.Dispatch<React.SetStateAction<TransaksiKas[]>>;
  daftarDokumen: DokumenRt[];
  setDaftarDokumen: React.Dispatch<React.SetStateAction<DokumenRt[]>>;
  daftarPengurus: PengurusRt[];
  setDaftarPengurus: React.Dispatch<React.SetStateAction<PengurusRt[]>>;
  profilRt: ProfilRt;
  setProfilRt: React.Dispatch<React.SetStateAction<ProfilRt>>;
  credentials: UserCredential[];
  setCredentials: React.Dispatch<React.SetStateAction<UserCredential[]>>;
  currentUser: UserSession | null;
}

export function useRtSync({
  daftarWarga,
  setDaftarWarga,
  daftarMutasi,
  setDaftarMutasi,
  daftarKas,
  setDaftarKas,
  daftarDokumen,
  setDaftarDokumen,
  daftarPengurus,
  setDaftarPengurus,
  profilRt,
  setProfilRt,
  credentials,
  setCredentials,
  currentUser,
}: UseRtSyncProps) {
  const [isLocalDbLoaded, setIsLocalDbLoaded] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isSupabaseTablesMissing, setIsSupabaseTablesMissing] = useState(false);
  const [supabaseErrorMessage, setSupabaseErrorMessage] = useState<string | undefined>();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Kunci konkurensi agar sinkronisasi tidak tumpang tindih
  const isSyncingRef = useRef(false);
  const pendingSyncRef = useRef(false);
  const initialSeedCheckedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Initial Load from IndexedDB (Pemuatan awal cepat agar offline-ready)
  useEffect(() => {
    loadAllLocalData()
      .then(local => {
        if (local.daftarWarga && local.daftarWarga.length > 0) setDaftarWarga(local.daftarWarga);
        if (local.daftarMutasi && local.daftarMutasi.length > 0) setDaftarMutasi(local.daftarMutasi);
        if (local.daftarKas && local.daftarKas.length > 0) setDaftarKas(local.daftarKas);
        if (local.daftarDokumen && local.daftarDokumen.length > 0) setDaftarDokumen(local.daftarDokumen);
        if (local.daftarPengurus && local.daftarPengurus.length > 0) setDaftarPengurus(local.daftarPengurus);
        if (local.profilRt) setProfilRt(local.profilRt);
        if (local.credentials && local.credentials.length > 0) {
          const existingNiks = new Set(local.credentials.map(c => c.nik.toLowerCase()));
          const missingDefaults = INITIAL_CREDENTIALS.filter(c => !existingNiks.has(c.nik.toLowerCase()));
          setCredentials([...local.credentials, ...missingDefaults]);
        } else {
          setCredentials(INITIAL_CREDENTIALS);
        }
        setIsLocalDbLoaded(true);
      })
      .catch(err => {
        console.warn('Gagal membaca IndexedDB lokal:', err);
        setIsLocalDbLoaded(true);
      });
  }, [setDaftarWarga, setDaftarMutasi, setDaftarKas, setDaftarDokumen, setDaftarPengurus, setProfilRt, setCredentials]);

  // 2. Auto-save ke IndexedDB lokal sebagai cache offline cadangan
  useEffect(() => {
    if (isLocalDbLoaded) saveCollectionToIndexedDb('warga', daftarWarga);
  }, [daftarWarga, isLocalDbLoaded]);

  useEffect(() => {
    if (isLocalDbLoaded) saveCollectionToIndexedDb('mutasi', daftarMutasi);
  }, [daftarMutasi, isLocalDbLoaded]);

  useEffect(() => {
    if (isLocalDbLoaded) saveCollectionToIndexedDb('transaksi_kas', daftarKas);
  }, [daftarKas, isLocalDbLoaded]);

  useEffect(() => {
    if (isLocalDbLoaded) saveCollectionToIndexedDb('dokumen_rt', daftarDokumen);
  }, [daftarDokumen, isLocalDbLoaded]);

  useEffect(() => {
    if (isLocalDbLoaded) saveCollectionToIndexedDb('pengurus_rt', daftarPengurus);
  }, [daftarPengurus, isLocalDbLoaded]);

  useEffect(() => {
    if (isLocalDbLoaded) saveSingleItemToIndexedDb('profil_rt', profilRt);
  }, [profilRt, isLocalDbLoaded]);

  useEffect(() => {
    if (isLocalDbLoaded) saveCollectionToIndexedDb('credentials', credentials);
  }, [credentials, isLocalDbLoaded]);

  // 3. Keep latest data in ref for sync
  const currentDataRef = useRef({
    profilRt,
    daftarWarga,
    daftarMutasi,
    daftarKas,
    daftarDokumen,
    daftarPengurus,
    credentials,
  });

  useEffect(() => {
    currentDataRef.current = {
      profilRt,
      daftarWarga,
      daftarMutasi,
      daftarKas,
      daftarDokumen,
      daftarPengurus,
      credentials,
    };
  }, [profilRt, daftarWarga, daftarMutasi, daftarKas, daftarDokumen, daftarPengurus, credentials]);

  // 4. SUPABASE AS SINGLE SOURCE OF TRUTH (SSOT) SYNC ENGINE
  const refreshSupabaseConnection = useCallback(async () => {
    if (!isLocalDbLoaded) return;

    // Cegah race condition jika fetch sedang berlangsung
    if (isSyncingRef.current) {
      pendingSyncRef.current = true;
      return;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);

    try {
      const status = await checkSupabaseConnection();
      setIsSupabaseConnected(status.isConnected);
      setIsSupabaseTablesMissing(Boolean(status.tablesMissing));
      setSupabaseErrorMessage(status.error);

      if (status.isConnected) {
        // Kirim perubahan data offline yang belum terkirim
        await flushOfflineSyncQueue();
        const latest = currentDataRef.current;

        // Seeding awal hanya dievaluasi sekali saat inisialisasi perdana
        if (!initialSeedCheckedRef.current) {
          initialSeedCheckedRef.current = true;
          await seedInitialDataToSupabase({
            profilRt: latest.profilRt,
            daftarWarga: latest.daftarWarga,
            daftarMutasi: latest.daftarMutasi,
            daftarKas: latest.daftarKas,
            daftarDokumen: latest.daftarDokumen,
            daftarPengurus: latest.daftarPengurus,
            credentials: latest.credentials,
          });
        }

        // Ambil data resmi dari Supabase Cloud (Single Source of Truth)
        const cloudData = await fetchAllFromSupabase({
          profilRt: latest.profilRt,
          daftarWarga: latest.daftarWarga,
          daftarMutasi: latest.daftarMutasi,
          daftarKas: latest.daftarKas,
          daftarDokumen: latest.daftarDokumen,
          daftarPengurus: latest.daftarPengurus,
          credentials: latest.credentials,
        });

        if (cloudData) {
          // Ganti state lokal secara penuh dengan data Cloud (SSOT)
          if (Array.isArray(cloudData.daftarWarga)) {
            setDaftarWarga(cloudData.daftarWarga);
          }
          if (Array.isArray(cloudData.daftarMutasi)) {
            setDaftarMutasi(cloudData.daftarMutasi);
          }
          if (Array.isArray(cloudData.daftarKas)) {
            setDaftarKas(cloudData.daftarKas);
          }
          if (Array.isArray(cloudData.daftarDokumen)) {
            setDaftarDokumen(cloudData.daftarDokumen);
          }
          if (Array.isArray(cloudData.daftarPengurus)) {
            setDaftarPengurus(cloudData.daftarPengurus);
          }
          if (cloudData.profilRt) {
            setProfilRt(cloudData.profilRt);
          }
          if (cloudData.credentials && cloudData.credentials.length > 0) {
            // Gunakan daftar akun resmi dari Supabase tanpa membangkitkan akun yang sudah dihapus
            setCredentials(cloudData.credentials);
          }

          setLastSyncedAt(new Date());
        }
      }
    } catch (err: any) {
      console.error('Error saat sinkronisasi Supabase SSOT:', err);
      setSupabaseErrorMessage(err?.message || 'Gagal tersambung ke Supabase Cloud');
    } finally {
      setIsSyncing(false);
      isSyncingRef.current = false;

      // Jika ada permintaan sinkronisasi tertunda selama proses berlangsung, jalankan kembali
      if (pendingSyncRef.current) {
        pendingSyncRef.current = false;
        refreshSupabaseConnection();
      }
    }
  }, [isLocalDbLoaded, setDaftarWarga, setDaftarMutasi, setDaftarKas, setDaftarDokumen, setDaftarPengurus, setProfilRt, setCredentials]);

  // Debounced sync caller untuk menampung lonjakan event serentak
  const triggerDebouncedSync = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      refreshSupabaseConnection();
    }, 300);
  }, [refreshSupabaseConnection]);

  // Sinkronisasi awal segera setelah DB lokal siap
  useEffect(() => {
    if (isLocalDbLoaded) {
      refreshSupabaseConnection();
    }
  }, [isLocalDbLoaded, refreshSupabaseConnection]);

  // Re-sync saat user login berhasil
  useEffect(() => {
    if (isLocalDbLoaded && currentUser) {
      triggerDebouncedSync();
    }
  }, [currentUser, isLocalDbLoaded, triggerDebouncedSync]);

  // 5. EVENT LISTENERS: Realtime, Tab Visibility, Window Focus, Online/Offline, & Heartbeat Polling
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerDebouncedSync();
    };
    const handleOffline = () => setIsOnline(false);

    // Klien/browser lain yang baru dibuka atau kembali ke tab aktif akan langsung sinkron
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        triggerDebouncedSync();
      }
    };

    const handleWindowFocus = () => {
      triggerDebouncedSync();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    // Heartbeat Polling setiap 30 detik jika tab aktif dan online (fail-safe jika WebSocket drop)
    const heartbeatInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        triggerDebouncedSync();
      }
    }, 30000);

    // Supabase Realtime WebSocket Subscription
    const unsubscribeRealtime = subscribeToRealtimeChanges((table) => {
      console.log(`[Realtime SSOT] Perubahan terdeteksi pada tabel: ${table}, menyinkronkan data...`);
      triggerDebouncedSync();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      clearInterval(heartbeatInterval);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      unsubscribeRealtime();
    };
  }, [triggerDebouncedSync]);

  return {
    isLocalDbLoaded,
    isOnline,
    isSyncing,
    lastSyncedAt,
    isSupabaseConnected,
    setIsSupabaseConnected,
    isSupabaseTablesMissing,
    supabaseErrorMessage,
    refreshSupabaseConnection,
  };
}
