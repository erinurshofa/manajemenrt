import React from 'react';
import { Database, FileSpreadsheet, UploadCloud, FolderPlus } from 'lucide-react';

interface DriveQuickActionsProps {
  onBackupAll: () => void;
  onExportCsv: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenNewFolder: () => void;
  isUploading: boolean;
}

export const DriveQuickActions: React.FC<DriveQuickActionsProps> = ({
  onBackupAll,
  onExportCsv,
  onFileUpload,
  onOpenNewFolder,
  isUploading,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Backup RT Data */}
      <button
        id="btn-drive-backup-all"
        onClick={onBackupAll}
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
        onClick={onExportCsv}
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
          onChange={onFileUpload}
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
        onClick={onOpenNewFolder}
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
  );
};
