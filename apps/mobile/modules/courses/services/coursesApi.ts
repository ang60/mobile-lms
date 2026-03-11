import { apiFetch } from '@/utils/api/client';

export type CourseItem = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type SectionItem = {
  id: string;
  courseId: string;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type CourseWithSections = CourseItem & {
  sections: SectionItem[];
};

export const coursesApi = {
  list: (): Promise<CourseItem[]> =>
    apiFetch<CourseItem[]>('/courses', { method: 'GET' }),

  get: (id: string): Promise<CourseWithSections> =>
    apiFetch<CourseWithSections>(`/courses/${id}`, { method: 'GET' }),
};
