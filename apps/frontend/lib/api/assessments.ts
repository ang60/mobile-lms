import { apiClient } from '../api-client';

export interface AssessmentItem {
  id: string;
  title: string;
  courseId?: string;
  sectionId?: string;
  courseName: string;
  sectionName: string;
  questions: number;
  timeMinutes: number;
  difficulty: string;
  attempts: number;
  avgScore: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssessmentDto {
  title: string;
  courseId?: string;
  sectionId?: string;
  courseName?: string;
  sectionName?: string;
  questions: number;
  timeMinutes: number;
  difficulty?: string;
}

export interface QuestionItem {
  id: string;
  assessmentId: string;
  order: number;
  questionText: string;
  type: 'mcq' | 'true_false';
  options: string[];
  correctIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  questionText: string;
  type?: 'mcq' | 'true_false';
  options: string[];
  correctIndex: number;
  order?: number;
}

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('token') ?? undefined;
}

const authHeaders = (): Record<string, string> | undefined => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export const assessmentsApi = {
  list: (): Promise<AssessmentItem[]> => apiClient.get<AssessmentItem[]>('/assessments'),

  getQuestions: (assessmentId: string): Promise<QuestionItem[]> =>
    apiClient.get<QuestionItem[]>(`/assessments/${assessmentId}/questions`),

  create: (data: CreateAssessmentDto): Promise<AssessmentItem> =>
    apiClient.post<AssessmentItem>('/assessments', data, authHeaders()),

  update: (id: string, data: Partial<CreateAssessmentDto>): Promise<AssessmentItem> =>
    apiClient.put<AssessmentItem>(`/assessments/${id}`, data, authHeaders()),

  delete: (id: string): Promise<{ success: boolean }> =>
    apiClient.delete<{ success: boolean }>(`/assessments/${id}`, authHeaders()),

  addQuestion: (assessmentId: string, data: CreateQuestionDto): Promise<QuestionItem> =>
    apiClient.post<QuestionItem>(`/assessments/${assessmentId}/questions`, data, authHeaders()),

  updateQuestion: (
    assessmentId: string,
    questionId: string,
    data: Partial<CreateQuestionDto>,
  ): Promise<QuestionItem> =>
    apiClient.put<QuestionItem>(
      `/assessments/${assessmentId}/questions/${questionId}`,
      data,
      authHeaders(),
    ),

  deleteQuestion: (assessmentId: string, questionId: string): Promise<{ success: boolean }> =>
    apiClient.delete<{ success: boolean }>(
      `/assessments/${assessmentId}/questions/${questionId}`,
      authHeaders(),
    ),
};
