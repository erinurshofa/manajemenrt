import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from 'react';
import { Sidebar, TabId } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardStats } from './components/DashboardStats';
import { DaftarWarga } from './components/DaftarWarga';
import { DaftarKeluarga } from './components/DaftarKeluarga';
import { MutasiManager } from './components/MutasiManager';
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
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileMenuSheet } from './components/MobileMenuSheet';
import { Sparkles, Loader2 } from 'lucide-react';
import { DevRoleBanner } from './components/dev/DevRoleBanner';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useRtSync } from './hooks/useRtSync';

// Lazy Loaded Components for Maximum Bundle Performance & Faster Mobile Initial Load
const BukuKasKeuangan = React.lazy(() =>
  import('./components/BukuKasKeuangan').then(m => ({ default: m.BukuKasKeuangan }))
);
const GoogleDriveManager = React.lazy(() =>
  import('./components/GoogleDriveManager').then(m => ({ default: m.GoogleDriveManager }))
);
const MatriksPeranPengguna = React.lazy(() =>
  import('./components/MatriksPeranPengguna').then(m => ({ default: m.MatriksPeranPengguna }))
);
const ArsipDokumen = React.lazy(() =>
  import('./components/ArsipDokumen').then(m => ({ default: m.ArsipDokumen }))
);
const LaporanBulanan = React.lazy(() =>
  import('./components/LaporanBulanan').then(m => ({ default: m.LaporanBulanan }))
);
const AsistenAiModal = React.lazy(() =>
  import('./components/AsistenAiModal').then(m => ({ default: m.AsistenAiModal }))
);
const DeveloperToolsModal = React.lazy(() =>
  import('./components/dev/DeveloperToolsModal').then(m => ({ default: m.DeveloperToolsModal }))
);

const PageSuspenseFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[360px] p-8 text-center space-y-3 bg-white/60 rounded-2xl border border-stone-200/80">
    <Loader2 className="w-8 h-8 text-amber-700 animate-spin" />
    <p className="text-xs font-semibold text-stone-600">Memuat modul aplikasi...</p>
  </div>
);
import {
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
  syncCredentialUpsert,
  syncCredentialDelete,
} from './services/supabaseService';

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
  UserRole,
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
  DEFAULT_ADMIN_USER,
} from './data/initialData';
import { kelompokkanPerKk } from './utils/calculations';
import { isDeveloper } from './utils/permissions';

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
      setSimulatedRole(null);
    }
  }, [currentUser]);

  // Developer Impersonation State
  const [simulatedRole, setSimulatedRole] = useState<UserRole | null>(() => {
    if (typeof window !== 'undefined') {
      return (sessionStorage.getItem('gasemraya_simulated_role') as UserRole) || null;
    }
    return null;
  });

  useEffect(() => {
    if (simulatedRole) {
      sessionStorage.setItem('gasemraya_simulated_role', simulatedRole);
    } else {
      sessionStorage.removeItem('gasemraya_simulated_role');
    }
  }, [simulatedRole]);

  // Developer Tools Modal State
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  // Original developer identity check
  const isRealDeveloper = currentUser?.role === 'developer';

  // Effective user session considering role impersonation
  const effectiveUser: UserSession | null = useMemo(() => {
    if (!currentUser) return null;
    if (isRealDeveloper && simulatedRole) {
      return {
        ...currentUser,
        role: simulatedRole,
      };
    }
    return currentUser;
  }, [currentUser, isRealDeveloper, simulatedRole]);

  // IndexedDB Resilient Offline & Supabase Cloud Realtime Synchronizer
  const {
    isLocalDbLoaded,
    isOnline,
    isSupabaseConnected,
    setIsSupabaseConnected,
    isSupabaseTablesMissing,
    supabaseErrorMessage,
    refreshSupabaseConnection,
  } = useRtSync({
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
  });

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
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
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
      setSimulatedRole(null);
      setIsSupabaseConnected(false);
      sessionStorage.removeItem('gasemraya_auth');
      sessionStorage.removeItem('gasemraya_simulated_role');
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
    const targetWarga = daftarWarga.find(w => w.id === id);
    const targetNik = targetWarga?.nik;

    const relatedMutasi = daftarMutasi.filter(
      m => m.wargaId === id || (targetNik && m.nik === targetNik)
    );

    let confirmMsg = `Apakah Anda yakin ingin menghapus data warga "${nama}"?`;
    if (relatedMutasi.length > 0) {
      confirmMsg = `Warga "${nama}" memiliki ${relatedMutasi.length} catatan riwayat di menu Mutasi Penduduk.\n\nApakah Anda yakin ingin menghapus data warga ini beserta seluruh ${relatedMutasi.length} riwayat mutasinya secara permanen?`;
    }

    if (confirm(confirmMsg)) {
      const mutasiIdsToDelete = new Set(relatedMutasi.map(m => m.id));
      setDaftarWarga(prev => prev.filter(w => w.id !== id));
      setDaftarMutasi(prev => prev.filter(m => !mutasiIdsToDelete.has(m.id) && m.wargaId !== id));

      await syncWargaDelete(id);
      for (const m of relatedMutasi) {
        await syncMutasiDelete(m.id);
      }
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

  const handleEditDokumen = (doc: DokumenRt) => {
    setDaftarDokumen(prev => prev.map(d => (d.id === doc.id ? doc : d)));
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
    syncCredentialUpsert(cred);
  };

  const handleEditCredential = (cred: UserCredential) => {
    setCredentials(prev => prev.map(c => (c.nik === cred.nik ? cred : c)));
    syncCredentialUpsert(cred);
  };

  const handleHapusCredential = (nik: string) => {
    setCredentials(prev => prev.filter(c => c.nik !== nik));
    syncCredentialDelete(nik);
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
    <div className="flex flex-col h-screen w-full bg-[#fdfbf7] overflow-hidden font-sans text-stone-800 antialiased">
      {/* Developer Impersonation Floating Banner (Active when developer simulates another role) */}
      {isRealDeveloper && (
        <DevRoleBanner
          simulatedRole={simulatedRole}
          onResetToDeveloper={() => setSimulatedRole(null)}
          onSwitchRole={r => setSimulatedRole(r)}
          onOpenDevTools={() => setIsDevToolsOpen(true)}
        />
      )}

      <div className="flex flex-1 min-h-0 w-full overflow-hidden">
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
          currentUser={effectiveUser}
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
            currentUser={effectiveUser}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            onLogout={handleLogout}
            onOpenThemeModal={() => setIsThemeLogoModalOpen(true)}
            onOpenAndroidApk={() => setIsAndroidApkModalOpen(true)}
            onOpenShareOnline={() => setIsShareOnlineModalOpen(true)}
            isSupabaseConnected={isSupabaseConnected}
            tablesMissing={isSupabaseTablesMissing}
            onOpenSupabaseModal={isDeveloper(effectiveUser?.role) ? () => setIsSupabaseModalOpen(true) : undefined}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenDevTools={() => setIsDevToolsOpen(true)}
            isDeveloperUser={isDeveloper(effectiveUser?.role)}
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
                currentUser={effectiveUser}
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
                currentUser={effectiveUser}
              />
            )}

            {/* Tab 3: Kas & Pembukuan Keuangan RT (Lazy Loaded) */}
            {activeTab === 'kas' && (
              <Suspense fallback={<PageSuspenseFallback />}>
                <BukuKasKeuangan
                  daftarKas={daftarKas}
                  profilRt={profilRt}
                  daftarWarga={daftarWarga}
                  onTambahKas={handleTambahKas}
                  onHapusKas={handleHapusKas}
                  currentUser={effectiveUser}
                />
              </Suspense>
            )}

            {/* Tab 4: Arsip Dokumen & AD/ART RT (Lazy Loaded) */}
            {activeTab === 'dokumen' && (
              <Suspense fallback={<PageSuspenseFallback />}>
                <ArsipDokumen
                  daftarDokumen={daftarDokumen}
                  profilRt={profilRt}
                  onTambahDokumen={handleTambahDokumen}
                  onEditDokumen={handleEditDokumen}
                  onHapusDokumen={handleHapusDokumen}
                  onNavigateToDrive={() => setActiveTab('drive')}
                  currentUser={effectiveUser}
                />
              </Suspense>
            )}

            {/* Tab Google Drive RT (Lazy Loaded) */}
            {activeTab === 'drive' && (
              <Suspense fallback={<PageSuspenseFallback />}>
                <GoogleDriveManager
                  profilRt={profilRt}
                  daftarWarga={daftarWarga}
                  daftarKk={daftarKk}
                  daftarKas={daftarKas}
                  daftarMutasi={daftarMutasi}
                  daftarDokumen={daftarDokumen}
                />
              </Suspense>
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
                currentUser={effectiveUser}
              />
            )}

            {/* Tab 6: Laporan Rekapitulasi Penduduk Bulanan (Lazy Loaded) */}
            {activeTab === 'laporan' && (
              <Suspense fallback={<PageSuspenseFallback />}>
                <LaporanBulanan
                  daftarWarga={daftarWarga}
                  daftarMutasi={daftarMutasi}
                  profilRt={profilRt}
                />
              </Suspense>
            )}

            {/* Tab 7: Mutasi & Peristiwa Kependudukan */}
            {activeTab === 'mutasi' && (
              <MutasiManager
                daftarMutasi={daftarMutasi}
                daftarWarga={daftarWarga}
                onTambahMutasi={handleTambahMutasi}
                onHapusMutasi={handleHapusMutasi}
                currentUser={effectiveUser}
              />
            )}

            {/* Tab 8: Matriks Hak Akses Peran & Manajemen Pengguna (Lazy Loaded) */}
            {activeTab === 'pengguna' && (
              <Suspense fallback={<PageSuspenseFallback />}>
                <MatriksPeranPengguna
                  credentials={credentials}
                  onTambahCredential={handleTambahCredential}
                  onEditCredential={handleEditCredential}
                  onHapusCredential={handleHapusCredential}
                  currentUser={effectiveUser}
                  profilRt={profilRt}
                  isSupabaseConnected={isSupabaseConnected}
                  totalWarga={daftarWarga.length}
                  totalKk={daftarKk.length}
                  totalKas={daftarKas.length}
                />
              </Suspense>
            )}
          </main>
        </div>
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
        currentUser={effectiveUser}
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

      {/* Supabase Cloud Database Status & Configuration Modal (Hanya Developer) */}
      {isDeveloper(effectiveUser?.role) && (
        <SupabaseConfigModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          isConnected={isSupabaseConnected}
          tablesMissing={isSupabaseTablesMissing}
          errorMessage={supabaseErrorMessage}
          onRefreshConnection={refreshSupabaseConnection}
        />
      )}

      {/* Asisten Cerdas RT (Google Gemini AI - Lazy Loaded) */}
      {isAiModalOpen && (
        <Suspense fallback={null}>
          <AsistenAiModal
            isOpen={isAiModalOpen}
            onClose={() => setIsAiModalOpen(false)}
            profilRt={profilRt}
            totalWarga={daftarWarga.length}
            totalKk={daftarKk.length}
            saldoKas={daftarKas.reduce((acc, k) => acc + (k.jenis === 'PEMASUKAN' ? k.nominal : -k.nominal), 0)}
          />
        </Suspense>
      )}

      {/* Developer Tools Modal (Exclusively for developer role - Lazy Loaded) */}
      {isDevToolsOpen && (
        <Suspense fallback={null}>
          <DeveloperToolsModal
            isOpen={isDevToolsOpen}
            onClose={() => setIsDevToolsOpen(false)}
            isOnline={isOnline}
            isSupabaseConnected={isSupabaseConnected}
            isTablesMissing={isSupabaseTablesMissing}
            onForceResync={refreshSupabaseConnection}
            simulatedRole={simulatedRole}
            onSetSimulatedRole={setSimulatedRole}
            daftarWarga={daftarWarga}
            setDaftarWarga={setDaftarWarga}
            daftarMutasi={daftarMutasi}
            setDaftarMutasi={setDaftarMutasi}
            daftarKas={daftarKas}
            setDaftarKas={setDaftarKas}
            daftarDokumen={daftarDokumen}
            setDaftarDokumen={setDaftarDokumen}
            daftarPengurus={daftarPengurus}
            setDaftarPengurus={setDaftarPengurus}
            credentials={credentials}
            setCredentials={setCredentials}
            profilRt={profilRt}
            setProfilRt={handleSaveProfil}
          />
        </Suspense>
      )}

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
        currentUser={effectiveUser}
        profilRt={profilRt}
      />

      {/* World-class Native Mobile Action Sheet for Secondary Menu */}
      <MobileMenuSheet
        isOpen={isMobileMenuSheetOpen}
        onClose={() => setIsMobileMenuSheetOpen(false)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        profilRt={profilRt}
        currentUser={effectiveUser}
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

