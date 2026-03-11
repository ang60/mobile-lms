import { apiClient } from '../api-client';

export interface CourseItem {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectionItem {
  id: string;
  courseId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CourseWithSections extends CourseItem {
  sections: SectionItem[];
}

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('token') ?? undefined;
}

export const coursesApi = {
  list: async (): Promise<CourseItem[]> => {
    return apiClient.get<CourseItem[]>('/courses');
  },

  get: async (id: string): Promise<CourseWithSections> => {
    return apiClient.get<CourseWithSections>(`/courses/${id}`);
  },

  createCourse: async (name: string): Promise<CourseItem> => {
    const token = getToken();
    return apiClient.post<CourseItem>('/courses', { name }, token ? { Authorization: `Bearer ${token}` } : {});
  },

  addSection: async (courseId: string, name: string, order?: number): Promise<SectionItem> => {
    const token = getToken();
    return apiClient.post<SectionItem>(`/courses/${courseId}/sections`, { name, order }, token ? { Authorization: `Bearer ${token}` } : {});
  },
};
