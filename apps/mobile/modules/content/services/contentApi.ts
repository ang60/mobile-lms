import { apiFetch, getBaseUrl } from '@/utils/api/client';

export type ContentItem = {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  type: 'pdf' | 'epub';
  lessons: number;
  previewUrl?: string;
  courseId?: string;
  sectionId?: string;
  fileId?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt?: string;
  updatedAt?: string;
};

type ListParams = {
  token?: string | null;
  courseId?: string;
  sectionId?: string;
};

export const contentApi = {
  list: (tokenOrParams?: string | null | ListParams): Promise<ContentItem[]> => {
    const params: ListParams =
      typeof tokenOrParams === 'string' || tokenOrParams == null
        ? { token: tokenOrParams ?? undefined }
        : tokenOrParams;
    const search = new URLSearchParams();
    if (params.courseId) search.set('courseId', params.courseId);
    if (params.sectionId) search.set('sectionId', params.sectionId);
    const qs = search.toString();
    const path = qs ? `/content?${qs}` : '/content';
    return apiFetch<ContentItem[]>(path, {
      method: 'GET',
      token: params.token ?? undefined,
    });
  },

  get: (id: string, token?: string | null): Promise<ContentItem> =>
    apiFetch<ContentItem>(`/content/${id}`, {
      method: 'GET',
      token: token || undefined,
    }),

  download: async (id: string, token: string): Promise<Blob> => {
    const url = `${getBaseUrl()}/content/${id}/file`;

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


