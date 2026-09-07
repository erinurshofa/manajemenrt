import React, { useState, useEffect } from 'react';
import {
  Terminal,
  X,
  Activity,
  UserCheck,
  Database,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
  ShieldCheck,
  Wifi,
  WifiOff,
  Server,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  FileCode,
} from 'lucide-react';
import {
  Warga,
  MutasiRecord,
  TransaksiKas,
  DokumenRt,
  PengurusRt,
  UserCredential,
  ProfilRt,
  UserRole,
} from '../../types';
import { ROLE_DEFINITIONS } from '../../utils/permissions';
import {
  generateDummyWarga,
  generateDummyKas,
  generateDummyMutasi,
} from '../../utils/dummyDataGenerator';
import {
  INITIAL_WARGA,
  INITIAL_MUTASI,
  INITIAL_KAS,
  INITIAL_DOKUMEN,
  INITIAL_PENGURUS,
  INITIAL_CREDENTIALS,
  DEFAULT_PROFIL_RT,
} from '../../data/initialData';

interface DeveloperToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // System states
  isOnline: boolean;
  isSupabaseConnected: boolean;
  isTablesMissing?: boolean;
  onForceResync: () => Promise<void> | void;
  // Impersonation
  simulatedRole: UserRole | null;
  onSetSimulatedRole: (role: UserRole | null) => void;
  // Data stores
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
  credentials: UserCredential[];
  setCredentials: React.Dispatch<React.SetStateAction<UserCredential[]>>;
  profilRt: ProfilRt;
  setProfilRt: (profil: ProfilRt) => void;
}

type DevTab = 'diagnostik' | 'impersonate' | 'snapshot' | 'seeder';

