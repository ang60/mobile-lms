import { Controller, Get, Headers, Post, Body, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

function extractToken(header?: string) {
  if (!header) return undefined;
  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') return undefined;
  return value;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  logout(@Headers('authorization') authHeader?: string) {
    this.authService.logout(extractToken(authHeader));
    return { success: true };
  }

  @Get('me')
  async me(@Headers('authorization') authHeader?: string) {
    const user = await this.authService.getUserFromToken(extractToken(authHeader));
    return this.authService.getPublicUser(user);
  }

  @Get('users')
  async listUsers(@Headers('authorization') authHeader?: string) {
    const token = extractToken(authHeader);
    if (!token) {
      throw new UnauthorizedException('Admin token required.');
    }
    const user = await this.authService.getUserFromToken(token);
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only admins can list users.');
    }
    return this.authService.listUsersForAdmin();
  }
}

