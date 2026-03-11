import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SectionEntity {
  @Prop({ required: true, type: Types.ObjectId, ref: 'CourseEntity' })
  courseId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: 0 })
  order!: number;
}

export type SectionDocument = HydratedDocument<SectionEntity> & {
  createdAt: Date;
  updatedAt: Date;
};
export const SectionSchema = SchemaFactory.createForClass(SectionEntity);
