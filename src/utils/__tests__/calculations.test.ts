import { describe, it, expect } from 'vitest';
import { hitungUsia, formatTanggalIndo, formatBulanTahun, kelompokkanPerKk } from '../calculations';
import { Warga } from '../../types';

describe('Calculation Utilities', () => {
  it('should calculate age correctly based on reference date', () => {
    const ref = new Date('2026-09-01');
    expect(hitungUsia('2000-09-01', ref)).toBe(26);
    expect(hitungUsia('2000-09-02', ref)).toBe(25); // birthday hasn't occurred yet
    expect(hitungUsia('')).toBe(0);
    expect(hitungUsia('invalid-date')).toBe(0);
  });

  it('should format Indonesian dates correctly', () => {
    expect(formatTanggalIndo('2026-08-17')).toBe('17 Agustus 2026');
    expect(formatTanggalIndo('')).toBe('-');
  });

  it('should format month and year in Indonesian', () => {
    expect(formatBulanTahun(2026, 9)).toBe('September 2026');
    expect(formatBulanTahun(2025, 1)).toBe('Januari 2025');
  });

  it('should group citizens by KK and sort head of family first', () => {
    const sampleWarga: Warga[] = [
      {
        id: 'w-1',
        nik: '3374010101010001',
        nama: 'Anak Pertama',
        tempatLahir: 'Semarang',
        tanggalLahir: '2010-01-01',
        jenisKelamin: 'L',
        noKk: '3374010101019999',
        hubunganKeluarga: 'ANAK',
        alamat: 'Jl. Gasem Raya No. 1',
        rt: '02',
        rw: '04',
        agama: 'Islam',
        statusPerkawinan: 'Belum Kawin',
        pekerjaan: 'Pelajar',
        statusKependudukan: 'Tetap',
        statusKehidupan: 'Hidup',
        tanggalDaftar: '2024-01-01',
      },
      {
        id: 'w-2',
        nik: '3374010101010002',
        nama: 'Bapak Kepala',
        tempatLahir: 'Semarang',
        tanggalLahir: '1980-01-01',
        jenisKelamin: 'L',
        noKk: '3374010101019999',
        hubunganKeluarga: 'KEPALA KELUARGA',
        alamat: 'Jl. Gasem Raya No. 1',
        rt: '02',
        rw: '04',
        agama: 'Islam',
        statusPerkawinan: 'Kawin',
        pekerjaan: 'Karyawan',
        statusKependudukan: 'Tetap',
        statusKehidupan: 'Hidup',
        tanggalDaftar: '2024-01-01',
      },
      {
        id: 'w-3',
        nik: '3374010101010003',
        nama: 'Warga Meninggal',
        tempatLahir: 'Semarang',
        tanggalLahir: '1950-01-01',
        jenisKelamin: 'P',
        noKk: '3374010101019999',
        hubunganKeluarga: 'ORANG TUA',
        alamat: 'Jl. Gasem Raya No. 1',
        rt: '02',
        rw: '04',
        agama: 'Islam',
        statusPerkawinan: 'Cerai Mati',
        pekerjaan: 'Pensiunan',
        statusKependudukan: 'Tetap',
        statusKehidupan: 'Meninggal', // Status meninggal harus difilter dari anggota aktif KK
        tanggalDaftar: '2024-01-01',
      },
    ];

    const result = kelompokkanPerKk(sampleWarga);
    expect(result.length).toBe(1);
    expect(result[0].noKk).toBe('3374010101019999');
    expect(result[0].kepalaKeluarga?.nama).toBe('Bapak Kepala');
    expect(result[0].anggota.length).toBe(2);
    expect(result[0].anggota[0].hubunganKeluarga).toBe('KEPALA KELUARGA');
    expect(result[0].anggota[1].hubunganKeluarga).toBe('ANAK');
  });
});
