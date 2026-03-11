import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [AdminController],
})
export class AdminModule {}
