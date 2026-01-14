import { apiFetch } from '@/utils/api/client';

type AuthResponse = {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
  };
};

export const authApi = {
  register: (payload: { name: string; email: string; password: string; phone?: string }) =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: payload,
    }),
  login: (payload: { email: string; password: string }) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: payload,
    }),
  me: (token: string) =>
    apiFetch<AuthResponse['user']>('/auth/me', {
      method: 'GET',
      token,
    }),
  logout: (token: string) =>
    apiFetch<void>('/auth/logout', {
      method: 'POST',
      token,
    }),
};

