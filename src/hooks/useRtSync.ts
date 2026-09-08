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
  syncCredentialUpsert,
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

  // 1. Initial Load from IndexedDB
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
        console.warn('Gagal membaca IndexedDB:', err);
        setIsLocalDbLoaded(true);
      });
  }, [setDaftarWarga, setDaftarMutasi, setDaftarKas, setDaftarDokumen, setDaftarPengurus, setProfilRt, setCredentials]);

  // 2. Auto-save to IndexedDB on local state change
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

  // 3. Keep latest data in ref for sync without triggering re-fetches
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

  // 4. Supabase Connection & Cloud Sync (Bisa berjalan langsung saat DB lokal siap, tanpa terblokir sesi login)
  const refreshSupabaseConnection = useCallback(async () => {
    if (!isLocalDbLoaded) return;
    setIsSyncing(true);

    try {
      const status = await checkSupabaseConnection();
      setIsSupabaseConnected(status.isConnected);
      setIsSupabaseTablesMissing(Boolean(status.tablesMissing));
      setSupabaseErrorMessage(status.error);

      if (status.isConnected) {
        await flushOfflineSyncQueue();
        const latest = currentDataRef.current;

        await seedInitialDataToSupabase({
          profilRt: latest.profilRt,
          daftarWarga: latest.daftarWarga,
          daftarMutasi: latest.daftarMutasi,
          daftarKas: latest.daftarKas,
          daftarDokumen: latest.daftarDokumen,
          daftarPengurus: latest.daftarPengurus,
          credentials: latest.credentials,
        });

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
          if (cloudData.profilRt) setProfilRt(cloudData.profilRt);
          if (cloudData.credentials && cloudData.credentials.length > 0) {
            setCredentials(prev => {
              const cloudNiks = new Set(cloudData.credentials.map(c => c.nik.toLowerCase()));
              const localPending = prev.filter(c => !cloudNiks.has(c.nik.toLowerCase()));
              const combined = [...cloudData.credentials, ...localPending];
              const combinedNiks = new Set(combined.map(c => c.nik.toLowerCase()));
              const missingDefaults = INITIAL_CREDENTIALS.filter(c => !combinedNiks.has(c.nik.toLowerCase()));
              const result = [...combined, ...missingDefaults];

              if (missingDefaults.length > 0) {
                missingDefaults.forEach(d => syncCredentialUpsert(d));
              }

              return result;
            });
          } else {
            setCredentials(INITIAL_CREDENTIALS);
            INITIAL_CREDENTIALS.forEach(d => syncCredentialUpsert(d));
          }
        }
      }
    } catch (err: any) {
      console.error('Error during Supabase connection check/sync:', err);
      setSupabaseErrorMessage(err?.message || 'Gagal tersambung ke Supabase');
    } finally {
      setIsSyncing(false);
    }
  }, [isLocalDbLoaded, setDaftarWarga, setDaftarMutasi, setDaftarKas, setDaftarDokumen, setDaftarPengurus, setProfilRt, setCredentials]);

  // Jalankan sinkronisasi awal segera setelah IndexedDB selesai dimuat
  useEffect(() => {
    if (isLocalDbLoaded) {
      refreshSupabaseConnection();
    }
  }, [isLocalDbLoaded, refreshSupabaseConnection]);

  // Re-sync saat user login berhasil
  useEffect(() => {
    if (isLocalDbLoaded && currentUser) {
      refreshSupabaseConnection();
    }
  }, [currentUser, isLocalDbLoaded, refreshSupabaseConnection]);

  // 5. Online/Offline & Realtime Subscription (Aktif langsung agar browser lain realtime sinkron)
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      refreshSupabaseConnection();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribeRealtime = subscribeToRealtimeChanges((table) => {
      console.log(`[Realtime] Perubahan terdeteksi pada tabel: ${table}, memuat data terbaru...`);
      refreshSupabaseConnection();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeRealtime();
    };
  }, [refreshSupabaseConnection]);

  return {
    isLocalDbLoaded,
    isOnline,
    isSyncing,
    isSupabaseConnected,
    setIsSupabaseConnected,
    isSupabaseTablesMissing,
    supabaseErrorMessage,
    refreshSupabaseConnection,
  };
}
