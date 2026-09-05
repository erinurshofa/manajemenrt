import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Cloud,
  FolderPlus,
  UploadCloud,
  RefreshCw,
  Folder,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  FileArchive,
  File,
  ExternalLink,
  Download,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Database,
  ShieldAlert,
  X,
  ChevronRight,
  HardDrive,
  User,
  Users,
  LogOut,
  Info,
  Globe,
  Settings,
  Grid,
  List,
  ShieldCheck,
} from 'lucide-react';
import {
  DriveFile,
  listDriveFiles,
  createDriveFolder,
  uploadDriveFile,
  uploadJsonToDrive,
  uploadCsvToDrive,
  deleteDriveFile,
  getOrCreateRtFolder,
  getCustomFolderId,
  setCustomFolderId,
  extractDriveFolderId,
  getServiceAccountEmail,
} from '../services/googleDriveApi';
import {
  initAuth,
  googleSignIn,
  logoutGoogle,
  getCurrentGoogleUser,
  getAccessToken,
} from '../services/googleDriveAuth';
import { ProfilRt, Warga, MutasiRecord, TransaksiKas, DokumenRt, KartuKeluargaData } from '../types';

interface GoogleDriveManagerProps {
  profilRt: ProfilRt;
  daftarWarga: Warga[];
  daftarKk: KartuKeluargaData[];
  daftarKas: TransaksiKas[];
  daftarMutasi: MutasiRecord[];
  daftarDokumen: DokumenRt[];
}

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  profilRt,
  daftarWarga,
  daftarKk,
  daftarKas,
  daftarMutasi,
  daftarDokumen,
}) => {
  // Drive configuration from .env / localStorage
  const configuredFolderId = getCustomFolderId();
  const configuredServiceEmail = getServiceAccountEmail();

  // Tab Mode: 'public' (Bebas Akses Tanpa Sign-In) vs 'manage' (Kelola & Cadangkan Data)
  const [activeDriveTab, setActiveDriveTab] = useState<'public' | 'manage'>('public');

  // Public Folder Configuration
  const [publicFolderId, setPublicFolderId] = useState<string>(getCustomFolderId());
  const [tempFolderInput, setTempFolderInput] = useState<string>(getCustomFolderId());
  const [publicViewMode, setPublicViewMode] = useState<'grid' | 'list'>('grid');
  const [isFolderSettingsOpen, setIsFolderSettingsOpen] = useState<boolean>(false);

  const handleSavePublicFolderId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractDriveFolderId(tempFolderInput);
    setCustomFolderId(cleanId);
    setPublicFolderId(cleanId);
    setIsFolderSettingsOpen(false);
    setSuccessMessage(cleanId ? 'ID Folder Google Drive berhasil disimpan!' : 'Pengaturan folder dikosongkan.');
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  // Auth state
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [googleUser, setGoogleUser] = useState<{
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null>(null);

  // Drive state
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Folder navigation
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined);
  const [folderHistory, setFolderHistory] = useState<Array<{ id: string; name: string }>>([
    { id: 'root', name: 'Google Drive Saya' },
  ]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'folder' | 'doc' | 'sheet' | 'pdf' | 'image'>('all');

  // Modals state
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Destructive Confirmation Modal
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        if (token) {
          setNeedsAuth(false);
          setGoogleUser({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          });
        } else {
          setNeedsAuth(true);
        }
      },
      () => {
        setNeedsAuth(true);
        setGoogleUser(null);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Fetch files
  const loadFiles = useCallback(
    async (folderId?: string) => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const token = await getAccessToken();
        if (!token) {
          setNeedsAuth(true);
          return;
        }
        const driveFiles = await listDriveFiles({
          folderId: folderId && folderId !== 'root' ? folderId : undefined,
          query: searchQuery,
        });
        setFiles(driveFiles);
      } catch (err: any) {
        console.error('Failed to load drive files:', err);
        setErrorMessage(err.message || 'Gagal memuat berkas Google Drive.');
        if (err.message && err.message.toLowerCase().includes('token')) {
          setNeedsAuth(true);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery]
  );

  // Trigger file fetch when authenticated or folder changes
  useEffect(() => {
    if (!needsAuth) {
      loadFiles(currentFolderId);
    }
  }, [needsAuth, currentFolderId, loadFiles]);

  // Handle Login
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    try {
      const result = await googleSignIn();
      if (result?.accessToken) {
        setNeedsAuth(false);
        setGoogleUser({
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        });
        setSuccessMessage('Berhasil terhubung dengan akun Google!');
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleGoogleLogout = async () => {
    try {
      await logoutGoogle();
      setNeedsAuth(true);
      setGoogleUser(null);
      setFiles([]);
      setSuccessMessage('Koneksi Google Drive diputuskan.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    try {
      const parent = currentFolderId && currentFolderId !== 'root' ? currentFolderId : undefined;
      await createDriveFolder(newFolderName.trim(), parent);
      setNewFolderName('');
      setIsNewFolderOpen(false);
      setSuccessMessage(`Folder "${newFolderName}" berhasil dibuat!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      loadFiles(currentFolderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat folder di Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  // Upload Local File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage(null);
    try {
      const parent = currentFolderId && currentFolderId !== 'root' ? currentFolderId : undefined;
      await uploadDriveFile(file, file.name, file.type, parent);
      setSuccessMessage(`Berkas "${file.name}" berhasil diunggah ke Google Drive!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      loadFiles(currentFolderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengunggah berkas ke Google Drive.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // Backup All RT Data to Google Drive
  const handleBackupAllRtData = async () => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      // 1. Get or create RT folder
      const rtFolder = await getOrCreateRtFolder();

      // 2. Prepare payload
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPayload = {
        waktuCadangan: new Date().toLocaleString('id-ID'),
        profilRt,
        totalWarga: daftarWarga.length,
        totalKk: daftarKk.length,
        totalTransaksiKas: daftarKas.length,
        daftarWarga,
        daftarKk,
        daftarKas,
        daftarMutasi,
        daftarDokumen,
      };

      const fileName = `Cadangan_Sistem_RT02_${timestamp}.json`;
      await uploadJsonToDrive(backupPayload, fileName, rtFolder.id);

      setSuccessMessage(
        `Sukses! Seluruh data RT berhasil dicadangkan ke folder "${rtFolder.name}" di Google Drive Anda.`
      );
      setTimeout(() => setSuccessMessage(null), 5000);
      loadFiles(currentFolderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mencadangkan data RT ke Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Export Data Warga CSV to Google Drive
  const handleExportWargaCsv = async () => {
    setIsUploading(true);
    setErrorMessage(null);
    try {
      const rtFolder = await getOrCreateRtFolder();
      const headers = [
        'NIK',
        'Nama Lengkap',
        'Nomor KK',
        'Jenis Kelamin',
        'Tempat Lahir',
        'Tanggal Lahir',
        'Agama',
        'Pendidikan',
        'Pekerjaan',
        'Status Perkawinan',
        'Status Hubungan',
        'Alamat',
        'Nomor HP',
      ];

      const rows = daftarWarga.map(w => [
        `"${w.nik}"`,
        `"${w.nama.replace(/"/g, '""')}"`,
        `"${w.noKk}"`,
        `"${w.jenisKelamin}"`,
        `"${w.tempatLahir}"`,
        `"${w.tanggalLahir}"`,
        `"${w.agama}"`,
        `"${w.pendidikan}"`,
        `"${w.pekerjaan}"`,
        `"${w.statusPerkawinan}"`,
        `"${w.statusHubunganKeluarga}"`,
        `"${(w.alamat || '').replace(/"/g, '""')}"`,
        `"${w.noHp || ''}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const fileName = `Data_Warga_RT02_${new Date().toISOString().split('T')[0]}.csv`;

      await uploadCsvToDrive(csvContent, fileName, rtFolder.id);
      setSuccessMessage(`Data Warga (.CSV) berhasil diekspor ke Google Drive (${fileName})!`);
      setTimeout(() => setSuccessMessage(null), 4500);
      loadFiles(currentFolderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengekspor CSV ke Google Drive.');
    } finally {
      setIsUploading(false);
    }
  };

  // Destructive Delete Execution (Strict confirmation)
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setSuccessMessage(`Berkas "${fileToDelete.name}" berhasil dihapus dari Google Drive.`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setFileToDelete(null);
      loadFiles(currentFolderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menghapus berkas dari Google Drive.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Navigate into a folder
  const handleOpenFolder = (folder: DriveFile) => {
    setCurrentFolderId(folder.id);
    setFolderHistory(prev => [...prev, { id: folder.id, name: folder.name }]);
  };

  // Navigate via breadcrumbs
  const handleBreadcrumbClick = (index: number) => {
    const target = folderHistory[index];
    setFolderHistory(prev => prev.slice(0, index + 1));
    setCurrentFolderId(target.id === 'root' ? undefined : target.id);
  };

  // Filtered files
  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
      if (activeFilter === 'folder') return isFolder;
      if (activeFilter === 'doc')
        return (
          file.mimeType.includes('document') ||
          file.mimeType.includes('word') ||
          file.name.endsWith('.doc') ||
          file.name.endsWith('.docx')
        );
      if (activeFilter === 'sheet')
        return (
          file.mimeType.includes('spreadsheet') ||
          file.mimeType.includes('excel') ||
          file.name.endsWith('.csv') ||
          file.name.endsWith('.xlsx')
        );
      if (activeFilter === 'pdf')
        return file.mimeType.includes('pdf') || file.name.endsWith('.pdf');
      if (activeFilter === 'image') return file.mimeType.startsWith('image/');
      return true;
    });
  }, [files, activeFilter]);

  // Helper for file type icon
  const renderFileIcon = (file: DriveFile) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-8 h-8 text-amber-600 fill-amber-100" />;
    }
    if (file.mimeType.includes('spreadsheet') || file.name.endsWith('.csv')) {
      return <FileSpreadsheet className="w-8 h-8 text-emerald-600" />;
    }
    if (file.mimeType.includes('document') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
      return <FileText className="w-8 h-8 text-blue-600" />;
    }
    if (file.mimeType.includes('pdf') || file.name.endsWith('.pdf')) {
      return <FileArchive className="w-8 h-8 text-rose-600" />;
    }
    if (file.mimeType.startsWith('image/')) {
      return <ImageIcon className="w-8 h-8 text-purple-600" />;
    }
    return <File className="w-8 h-8 text-stone-500" />;
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) return '-';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '-';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-stone-900 rounded-2xl p-6 text-white shadow-sm border border-amber-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-200 text-xs font-semibold border border-amber-500/30">
                <Cloud className="w-3.5 h-3.5" />
                <span>Integrasi Resmi Google Workspace</span>
              </div>
              {configuredFolderId && (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold border border-emerald-500/40"
                  title={`ID Folder Cadangan: ${configuredFolderId}`}
                >
                  <Folder className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Folder Kustom Aktif</span>
                </div>
              )}
              {configuredServiceEmail && (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold border border-blue-500/40"
                  title={`Email Service Account: ${configuredServiceEmail}`}
                >
                  <Users className="w-3.5 h-3.5 text-blue-300" />
                  <span className="max-w-[200px] truncate">{configuredServiceEmail}</span>
                </div>
              )}
            </div>
            <h1 className="text-2xl font-bold text-amber-50">Google Drive RT 02 Gasem Raya</h1>
            <p className="text-amber-200/90 text-sm max-w-2xl">
              Sinkronisasi dan simpan dokumen arsip RT, rekap data warga, laporan kas, dan cadangan sistem secara
              aman di penyimpanan awan Google Drive Anda.
            </p>
          </div>

          {/* Connect / User Info Section */}
          <div className="flex items-center gap-3">
            {!needsAuth && googleUser ? (
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
                {googleUser.photoURL ? (
                  <img
                    src={googleUser.photoURL}
                    alt={googleUser.displayName || 'Google User'}
                    className="w-9 h-9 rounded-full border border-white/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-amber-600 flex items-center justify-center font-bold text-white">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="text-left leading-tight pr-1">
                  <div className="font-semibold text-xs text-amber-50">{googleUser.displayName || 'Pengguna Google'}</div>
                  <div className="text-[11px] text-amber-200/80 truncate max-w-[140px]">{googleUser.email}</div>
                </div>
                <button
                  id="btn-disconnect-google"
                  onClick={handleGoogleLogout}
                  className="p-1.5 hover:bg-rose-500/20 text-rose-200 hover:text-rose-100 rounded-lg transition-colors"
                  title="Putus Sambungan Google Drive"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 hover:text-rose-800 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center gap-2 p-1 bg-stone-100/90 rounded-xl border border-stone-200/80">
          <button
            onClick={() => setActiveDriveTab('public')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeDriveTab === 'public'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Folder Berkas RT (Tanpa Sign-In)</span>
          </button>
          <button
            onClick={() => setActiveDriveTab('manage')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeDriveTab === 'manage'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Kelola & Cadangkan Data (Pengurus)</span>
            {!needsAuth && <span className="w-2 h-2 rounded-full bg-emerald-400" title="Akun Terhubung" />}
          </button>
        </div>

        {activeDriveTab === 'public' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFolderSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer"
              title="Atur Link / ID Folder Google Drive"
            >
              <Settings className="w-3.5 h-3.5 text-amber-700" />
              <span>Atur Folder</span>
            </button>
            {publicFolderId && (
              <a
                href={`https://drive.google.com/drive/folders/${publicFolderId}?usp=sharing`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di Google Drive</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* 1. TAMPILAN FOLDER PUBLIK (LANGSUNG TANPA SIGN-IN) */}
      {activeDriveTab === 'public' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-800 border border-amber-200">
                <Folder className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>Folder Berkas & Dokumen Terbuka RT 02</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                    Bebas Akses Tanpa Sign-In
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  Warga & pengurus dapat langsung membuka, melihat pratinjau, dan mendownload berkas di sini.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs font-medium">
                <button
                  onClick={() => setPublicViewMode('grid')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                    publicViewMode === 'grid' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Tampilan Kotak"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  onClick={() => setPublicViewMode('list')}
                  className={`px-2.5 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                    publicViewMode === 'list' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Tampilan Daftar"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
            </div>
          </div>

          {publicFolderId ? (
            <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
              <div className="bg-stone-50/90 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500">
                <span className="font-mono text-[11px] truncate max-w-md">
                  ID Folder: <span className="text-stone-700 font-semibold">{publicFolderId}</span>
                </span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Siap Diakses Langsung
                </span>
              </div>
              <div className="relative w-full h-[650px] bg-stone-100">
                <iframe
                  src={`https://drive.google.com/embeddedfolderview?id=${publicFolderId}#${publicViewMode}`}
                  title="Google Drive Folder RT Gasem Raya 02"
                  className="w-full h-full border-0"
                  allow="autoplay"
                />
              </div>
              <div className="p-3 bg-amber-50/70 border-t border-amber-200/60 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Jika berkas tidak muncul di dalam frame, pastikan akses folder di Google Drive disetel: <b>"Siapa saja yang memiliki link"</b> &rarr; <b>Pelihat</b>.
                  </span>
                </span>
                <a
                  href={`https://drive.google.com/drive/folders/${publicFolderId}?usp=sharing`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-800 hover:text-amber-950 font-semibold underline shrink-0 inline-flex items-center gap-1"
                >
                  Buka Folder di Tab Baru <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-amber-200 p-8 text-center space-y-4 shadow-2xs">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-center mx-auto text-amber-700">
                <Folder className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-stone-900">Folder Belum Diatur</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Masukkan link atau ID folder Google Drive RT Anda agar isi foldernya langsung tampil di sini tanpa warga harus login.
                </p>
              </div>
              <button
                onClick={() => setIsFolderSettingsOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span>Atur Link / ID Folder Google Drive</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. TAMPILAN KELOLA & CADANGKAN DATA (PENGURUS) */}
      {activeDriveTab === 'manage' && (
        <>
          {needsAuth ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-2xs space-y-6 max-w-xl mx-auto my-8">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
            <Cloud className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-stone-900">Hubungkan Akun Google Drive</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Untuk mengelola berkas, mengunggah dokumen warga, atau membuat cadangan data RT ke cloud, silakan
              hubungkan akun Google Drive Anda dengan izin akses yang aman.
            </p>
          </div>

          <div className="pt-2">
            {/* Official Style Sign in with Google Button */}
            <button
              id="btn-google-sign-in"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-sm text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 active:bg-stone-100 shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                />
                <path
                  fill="#4285F4"
                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                />
                <path
                  fill="#FBBC05"
                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                />
                <path
                  fill="#34A853"
                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                />
                <path fill="none" d="M0 0h48v48H0z" />
              </svg>
              <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
            </button>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 text-xs text-stone-500 text-left border border-stone-200/80 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <span>
              Aplikasi ini beroperasi dengan izin pengguna Anda secara transparan. Token akses hanya disimpan dalam
              memori sementara peramban dan tidak disimpan di media penyimpanan lokal.
            </span>
          </div>
        </div>
      ) : (
        /* When Authenticated: Full Google Drive Workspace */
        <div className="space-y-6">
          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Backup RT Data */}
            <button
              id="btn-drive-backup-all"
              onClick={handleBackupAllRtData}
              disabled={isUploading}
              className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/90 text-left transition-all shadow-2xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Database className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-amber-950">Cadangkan Data RT</div>
                <div className="text-[11px] text-amber-800 truncate">
                  Simpan warga, kas & AD/ART ke folder RT
                </div>
              </div>
            </button>

            {/* Export Warga CSV */}
            <button
              id="btn-drive-export-csv"
              onClick={handleExportWargaCsv}
              disabled={isUploading}
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/90 text-left transition-all shadow-2xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-emerald-950">Ekspor Warga (.CSV)</div>
                <div className="text-[11px] text-emerald-800 truncate">Simpan spreadsheet data penduduk</div>
              </div>
            </button>

            {/* Upload Local File */}
            <label
              id="label-drive-upload"
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200/90 text-left transition-all shadow-2xs group cursor-pointer"
            >
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <div className="w-10 h-10 rounded-lg bg-blue-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-blue-950">Unggah Berkas Baru</div>
                <div className="text-[11px] text-blue-800 truncate">
                  {isUploading ? 'Mengunggah...' : 'Upload PDF, Word, atau Foto'}
                </div>
              </div>
            </label>

            {/* Create New Folder */}
            <button
              id="btn-drive-new-folder"
              onClick={() => setIsNewFolderOpen(true)}
              className="flex items-center gap-3 p-4 rounded-xl bg-stone-50 hover:bg-stone-100/80 border border-stone-200/90 text-left transition-all shadow-2xs group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-700 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-stone-900">Buat Folder Baru</div>
                <div className="text-[11px] text-stone-600 truncate">Rapikan berkas per kategori</div>
              </div>
            </button>
          </div>

          {/* Browser Container */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
            {/* Top Toolbar */}
            <div className="p-4 border-b border-stone-200 space-y-3 bg-stone-50/50">
              {/* Breadcrumb Navigation */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <nav className="flex items-center gap-1.5 text-xs font-medium text-stone-600">
                  {folderHistory.map((f, idx) => (
                    <React.Fragment key={f.id}>
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone-400" />}
                      <button
                        onClick={() => handleBreadcrumbClick(idx)}
                        className={`hover:text-amber-700 transition-colors py-1 px-1.5 rounded-md hover:bg-stone-200/60 ${
                          idx === folderHistory.length - 1
                            ? 'font-bold text-stone-900 bg-stone-200/80'
                            : ''
                        }`}
                      >
                        {idx === 0 ? (
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>{f.name}</span>
                          </span>
                        ) : (
                          f.name
                        )}
                      </button>
                    </React.Fragment>
                  ))}
                </nav>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-refresh-drive"
                    onClick={() => loadFiles(currentFolderId)}
                    disabled={isLoading}
                    className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-all"
                    title="Segarkan daftar file"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Search & Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari berkas di Google Drive..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-600 focus:border-amber-600 bg-white"
                  />
                </div>

                {/* Filter chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {(
                    [
                      { id: 'all', label: 'Semua' },
                      { id: 'folder', label: 'Folder' },
                      { id: 'doc', label: 'Dokumen' },
                      { id: 'sheet', label: 'Spreadsheet' },
                      { id: 'pdf', label: 'PDF' },
                      { id: 'image', label: 'Gambar' },
                    ] as const
                  ).map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                        activeFilter === filter.id
                          ? 'bg-amber-700 text-white shadow-2xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Files List / Grid */}
            <div className="p-4">
              {isLoading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-stone-500 font-medium">Memuat berkas Google Drive...</p>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="py-16 text-center space-y-3 max-w-sm mx-auto">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                    <Cloud className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-stone-800">Tidak ada berkas yang ditemukan</p>
                  <p className="text-xs text-stone-500">
                    Folder ini masih kosong atau tidak ada berkas yang sesuai dengan kata kunci pencarian.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {filteredFiles.map(file => {
                    const isFolder = file.mimeType === 'application/vnd.google-apps.folder';

                    return (
                      <div
                        key={file.id}
                        className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/40 hover:bg-white hover:border-amber-300/80 hover:shadow-sm transition-all group flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div
                              onClick={() => isFolder && handleOpenFolder(file)}
                              className={`p-2 rounded-lg bg-white border border-stone-200/80 shadow-2xs ${
                                isFolder ? 'cursor-pointer hover:bg-amber-50' : ''
                              }`}
                            >
                              {renderFileIcon(file)}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                              {file.webViewLink && (
                                <a
                                  href={file.webViewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Buka di Google Drive"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              {file.webContentLink && (
                                <a
                                  href={file.webContentLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-stone-100 rounded-lg transition-colors"
                                  title="Unduh Berkas"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <button
                                id={`btn-delete-${file.id}`}
                                onClick={() => setFileToDelete(file)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Berkas dari Google Drive"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div
                            onClick={() => isFolder && handleOpenFolder(file)}
                            className={isFolder ? 'cursor-pointer' : ''}
                          >
                            <h3
                              className={`text-xs font-semibold text-stone-900 line-clamp-2 ${
                                isFolder ? 'hover:text-amber-700' : ''
                              }`}
                              title={file.name}
                            >
                              {file.name}
                            </h3>
                          </div>
                        </div>

                        <div className="pt-2.5 mt-2.5 border-t border-stone-200/60 flex items-center justify-between text-[10px] text-stone-500">
                          <span>{isFolder ? 'Folder' : formatFileSize(file.size)}</span>
                          <span>
                            {file.modifiedTime
                              ? new Date(file.modifiedTime).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                })
                              : '-'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </div>
          </div>
        )}
      </>
    )}

      {/* Modal Pengaturan Folder ID Google Drive */}
      {isFolderSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-amber-200 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-800" />
                <h3 className="font-bold text-stone-900 text-base">Atur Folder Google Drive RT</h3>
              </div>
              <button
                onClick={() => setIsFolderSettingsOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePublicFolderId} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">
                  Link Lengkap Folder atau Folder ID:
                </label>
                <input
                  type="text"
                  value={tempFolderInput}
                  onChange={e => setTempFolderInput(e.target.value)}
                  placeholder="Contoh: https://drive.google.com/drive/folders/1ABCxyz123... atau ID folder"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-700/30 focus:border-amber-700"
                />
                <p className="text-[11px] text-stone-500">
                  Anda bisa menempelkan URL sharing langsung dari Google Drive, sistem akan otomatis mengenali ID foldernya.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-700" /> Cara Agar Folder Terbuka Tanpa Harus Sign-In:
                </div>
                <ol className="list-decimal list-inside text-[11px] space-y-1 text-stone-700 pl-1">
                  <li>Buka folder Anda di Google Drive.</li>
                  <li>Klik kanan folder &rarr; pilih <b>Bagikan (Share)</b>.</li>
                  <li>Ubah bagian Akses umum dari <i>Dibatasi</i> menjadi <b>"Siapa saja yang memiliki link"</b>.</li>
                  <li>Pilih peran sebagai <b>Pelihat (Viewer)</b> agar aman.</li>
                  <li>Klik <b>Salin link</b> dan tempelkan ke kolom di atas lalu klik Simpan.</li>
                </ol>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFolderSettingsOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Simpan & Tampilkan Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-stone-900 text-sm">Buat Folder Baru di Drive</h3>
              </div>
              <button
                onClick={() => setIsNewFolderOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">Nama Folder</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dokumen Warga 2026"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:ring-2 focus:ring-amber-600"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newFolderName.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50"
                >
                  Buat Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANDATORY Explicit Destructive Action Confirmation Dialog */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-rose-200 space-y-4 animate-scaleUp">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-stone-900 text-sm">Hapus Berkas dari Google Drive?</h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Apakah Anda yakin ingin menghapus berkas{' '}
                  <span className="font-semibold text-stone-900">"{fileToDelete.name}"</span> secara permanen dari
                  akun Google Drive Anda?
                </p>
                <p className="text-[11px] text-rose-600 font-medium pt-1">
                  Peringatan: Tindakan penghapusan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
              <button
                id="btn-cancel-delete"
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
