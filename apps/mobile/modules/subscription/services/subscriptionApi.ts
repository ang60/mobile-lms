import { apiFetch } from '@/utils/api/client';

export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
};

export type Subscription = {
  planId: string;
  status: 'active' | 'inactive' | 'past_due';
  expiresAt: string;
};

export const subscriptionApi = {
  getPlans: (): Promise<SubscriptionPlan[]> =>
    apiFetch<SubscriptionPlan[]>('/subscription/plans', {
      method: 'GET',
    }),

  activate: (planId: string, token: string): Promise<Subscription> =>
    apiFetch<Subscription>('/subscription/activate', {
      method: 'POST',
      body: { planId },
      token,
    }),
};


