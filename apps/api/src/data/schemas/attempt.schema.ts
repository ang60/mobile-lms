import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AttemptEntity {
  @Prop({ required: true, type: Types.ObjectId, ref: 'UserEntity' })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'AssessmentEntity' })
  assessmentId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  correctCount!: number;

  @Prop({ required: true, min: 1 })
  totalQuestions!: number;

  @Prop({ required: true, min: 0, max: 100 })
  scorePercent!: number;
}

export type AttemptDocument = HydratedDocument<AttemptEntity> & {
  createdAt: Date;
  updatedAt: Date;
};
export const AttemptSchema = SchemaFactory.createForClass(AttemptEntity);
