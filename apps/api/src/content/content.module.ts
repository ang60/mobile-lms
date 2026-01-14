import { Module } from '@nestjs/common';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}

