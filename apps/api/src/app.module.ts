import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { CoursesModule } from './courses/courses.module';
import { DataModule } from './data/data.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('MONGODB_URI');
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in the environment variables.');
        }

        return {
          uri,
          dbName: config.get<string>('MONGODB_DB'),
          user: config.get<string>('MONGODB_USERNAME'),
          pass: config.get<string>('MONGODB_PASSWORD'),
        };
      },
    }),
    DataModule,
    AuthModule,
    AdminModule,
    ContentModule,
    CoursesModule,
    AssessmentsModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
