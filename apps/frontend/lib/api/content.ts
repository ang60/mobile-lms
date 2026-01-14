import { apiClient } from '../api-client';

export type ContentType = 'pdf' | 'epub';

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  subject: string;
  price: number;
  previewUrl: string;
  type: ContentType;
  lessons: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentDto {
  title: string;
  description: string;
  subject: string;
  price: number;
  previewUrl?: string;
  type: ContentType;
  lessons: number;
}

export type UpdateContentDto = Partial<CreateContentDto>;

export const contentApi = {
  list: async (): Promise<ContentItem[]> => {
    return apiClient.get<ContentItem[]>('/content');
  },

  get: async (id: string): Promise<ContentItem> => {
    return apiClient.get<ContentItem>(`/content/${id}`);
  },

  create: async (data: CreateContentDto, token?: string): Promise<ContentItem> => {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return apiClient.post<ContentItem>('/content', data, headers);
  },

  update: async (id: string, data: UpdateContentDto, token?: string): Promise<ContentItem> => {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return apiClient.put<ContentItem>(`/content/${id}`, data, headers);
  },

  delete: async (id: string, token?: string): Promise<{ success: boolean }> => {
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return apiClient.delete<{ success: boolean }>(`/content/${id}`, headers);
  },

  upload: async (data: CreateContentDto, file: File, token?: string): Promise<ContentItem> => {
    const formData = new FormData();
    formData.append('file', file);
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return apiClient.upload<ContentItem>('/content/upload', formData, headers);
  },
};

