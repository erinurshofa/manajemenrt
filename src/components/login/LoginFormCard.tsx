import React, { RefObject } from 'react';
import { Lock, User, UserPlus, LogIn, AlertCircle, Sparkles, Eye, EyeOff, ShieldCheck, Smartphone } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginFormCardProps {
  loginCardRef: RefObject<HTMLDivElement | null>;
  usernameInputRef: RefObject<HTMLInputElement | null>;
  hasAccounts: boolean;
  username: string;
  setUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (val: string | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  // Initial setup props
  setupNik: string;
  setSetupNik: (val: string) => void;
  setupNama: string;
  setSetupNama: (val: string) => void;
  setupPass: string;
  setSetupPass: (val: string) => void;
  setupConfirm: string;
  setSetupConfirm: (val: string) => void;
  setupRole: UserRole;
  setSetupRole: (val: UserRole) => void;
  setupShowPass: boolean;
  setSetupShowPass: (val: boolean) => void;
  onSetupSubmit: (e: React.FormEvent) => void;
  onOpenAndroidApk?: () => void;
}

export const LoginFormCard: React.FC<LoginFormCardProps> = ({
  loginCardRef,
  usernameInputRef,
  hasAccounts,
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  errorMessage,
  setErrorMessage,
  onSubmit,
  setupNik,
  setSetupNik,
  setupNama,
  setSetupNama,
  setupPass,
  setSetupPass,
  setupConfirm,
  setSetupConfirm,
  setupRole,
  setSetupRole,
  setupShowPass,
  setSetupShowPass,
  onSetupSubmit,
  onOpenAndroidApk,
}) => {
  return (
    <div className="lg:col-span-5" ref={loginCardRef}>
      <div className="relative bg-[#fffdfa] rounded-2xl shadow-2xl border-2 border-amber-500/40 text-stone-900 overflow-hidden">
        {/* Header Card */}
        <div className="px-6 pt-6 pb-5 bg-gradient-to-r from-[#2c1408] via-[#3e1d0d] to-[#250f05] text-amber-100 border-b border-amber-600/40 relative">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow border border-amber-400/50 shrink-0">
              {!hasAccounts ? <UserPlus className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-white tracking-wide">
                {!hasAccounts ? 'Inisialisasi Sistem Perdana' : 'Masuk ke Menu Sistem'}
              </h2>
              <p className="text-xs text-amber-200/80">
                {!hasAccounts
                  ? 'Belum ada akun di basis data. Silakan buat akun pimpinan RT perdana.'
                  : 'Masukkan akun resmi untuk membuka seluruh menu RT 02'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Alert Error */}
          {errorMessage && (
            <div
              id="login-error-alert"
              className="flex items-start gap-2.5 p-3 text-xs bg-rose-50 text-rose-800 border border-rose-200 rounded-xl animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Perhatian</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Mode: Inisialisasi Darurat */}
          {!hasAccounts ? (
            <form onSubmit={onSetupSubmit} className="space-y-3.5">
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Sistem belum memiliki akun administrator. Tentukan username dan kata sandi pilihan Anda untuk memulai.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Username / NIK Akun
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={setupNik}
                    onChange={e => setSetupNik(e.target.value)}
                    placeholder="Contoh: username_admin atau NIK"
                    className="w-full px-3.5 py-2 pl-10 text-sm font-medium bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    required
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={setupNama}
                  onChange={e => setSetupNama(e.target.value)}
                  placeholder="Nama lengkap penanggung jawab"
                  className="w-full px-3.5 py-2 text-sm font-medium bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Hak Akses Peran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSetupRole('developer')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                      setupRole === 'developer'
                        ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>Developer</span>
                    <span className="text-[10px] font-normal text-stone-500">Superadmin & Diagnostik</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupRole('ketua_rt')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left flex flex-col gap-0.5 cursor-pointer ${
                      setupRole === 'ketua_rt'
                        ? 'bg-amber-100 border-amber-600 text-amber-950 shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                    }`}
                  >
                    <span>Ketua RT</span>
                    <span className="text-[10px] font-normal text-stone-500">Pimpinan & Pengelola RT</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={setupShowPass ? 'text' : 'password'}
                    value={setupPass}
                    onChange={e => setSetupPass(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    className="w-full px-3.5 py-2 pl-10 pr-10 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setSetupShowPass(!setupShowPass)}
                    className="absolute right-3 top-2 text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
                  >
                    {setupShowPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Konfirmasi Kata Sandi
                </label>
                <input
                  type={setupShowPass ? 'text' : 'password'}
                  value={setupConfirm}
                  onChange={e => setSetupConfirm(e.target.value)}
                  placeholder="Ulangi kata sandi di atas"
                  className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-stone-950 font-bold text-sm shadow-md bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] mt-2"
              >
                <UserPlus className="w-4 h-4 text-stone-950" />
                <span>Inisialisasi Akun Utama & Buka Sistem →</span>
              </button>
            </form>
          ) : (
            /* Mode: Normal Login */
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="input-username"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                >
                  Username / NIK
                </label>
                <div className="relative">
                  <input
                    ref={usernameInputRef}
                    id="input-username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={e => {
                      setUsername(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Masukkan username atau NIK akun"
                    className="w-full px-4 py-2.5 pl-10 text-sm font-medium bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    required
                  />
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="input-password"
                  className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="input-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={e => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Masukkan kata sandi"
                    className="w-full px-4 py-2.5 pl-10 pr-10 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors cursor-pointer"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-stone-950 font-bold text-sm shadow-md bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4 text-stone-950" />
                <span>Buka Kunci & Masuk ke Menu →</span>
              </button>
            </form>
          )}

          <div className="pt-2">
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-stone-700 leading-relaxed flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                Akses aman: Kredensial akun dikelola secara dinamis & terenkripsi di penyimpanan basis data.
              </p>
            </div>
          </div>

          {onOpenAndroidApk && (
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenAndroidApk}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Buka / Pasang di HP Android (APK)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
