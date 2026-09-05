import { supabase, isSupabaseConfigured } from './supabaseClient';
import { UserSession } from '../types';

/**
 * Normalisasi identifier username/nik ke format email Supabase Auth
 */
export const toAuthEmail = (identifier: string): string => {
  const clean = identifier.trim().toLowerCase();
  if (clean.includes('@')) return clean;
  return `${clean}@gasemraya02.internal`;
};

export interface AuthResult {
  success: boolean;
  user?: UserSession;
  error?: string;
}

/**
 * Login resmi via Supabase Auth
 */
export const loginWithSupabase = async (
  identifier: string,
  password: string
): Promise<AuthResult> => {
  const email = toAuthEmail(identifier);

  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      error: 'Supabase belum terkonfigurasi. Periksa berkas .env.',
    };
  }

  try {
    // 1. Coba login dengan kredensial Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!authError && authData.user) {
      const userMeta = authData.user.user_metadata || {};
      const session: UserSession = {
        nik: userMeta.nik || identifier.trim(),
        nama: userMeta.nama || 'Pengurus RT 02',
        role: userMeta.role || 'admin',
        jabatan: userMeta.jabatan || 'Ketua RT (Admin RT 02)',
        noKk: userMeta.no_kk,
        alamat: userMeta.alamat,
        noHp: userMeta.no_hp,
        loginAt: new Date().toISOString(),
      };
      return { success: true, user: session };
    }

    // 2. Jika kredensial tidak cocok, kembalikan pesan error keamanan tanpa membuat akun baru
    if (authError?.message?.includes('Invalid login credentials')) {
      return {
        success: false,
        error: 'NIK / Username atau kata sandi tidak cocok. Silakan periksa kembali.',
      };
    }

    return {
      success: false,
      error: authError?.message || 'Gagal masuk ke sistem.',
    };
  } catch (err: any) {
    console.error('Error saat login Supabase Auth:', err);
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan pada server autentikasi.',
    };
  }
};

/**
 * Logout dari Supabase Auth
 */
export const logoutSupabase = async (): Promise<void> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase sign out error:', e);
    }
  }
};

/**
 * Dapatkan sesi aktif saat ini dari Supabase
 */
export const getActiveSupabaseSession = async (): Promise<UserSession | null> => {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const meta = session.user.user_metadata || {};
      return {
        nik: meta.nik || session.user.email?.split('@')[0] || 'admin',
        nama: meta.nama || 'Pengurus RT 02',
        role: meta.role || 'admin',
        jabatan: meta.jabatan || 'Pengurus RT 02',
        noKk: meta.no_kk,
        alamat: meta.alamat,
        noHp: meta.no_hp,
        loginAt: new Date().toISOString(),
      };
    }
    return null;
  } catch (e) {
    console.error('Failed to get Supabase session:', e);
    return null;
  }
};