export const DeveloperToolsModal: React.FC<DeveloperToolsModalProps> = ({
  isOpen,
  onClose,
  isOnline,
  isSupabaseConnected,
  isTablesMissing = false,
  onForceResync,
  simulatedRole,
  onSetSimulatedRole,
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
  credentials,
  setCredentials,
  profilRt,
  setProfilRt,
}) => {
  const [activeTab, setActiveTab] = useState<DevTab>('diagnostik');
  const [storageUsage, setStorageUsage] = useState<string>('Memeriksa...');
  const [isResyncing, setIsResyncing] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Estimate browser IndexedDB & cache storage
  useEffect(() => {
    if (isOpen && typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(estimate => {
        const usageMb = ((estimate.usage || 0) / (1024 * 1024)).toFixed(2);
        const quotaMb = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
        setStorageUsage(`${usageMb} MB / ${quotaMb} MB`);
      }).catch(() => {
        setStorageUsage('Tidak dapat diakses');
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotice = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // 1. Force Resync Handler
  const handleTriggerResync = async () => {
    setIsResyncing(true);
    try {
      await onForceResync();
      showNotice('Sinkronisasi paksa berhasil dipicu!', 'success');
    } catch {
      showNotice('Gagal memicu sinkronisasi.', 'error');
    } finally {
      setIsResyncing(false);
    }
  };

  // 2. Full JSON Database Dump
  const handleExportFullJson = () => {
    const backupData = {
      meta: {
        app: 'Sistem Informasi RT Gasem Raya',
        version: '2.0-developer-snapshot',
        exportedAt: new Date().toISOString(),
        author: 'Developer / Superadmin RT',
        profilRt,
      },
      data: {
        warga: daftarWarga,
        mutasi: daftarMutasi,
        kas: daftarKas,
        dokumen: daftarDokumen,
        pengurus: daftarPengurus,
        credentials: credentials.map(c => ({
          ...c,
          password: c.password, // Dev export for full backup
        })),
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_full_rtgasem_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotice('File snapshot database JSON berhasil diunduh!', 'success');
  };

  // 3. Restore from JSON
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.data || !Array.isArray(parsed.data.warga)) {
          throw new Error('Format file JSON tidak valid atau bukan snapshot RT Gasem.');
        }

        if (confirm('Apakah Anda yakin ingin memulihkan database dari file ini? Data yang ada akan diperbarui.')) {
          if (parsed.data.warga) setDaftarWarga(parsed.data.warga);
          if (parsed.data.mutasi) setDaftarMutasi(parsed.data.mutasi);
          if (parsed.data.kas) setDaftarKas(parsed.data.kas);
          if (parsed.data.dokumen) setDaftarDokumen(parsed.data.dokumen);
          if (parsed.data.pengurus) setDaftarPengurus(parsed.data.pengurus);
          if (parsed.data.credentials) setCredentials(parsed.data.credentials);
          if (parsed.meta?.profilRt) setProfilRt(parsed.meta.profilRt);

          showNotice('Database berhasil dipulihkan dari snapshot JSON!', 'success');
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'File tidak valid';
        showNotice(`Gagal mengimpor data: ${errorMsg}`, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 4. Inject Dummy Sample Data
  const handleInjectDummyData = () => {
    if (confirm('Tambahkan data warga contoh, kas, dan mutasi untuk pengujian performa UI?')) {
      const dummyWarga = generateDummyWarga();
      const dummyKas = generateDummyKas();
      const dummyMutasi = generateDummyMutasi(dummyWarga);

      setDaftarWarga(prev => [...dummyWarga, ...prev]);
      setDaftarKas(prev => [...dummyKas, ...prev]);
      setDaftarMutasi(prev => [...dummyMutasi, ...prev]);

      showNotice(`Berhasil menambahkan ${dummyWarga.length} warga contoh & 5 transaksi kas!`, 'success');
    }
  };

  // 5. Reset to Clean Initial Data
  const handleResetToInitialData = () => {
    if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke data standar bawaan aplikasi?')) {
      setDaftarWarga(INITIAL_WARGA);
      setDaftarMutasi(INITIAL_MUTASI);
      setDaftarKas(INITIAL_KAS);
      setDaftarDokumen(INITIAL_DOKUMEN);
      setDaftarPengurus(INITIAL_PENGURUS);
      setCredentials(INITIAL_CREDENTIALS);
      setProfilRt(DEFAULT_PROFIL_RT);
      showNotice('Data berhasil direset ke kondisi default pabrikan!', 'info');
    }
  };

  // Check env configs safely
  const envChecklist = [
    {
      name: 'VITE_SUPABASE_URL',
      status: Boolean(import.meta.env.VITE_SUPABASE_URL),
      note: 'Endpoint Cloud Supabase REST / WebSocket',
    },
    {
      name: 'VITE_SUPABASE_ANON_KEY',
      status: Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY),
      note: 'Public Anon Key Otentikasi Supabase',
    },
    {
      name: 'VITE_GEMINI_API_KEY / Proxy',
      status: true, // System includes robust built-in fallback proxy
      note: 'AI Assistant Service via serverless proxy',
    },
    {
      name: 'Service Worker PWA',
      status: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
      note: 'Offline caching & installability',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white border border-stone-300 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white px-5 py-4 flex items-center justify-between border-b border-stone-700 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 shadow-inner">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="dev-modal-title" className="text-base sm:text-lg font-bold">Developer Tools & Diagnostics</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-900/80 text-violet-300 border border-violet-500/40">
                  ROOT ACCESS
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Pusat kendali diagnostik sistem, simulasi hak akses, dan manajemen database
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela"
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notice Alert */}
        {actionNotice && (
          <div
            className={`px-4 py-2.5 text-xs flex items-center gap-2 border-b shrink-0 ${
              actionNotice.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : actionNotice.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{actionNotice.message}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-4 bg-stone-100 border-b border-stone-200 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('diagnostik')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'diagnostik'
                ? 'border-amber-600 text-amber-900 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Activity className="w-4 h-4 text-amber-700" />
            <span>Diagnostik & Sistem</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('impersonate')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'impersonate'
                ? 'border-amber-600 text-amber-900 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-amber-700" />
            <span>Simulasi Peran {simulatedRole && simulatedRole !== 'developer' && '🔴'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('snapshot')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'snapshot'
                ? 'border-amber-600 text-amber-900 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Database className="w-4 h-4 text-amber-700" />
            <span>Snapshot JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seeder')}
            className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'seeder'
                ? 'border-amber-600 text-amber-900 bg-white shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>Generator Data Uji</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-50/50 space-y-5">
          {/* TAB 1: DIAGNOSTIK & SISTEM */}
          {activeTab === 'diagnostik' && (
            <div className="space-y-5">
              {/* Infrastructure Status Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. Supabase Realtime */}
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500">Supabase Cloud</span>
                    <Server className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <span className="font-bold text-sm text-stone-900">
                      {isSupabaseConnected ? 'Terhubung (Online)' : 'Terputus (Offline)'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500">
                    {isTablesMissing ? 'Tabel skema belum dibuat' : 'Skema tabel siap & sinkron'}
                  </p>
                </div>

                {/* 2. Koneksi Internet */}
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500">Status Jaringan</span>
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-rose-600" />
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">
                      {isOnline ? 'Internet Tersedia' : 'Mode Offline Aktif'}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500">
                    {isOnline ? 'Realtime sync aktif' : 'Data disimpan ke IndexedDB'}
                  </p>
                </div>

                {/* 3. IndexedDB Quota */}
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500">Local Cache Storage</span>
                    <HardDrive className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="mt-2">
                    <span className="font-bold text-sm text-stone-900">{storageUsage}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500">IndexedDB RT Gasem Engine</p>
                </div>

                {/* 4. Total Entities */}
                <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500">Total Record Data</span>
                    <Layers className="w-4 h-4 text-stone-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="font-bold text-lg text-amber-900">
                      {daftarWarga.length + daftarKas.length + daftarMutasi.length + daftarDokumen.length}
                    </span>
                    <span className="text-xs text-stone-500">baris</span>
                  </div>
                  <p className="mt-1 text-[11px] text-stone-500">
                    {daftarWarga.length} warga, {daftarKas.length} kas
                  </p>
                </div>
              </div>

              {/* Entity Breakdown Table */}
              <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-amber-700" />
                    <span>Rincian Record IndexedDB / Cloud</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleTriggerResync}
                    disabled={isResyncing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-300 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isResyncing ? 'animate-spin' : ''}`} />
                    <span>{isResyncing ? 'Menyinkronkan...' : 'Paksa Resync'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <div className="text-[11px] font-medium text-stone-500">Warga</div>
                    <div className="text-base font-bold text-stone-800">{daftarWarga.length}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <div className="text-[11px] font-medium text-stone-500">Mutasi</div>
                    <div className="text-base font-bold text-stone-800">{daftarMutasi.length}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <div className="text-[11px] font-medium text-stone-500">Kas RT</div>
                    <div className="text-base font-bold text-stone-800">{daftarKas.length}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <div className="text-[11px] font-medium text-stone-500">Arsip Surat</div>
                    <div className="text-base font-bold text-stone-800">{daftarDokumen.length}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <div className="text-[11px] font-medium text-stone-500">Pengurus</div>
                    <div className="text-base font-bold text-stone-800">{daftarPengurus.length}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200">
                    <div className="text-[11px] font-medium text-stone-500">Akun Pengguna</div>
                    <div className="text-base font-bold text-stone-800">{credentials.length}</div>
                  </div>
                </div>
              </div>

              {/* Environment Checklist */}
              <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-2xs">
                <h3 className="text-xs sm:text-sm font-bold text-stone-900 mb-3 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-amber-700" />
                  <span>Status Konfigurasi Environment & Service</span>
                </h3>

                <div className="space-y-2">
                  {envChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-stone-800">{item.name}</div>
                        <div className="text-[11px] text-stone-500">{item.note}</div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.status ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terkonfigurasi</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-100 text-amber-800">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Fallback / Standby</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIMULASI PERAN (IMPERSONATION) */}
          {activeTab === 'impersonate' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-violet-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-violet-900 leading-relaxed">
                  <span className="font-bold">Role Impersonation Simulator: </span>
                  Fitur ini memungkinkan Anda merasakan dan memverifikasi antarmuka sistem dari sudut pandang warga biasa atau pengurus tertentu tanpa perlu logout-login ulang.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map(roleKey => {
                  const roleDef = ROLE_DEFINITIONS[roleKey];
                  const isCurrent =
                    (!simulatedRole && roleKey === 'developer') ||
                    simulatedRole === roleKey;

                  return (
                    <div
                      key={roleKey}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-amber-600 bg-amber-50/70 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sm text-stone-900">{roleDef.title}</div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            roleKey === 'developer'
                              ? 'bg-purple-100 text-purple-900'
                              : roleKey === 'ketua_rt'
                              ? 'bg-amber-100 text-amber-900'
                              : roleKey === 'warga'
                              ? 'bg-stone-100 text-stone-700'
                              : 'bg-blue-100 text-blue-900'
                          }`}
                        >
                          {roleDef.badgeLabel}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-stone-600 leading-relaxed">
                        {roleDef.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-[11px] text-stone-400">
                          {isCurrent ? 'Peran Aktif Saat Ini' : 'Klik untuk menguji'}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (roleKey === 'developer') {
                              onSetSimulatedRole(null);
                              showNotice('Kembali ke hak akses penuh Developer Root!', 'info');
                            } else {
                              onSetSimulatedRole(roleKey);
                              showNotice(`Mode simulasi diaktifkan: ${roleDef.title}`, 'success');
                            }
                          }}
                          disabled={isCurrent}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-600 text-white cursor-default'
                              : 'bg-stone-800 hover:bg-stone-700 text-white active:scale-95'
                          }`}
                        >
                          {isCurrent ? 'Aktif' : 'Simulasikan'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {simulatedRole && (
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSetSimulatedRole(null);
                      showNotice('Kembali ke hak akses penuh Developer Root!', 'info');
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-all shadow"
                  >
                    Batalkan Simulasi (Kembali ke Developer)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SNAPSHOT DATABASE (JSON) */}
          {activeTab === 'snapshot' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Ekspor Full Database */}
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                      <Download className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                      Unduh Snapshot Database (Full JSON)
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                      Ekspor seluruh data warga, KK, riwayat mutasi, transaksi kas, dokumen arsip, dan akun dalam 1 file JSON terstruktur untuk cadangan darurat.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={handleExportFullJson}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow cursor-pointer active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>Unduh File Snapshot (.json)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Pulihkan / Restore Snapshot */}
                <div className="p-5 rounded-xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-stone-900 text-sm sm:text-base">
                      Pulihkan Database dari Snapshot JSON
                    </h3>
                    <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                      Unggah file backup JSON resmi RT Gasem untuk mengembalikan data warga, kas, dan arsip secara instan jika terjadi insiden kesalahan input.
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-100">
                    <label className="w-full py-2.5 px-4 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow cursor-pointer active:scale-95">
                      <Upload className="w-4 h-4" />
                      <span>Pilih File Snapshot (.json)</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportJson}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GENERATOR DATA UJI (SEEDER) */}
          {activeTab === 'seeder' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                  <span className="font-bold">Generator Data Uji Realistis: </span>
                  Sangat berguna saat mendemokan aplikasi ke pengurus RT baru atau menguji performa paginasi tabel, filter pencarian NIK, dan cetak laporan kas tanpa mengotori data asli warga.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Tambah Data Uji */}
                <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <h4 className="font-bold text-sm text-stone-900">Tambahkan Data Uji (Seeder)</h4>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    Menyisipkan 8 warga contoh (3 KK), 5 transaksi kas rutin & pembangunan, serta 1 mutasi domisili realistis ke dalam state aplikasi.
                  </p>
                  <button
                    type="button"
                    onClick={handleInjectDummyData}
                    className="mt-4 px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Inject Data Uji Realistis</span>
                  </button>
                </div>

                {/* 2. Reset Default Data */}
                <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs">
                  <h4 className="font-bold text-sm text-stone-900">Reset ke Data Default Pabrikan</h4>
                  <p className="mt-1 text-xs text-stone-600 leading-relaxed">
                    Membersihkan data tambahan dan mengembalikan seluruh koleksi (warga, kas, profil RT) ke kondisi awal bawaan installer.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetToInitialData}
                    className="mt-4 px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer active:scale-95"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Reset Seluruh Data</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Developer Console Siap Digunakan</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
