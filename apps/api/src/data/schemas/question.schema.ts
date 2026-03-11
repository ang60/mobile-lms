import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class QuestionEntity {
  @Prop({ required: true, type: Types.ObjectId, ref: 'AssessmentEntity' })
  assessmentId!: Types.ObjectId;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ required: true })
  questionText!: string;

  @Prop({ default: 'mcq' })
  type!: 'mcq' | 'true_false';

  @Prop({ type: [String], default: [] })
  options!: string[];

  @Prop({ required: true, min: 0 })
  correctIndex!: number;
}

export type QuestionDocument = HydratedDocument<QuestionEntity> & {
  createdAt: Date;
  updatedAt: Date;
};
export const QuestionSchema = SchemaFactory.createForClass(QuestionEntity);
