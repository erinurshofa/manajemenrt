import React from 'react';
import { ShieldAlert, X, ArrowLeftRight, Terminal } from 'lucide-react';
import { UserRole } from '../../types';
import { ROLE_DEFINITIONS } from '../../utils/permissions';

interface DevRoleBannerProps {
  simulatedRole: UserRole | null;
  onResetToDeveloper: () => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenDevTools: () => void;
}

export const DevRoleBanner: React.FC<DevRoleBannerProps> = ({
  simulatedRole,
  onResetToDeveloper,
  onSwitchRole,
  onOpenDevTools,
}) => {
  if (!simulatedRole || simulatedRole === 'developer') {
    return null;
  }

  const roleInfo = ROLE_DEFINITIONS[simulatedRole] || {
    title: simulatedRole,
    badgeLabel: simulatedRole,
  };

  const quickRoles: { role: UserRole; label: string }[] = [
    { role: 'ketua_rt', label: 'Ketua RT' },
    { role: 'sekretaris', label: 'Sekretaris' },
    { role: 'bendahara', label: 'Bendahara' },
    { role: 'warga', label: 'Warga' },
  ];

  return (
    <aside
      aria-label="Mode Simulasi Pengembang"
      className="sticky top-0 z-50 bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 text-white px-3 py-2 sm:px-4 sm:py-2.5 shadow-md border-b border-violet-500/40 no-print flex flex-wrap items-center justify-between gap-2"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1 rounded-md bg-amber-400 text-stone-900 shrink-0 animate-pulse">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs sm:text-sm">
          <span className="font-semibold text-violet-200">Mode Simulasi Aktif:</span>
          <span className="px-2 py-0.5 rounded-md bg-violet-800 border border-violet-400/50 font-bold text-amber-300">
            {roleInfo.title}
          </span>
          <span className="hidden md:inline text-[11px] text-violet-300">
            (Tampilan & batasan izin disesuaikan dengan peran ini)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {/* Quick Switch Chips */}
        <div className="hidden lg:flex items-center gap-1 text-[11px] mr-1">
          <span className="text-violet-300 flex items-center gap-1">
            <ArrowLeftRight className="w-3 h-3" /> Ganti ke:
          </span>
          {quickRoles.map(r => (
            <button
              key={r.role}
              type="button"
              onClick={() => onSwitchRole(r.role)}
              disabled={simulatedRole === r.role}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                simulatedRole === r.role
                  ? 'bg-violet-600 text-white font-bold'
                  : 'bg-white/10 hover:bg-white/20 text-violet-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Dev Tools Shortcut */}
        <button
          type="button"
          onClick={onOpenDevTools}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 text-violet-100 text-xs font-medium transition-colors cursor-pointer"
          title="Buka panel Developer Tools"
        >
          <Terminal className="w-3.5 h-3.5 text-amber-300" />
          <span className="hidden sm:inline">DevTools</span>
        </button>

        {/* Exit Simulation Button */}
        <button
          type="button"
          onClick={onResetToDeveloper}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all shadow cursor-pointer active:scale-95"
          title="Keluar dari mode simulasi dan kembali ke hak akses penuh Developer"
        >
          <X className="w-3.5 h-3.5" />
          <span>Kembali ke Developer Root</span>
        </button>
      </div>
    </aside>
  );
};
