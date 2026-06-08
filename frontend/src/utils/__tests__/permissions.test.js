import { describe, it, expect } from 'vitest';
import {
  canCreate,
  canEdit,
  canDelete,
  canPublish,
  canManageUsers,
} from '../permissions';

describe('permissions', () => {
  describe('canCreate', () => {
    it('only admin can create', () => {
      expect(canCreate('admin')).toBe(true);
      expect(canCreate('editor')).toBe(false);
      expect(canCreate('viewer')).toBe(false);
    });
  });

  describe('canEdit', () => {
    it('admin and editor can edit, viewer cannot', () => {
      expect(canEdit('admin')).toBe(true);
      expect(canEdit('editor')).toBe(true);
      expect(canEdit('viewer')).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('only admin can delete', () => {
      expect(canDelete('admin')).toBe(true);
      expect(canDelete('editor')).toBe(false);
      expect(canDelete('viewer')).toBe(false);
    });
  });

  describe('canPublish / canManageUsers', () => {
    it('are admin-only', () => {
      expect(canPublish('admin')).toBe(true);
      expect(canPublish('editor')).toBe(false);
      expect(canManageUsers('admin')).toBe(true);
      expect(canManageUsers('viewer')).toBe(false);
    });
  });

  it('treats unknown or missing roles as no permission', () => {
    expect(canCreate(undefined)).toBe(false);
    expect(canEdit('')).toBe(false);
    expect(canDelete('superuser')).toBe(false);
  });
});
