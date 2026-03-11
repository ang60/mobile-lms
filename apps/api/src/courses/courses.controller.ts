import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  NotFoundException,
  Param,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { DataService } from '@/data/data.service';
import { AuthService } from '@/auth/auth.service';

function extractToken(header?: string) {
  if (!header) return undefined;
  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') return undefined;
  return value;
}

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly data: DataService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async list() {
    return this.data.getCourses();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const course = await this.data.getCourseById(id);
    if (!course) throw new NotFoundException('Course not found');
    const sections = await this.data.getSectionsByCourseId(id);
    return { ...course, sections };
  }

  @Post()
  async createCourse(
    @Body() body: { name: string },
    @Headers('authorization') authHeader?: string,
  ) {
    await this.assertAdmin(authHeader);
    if (!body?.name?.trim()) {
      return { error: 'name is required' };
    }
    return this.data.createCourse(body.name.trim());
  }

  @Post(':id/sections')
  async addSection(
    @Param('id') id: string,
    @Body() body: { name: string; order?: number },
    @Headers('authorization') authHeader?: string,
  ) {
    await this.assertAdmin(authHeader);
    if (!body?.name?.trim()) {
      return { error: 'name is required' };
    }
    return this.data.createSection(id, body.name.trim(), body.order);
  }

  private async assertAdmin(authHeader?: string) {
    const token = extractToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Admin token required.');
    }
    const user = await this.authService.getUserFromToken(token);
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can perform this action.');
    }
    return user;
  }
}
