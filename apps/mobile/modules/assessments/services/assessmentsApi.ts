import { apiFetch } from '@/utils/api/client';

export interface SubmitAttemptResponse {
  attemptId: string;
  correctCount: number;
  totalQuestions: number;
  scorePercent: number;
}

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

export const assessmentsApi = {
  list: (): Promise<AssessmentItem[]> =>
    apiFetch<AssessmentItem[]>('/assessments', { method: 'GET' }),

  getQuestions: (assessmentId: string): Promise<QuestionItem[]> =>
    apiFetch<QuestionItem[]>(`/assessments/${assessmentId}/questions`, { method: 'GET' }),

  submitAttempt: (
    assessmentId: string,
    answers: Array<{ questionId: string; selectedIndex: number }>,
    token: string,
  ): Promise<SubmitAttemptResponse> =>
    apiFetch<SubmitAttemptResponse>(`/assessments/${assessmentId}/attempts`, {
      method: 'POST',
      body: { answers },
      token,
    }),
};
