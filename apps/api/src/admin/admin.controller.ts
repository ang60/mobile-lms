import { Controller, Get, Headers, Query, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { DataService } from '@/data/data.service';
import { AuthService } from '@/auth/auth.service';

function extractToken(header?: string) {
  if (!header) return undefined;
  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') return undefined;
  return value;
}

@Controller('admin')
export class AdminController {
  constructor(
    private readonly data: DataService,
    private readonly auth: AuthService,
  ) {}

  private async assertAdmin(authHeader?: string) {
    const token = extractToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Admin token required.');
    }
    const user = await this.auth.getUserFromToken(token);
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this.');
    }
    return user;
  }

  @Get('analytics')
  async analytics(@Headers('authorization') authHeader?: string) {
    await this.assertAdmin(authHeader);
    return this.data.getAnalyticsForAdmin();
  }

  @Get('progress')
  async progress(@Headers('authorization') authHeader?: string) {
    await this.assertAdmin(authHeader);
    return this.data.getProgressForAdmin();
  }

  @Get('payments')
  async payments(
    @Headers('authorization') authHeader?: string,
    @Query('limit') limit?: string,
  ) {
    await this.assertAdmin(authHeader);
    const limitNum = limit ? Math.min(500, Math.max(1, parseInt(limit, 10) || 100)) : 100;
    return this.data.getPaymentsForAdmin(limitNum);
  }

  @Get('revenue')
  async revenue(@Headers('authorization') authHeader?: string) {
    await this.assertAdmin(authHeader);
    return this.data.getRevenueSummary();
  }
}
