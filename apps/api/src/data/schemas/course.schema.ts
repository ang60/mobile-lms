import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class CourseEntity {
  @Prop({ required: true })
  name!: string;
}

export type CourseDocument = HydratedDocument<CourseEntity> & {
  createdAt: Date;
  updatedAt: Date;
};
export const CourseSchema = SchemaFactory.createForClass(CourseEntity);
