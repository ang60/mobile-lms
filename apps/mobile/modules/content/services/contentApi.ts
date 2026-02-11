import { apiFetch } from '@/utils/api/client';

export type ContentItem = {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  type: 'pdf' | 'epub';
  lessons: number;
  previewUrl?: string;
  fileId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
};

// Simple in-memory cache with TTL (5 minutes)
type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<any>>();

function getCacheKey(path: string, token?: string | null): string {
  return token ? `${path}:${token}` : path;
}

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  
  const age = Date.now() - entry.timestamp;
  if (age > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function clearCache(): void {
  cache.clear();
}

export const contentApi = {
  list: async (token?: string | null, useCache = true): Promise<ContentItem[]> => {
    const cacheKey = getCacheKey('/content', token);
    
    // Return cached data immediately if available
    if (useCache) {
      const cached = getCached<ContentItem[]>(cacheKey);
      if (cached && cached.length > 0) {
        // Fetch fresh data in background (fire and forget)
        apiFetch<ContentItem[]>('/content', {
          method: 'GET',
          token: token || undefined,
        })
          .then((freshData) => {
            setCache(cacheKey, freshData);
          })
          .catch(() => {
            // Silently fail background refresh
          });
        
        return cached;
      }
    }
    
    // Fetch fresh data
    const data = await apiFetch<ContentItem[]>('/content', {
      method: 'GET',
      token: token || undefined,
    });
    
    if (useCache && data && data.length >= 0) {
      setCache(cacheKey, data);
    }
    
    return data || [];
  },

  get: async (id: string, token?: string | null, useCache = true): Promise<ContentItem> => {
    const cacheKey = getCacheKey(`/content/${id}`, token);
    
    // Return cached data immediately if available
    if (useCache) {
      const cached = getCached<ContentItem>(cacheKey);
      if (cached) {
        // Fetch fresh data in background
        apiFetch<ContentItem>(`/content/${id}`, {
          method: 'GET',
          token: token || undefined,
        })
          .then((freshData) => {
            setCache(cacheKey, freshData);
          })
          .catch(() => {
            // Silently fail background refresh
          });
        
        return cached;
      }
    }
    
    // Fetch fresh data
    const data = await apiFetch<ContentItem>(`/content/${id}`, {
      method: 'GET',
      token: token || undefined,
    });
    
    if (useCache) {
      setCache(cacheKey, data);
    }
    
    return data;
  },

  download: async (id: string, token: string): Promise<Blob> => {
    const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
    const url = `${BASE_URL}/content/${id}/file`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'any',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    return response.blob();
  },

  // Clear cache (useful for logout or after content updates)
  clearCache,
};


