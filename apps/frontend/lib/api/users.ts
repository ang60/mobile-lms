import { apiClient } from '../api-client';

export interface UserItem {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'admin';
  subscription: { planId: string; status: string; expiresAt: string } | null;
  library: string[];
  createdAt: string;
  updatedAt: string;
}

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('token') ?? undefined;
}

const authHeaders = (): Record<string, string> | undefined => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const usersApi = {
  list: (): Promise<UserItem[]> =>
    apiClient.get<UserItem[]>('/auth/users', authHeaders()),
};
