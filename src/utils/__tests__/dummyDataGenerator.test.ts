import { describe, it, expect } from 'vitest';
import {
  generateDummyWarga,
  generateDummyKas,
  generateDummyMutasi,
  generateDummyDokumen,
  generateDummyPengurus,
  generateDummyCredentials,
} from '../dummyDataGenerator';

describe('dummyDataGenerator', () => {
  it('should generate dummy warga data correctly', () => {
    const warga = generateDummyWarga();
    expect(warga.length).toBeGreaterThan(0);
    warga.forEach(w => {
      expect(w.id).toBeDefined();
      expect(w.nama).toBeTruthy();
      expect(w.nik).toHaveLength(16);
      expect(w.noKk).toHaveLength(16);
      expect(['L', 'P']).toContain(w.jenisKelamin);
    });
  });

  it('should generate dummy kas transactions correctly', () => {
    const kas = generateDummyKas();
    expect(kas.length).toBeGreaterThan(0);
    kas.forEach(k => {
      expect(k.id).toBeDefined();
      expect(k.nominal).toBeGreaterThan(0);
      expect(['PEMASUKAN', 'PENGELUARAN']).toContain(k.jenis);
      expect(k.kategori).toBeTruthy();
    });
  });

  it('should generate dummy mutasi records correctly', () => {
    const warga = generateDummyWarga();
    const mutasi = generateDummyMutasi(warga);
    expect(mutasi.length).toBeGreaterThan(0);
    expect(mutasi[0].nik).toBe(warga[0].nik);
    expect(mutasi[0].jenisMutasi).toBe('Pindah_Masuk');
  });

  it('should generate dummy arsip dokumen with valid categories and types', () => {
    const dokumen = generateDummyDokumen();
    expect(dokumen.length).toBeGreaterThan(0);
    dokumen.forEach(d => {
      expect(d.id).toBeDefined();
      expect(d.judul).toBeTruthy();
      expect(d.kategori).toBeTruthy();
      expect(['pdf', 'doc', 'image', 'text']).toContain(d.tipeFile);
      expect(d.namaFile).toBeTruthy();
    });
  });

  it('should generate dummy pengurus with complete roles and contact info', () => {
    const pengurus = generateDummyPengurus();
    expect(pengurus.length).toBeGreaterThan(0);
    expect(pengurus[0].jabatan.toLowerCase()).toContain('ketua rt');
    pengurus.forEach(p => {
      expect(p.id).toBeDefined();
      expect(p.nama).toBeTruthy();
      expect(p.jabatan).toBeTruthy();
      expect(p.noHp).toBeTruthy();
      expect(p.periode).toContain('2024');
    });
  });

  it('should generate dummy credentials covering all 7 roles', () => {
    const creds = generateDummyCredentials();
    expect(creds.length).toBe(7);
    const roles = creds.map(c => c.role);
    expect(roles).toContain('developer');
    expect(roles).toContain('ketua_rt');
    expect(roles).toContain('sekretaris');
    expect(roles).toContain('bendahara');
    expect(roles).toContain('pengurus');
    expect(roles).toContain('warga');
    expect(roles).toContain('admin');

    creds.forEach(c => {
      expect(c.nik).toBeTruthy();
      expect(c.password).toBeTruthy();
      expect(c.nama).toBeTruthy();
      expect(c.role).toBeTruthy();
    });
  });
});
