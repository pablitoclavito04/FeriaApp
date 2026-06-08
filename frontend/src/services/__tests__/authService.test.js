import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the shared axios instance so no real HTTP happens.
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import api from '../api';
import authService from '../authService';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('login posts credentials and returns the response data', async () => {
    api.post.mockResolvedValue({ data: { token: 'jwt', user: { email: 'a@b.c' } } });
    const result = await authService.login('a@b.c', 'pw');
    expect(api.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.c', password: 'pw' });
    expect(result).toEqual({ token: 'jwt', user: { email: 'a@b.c' } });
  });

  it('register posts name/email/password', async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    await authService.register('Pablo', 'a@b.c', 'pw');
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Pablo',
      email: 'a@b.c',
      password: 'pw',
    });
  });

  it('getProfile fetches the current user', async () => {
    api.get.mockResolvedValue({ data: { email: 'a@b.c', role: 'admin' } });
    const result = await authService.getProfile();
    expect(api.get).toHaveBeenCalledWith('/auth/profile');
    expect(result.role).toBe('admin');
  });

  it('propagates errors from the API', async () => {
    api.post.mockRejectedValue(new Error('401'));
    await expect(authService.login('x', 'y')).rejects.toThrow('401');
  });
});
