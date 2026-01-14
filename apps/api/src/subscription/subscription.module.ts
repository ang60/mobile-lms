import { Module } from '@nestjs/common';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { DataModule } from '@/data/data.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [DataModule, AuthModule],
  controllers: [SubscriptionController],
  providers: [SubscriptionService],
})
export class SubscriptionModule {}


