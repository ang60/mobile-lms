import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Res,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { AuthService } from '@/auth/auth.service';

function extractToken(header?: string) {
  if (!header) return undefined;
  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') return undefined;
  return value;
}

const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;

@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  list() {
    return this.contentService.list();
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.contentService.detail(id);
  }

  @Post()
  async create(@Body() dto: CreateContentDto, @Headers('authorization') authHeader?: string) {
    await this.assertAdmin(authHeader);
    return this.contentService.create(dto);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_UPLOAD_SIZE },
    }),
  )
  async upload(
    @Body() dto: CreateContentDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.assertAdmin(authHeader);
    return this.contentService.upload(dto, file);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateContentDto,
    @Headers('authorization') authHeader?: string,
  ) {
    await this.assertAdmin(authHeader);
    return this.contentService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Headers('authorization') authHeader?: string) {
    await this.assertAdmin(authHeader);
    return this.contentService.remove(id);
  }

  @Get(':id/file')
  async download(
    @Param('id') id: string,
    @Res() res: Response,
    @Headers('authorization') authHeader?: string,
  ) {
    const token = extractToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Authentication is required to download files.');
    }
    const user = await this.authService.getUserFromToken(token);
    await this.contentService.streamFile(id, user, res);
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

