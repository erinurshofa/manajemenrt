import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Sidebar, TabId } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardStats } from './components/DashboardStats';
import { DaftarWarga } from './components/DaftarWarga';
import { DaftarKeluarga } from './components/DaftarKeluarga';
import { LaporanBulanan } from './components/LaporanBulanan';
import { MutasiManager } from './components/MutasiManager';
import { BukuKasKeuangan } from './components/BukuKasKeuangan';
import { ArsipDokumen } from './components/ArsipDokumen';
import { StrukturPengurus } from './components/StrukturPengurus';
import { ModalFormWarga } from './components/ModalFormWarga';
import { ModalDetailWarga } from './components/ModalDetailWarga';
import { CetakKartuKeluargaModal } from './components/CetakKartuKeluargaModal';
import { PengaturanRtModal } from './components/PengaturanRtModal';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { PengaturanTemaLogoModal } from './components/PengaturanTemaLogoModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { ShareOnlineModal } from './components/ShareOnlineModal';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { AsistenAiModal } from './components/AsistenAiModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMenuSheet } from './components/MobileMenuSheet';
import { MatriksPeranPengguna } from './components/MatriksPeranPengguna';
import { Sparkles } from 'lucide-react';
import { GoogleDriveManager } from './components/GoogleDriveManager';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  checkSupabaseConnection,
  fetchAllFromSupabase,
  seedInitialDataToSupabase,
  syncWargaUpsert,
  syncWargaDelete,
  syncMutasiUpsert,
  syncMutasiDelete,
  syncKasUpsert,
  syncKasDelete,
  syncDokumenUpsert,
  syncDokumenDelete,
  syncPengurusUpsert,
  syncPengurusDelete,
  syncProfilRtUpsert,
  flushOfflineSyncQueue,
  subscribeToRealtimeChanges,
} from './services/supabaseService';
import {
  loadAllLocalData,
  saveCollectionToIndexedDb,
  saveSingleItemToIndexedDb,
} from './services/offlineStorage';

import {
  Warga,
  KartuKeluargaData,
  MutasiRecord,
  ProfilRt,
  TransaksiKas,
  DokumenRt,
  PengurusRt,
  UserSession,
  UserCredential,
  ThemeConfig,
  LogoConfig,
} from './types';
import {
  INITIAL_WARGA,
  INITIAL_MUTASI,
  DEFAULT_PROFIL_RT,
  INITIAL_KAS,
  INITIAL_DOKUMEN,
  INITIAL_PENGURUS,
  INITIAL_CREDENTIALS,
  DEFAULT_THEME_CONFIG,
  DEFAULT_LOGO_CONFIG,
} from './data/initialData';
import { kelompokkanPerKk } from './utils/calculations';

// Clean up all local data storage - Pure Supabase Cloud Mode
if (typeof window !== 'undefined') {
  const localKeys = [
    'rt_data_warga',
    'rt_data_mutasi',
    'rt_profil',
    'gasemraya_kas',
    'gasemraya_dokumen',
    'gasemraya_pengurus',
    'gasemraya_credentials',
    'gasemraya_auth',
  ];
  localKeys.forEach(k => localStorage.removeItem(k));
}



