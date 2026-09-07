import { describe, it, expect } from 'vitest';
import {
  isDeveloper,
  isAdminOrLeader,
  canManageWarga,
  canManageMutasi,
  canManageKas,
  canManageDokumen,
  canManagePengurus,
  canManageUsers,
  canAccessDeveloperTools,
  canEditSettings,
} from '../permissions';

describe('Role-Based Access Control (RBAC) Permissions', () => {
  it('should verify developer role correctly', () => {
    expect(isDeveloper('developer')).toBe(true);
    expect(isDeveloper('ketua_rt')).toBe(false);
    expect(isDeveloper('warga')).toBe(false);
    expect(isDeveloper(undefined)).toBe(false);
  });

  it('should verify admin or leader roles', () => {
    expect(isAdminOrLeader('developer')).toBe(true);
    expect(isAdminOrLeader('ketua_rt')).toBe(true);
    expect(isAdminOrLeader('admin')).toBe(true);
    expect(isAdminOrLeader('sekretaris')).toBe(false);
    expect(isAdminOrLeader('bendahara')).toBe(false);
    expect(isAdminOrLeader('warga')).toBe(false);
  });

  it('should verify warga management permissions', () => {
    expect(canManageWarga('developer')).toBe(true);
    expect(canManageWarga('ketua_rt')).toBe(true);
    expect(canManageWarga('sekretaris')).toBe(true);
    expect(canManageWarga('bendahara')).toBe(false);
    expect(canManageWarga('warga')).toBe(false);
  });

  it('should verify kas management permissions (bendahara allowed, sekretaris disallowed)', () => {
    expect(canManageKas('bendahara')).toBe(true);
    expect(canManageKas('ketua_rt')).toBe(true);
    expect(canManageKas('developer')).toBe(true);
    expect(canManageKas('sekretaris')).toBe(false);
    expect(canManageKas('warga')).toBe(false);
  });

  it('should restrict developer tools exclusively to developer', () => {
    expect(canAccessDeveloperTools('developer')).toBe(true);
    expect(canAccessDeveloperTools('ketua_rt')).toBe(false);
    expect(canAccessDeveloperTools('sekretaris')).toBe(false);
    expect(canAccessDeveloperTools('bendahara')).toBe(false);
    expect(canAccessDeveloperTools('warga')).toBe(false);
  });
});
