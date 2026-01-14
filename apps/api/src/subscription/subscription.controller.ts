import { Controller, Get, Post, Headers, Body, UnauthorizedException } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { AuthService } from '@/auth/auth.service';

function extractToken(header?: string) {
  if (!header) return undefined;
  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') return undefined;
  return value;
}

@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly authService: AuthService,
  ) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionService.getPlans();
  }

  @Post('activate')
  async activate(
    @Headers('authorization') authHeader?: string,
    @Body() body?: { planId: string },
  ) {
    const token = extractToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }
    const user = await this.authService.getUserFromToken(token);
    if (!body?.planId) {
      throw new Error('Plan ID is required');
    }
    return this.subscriptionService.activate(user, body.planId);
  }
}