export default function App() {
  // Pure State (Direct Supabase Cloud storage, no local persistence)
  const [daftarWarga, setDaftarWarga] = useState<Warga[]>(INITIAL_WARGA);
  const [daftarMutasi, setDaftarMutasi] = useState<MutasiRecord[]>(INITIAL_MUTASI);
  const [profilRt, setProfilRt] = useState<ProfilRt>(DEFAULT_PROFIL_RT);
  const [daftarKas, setDaftarKas] = useState<TransaksiKas[]>(INITIAL_KAS);
  const [daftarDokumen, setDaftarDokumen] = useState<DokumenRt[]>(INITIAL_DOKUMEN);
  const [daftarPengurus, setDaftarPengurus] = useState<PengurusRt[]>(INITIAL_PENGURUS);
  const [credentials, setCredentials] = useState<UserCredential[]>(INITIAL_CREDENTIALS);

  // User Auth session (kept in sessionStorage during browser tab lifecycle)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    if (typeof window !== 'undefined') {
      const savedSession = sessionStorage.getItem('gasemraya_auth');
      if (savedSession) {
        try {
          return JSON.parse(savedSession);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return null;
  });

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('gasemraya_auth', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem('gasemraya_auth');
    }
  }, [currentUser]);

  // IndexedDB Resilient Offline & Refresh Persistence
  const [isLocalDbLoaded, setIsLocalDbLoaded] = useState(false);

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
          setCredentials(local.credentials);
        } else {
          setCredentials(INITIAL_CREDENTIALS);
        }
        setIsLocalDbLoaded(true);
      })
      .catch(err => {
        console.warn('Gagal membaca IndexedDB:', err);
        setIsLocalDbLoaded(true);
      });
  }, []);

  // Simpan otomatis ke IndexedDB setiap kali ada perubahan data (0% Data Loss on F5 Refresh)
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

  // Network Online / Offline Listener
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Supabase Cloud State
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [isSupabaseTablesMissing, setIsSupabaseTablesMissing] = useState(false);
  const [supabaseErrorMessage, setSupabaseErrorMessage] = useState<string | undefined>();
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Reference to always access current data state without causing unnecessary re-fetches
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

  // Supabase connection, offline queue flush & initial sync (HANYA setelah pengguna login)
  const refreshSupabaseConnection = useCallback(async () => {
    if (!isLocalDbLoaded || !currentUser) return; // Cegah koneksi dan sync jika belum login

    try {
      const status = await checkSupabaseConnection();
      setIsSupabaseConnected(status.isConnected);
      setIsSupabaseTablesMissing(Boolean(status.tablesMissing));
      setSupabaseErrorMessage(status.error);

      if (status.isConnected) {
        // 1. Kirim antrean offline terlebih dahulu agar data lokal offline tidak tertimpa!
        await flushOfflineSyncQueue();

        const latest = currentDataRef.current;

        // 2. Seed data awal jika database di cloud masih benar-benar kosong
        await seedInitialDataToSupabase({
          profilRt: latest.profilRt,
          daftarWarga: latest.daftarWarga,
          daftarMutasi: latest.daftarMutasi,
          daftarKas: latest.daftarKas,
          daftarDokumen: latest.daftarDokumen,
          daftarPengurus: latest.daftarPengurus,
          credentials: latest.credentials,
        });

        // 3. Tarik data terbaru yang sudah sinkron dari Supabase Cloud
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
          // Merge data dengan proteksi: data lokal yang belum tersinkron ke cloud TIDAK BOLEH hilang
          if (cloudData.daftarWarga && cloudData.daftarWarga.length > 0) {
            setDaftarWarga(prev => {
              const cloudIds = new Set(cloudData.daftarWarga.map(w => w.id));
              const localPending = prev.filter(w => !cloudIds.has(w.id));
              return [...cloudData.daftarWarga, ...localPending];
            });
          }
          if (cloudData.daftarMutasi && cloudData.daftarMutasi.length > 0) {
            setDaftarMutasi(prev => {
              const cloudIds = new Set(cloudData.daftarMutasi.map(m => m.id));
              const localPending = prev.filter(m => !cloudIds.has(m.id));
              return [...cloudData.daftarMutasi, ...localPending];
            });
          }
          if (cloudData.daftarKas && cloudData.daftarKas.length > 0) {
            setDaftarKas(prev => {
              const cloudIds = new Set(cloudData.daftarKas.map(k => k.id));
              const localPending = prev.filter(k => !cloudIds.has(k.id));
              return [...cloudData.daftarKas, ...localPending];
            });
          }
          if (cloudData.daftarDokumen && cloudData.daftarDokumen.length > 0) {
            setDaftarDokumen(prev => {
              const cloudIds = new Set(cloudData.daftarDokumen.map(d => d.id));
              const localPending = prev.filter(d => !cloudIds.has(d.id));
              return [...cloudData.daftarDokumen, ...localPending];
            });
          }
          if (cloudData.daftarPengurus && cloudData.daftarPengurus.length > 0) {
            setDaftarPengurus(prev => {
              const cloudIds = new Set(cloudData.daftarPengurus.map(p => p.id));
              const localPending = prev.filter(p => !cloudIds.has(p.id));
              return [...cloudData.daftarPengurus, ...localPending];
            });
          }
          if (cloudData.profilRt) setProfilRt(cloudData.profilRt);
          if (cloudData.credentials && cloudData.credentials.length > 0) {
            setCredentials(cloudData.credentials);
          }
        }
      }
    } catch (err: any) {
      console.error('Error during Supabase connection check/sync:', err);
      setSupabaseErrorMessage(err?.message || 'Gagal tersambung ke Supabase');
    }
  }, [isLocalDbLoaded, currentUser]);

  // Jalankan sinkronisasi cloud HANYA setelah IndexedDB lokal selesai dimuat DAN pengguna sudah login
  useEffect(() => {
    if (isLocalDbLoaded && currentUser) {
      refreshSupabaseConnection();
    }
  }, [isLocalDbLoaded, currentUser, refreshSupabaseConnection]);

  // Network listener & Supabase Realtime Subscription (HANYA setelah pengguna login)
  useEffect(() => {
    if (!currentUser) return;

    const handleOnline = () => {
      setIsOnline(true);
      refreshSupabaseConnection();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Langganan perubahan data realtime dari perangkat pengurus lain HANYA setelah login
    const unsubscribeRealtime = subscribeToRealtimeChanges((table) => {
      console.log(`[Realtime] Perubahan terdeteksi pada tabel: ${table}, memuat data terbaru...`);
      refreshSupabaseConnection();
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeRealtime();
    };
  }, [currentUser, refreshSupabaseConnection]);

  // UI state
  const [activeTab, setActiveTab] = useState<TabId>('warga');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState<Warga | null>(null);
  const [detailWarga, setDetailWarga] = useState<Warga | null>(null);
  const [prefilledKk, setPrefilledKk] = useState<{ noKk: string; alamat: string; rt: string; rw: string } | null>(null);
  const [cetakKkData, setCetakKkData] = useState<KartuKeluargaData | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isThemeLogoModalOpen, setIsThemeLogoModalOpen] = useState(false);
  const [isAndroidApkModalOpen, setIsAndroidApkModalOpen] = useState(false);
  const [isShareOnlineModalOpen, setIsShareOnlineModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isMobileMenuSheetOpen, setIsMobileMenuSheetOpen] = useState(false);
  const [selectedKkFilter, setSelectedKkFilter] = useState<string | undefined>(undefined);

  // PWA & Android Installation Hook
  const { isInstallable, isInstalled, install: installPwa } = usePWAInstall();

  // Computed grouped Kartu Keluarga
  const daftarKk = useMemo(() => {
    return kelompokkanPerKk(daftarWarga);
  }, [daftarWarga]);

  // Count current month mutations
  const totalMutasiBulanIni = useMemo(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return daftarMutasi.filter(m => m.tanggal.startsWith(currentYearMonth)).length;
  }, [daftarMutasi]);

  // Handlers Login & Auth
  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUser(session);
    sessionStorage.setItem('gasemraya_auth', JSON.stringify(session));
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari sistem Gasem Raya RT 02?')) {
      setCurrentUser(null);
      setIsSupabaseConnected(false);
      sessionStorage.removeItem('gasemraya_auth');
      localStorage.removeItem('gasemraya_auth');
    }
  };

  // Handler Save Theme & Logo & Profil
  const handleSaveThemeAndLogo = (newTheme: ThemeConfig, newLogo: LogoConfig) => {
    const updated = {
      ...profilRt,
      themeConfig: newTheme,
      logoConfig: newLogo,
    };
    setProfilRt(updated);
    syncProfilRtUpsert(updated);
  };

  const handleSaveProfil = (newProfil: ProfilRt) => {
    setProfilRt(newProfil);
    syncProfilRtUpsert(newProfil);
  };

  // Handlers Warga
  const handleOpenAddWarga = () => {
    setEditingWarga(null);
    setPrefilledKk(null);
    setModalFormOpen(true);
  };

  const handleEditWarga = (warga: Warga) => {
    setEditingWarga(warga);
    setPrefilledKk(null);
    setModalFormOpen(true);
  };

  const handleHapusWarga = async (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data warga "${nama}"?`)) {
      setDaftarWarga(prev => prev.filter(w => w.id !== id));
      setDaftarMutasi(prev => prev.filter(m => m.wargaId !== id));
      await syncWargaDelete(id);
    }
  };

  const handleSaveWarga = async (
    warga: Warga,
    catatMutasi?: { jenis: 'Lahir' | 'Pindah_Masuk'; tanggal: string; keterangan: string }
  ) => {
    setDaftarWarga(prev => {
      const exists = prev.some(w => w.id === warga.id);
      if (exists) {
        return prev.map(w => (w.id === warga.id ? warga : w));
      } else {
        return [warga, ...prev];
      }
    });
    await syncWargaUpsert(warga);

    if (catatMutasi) {
      const mutasiBaru: MutasiRecord = {
        id: `m-${Date.now()}`,
        wargaId: warga.id,
        nama: warga.nama,
        nik: warga.nik,
        noKk: warga.noKk,
        jenisKelamin: warga.jenisKelamin,
        jenisMutasi: catatMutasi.jenis,
        tanggal: catatMutasi.tanggal,
        keterangan: catatMutasi.keterangan,
      };
      setDaftarMutasi(prev => [mutasiBaru, ...prev]);
      await syncMutasiUpsert(mutasiBaru);
    }
  };

  const handleTambahAnggotaKk = (noKk: string, alamat: string, rt: string, rw: string) => {
    setEditingWarga(null);
    setPrefilledKk({ noKk, alamat, rt, rw });
    setModalFormOpen(true);
  };

  const handlePilihKkFromWarga = (noKk: string) => {
    setSelectedKkFilter(noKk);
    setActiveTab('kk');
  };

  // Handlers Mutasi
  const handleTambahMutasi = (
    mutasi: MutasiRecord,
    updateStatus?: { wargaId: string; status: 'Meninggal' | 'Pindah Keluar' }
  ) => {
    setDaftarMutasi(prev => [mutasi, ...prev]);
    syncMutasiUpsert(mutasi);

    if (updateStatus) {
      setDaftarWarga(prev =>
        prev.map(w => {
          if (w.id === updateStatus.wargaId) {
            const updated = {
              ...w,
              statusKehidupan: updateStatus.status,
              tanggalMutasi: mutasi.tanggal,
            };
            syncWargaUpsert(updated);
            return updated;
          }
          return w;
        })
      );
    }
  };

  const handleHapusMutasi = (id: string) => {
    if (confirm('Hapus catatan mutasi ini?')) {
      setDaftarMutasi(prev => prev.filter(m => m.id !== id));
      syncMutasiDelete(id);
    }
  };

  // Handlers Kas
  const handleTambahKas = (tx: TransaksiKas) => {
    setDaftarKas(prev => [tx, ...prev]);
    syncKasUpsert(tx);
  };

  const handleHapusKas = (id: string) => {
    setDaftarKas(prev => prev.filter(k => k.id !== id));
    syncKasDelete(id);
  };

  // Handlers Dokumen
  const handleTambahDokumen = (doc: DokumenRt) => {
    setDaftarDokumen(prev => [doc, ...prev]);
    syncDokumenUpsert(doc);
  };

  const handleHapusDokumen = (id: string) => {
    setDaftarDokumen(prev => prev.filter(d => d.id !== id));
    syncDokumenDelete(id);
  };

  // Handlers Pengurus
  const handleTambahPengurus = (p: PengurusRt) => {
    setDaftarPengurus(prev => [...prev, p]);
    syncPengurusUpsert(p);
  };

  const handleEditPengurus = (p: PengurusRt) => {
    setDaftarPengurus(prev => prev.map(item => (item.id === p.id ? p : item)));
    syncPengurusUpsert(p);
  };

  const handleHapusPengurus = (id: string) => {
    setDaftarPengurus(prev => prev.filter(item => item.id !== id));
    syncPengurusDelete(id);
  };

  // Handlers Kredensial / Akun Pengguna (RBAC & Developer Management)
  const handleTambahCredential = (cred: UserCredential) => {
    setCredentials(prev => [...prev.filter(c => c.nik !== cred.nik), cred]);
  };

  const handleEditCredential = (cred: UserCredential) => {
    setCredentials(prev => prev.map(c => (c.nik === cred.nik ? cred : c)));
  };

  const handleHapusCredential = (nik: string) => {
    setCredentials(prev => prev.filter(c => c.nik !== nik));
  };

  // Reset & Import
  const handleResetData = () => {
    setDaftarWarga(INITIAL_WARGA);
    setDaftarMutasi(INITIAL_MUTASI);
    setProfilRt(DEFAULT_PROFIL_RT);
    setDaftarKas(INITIAL_KAS);
    setDaftarDokumen(INITIAL_DOKUMEN);
    setDaftarPengurus(INITIAL_PENGURUS);
    setCredentials(INITIAL_CREDENTIALS);
    setCurrentUser(DEFAULT_ADMIN_USER);
  };

  const handleImportData = (
    warga: Warga[],
    mutasi: MutasiRecord[],
    profil: ProfilRt,
    kas?: TransaksiKas[],
    dokumen?: DokumenRt[],
    pengurus?: PengurusRt[]
  ) => {
    setDaftarWarga(warga);
    setDaftarMutasi(mutasi);
    setProfilRt(profil);
    if (kas && Array.isArray(kas)) setDaftarKas(kas);
    if (dokumen && Array.isArray(dokumen)) setDaftarDokumen(dokumen);
    if (pengurus && Array.isArray(pengurus)) setDaftarPengurus(pengurus);
  };

  const currentTheme = profilRt.themeConfig || DEFAULT_THEME_CONFIG;

  // Jika belum login atau setelah logout, tampilkan halaman Login Screen
  if (!currentUser) {
    return (
      <>
        <LoginScreen
          profilRt={profilRt}
          onLoginSuccess={handleLoginSuccess}
          onOpenAndroidApk={() => setIsAndroidApkModalOpen(true)}
          onOpenShareOnline={() => setIsShareOnlineModalOpen(true)}
          totalWarga={daftarWarga.length}
          totalKk={daftarKk.length}
          credentials={credentials}
          onTambahCredential={handleTambahCredential}
        />
        <AndroidApkModal
          isOpen={isAndroidApkModalOpen}
          onClose={() => setIsAndroidApkModalOpen(false)}
          profilRt={profilRt}
          isInstallable={isInstallable}
          isInstalled={isInstalled}
          onInstallPrompt={installPwa}
        />
        <ShareOnlineModal
          isOpen={isShareOnlineModalOpen}
          onClose={() => setIsShareOnlineModalOpen(false)}
          profilRt={profilRt}
        />
      </>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#fdfbf7] overflow-hidden font-sans text-stone-800 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          if (tab !== 'kk') setSelectedKkFilter(undefined);
        }}
        profilRt={profilRt}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenAddWarga={handleOpenAddWarga}
        onOpenSettings={() => setSettingsOpen(true)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenThemeModal={() => setIsThemeLogoModalOpen(true)}
        onOpenAndroidApk={() => setIsAndroidApkModalOpen(true)}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <TopHeader
          activeTab={activeTab}
          profilRt={profilRt}
          onToggleMobileMenu={() => setIsMobileOpen(true)}
          onOpenAddWarga={handleOpenAddWarga}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenCetakLaporan={() => setActiveTab('laporan')}
          currentUser={currentUser}
          onOpenLogin={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          onOpenThemeModal={() => setIsThemeLogoModalOpen(true)}
          onOpenAndroidApk={() => setIsAndroidApkModalOpen(true)}
          onOpenShareOnline={() => setIsShareOnlineModalOpen(true)}
          isSupabaseConnected={isSupabaseConnected}
          tablesMissing={isSupabaseTablesMissing}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onOpenAiModal={() => setIsAiModalOpen(true)}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-28 md:pb-8">
          {/* Top Summary Stats (Only on demographic tabs) */}
          {(activeTab === 'warga' || activeTab === 'kk' || activeTab === 'laporan' || activeTab === 'mutasi') && (
            <DashboardStats
              daftarWarga={daftarWarga}
              daftarKk={daftarKk}
              totalMutasiBulanIni={totalMutasiBulanIni}
              onNavigateToTab={setActiveTab}
            />
          )}

          {/* Tab 1: Data Warga (Buku Induk Kependudukan) */}
          {activeTab === 'warga' && (
            <DaftarWarga
              daftarWarga={daftarWarga}
              onTambahWarga={handleOpenAddWarga}
              onEditWarga={handleEditWarga}
              onHapusWarga={handleHapusWarga}
              onLihatDetail={warga => setDetailWarga(warga)}
              onPilihKk={handlePilihKkFromWarga}
              currentUser={currentUser}
            />
          )}

          {/* Tab 2: Kartu Keluarga (KK Penghubung Data Keluarga 1 KK) */}
          {activeTab === 'kk' && (
            <DaftarKeluarga
              daftarKk={daftarKk}
              onTambahAnggotaKk={handleTambahAnggotaKk}
              onCetakKk={kk => setCetakKkData(kk)}
              onEditWarga={handleEditWarga}
              onLihatDetailWarga={warga => setDetailWarga(warga)}
              initialSelectedKk={selectedKkFilter}
              currentUser={currentUser}
            />
          )}

          {/* Tab 3: Kas & Pembukuan Keuangan RT */}
          {activeTab === 'kas' && (
            <BukuKasKeuangan
              daftarKas={daftarKas}
              profilRt={profilRt}
              daftarWarga={daftarWarga}
              onTambahKas={handleTambahKas}
              onHapusKas={handleHapusKas}
              currentUser={currentUser}
            />
          )}

          {/* Tab 4: Arsip Dokumen & AD/ART RT */}
          {activeTab === 'dokumen' && (
            <ArsipDokumen
              daftarDokumen={daftarDokumen}
              profilRt={profilRt}
              onTambahDokumen={handleTambahDokumen}
              onHapusDokumen={handleHapusDokumen}
              onNavigateToDrive={() => setActiveTab('drive')}
              currentUser={currentUser}
            />
          )}

          {/* Tab Google Drive RT (Cloud Storage Workspace) */}
          {activeTab === 'drive' && (
            <GoogleDriveManager
              profilRt={profilRt}
              daftarWarga={daftarWarga}
              daftarKk={daftarKk}
              daftarKas={daftarKas}
              daftarMutasi={daftarMutasi}
              daftarDokumen={daftarDokumen}
            />
          )}

          {/* Tab 5: Susunan & Struktur Pengurus RT */}
          {activeTab === 'pengurus' && (
            <StrukturPengurus
              daftarPengurus={daftarPengurus}
              profilRt={profilRt}
              daftarWarga={daftarWarga}
              onTambahPengurus={handleTambahPengurus}
              onEditPengurus={handleEditPengurus}
              onHapusPengurus={handleHapusPengurus}
              currentUser={currentUser}
            />
          )}

          {/* Tab 6: Laporan Rekapitulasi Penduduk Bulanan Siap Cetak */}
          {activeTab === 'laporan' && (
            <LaporanBulanan
              daftarWarga={daftarWarga}
              daftarMutasi={daftarMutasi}
              profilRt={profilRt}
            />
          )}

          {/* Tab 7: Mutasi & Peristiwa Kependudukan */}
          {activeTab === 'mutasi' && (
            <MutasiManager
              daftarMutasi={daftarMutasi}
              daftarWarga={daftarWarga}
              onTambahMutasi={handleTambahMutasi}
              onHapusMutasi={handleHapusMutasi}
              currentUser={currentUser}
            />
          )}

          {/* Tab 8: Matriks Hak Akses Peran & Manajemen Pengguna (Developer & Pengurus) */}
          {activeTab === 'pengguna' && (
            <MatriksPeranPengguna
              credentials={credentials}
              onTambahCredential={handleTambahCredential}
              onEditCredential={handleEditCredential}
              onHapusCredential={handleHapusCredential}
              currentUser={currentUser}
              profilRt={profilRt}
              isSupabaseConnected={isSupabaseConnected}
              totalWarga={daftarWarga.length}
              totalKk={daftarKk.length}
              totalKas={daftarKas.length}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ModalFormWarga
        isOpen={modalFormOpen}
        onClose={() => setModalFormOpen(false)}
        onSave={handleSaveWarga}
        initialData={editingWarga}
        daftarKk={daftarKk}
        prefilledKk={prefilledKk}
      />

      <ModalDetailWarga
        isOpen={!!detailWarga}
        onClose={() => setDetailWarga(null)}
        warga={detailWarga}
        daftarKk={daftarKk}
        onEdit={handleEditWarga}
        onPilihKk={handlePilihKkFromWarga}
        currentUser={currentUser}
      />

      <CetakKartuKeluargaModal
        isOpen={!!cetakKkData}
        onClose={() => setCetakKkData(null)}
        kkData={cetakKkData}
        profilRt={profilRt}
      />

      <PengaturanRtModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        profilRt={profilRt}
        onSaveProfil={handleSaveProfil}
        onResetData={handleResetData}
        daftarWarga={daftarWarga}
        daftarMutasi={daftarMutasi}
        daftarKas={daftarKas}
        daftarDokumen={daftarDokumen}
        daftarPengurus={daftarPengurus}
        onImportData={handleImportData}
        onOpenThemeModal={() => setIsThemeLogoModalOpen(true)}
      />

      {/* Login Modal with NIK & Password */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        daftarWarga={daftarWarga}
        credentials={credentials}
        profilRt={profilRt}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Customizer Tema Batik & Logo RT Modal */}
      <PengaturanTemaLogoModal
        isOpen={isThemeLogoModalOpen}
        onClose={() => setIsThemeLogoModalOpen(false)}
        profilRt={profilRt}
        onSaveThemeAndLogo={handleSaveThemeAndLogo}
      />

      {/* Android APK & WebAPK Modal Guide */}
      <AndroidApkModal
        isOpen={isAndroidApkModalOpen}
        onClose={() => setIsAndroidApkModalOpen(false)}
        profilRt={profilRt}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstallPrompt={installPwa}
      />

      {/* Share Online Link Modal */}
      <ShareOnlineModal
        isOpen={isShareOnlineModalOpen}
        onClose={() => setIsShareOnlineModalOpen(false)}
        profilRt={profilRt}
      />

      {/* Supabase Cloud Database Status & Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isConnected={isSupabaseConnected}
        tablesMissing={isSupabaseTablesMissing}
        errorMessage={supabaseErrorMessage}
        onRefreshConnection={refreshSupabaseConnection}
      />

      {/* Asisten Cerdas RT (Google Gemini AI) */}
      <AsistenAiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        profilRt={profilRt}
        totalWarga={daftarWarga.length}
        totalKk={daftarKk.length}
        saldoKas={daftarKas.reduce((acc, k) => acc + (k.jenis === 'PEMASUKAN' ? k.nominal : -k.nominal), 0)}
      />

      {/* Floating AI Assistant Trigger Button (Desktop & Tablet only) */}
      <button
        id="btn-floating-ai-assistant"
        onClick={() => setIsAiModalOpen(true)}
        className="hidden md:flex fixed bottom-5 right-5 z-40 p-3 sm:px-4 sm:py-3 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-bold shadow-xl border-2 border-amber-300/80 items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
        title="Tanya Asisten Pintar RT Gasem Raya (Google Gemini AI)"
      >
        <Sparkles className="w-4.5 h-4.5 text-stone-950 animate-spin-slow" />
        <span className="hidden sm:inline text-xs tracking-wide">Asisten AI RT</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </button>

      {/* World-class Native Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectTab={setActiveTab}
        onOpenAddWarga={handleOpenAddWarga}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenMenuSheet={() => setIsMobileMenuSheetOpen(true)}
        currentUser={currentUser}
        profilRt={profilRt}
      />

      {/* World-class Native Mobile Action Sheet for Secondary Menu */}
      <MobileMenuSheet
        isOpen={isMobileMenuSheetOpen}
        onClose={() => setIsMobileMenuSheetOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profilRt={profilRt}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenThemeModal={() => setIsThemeLogoModalOpen(true)}
        onOpenAndroidApk={() => setIsAndroidApkModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        isSupabaseConnected={isSupabaseConnected}
      />
    </div>
  );
}

