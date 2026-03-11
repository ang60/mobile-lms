import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class AssessmentEntity {
  @Prop({ required: true })
  title!: string;

  @Prop()
  courseId?: Types.ObjectId;

  @Prop()
  sectionId?: Types.ObjectId;

  @Prop({ default: '' })
  courseName!: string;

  @Prop({ default: '' })
  sectionName!: string;

  @Prop({ required: true, min: 1 })
  questions!: number;

  @Prop({ required: true, min: 1 })
  timeMinutes!: number;

  @Prop({ default: 'Medium' })
  difficulty!: string;

  @Prop({ default: 0 })
  attempts!: number;

  @Prop({ default: '-' })
  avgScore!: string;
}

export type AssessmentDocument = HydratedDocument<AssessmentEntity> & {
  createdAt: Date;
  updatedAt: Date;
};
export const AssessmentSchema = SchemaFactory.createForClass(AssessmentEntity);
