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

export const contentApi = {
  list: (token?: string | null): Promise<ContentItem[]> =>
    apiFetch<ContentItem[]>('/content', {
      method: 'GET',
      token: token || undefined,
    }),

  get: (id: string, token?: string | null): Promise<ContentItem> =>
    apiFetch<ContentItem>(`/content/${id}`, {
      method: 'GET',
      token: token || undefined,
    }),

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
};


