/**
 * Utility Keamanan dan Penyensoran Data Pribadi (UU PDP)
 */

/**
 * Sensor NIK: Hanya menampilkan 4 digit depan dan 2 digit belakang
 * Contoh: 3374012345670002 -> 3374**********02
 */
export const maskNik = (nik?: string): string => {
  if (!nik) return '-';
  const clean = nik.trim();
  if (clean.length < 8) return '****';
  return `${clean.slice(0, 4)}${'*'.repeat(Math.max(4, clean.length - 6))}${clean.slice(-2)}`;
};

/**
 * Sensor Nomor KK: Hanya menampilkan 4 digit depan dan 2 digit belakang
 * Contoh: 3276010101100002 -> 3276**********02
 */
export const maskNoKk = (noKk?: string): string => {
  if (!noKk) return '-';
  const clean = noKk.trim();
  if (clean.length < 8) return '****';
  return `${clean.slice(0, 4)}${'*'.repeat(Math.max(4, clean.length - 6))}${clean.slice(-2)}`;
};

/**
 * Sensor Nomor HP / Telepon: Menutup digit tengah
 * Contoh: 0812-3456-7890 -> 0812-****-7890
 */
export const maskNoHp = (noHp?: string): string => {
  if (!noHp) return '-';
  const clean = noHp.trim();
  if (clean.length <= 6) return '****';
  return `${clean.slice(0, 4)}-****-${clean.slice(-4)}`;
};

/**
 * Sensor Nama untuk publik jika dibutuhkan (opsional)
 * Contoh: Budi Santoso -> Budi S.
 */
export const maskNama = (nama?: string): string => {
  if (!nama) return '-';
  const parts = nama.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts.slice(1).map(p => p[0] + '.').join(' ')}`;
};
