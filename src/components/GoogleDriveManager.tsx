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
  Copy,
  FolderInput,
  Eye,
  Sparkles,
} from 'lucide-react';
import {
  DriveFile,
  listDriveFiles,
  createDriveFolder,
  uploadDriveFile,
  uploadJsonToDrive,
  uploadCsvToDrive,
  deleteDriveFile,
  copyDriveFile,
  moveDriveFile,
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
import { DriveHeader } from './drive/DriveHeader';
import { PublicFolderSettingsModal } from './drive/PublicFolderSettingsModal';
import { NewFolderModal, DeleteConfirmationModal, MoveFileModal } from './drive/DriveModals';
import { DriveQuickActions } from './drive/DriveQuickActions';
import { FileUploadProgressModal, QueuedUploadFile } from './drive/FileUploadProgressModal';

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
  const [publicSubView, setPublicSubView] = useState<'embed' | 'interactive'>('embed');
  const [iframeRefreshKey, setIframeRefreshKey] = useState<number>(0);
  const [isFolderSettingsOpen, setIsFolderSettingsOpen] = useState<boolean>(false);

  const handleSavePublicFolderId = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractDriveFolderId(tempFolderInput);
    setCustomFolderId(cleanId);
    setPublicFolderId(cleanId);
    setIsFolderSettingsOpen(false);
    setSuccessMessage(cleanId ? 'ID Folder Google Drive berhasil disimpan!' : 'Pengaturan folder dikosongkan.');
    setTimeout(() => setSuccessMessage(null), 3500);
    setIframeRefreshKey(prev => prev + 1);
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

  // Upload Progress & Queue state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<QueuedUploadFile[]>([]);
  const [uploadTargetFolder, setUploadTargetFolder] = useState<{ id?: string; name: string }>({
    id: undefined,
    name: 'Folder Terbuka RT 02',
  });

  // Destructive Confirmation Modal
  const [fileToDelete, setFileToDelete] = useState<DriveFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Drag & Drop State
  const [isDragOver, setIsDragOver] = useState(false);

  // Move & Copy State
  const [fileToMove, setFileToMove] = useState<DriveFile | null>(null);
  const [targetMoveFolderId, setTargetMoveFolderId] = useState<string>('root');
  const [isMoving, setIsMoving] = useState(false);
  const [isCopying, setIsCopying] = useState<string | null>(null);

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
  const handleGoogleLogin = async (): Promise<boolean> => {
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
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Gagal masuk dengan akun Google.');
      return false;
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

  // Switch to interactive view for RT Public Folder
  const handleSwitchToInteractive = () => {
    setPublicSubView('interactive');
    if (publicFolderId) {
      setCurrentFolderId(publicFolderId);
      setFolderHistory([
        { id: publicFolderId, name: 'Folder Terbuka RT 02' },
      ]);
      if (!needsAuth) {
        loadFiles(publicFolderId);
      }
    }
  };

  const handleSwitchToEmbed = () => {
    setPublicSubView('embed');
    setIframeRefreshKey(prev => prev + 1);
  };

  const handleOpenRtFolderInManage = () => {
    if (publicFolderId) {
      setCurrentFolderId(publicFolderId);
      setFolderHistory([
        { id: 'root', name: 'Google Drive Saya' },
        { id: publicFolderId, name: 'Folder Terbuka RT 02' },
      ]);
      loadFiles(publicFolderId);
    }
  };

  // Create Folder
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsLoading(true);
    try {
      const parent = currentFolderId && currentFolderId !== 'root' ? currentFolderId : (publicFolderId || undefined);
      await createDriveFolder(newFolderName.trim(), parent);
      setNewFolderName('');
      setIsNewFolderOpen(false);
      setSuccessMessage(`Folder "${newFolderName}" berhasil dibuat!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setIframeRefreshKey(prev => prev + 1);
      loadFiles(currentFolderId || publicFolderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat folder di Google Drive.');
    } finally {
      setIsLoading(false);
    }
  };

  // Process Upload Queue sequentially with real-time progress tracking
  const processUploadQueue = async (
    queue: QueuedUploadFile[],
    targetFolderId?: string
  ) => {
    setIsUploading(true);
    setErrorMessage(null);

    const updatedQueue = [...queue];

    for (let i = 0; i < updatedQueue.length; i++) {
      // If already succeeded, skip
      if (updatedQueue[i].status === 'success') continue;

      // Mark current file as uploading with initial progress
      updatedQueue[i] = {
        ...updatedQueue[i],
        status: 'uploading',
        progress: 15,
        errorMessage: undefined,
      };
      setUploadQueue([...updatedQueue]);

      try {
        await uploadDriveFile(
          updatedQueue[i].file,
          updatedQueue[i].file.name,
          updatedQueue[i].file.type,
          targetFolderId,
          (pct: number) => {
            updatedQueue[i] = {
              ...updatedQueue[i],
              progress: pct,
            };
            setUploadQueue([...updatedQueue]);
          }
        );

        updatedQueue[i] = {
          ...updatedQueue[i],
          status: 'success',
          progress: 100,
        };
        setUploadQueue([...updatedQueue]);
      } catch (err: any) {
        console.error('Upload failed for file:', updatedQueue[i].file.name, err);
        updatedQueue[i] = {
          ...updatedQueue[i],
          status: 'error',
          errorMessage: err?.message || 'Gagal mengunggah berkas ke Google Drive.',
        };
        setUploadQueue([...updatedQueue]);
      }
    }

    setIsUploading(false);

    const successCount = updatedQueue.filter(f => f.status === 'success').length;
    if (successCount > 0) {
      setSuccessMessage(`${successCount} berkas berhasil diunggah ke Google Drive!`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setIframeRefreshKey(prev => prev + 1);
      loadFiles(targetFolderId || currentFolderId);
    }
  };

  // Upload Local File
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetFolderOverride?: string
  ) => {
    const rawFiles = e.target.files ? (Array.from(e.target.files) as File[]) : [];
    if (rawFiles.length === 0) return;

    // Reset input value so same files can be re-selected if needed
    e.target.value = '';

    const parentId =
      targetFolderOverride !== undefined
        ? targetFolderOverride
        : currentFolderId && currentFolderId !== 'root'
        ? currentFolderId
        : (publicFolderId || undefined);

    const folderName =
      parentId === publicFolderId || !parentId
        ? 'Folder Terbuka RT 02'
        : folderHistory.find(f => f.id === parentId)?.name || 'Folder Google Drive';

    const newQueue: QueuedUploadFile[] = rawFiles.map(f => ({
      file: f,
      status: 'pending',
      progress: 0,
    }));

    setUploadQueue(newQueue);
    setUploadTargetFolder({ id: parentId, name: folderName });
    setIsUploadModalOpen(true);

    if (!needsAuth) {
      await processUploadQueue(newQueue, parentId);
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent, targetFolderOverride?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files) as File[];

      const parentId =
        targetFolderOverride !== undefined
          ? targetFolderOverride
          : currentFolderId && currentFolderId !== 'root'
          ? currentFolderId
          : (publicFolderId || undefined);

      const folderName =
        parentId === publicFolderId || !parentId
          ? 'Folder Terbuka RT 02'
          : folderHistory.find(f => f.id === parentId)?.name || 'Folder Google Drive';

      const newQueue: QueuedUploadFile[] = droppedFiles.map(f => ({
        file: f,
        status: 'pending',
        progress: 0,
      }));

      setUploadQueue(newQueue);
      setUploadTargetFolder({ id: parentId, name: folderName });
      setIsUploadModalOpen(true);

      if (!needsAuth) {
        await processUploadQueue(newQueue, parentId);
      }
    }
  };

  const handleLoginAndUploadQueue = async () => {
    const success = await handleGoogleLogin();
    if (success) {
      await processUploadQueue(uploadQueue, uploadTargetFolder.id);
    }
  };

  const handleRetryFailedUploads = async () => {
    await processUploadQueue(uploadQueue, uploadTargetFolder.id);
  };

  // Copy File Handler
  const handleCopyFile = async (file: DriveFile) => {
    setIsCopying(file.id);
    setErrorMessage(null);
    try {
      const parent = currentFolderId && currentFolderId !== 'root' ? currentFolderId : (publicFolderId || undefined);
      const copyName = file.name.includes('.')
        ? file.name.replace(/(\.[^.]+)$/, ' (Salinan)$1')
        : `${file.name} (Salinan)`;
      await copyDriveFile(file.id, copyName, parent);
      setSuccessMessage(`Berkas "${file.name}" berhasil disalin!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setIframeRefreshKey(prev => prev + 1);
      loadFiles(currentFolderId || publicFolderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyalin berkas.');
    } finally {
      setIsCopying(null);
    }
  };

  // Move File Handler
  const handleConfirmMove = async () => {
    if (!fileToMove) return;
    setIsMoving(true);
    setErrorMessage(null);
    try {
      const oldParent = currentFolderId && currentFolderId !== 'root' ? currentFolderId : (publicFolderId || undefined);
      const newParent = targetMoveFolderId;
      await moveDriveFile(fileToMove.id, newParent, oldParent);
      setSuccessMessage(`Berkas "${fileToMove.name}" berhasil dipindahkan!`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setFileToMove(null);
      setIframeRefreshKey(prev => prev + 1);
      loadFiles(currentFolderId || publicFolderId);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memindahkan berkas.');
    } finally {
      setIsMoving(false);
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
      setIframeRefreshKey(prev => prev + 1);
      loadFiles(currentFolderId || publicFolderId);
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
    if (target.id === 'root') {
      setCurrentFolderId(undefined);
    } else {
      setCurrentFolderId(target.id);
    }
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

  // Reusable File Browser Component (Digunakan di Folder Publik Interaktif dan Kelola Data)
  const renderFileBrowser = () => (
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
                      {f.id === 'root' ? <HardDrive className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5 text-amber-700" />}
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
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-all cursor-pointer"
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
                        {/* Copy Button (hanya berkas) */}
                        {!isFolder && (
                          <button
                            onClick={() => handleCopyFile(file)}
                            disabled={isCopying === file.id}
                            className="p-1.5 text-stone-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Salin / Duplikasi Berkas"
                          >
                            <Copy className={`w-3.5 h-3.5 ${isCopying === file.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}

                        {/* Move Button */}
                        <button
                          onClick={() => {
                            setFileToMove(file);
                            setTargetMoveFolderId(currentFolderId && currentFolderId !== 'root' ? currentFolderId : (publicFolderId || 'root'));
                          }}
                          className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Pindahkan Berkas/Folder ke Folder Lain"
                        >
                          <FolderInput className="w-3.5 h-3.5" />
                        </button>

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
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <DriveHeader
        configuredFolderId={configuredFolderId}
        configuredServiceEmail={configuredServiceEmail}
        needsAuth={needsAuth}
        googleUser={googleUser}
        onLogout={handleGoogleLogout}
      />

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2.5 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm shadow-2xs space-y-3">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-950">Terjadi Kesalahan</p>
                <p className="text-xs sm:text-sm text-rose-800 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 p-1 rounded-md cursor-pointer shrink-0"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errorMessage.includes('403') && (
            <div className="p-3.5 bg-white/90 rounded-xl border border-rose-200 text-xs text-stone-700 space-y-2">
              <p className="font-bold text-rose-900 flex items-center gap-1.5">
                <span>💡 Cara Mengatasi Error 403 (access_denied) di Google Cloud Console:</span>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg">
                  <span className="font-bold text-amber-900 text-[11px] block mb-1">
                    Solusi 1 (Cepat untuk Akun Anda): Tambah Test User
                  </span>
                  <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
                    Aplikasi masih status "Testing". Masukkan email Google Anda ke daftar pengguna penguji:
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-stone-600 space-y-1 pl-1">
                    <li>Buka <a href="https://console.cloud.google.com/apis/credentials/consent" target="_blank" rel="noopener noreferrer" className="text-amber-800 font-semibold underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink className="w-2.5 h-2.5 inline" /></a></li>
                    <li>Pilih menu <strong>OAuth consent screen</strong></li>
                    <li>Di bagian <strong>Test users</strong>, klik <strong>+ ADD USERS</strong></li>
                    <li>Ketik email Google Anda lalu klik <strong>Save</strong></li>
                  </ol>
                </div>

                <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-lg">
                  <span className="font-bold text-blue-900 text-[11px] block mb-1">
                    Solusi 2 (Untuk Semua Warga): Publish App
                  </span>
                  <p className="text-[11px] text-stone-600 mb-2 leading-relaxed">
                    Agar akun Google siapa pun dapat terhubung tanpa batasan email:
                  </p>
                  <ol className="list-decimal list-inside text-[11px] text-stone-600 space-y-1 pl-1">
                    <li>Di halaman <strong>OAuth consent screen</strong></li>
                    <li>Klik tombol <strong>PUBLISH APP</strong></li>
                    <li>Konfirmasi untuk mengubah status menjadi <strong>In production</strong></li>
                  </ol>
                </div>
              </div>
            </div>
          )}
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

      {/* 1. TAMPILAN FOLDER PUBLIK / RT 02 */}
      {activeDriveTab === 'public' && (
        <div className="space-y-4">
          {/* Sub Header & Switcher */}
          <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-800 border border-amber-200">
                <Folder className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <span>Folder Berkas & Dokumen Terbuka RT 02</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                    {publicSubView === 'embed' ? 'Bebas Akses Tanpa Sign-In' : 'Mode Pengelola Interaktif'}
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  {publicSubView === 'embed'
                    ? 'Warga & pengurus dapat langsung melihat pratinjau, mengunduh, dan drag & drop berkas ke sini.'
                    : 'Pengurus dapat mengunggah (drag & drop), membuat folder, memindahkan, menyalin, dan menghapus berkas.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Switch View: Embed vs Interactive */}
              <div className="flex items-center p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs font-medium">
                <button
                  onClick={handleSwitchToEmbed}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${
                    publicSubView === 'embed'
                      ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Tampilan Pratinjau Google Drive Bawaan"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-700" />
                  <span>Pratinjau Drive</span>
                </button>
                <button
                  onClick={handleSwitchToInteractive}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer transition-colors ${
                    publicSubView === 'interactive'
                      ? 'bg-white text-stone-900 font-semibold shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Pengelola Berkas RT (Drag & Drop, Pindah, Salin, Hapus, Buat Folder)"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>Pengelola Lengkap</span>
                </button>
              </div>

              {publicSubView === 'embed' && (
                <div className="flex items-center p-1 bg-stone-100 rounded-lg border border-stone-200 text-xs font-medium">
                  <button
                    onClick={() => setPublicViewMode('grid')}
                    className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                      publicViewMode === 'grid' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Tampilan Kotak"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPublicViewMode('list')}
                    className={`px-2 py-1 rounded flex items-center gap-1 cursor-pointer transition-colors ${
                      publicViewMode === 'list' ? 'bg-white text-stone-900 font-semibold shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                    title="Tampilan Daftar"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SUB-VIEW 1: EMBED VIEW DENGAN DRAG & DROP UPLOAD ZONE */}
          {publicSubView === 'embed' && (
            <>
              {publicFolderId ? (
                <div className="space-y-3">
                  {/* Drag & Drop Upload Zone on Public View */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, publicFolderId)}
                    className={`rounded-2xl border-2 border-dashed p-4 text-center transition-all ${
                      isDragOver
                        ? 'border-amber-600 bg-amber-50/95 scale-[1.008] shadow-md'
                        : 'border-stone-300 hover:border-amber-500/70 bg-stone-50/70 hover:bg-stone-50'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      id="drag-drop-input-public"
                      onChange={e => handleFileUpload(e, publicFolderId)}
                      className="hidden"
                    />
                    <label
                      htmlFor="drag-drop-input-public"
                      className="cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-3 px-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                            isDragOver
                              ? 'bg-amber-700 text-white animate-bounce'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <div className="text-left space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold text-stone-800">
                            {isDragOver
                              ? 'Lepaskan Berkas di Sini untuk Mengunggah ke Folder RT 02!'
                              : 'Tarik & Letakkan (Drag & Drop) Berkas ke Sini untuk Mengunggah'}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Langsung tersimpan ke Folder RT 02, atau{' '}
                            <span className="text-amber-700 font-semibold underline">klik untuk pilih berkas</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUploading && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-lg">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Mengunggah...
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitchToInteractive();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-100 text-[11px] font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                          title="Buka Pengelola Berkas Lengkap"
                        >
                          <Sparkles className="w-3 h-3 text-amber-700" />
                          <span>Pindah / Salin / Hapus Berkas</span>
                        </button>
                      </div>
                    </label>
                  </div>

                  {/* Embedded Iframe Container */}
                  <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col">
                    <div className="bg-stone-50/90 px-4 py-2 border-b border-stone-200 flex items-center justify-between text-xs text-stone-500">
                      <span className="font-mono text-[11px] truncate max-w-md">
                        ID Folder: <span className="text-stone-700 font-semibold">{publicFolderId}</span>
                      </span>
                      <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <button
                          onClick={() => setIframeRefreshKey(prev => prev + 1)}
                          className="hover:text-emerald-900 p-1 rounded hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Segarkan Pratinjau Google"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" /> Siap Diakses Langsung
                        </span>
                      </div>
                    </div>
                    <div className="relative w-full h-[650px] bg-stone-100">
                      <iframe
                        key={iframeRefreshKey}
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
                          Kotak pratinjau Google di atas diproteksi khusus untuk pelihat. Untuk memindahkan, menyalin, membuat folder, atau menghapus berkas, klik tombol <b>Pengelola Lengkap</b> di atas.
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
            </>
          )}

          {/* SUB-VIEW 2: INTERACTIVE FILE MANAGER (DRAG & DROP, BUAT FOLDER, PINDAH, SALIN, HAPUS) */}
          {publicSubView === 'interactive' && (
            <div className="space-y-4">
              {needsAuth ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center shadow-2xs space-y-5 max-w-xl mx-auto my-4">
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-center mx-auto text-amber-700 shadow-2xs">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-stone-900">
                      Masuk dengan Google (Pengurus RT)
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                      Untuk mengunggah berkas via Drag & Drop, membuat folder baru, menyalin, memindahkan, atau menghapus berkas di Folder RT 02, Google Drive API memerlukan otentikasi akun Google Pengurus.
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoggingIn}
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-sm text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 active:bg-stone-100 shadow-sm transition-all cursor-pointer disabled:opacity-60"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                      <span>{isLoggingIn ? 'Menghubungkan...' : 'Sign in with Google (Pengurus)'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Action Bar for Interactive RT Folder */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/60 p-3 rounded-xl border border-amber-200/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-950">Lokasi:</span>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-200 flex items-center gap-1.5">
                        <Folder className="w-3.5 h-3.5 text-amber-700" />
                        <span>Folder Berkas RT 02</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsNewFolderOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>Buat Folder Baru</span>
                      </button>
                      <button
                        onClick={() => loadFiles(currentFolderId)}
                        disabled={isLoading}
                        className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg border border-stone-200 transition-all cursor-pointer"
                        title="Segarkan Berkas"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Drag & Drop Upload Zone */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={e => handleDrop(e, currentFolderId || publicFolderId)}
                    className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                      isDragOver
                        ? 'border-amber-600 bg-amber-50/90 scale-[1.01] shadow-md'
                        : 'border-stone-300 hover:border-amber-500/70 bg-stone-50/60 hover:bg-stone-50/90'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      id="drag-drop-input-interactive"
                      onChange={e => handleFileUpload(e, currentFolderId || publicFolderId)}
                      className="hidden"
                    />
                    <label
                      htmlFor="drag-drop-input-interactive"
                      className="cursor-pointer flex flex-col items-center justify-center gap-2"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                          isDragOver
                            ? 'bg-amber-700 text-white animate-bounce'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-stone-800">
                          {isDragOver
                            ? 'Lepaskan Berkas di Sini untuk Mengunggah Langsung!'
                            : 'Tarik & Letakkan (Drag and Drop) Berkas ke Sini'}
                        </p>
                        <p className="text-xs text-stone-500">
                          Mendukung banyak file sekaligus, atau{' '}
                          <span className="text-amber-700 font-semibold underline">
                            klik untuk pilih dari komputer / HP
                          </span>
                        </p>
                      </div>
                      {isUploading && (
                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sedang mengunggah berkas...
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Browser Container Render */}
                  {renderFileBrowser()}
                </div>
              )}
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
          <DriveQuickActions
            onBackupAll={handleBackupAllRtData}
            onExportCsv={handleExportWargaCsv}
            onFileUpload={handleFileUpload}
            onOpenNewFolder={() => setIsNewFolderOpen(true)}
            isUploading={isUploading}
          />

          {/* Shortcut to RT 02 Public Folder */}
          {publicFolderId && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-3.5 rounded-xl border border-amber-200 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-800">
                  <Folder className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950">Folder Berkas & Dokumen Terbuka RT 02</div>
                  <div className="text-[11px] text-amber-800">
                    ID: <span className="font-mono font-semibold">{publicFolderId}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleOpenRtFolderInManage}
                className="px-3.5 py-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buka & Kelola Folder RT 02</span>
              </button>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              isDragOver
                ? 'border-amber-600 bg-amber-50/90 scale-[1.01] shadow-md'
                : 'border-stone-300 hover:border-amber-500/70 bg-stone-50/60 hover:bg-stone-50/90'
            }`}
          >
            <input
              type="file"
              multiple
              id="drag-drop-input"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="drag-drop-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragOver
                    ? 'bg-amber-700 text-white animate-bounce'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-stone-800">
                  {isDragOver
                    ? 'Lepaskan Berkas di Sini untuk Mengunggah Langsung!'
                    : 'Tarik & Letakkan (Drag and Drop) Berkas ke Sini'}
                </p>
                <p className="text-xs text-stone-500">
                  Mendukung banyak file sekaligus, atau{' '}
                  <span className="text-amber-700 font-semibold underline">
                    klik untuk pilih dari komputer / HP
                  </span>
                </p>
              </div>
              {isUploading && (
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-100/90 px-3 py-1 rounded-full">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Sedang mengunggah berkas...
                </div>
              )}
            </label>
          </div>

          {/* Browser Container */}
          {renderFileBrowser()}
        </div>
      )}
      </>
    )}

      {/* 1. Modal Pengaturan Folder ID Google Drive */}
      <PublicFolderSettingsModal
        isOpen={isFolderSettingsOpen}
        onClose={() => setIsFolderSettingsOpen(false)}
        tempFolderInput={tempFolderInput}
        setTempFolderInput={setTempFolderInput}
        onSave={handleSavePublicFolderId}
      />

      {/* 2. New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        onCreateFolder={handleCreateFolder}
        isLoading={isLoading}
      />

      {/* 3. Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        fileToDelete={fileToDelete}
        onCancel={() => setFileToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* 4. Move File Modal */}
      <MoveFileModal
        fileToMove={fileToMove}
        onCancel={() => setFileToMove(null)}
        onConfirm={handleConfirmMove}
        isMoving={isMoving}
        targetMoveFolderId={targetMoveFolderId}
        setTargetMoveFolderId={setTargetMoveFolderId}
        publicFolderId={publicFolderId}
        configuredFolderId={configuredFolderId}
        folderList={files}
      />

      {/* 5. Modal Progres & Otorisasi Unggah Berkas */}
      <FileUploadProgressModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        filesQueue={uploadQueue}
        targetFolderName={uploadTargetFolder.name}
        targetFolderId={uploadTargetFolder.id || publicFolderId}
        needsAuth={needsAuth}
        isLoggingIn={isLoggingIn}
        loginError={errorMessage}
        onLoginAndUpload={handleLoginAndUploadQueue}
        onStartUpload={() => processUploadQueue(uploadQueue, uploadTargetFolder.id)}
        isUploading={isUploading}
        onRetryFailed={handleRetryFailedUploads}
      />
    </div>
  );
};
