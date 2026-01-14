import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, expires: '30d' })
export class TokenEntity {
  @Prop({ required: true, unique: true })
  token!: string;

  @Prop({ required: true, index: true })
  userId!: string;
}

export type TokenDocument = HydratedDocument<TokenEntity>;
export const TokenSchema = SchemaFactory.createForClass(TokenEntity);

