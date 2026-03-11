import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class PaymentEntity {
  @Prop({ required: true, type: Types.ObjectId, ref: 'UserEntity' })
  userId!: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount!: number;

  @Prop({ default: 'KES' })
  currency!: string;

  @Prop({ default: 'completed' })
  status!: string;

  @Prop({ default: 'subscription' })
  type!: string;

  @Prop()
  planId?: string;
}

export type PaymentDocument = HydratedDocument<PaymentEntity> & {
  createdAt: Date;
  updatedAt: Date;
};
export const PaymentSchema = SchemaFactory.createForClass(PaymentEntity);
