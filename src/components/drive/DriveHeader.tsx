import React from 'react';
import { Cloud, Folder, Users, User, LogOut } from 'lucide-react';

interface DriveHeaderProps {
  configuredFolderId?: string;
  configuredServiceEmail?: string;
  needsAuth: boolean;
  googleUser: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
  onLogout: () => void;
}

export const DriveHeader: React.FC<DriveHeaderProps> = ({
  configuredFolderId,
  configuredServiceEmail,
  needsAuth,
  googleUser,
  onLogout,
}) => {
  return (
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
                onClick={onLogout}
                className="p-1.5 hover:bg-rose-500/20 text-rose-200 hover:text-rose-100 rounded-lg transition-colors cursor-pointer"
                title="Putus Sambungan Google Drive"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
