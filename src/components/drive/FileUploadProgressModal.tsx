import React from 'react';
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  FileText,
  File,
  Folder,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export interface QueuedUploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

interface FileUploadProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  filesQueue: QueuedUploadFile[];
  targetFolderName?: string;
  targetFolderId?: string;
  needsAuth: boolean;
  isLoggingIn: boolean;
  loginError?: string | null;
  onLoginAndUpload: () => void;
  onStartUpload: () => void;
  isUploading: boolean;
  onRetryFailed: () => void;
}

export const FileUploadProgressModal: React.FC<FileUploadProgressModalProps> = ({
  isOpen,
  onClose,
  filesQueue,
  targetFolderName = 'Folder Terbuka RT 02',
  targetFolderId,
  needsAuth,
  isLoggingIn,
  loginError,
  onLoginAndUpload,
  onStartUpload,
  isUploading,
  onRetryFailed,
}) => {
  if (!isOpen || filesQueue.length === 0) return null;

  const totalFiles = filesQueue.length;
  const successCount = filesQueue.filter(f => f.status === 'success').length;
  const errorCount = filesQueue.filter(f => f.status === 'error').length;
  const isFinished = !isUploading && (successCount + errorCount === totalFiles);
  const isAllSuccess = isFinished && errorCount === 0 && successCount > 0;

  const hasAnyError = (queue: QueuedUploadFile[]) => queue.some(f => f.status === 'error');

  // Overall percentage calculation
  const totalProgress = Math.round(
    filesQueue.reduce((acc, f) => acc + (f.status === 'success' ? 100 : f.progress), 0) / totalFiles
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-progress-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white border border-stone-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-stone-900 to-amber-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 id="upload-progress-title" className="font-bold text-sm sm:text-base text-white">
                Unggah Berkas ke Google Drive
              </h3>
              <p className="text-[11px] text-amber-200/80 flex items-center gap-1">
                <Folder className="w-3 h-3" />
                <span>Tujuan: {targetFolderName}</span>
              </p>
            </div>
          </div>

          {!isUploading && (
            <button
              onClick={onClose}
              aria-label="Tutup jendela unggah"
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: JIKA MEMERLUKAN OTORISASI GOOGLE SIGN-IN */}
          {needsAuth ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-stone-800 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                    Otorisasi Akun Google Diperlukan
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Google Drive memerlukan izin dari akun Google Anda untuk menyimpan berkas. Berkas yang Anda pilih sudah siap, cukup hubungkan akun Google sekali ini untuk langsung mengunggah.
                  </p>
                </div>
              </div>

              {loginError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-rose-950">Gagal Menghubungkan Akun</p>
                      <p className="mt-0.5">{loginError}</p>
                    </div>
                  </div>
                  {loginError.includes('403') && (
                    <div className="bg-white/80 p-2.5 rounded-lg border border-rose-200/80 text-[11px] text-stone-700 space-y-1.5">
                      <p className="font-semibold text-rose-900">
                        Solusi Error 403 (access_denied):
                      </p>
                      <ol className="list-decimal list-inside space-y-1 pl-1">
                        <li>
                          Buka{' '}
                          <a
                            href="https://console.cloud.google.com/apis/credentials/consent"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-800 font-semibold underline inline-flex items-center gap-0.5"
                          >
                            Google Cloud Console <ExternalLink className="w-3 h-3 inline" />
                          </a>
                        </li>
                        <li>
                          Masuk menu <strong>OAuth consent screen</strong>.
                        </li>
                        <li>
                          Di bagian <strong>Test users</strong>, klik <strong>+ ADD USERS</strong> dan masukkan alamat email Google Anda, lalu Simpan.
                        </li>
                        <li>
                          <em>Atau</em> klik <strong>PUBLISH APP</strong> agar akun Google mana pun dapat masuk.
                        </li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onLoginAndUpload}
                  disabled={isLoggingIn}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow cursor-pointer active:scale-95 disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menghubungkan Akun Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 48 48">
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
                      </svg>
                      <span>Masuk dengan Google & Lanjutkan Unggah</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: PROGRES UNGGAH AKTIF */
            <div className="space-y-3">
              {/* Overall Progress Bar */}
              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-800">
                    {isAllSuccess
                      ? 'Semua Berkas Berhasil Diunggah!'
                      : isUploading
                      ? 'Sedang Mengunggah ke Google Drive...'
                      : hasAnyError(filesQueue)
                      ? 'Proses Unggah Sebagian Gagal'
                      : 'Siap Mengunggah'}
                  </span>
                  <span className="font-mono font-bold text-amber-900">{totalProgress}%</span>
                </div>

                <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isAllSuccess
                        ? 'bg-emerald-600'
                        : hasAnyError(filesQueue)
                        ? 'bg-amber-600'
                        : 'bg-amber-700'
                    }`}
                    style={{ width: `${totalProgress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>
                    Berhasil: <strong className="text-emerald-700">{successCount}</strong> / {totalFiles}
                  </span>
                  {errorCount > 0 && (
                    <span className="text-rose-700 font-semibold">
                      Gagal: {errorCount} berkas
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* DAFTAR BERKAS YANG DIPILIH */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-stone-700">Daftar Berkas ({totalFiles}):</div>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {filesQueue.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                    item.status === 'uploading'
                      ? 'border-amber-400 bg-amber-50/70 shadow-xs'
                      : item.status === 'success'
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : item.status === 'error'
                      ? 'border-rose-200 bg-rose-50/60'
                      : 'border-stone-200 bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 shrink-0">
                        <File className="w-4 h-4 text-amber-800" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-stone-900 truncate max-w-[220px] sm:max-w-[280px]">
                          {item.file.name}
                        </p>
                        <p className="text-[10px] text-stone-500">
                          {formatFileSize(item.file.size)} &bull; {item.file.type || 'Berkas Dokumen'}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {item.status === 'uploading' && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                          <RefreshCw className="w-3 h-3 animate-spin text-amber-700" />
                          <span>{item.progress}%</span>
                        </div>
                      )}
                      {item.status === 'success' && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Berhasil</span>
                        </div>
                      )}
                      {item.status === 'error' && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 font-bold text-[10px]">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Gagal</span>
                        </div>
                      )}
                      {item.status === 'pending' && (
                        <span className="text-[10px] text-stone-400 font-medium px-2 py-0.5 rounded bg-stone-100">
                          Menunggu
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Per-file Progress Bar */}
                  {item.status === 'uploading' && (
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-amber-600 transition-all duration-200"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Error details if failed */}
                  {item.status === 'error' && item.errorMessage && (
                    <p className="text-[11px] text-rose-700 bg-rose-100/60 p-1.5 rounded-lg">
                      {item.errorMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between gap-2 shrink-0">
          <div className="text-xs text-stone-500">
            {isUploading ? (
              <span className="flex items-center gap-1.5 font-medium text-amber-800">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Sedang mengirim byte ke Google Drive...
              </span>
            ) : isAllSuccess ? (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Siap digunakan di folder RT!
              </span>
            ) : (
              <span>{targetFolderName}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!needsAuth && !isUploading && !isFinished && (
              <button
                type="button"
                onClick={onStartUpload}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow transition-all cursor-pointer active:scale-95"
              >
                Mulai Unggah
              </button>
            )}

            {errorCount > 0 && !isUploading && (
              <button
                type="button"
                onClick={onRetryFailed}
                className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs hover:bg-amber-200 transition-all cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Coba Lagi Berkas Gagal</span>
              </button>
            )}

            {isFinished && targetFolderId && (
              <a
                href={`https://drive.google.com/drive/folders/${targetFolderId}?usp=sharing`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Lihat di Drive</span>
              </a>
            )}

            {!isUploading && (
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isAllSuccess
                    ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {isAllSuccess ? 'Selesai' : 'Tutup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function hasAnyError(queue: QueuedUploadFile[]): boolean {
  return queue.some(f => f.status === 'error');
}
