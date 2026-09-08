import React from 'react';
import { X, User, Home, Edit2, Phone, Calendar, MapPin, Briefcase, Heart, Award, Lock } from 'lucide-react';
import { Warga, KartuKeluargaData, UserSession } from '../types';
import { formatTanggalIndo, hitungUsia } from '../utils/calculations';
import { maskNik, maskNoKk, maskNoHp } from '../utils/security';
import { canManageWarga } from '../utils/permissions';

interface ModalDetailWargaProps {
  isOpen: boolean;
  onClose: () => void;
  warga: Warga | null;
  daftarKk: KartuKeluargaData[];
  onEdit: (warga: Warga) => void;
  onPilihKk: (noKk: string) => void;
  currentUser?: UserSession | null;
}

export const ModalDetailWarga: React.FC<ModalDetailWargaProps> = ({
  isOpen,
  onClose,
  warga,
  daftarKk,
  onEdit,
  onPilihKk,
  currentUser,
}) => {
  const canManage = canManageWarga(currentUser?.role);
  const isAdmin = canManage;
  if (!isOpen || !warga) return null;

  const usia = hitungUsia(warga.tanggalLahir);
  const kk = daftarKk.find(k => k.noKk === warga.noKk);
  const anggotaLain = kk ? kk.anggota.filter(a => a.id !== warga.id) : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
              {warga.nama.charAt(0)}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                {warga.nama}
                <span className="text-xs px-2 py-0.5 rounded font-normal bg-slate-200 text-slate-700">
                  {warga.statusKehidupan}
                </span>
              </h3>
              <p className="text-xs font-mono text-slate-500 inline-flex items-center gap-1.5">
                {!isAdmin && <Lock className="w-3 h-3 text-amber-600" />}
                <span>NIK: {isAdmin ? warga.nik : maskNik(warga.nik)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(warga);
                }}
                className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit Data"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm text-slate-700">
          {/* Data Pokok Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Hubungan Keluarga</span>
              <span className="font-bold text-blue-700">{warga.hubunganKeluarga}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Jenis Kelamin</span>
              <span className="font-bold">{warga.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Usia</span>
              <span className="font-bold">{usia} Tahun</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Tempat, Tanggal Lahir</span>
              <span>{warga.tempatLahir}, {formatTanggalIndo(warga.tanggalLahir)}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Agama</span>
              <span>{warga.agama}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Status Perkawinan</span>
              <span>{warga.statusPerkawinan}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Pekerjaan</span>
              <span>{warga.pekerjaan || '-'}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Pendidikan</span>
              <span>{warga.pendidikan || '-'}</span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">Golongan Darah</span>
              <span>{warga.golonganDarah || '-'}</span>
            </div>
          </div>

          {/* Kartu Keluarga Connector & Alamat */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                  Data Kartu Keluarga (1 KK)
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onPilihKk(warga.noKk);
                }}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Lihat di Tab KK &rarr;
              </button>
            </div>
            <div className="text-xs space-y-1">
              <div className="flex items-center">
                <span className="w-24 text-slate-500 font-medium">No. KK</span>
                <span className="font-mono font-bold text-slate-900 inline-flex items-center gap-1">
                  {!isAdmin && <Lock className="w-3 h-3 text-amber-600" />}
                  <span>{isAdmin ? warga.noKk : maskNoKk(warga.noKk)}</span>
                </span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Kepala KK</span>
                <span className="font-medium text-slate-900">{kk?.kepalaKeluarga?.nama || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Alamat</span>
                <span>{warga.alamat} (RT {warga.rt} / RW {warga.rw})</span>
              </div>
              <div className="flex">
                <span className="w-24 text-slate-500 font-medium">Status</span>
                <span className="font-medium text-slate-900">Warga {warga.statusKependudukan}</span>
              </div>
              {warga.noHp && (
                <div className="flex items-center gap-1 pt-1 text-slate-800">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>No. HP / WA: {isAdmin ? warga.noHp : maskNoHp(warga.noHp)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Anggota Keluarga Lain dalam KK yang Sama */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Anggota Keluarga Lain dalam 1 KK ({anggotaLain.length} orang)
            </h4>
            {anggotaLain.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Tidak ada anggota lain terdaftar di KK ini.</p>
            ) : (
              <div className="space-y-1.5">
                {anggotaLain.map(a => (
                  <div
                    key={a.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 mr-2">{a.nama}</span>
                      <span className="text-[11px] text-slate-500 font-mono">NIK: {a.nik}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-300">
                        {a.hubunganKeluarga}
                      </span>
                      <span className="text-slate-500">{hitungUsia(a.tanggalLahir)} thn</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
