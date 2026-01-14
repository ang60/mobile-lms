import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '@/modules/auth/services/authApi';
import { ApiError } from '@/utils/api/client';

type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  subscription?: {
    planId: string;
    status: 'active' | 'inactive' | 'past_due';
    expiresAt: string;
  } | null;
} | null;

type AuthContextValue = {
  user: AuthUser;
  token: string | null;
  isLoading: boolean;
  isRestoring: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const STORAGE_KEY = 'auth_token';
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(STORAGE_KEY);
        if (!stored) {
          setIsRestoring(false);
          return;
        }
        setToken(stored);
        try {
          const current = await authApi.me(stored);
          if (current) setUser(current);
        } catch (error) {
          // 401 is expected if token is invalid/expired - silently clear it
          if (error instanceof ApiError && error.status === 401) {
            await SecureStore.deleteItemAsync(STORAGE_KEY);
            setToken(null);
          } else {
            // Log other errors for debugging
            console.warn('[AuthProvider] Failed to restore session:', error);
          }
        }
      } finally {
        setIsRestoring(false);
      }
    })();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { token: nextToken, user: nextUser } = await authApi.login({ email, password });
      setToken(nextToken);
      setUser(nextUser);
      await SecureStore.setItemAsync(STORAGE_KEY, nextToken);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string, phone?: string) => {
    setIsLoading(true);
    try {
      const { token: nextToken, user: nextUser } = await authApi.register({ name, email, password, phone });
      setToken(nextToken);
      setUser(nextUser);
      await SecureStore.setItemAsync(STORAGE_KEY, nextToken);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await authApi.logout(token).catch(() => {});
      }
    } finally {
      setToken(null);
      setUser(null);
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  };

  const handleRefreshUser = async () => {
    if (!token) return;
    try {
      const current = await authApi.me(token);
      if (current) setUser(current);
    } catch (error) {
      console.warn('[AuthProvider] Failed to refresh user:', error);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isRestoring,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refreshUser: handleRefreshUser,
    }),
    [user, token, isLoading, isRestoring]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

