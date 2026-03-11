import { Module } from '@nestjs/common';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';
import { AssessmentsController } from './assessments.controller';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [AssessmentsController],
})
export class AssessmentsModule {}
