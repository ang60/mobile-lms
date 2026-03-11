import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataService } from './data.service';
import { UserEntity, UserSchema } from './schemas/user.schema';
import { ContentEntity, ContentSchema } from './schemas/content.schema';
import { TokenEntity, TokenSchema } from './schemas/token.schema';
import { CourseEntity, CourseSchema } from './schemas/course.schema';
import { SectionEntity, SectionSchema } from './schemas/section.schema';
import { AssessmentEntity, AssessmentSchema } from './schemas/assessment.schema';
import { QuestionEntity, QuestionSchema } from './schemas/question.schema';
import { AttemptEntity, AttemptSchema } from './schemas/attempt.schema';
import { PaymentEntity, PaymentSchema } from './schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: ContentEntity.name, schema: ContentSchema },
      { name: TokenEntity.name, schema: TokenSchema },
      { name: CourseEntity.name, schema: CourseSchema },
      { name: SectionEntity.name, schema: SectionSchema },
      { name: AssessmentEntity.name, schema: AssessmentSchema },
      { name: QuestionEntity.name, schema: QuestionSchema },
      { name: AttemptEntity.name, schema: AttemptSchema },
      { name: PaymentEntity.name, schema: PaymentSchema },
    ]),
  ],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}



