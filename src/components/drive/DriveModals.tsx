import React from 'react';
import { FolderPlus, ShieldAlert, FolderInput, X, Trash2 } from 'lucide-react';
import { DriveFile } from '../../services/googleDriveApi';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  newFolderName: string;
  setNewFolderName: (val: string) => void;
  onCreateFolder: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const NewFolderModal: React.FC<NewFolderModalProps> = ({
  isOpen,
  onClose,
  newFolderName,
  setNewFolderName,
  onCreateFolder,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-stone-900 text-sm">Buat Folder Baru di Drive</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onCreateFolder} className="space-y-4">
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
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading || !newFolderName.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-amber-700 hover:bg-amber-800 disabled:opacity-50 cursor-pointer"
            >
              Buat Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmationModalProps {
  fileToDelete: DriveFile | null;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  fileToDelete,
  onCancel,
  onConfirm,
  isDeleting,
}) => {
  if (!fileToDelete) return null;

  return (
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
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            id="btn-confirm-delete"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface MoveFileModalProps {
  fileToMove: DriveFile | null;
  onCancel: () => void;
  onConfirm: () => void;
  isMoving: boolean;
  targetMoveFolderId: string;
  setTargetMoveFolderId: (id: string) => void;
  publicFolderId?: string;
  configuredFolderId?: string;
  folderList: DriveFile[];
}

export const MoveFileModal: React.FC<MoveFileModalProps> = ({
  fileToMove,
  onCancel,
  onConfirm,
  isMoving,
  targetMoveFolderId,
  setTargetMoveFolderId,
  publicFolderId,
  configuredFolderId,
  folderList,
}) => {
  if (!fileToMove) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-blue-200 space-y-4 animate-scaleUp">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2 text-blue-900">
            <FolderInput className="w-5 h-5 text-blue-700" />
            <h3 className="font-bold text-sm">Pindahkan Berkas / Folder</h3>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1 text-xs text-stone-600">
          <p>Pilih folder tujuan untuk:</p>
          <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 font-semibold text-stone-900 truncate flex items-center gap-2">
            <span>📁</span>
            <span className="truncate">{fileToMove.name}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-stone-700 block">Pilih Folder Tujuan:</label>
          <select
            value={targetMoveFolderId}
            onChange={e => setTargetMoveFolderId(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
          >
            <option value="root">📂 Folder Utama (Google Drive Saya / Root)</option>
            {publicFolderId && (
              <option value={publicFolderId}>📁 Folder Berkas & Dokumen Terbuka RT 02</option>
            )}
            {configuredFolderId && configuredFolderId !== publicFolderId && (
              <option value={configuredFolderId}>📂 Folder Khusus RT Gasem (Kustom)</option>
            )}
            {folderList
              .filter(f => f.mimeType === 'application/vnd.google-apps.folder' && f.id !== fileToMove.id)
              .map(f => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isMoving}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isMoving}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FolderInput className="w-3.5 h-3.5" />
            <span>{isMoving ? 'Memindahkan...' : 'Pindahkan Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
