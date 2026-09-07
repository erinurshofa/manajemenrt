import React from 'react';
import { Settings, X, ShieldCheck } from 'lucide-react';

interface PublicFolderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempFolderInput: string;
  setTempFolderInput: (val: string) => void;
  onSave: (e: React.FormEvent) => void;
}

export const PublicFolderSettingsModal: React.FC<PublicFolderSettingsModalProps> = ({
  isOpen,
  onClose,
  tempFolderInput,
  setTempFolderInput,
  onSave,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-amber-200 max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-800" />
            <h3 className="font-bold text-stone-900 text-base">Atur Folder Google Drive RT</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4">
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
              onClick={onClose}
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
  );
};
