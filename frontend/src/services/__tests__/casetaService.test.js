import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import api from '../api';
import casetaService from '../casetaService';

describe('casetaService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getCasetas forwards query params and returns data', async () => {
    api.get.mockResolvedValue({ data: { total: 3, data: [] } });
    const result = await casetaService.getCasetas({ fair: 'f1', limit: 10 });
    expect(api.get).toHaveBeenCalledWith('/casetas', { params: { fair: 'f1', limit: 10 } });
    expect(result.total).toBe(3);
  });

  it('getCaseta requests a single caseta by id', async () => {
    api.get.mockResolvedValue({ data: { _id: 'c1' } });
    await casetaService.getCaseta('c1');
    expect(api.get).toHaveBeenCalledWith('/casetas/c1');
  });

  it('createCaseta posts multipart form data', async () => {
    api.post.mockResolvedValue({ data: { _id: 'c2' } });
    const fd = new FormData();
    await casetaService.createCaseta(fd);
    expect(api.post).toHaveBeenCalledWith('/casetas', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('updateCaseta puts to the id endpoint', async () => {
    api.put.mockResolvedValue({ data: {} });
    const fd = new FormData();
    await casetaService.updateCaseta('c3', fd);
    expect(api.put).toHaveBeenCalledWith('/casetas/c3', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('deleteCaseta deletes by id', async () => {
    api.delete.mockResolvedValue({ data: { ok: true } });
    await casetaService.deleteCaseta('c4');
    expect(api.delete).toHaveBeenCalledWith('/casetas/c4');
  });

  it('deleteAllCasetas passes the fair scope', async () => {
    api.delete.mockResolvedValue({ data: { deleted: 5 } });
    const result = await casetaService.deleteAllCasetas({ fair: 'f1' });
    expect(api.delete).toHaveBeenCalledWith('/casetas', { params: { fair: 'f1' } });
    expect(result.deleted).toBe(5);
  });

  it('detectFromMap posts the form data to the detect endpoint', async () => {
    api.post.mockResolvedValue({ data: { casetas: [] } });
    const fd = new FormData();
    await casetaService.detectFromMap(fd);
    expect(api.post).toHaveBeenCalledWith('/casetas/detect', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  });

  it('bulkCreateCasetas posts the payload to the bulk endpoint', async () => {
    api.post.mockResolvedValue({ data: { created: 2, updated: 1 } });
    const payload = { fair: 'f1', casetas: [{ number: 1, location: { x: 0, y: 0 } }] };
    const result = await casetaService.bulkCreateCasetas(payload);
    expect(api.post).toHaveBeenCalledWith('/casetas/bulk', payload);
    expect(result.created).toBe(2);
  });
});
