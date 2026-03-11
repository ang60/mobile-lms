import { Module } from '@nestjs/common';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';
import { CoursesController } from './courses.controller';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [CoursesController],
})
export class CoursesModule {}
