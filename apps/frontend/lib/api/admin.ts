import { apiClient } from '../api-client';

function getToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return localStorage.getItem('token') ?? undefined;
}

const authHeaders = (): Record<string, string> | undefined => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
};

export interface AnalyticsData {
  totalUsers: number;
  totalContent: number;
  totalAttempts: number;
  passRatePercent: number;
  revenueTotal: number;
  revenueMonth: number;
  recentAttempts: Array<{
    id: string;
    userId: string;
    assessmentId: string;
    correctCount: number;
    totalQuestions: number;
    scorePercent: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface ProgressItem {
  userId: string;
  name: string;
  email: string;
  attemptsCount: number;
  avgScorePercent: number;
  lastAttemptAt: string | null;
}

export interface PaymentItem {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  planId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevenueSummary {
  total: number;
  count: number;
  monthTotal: number;
}

export const adminApi = {
  getAnalytics: (): Promise<AnalyticsData> =>
    apiClient.get<AnalyticsData>('/admin/analytics', authHeaders()),

  getProgress: (): Promise<ProgressItem[]> =>
    apiClient.get<ProgressItem[]>('/admin/progress', authHeaders()),

  getPayments: (limit?: number): Promise<PaymentItem[]> => {
    const q = limit != null ? `?limit=${limit}` : '';
    return apiClient.get<PaymentItem[]>(`/admin/payments${q}`, authHeaders());
  },

  getRevenue: (): Promise<RevenueSummary> =>
    apiClient.get<RevenueSummary>('/admin/revenue', authHeaders()),
};
