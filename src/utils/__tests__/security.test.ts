import { describe, it, expect } from 'vitest';
import { maskNik, maskNoKk, maskNoHp, maskNama } from '../security';

describe('Security Utilities (UU PDP)', () => {
  it('should mask NIK properly with first 4 digits and last 2 digits preserved', () => {
    expect(maskNik('3374012345670002')).toBe('3374**********02');
    expect(maskNik('')).toBe('-');
    expect(maskNik(undefined)).toBe('-');
    expect(maskNik('12345')).toBe('****');
  });

  it('should mask Nomor KK properly with first 4 digits and last 2 digits preserved', () => {
    expect(maskNoKk('3276010101100002')).toBe('3276**********02');
    expect(maskNoKk('')).toBe('-');
    expect(maskNoKk(undefined)).toBe('-');
  });

  it('should mask Phone Number properly hiding middle digits', () => {
    expect(maskNoHp('0812-3456-7890')).toBe('0812-****-7890');
    expect(maskNoHp('')).toBe('-');
    expect(maskNoHp(undefined)).toBe('-');
    expect(maskNoHp('1234')).toBe('****');
  });

  it('should mask full name to abbreviation where appropriate', () => {
    expect(maskNama('Budi Santoso')).toBe('Budi S.');
    expect(maskNama('Ahmad')).toBe('Ahmad');
    expect(maskNama('')).toBe('-');
    expect(maskNama(undefined)).toBe('-');
  });
});
