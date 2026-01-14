import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { ContentType } from '@/data/data.types';

@Schema({ timestamps: true })
export class ContentEntity {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  subject!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop()
  previewUrl?: string;

  @Prop({ default: 'other' })
  type!: ContentType;

  @Prop({ required: true, min: 0 })
  lessons!: number;

  @Prop()
  fileId?: string;

  @Prop()
  fileName?: string;

  @Prop()
  fileType?: string;

  @Prop()
  fileSize?: number;
}

export type ContentDocument = HydratedDocument<ContentEntity> & {
  createdAt: Date;
  updatedAt: Date;
};
export const ContentSchema = SchemaFactory.createForClass(ContentEntity);

