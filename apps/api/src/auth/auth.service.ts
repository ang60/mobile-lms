import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { DataService } from '@/data/data.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '@/data/data.types';

@Injectable()
export class AuthService {
  constructor(private readonly data: DataService) {}

  async register(dto: RegisterDto) {
    const existing = await this.data.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with that email already exists.');
    }
    const user = await this.data.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      phone: dto.phone,
      role: 'student',
    });
    const token = await this.data.issueToken(user.id);
    return { token, user: this.getPublicUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.data.findUserByEmail(dto.email);
    if (!user || user.password !== dto.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }
    const token = await this.data.issueToken(user.id);
    return { token, user: this.getPublicUser(user) };
  }

  async logout(token?: string) {
    if (!token) return;
    await this.data.revokeToken(token);
  }

  async getUserFromToken(token?: string) {
    const user = await this.data.findUserByToken(token);
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }

  getPublicUser(user: User) {
    return this.data.toPublicUser(user);
  }
}

