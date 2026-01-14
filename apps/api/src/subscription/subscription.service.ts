import { Injectable } from '@nestjs/common';
import { DataService } from '@/data/data.service';
import type { User, Subscription, SubscriptionPlan } from '@/data/data.types';

@Injectable()
export class SubscriptionService {
  constructor(private readonly dataService: DataService) {}

  getPlans(): SubscriptionPlan[] {
    return this.dataService.getSubscriptionPlans();
  }

  async activate(user: User, planId: string): Promise<Subscription> {
    return this.dataService.activateSubscription(user, planId);
  }
}


