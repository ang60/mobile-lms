import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { Role, SubscriptionStatus } from '@/data/data.types';

type SubscriptionSubdoc = {
  planId: string;
  status: SubscriptionStatus;
  expiresAt: Date;
};

@Schema({ timestamps: true })
export class UserEntity {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, index: true })
  email!: string;

  @Prop({ required: true })
  password!: string;

  @Prop()
  phone?: string;

  @Prop({ enum: ['student', 'admin'], default: 'student' })
  role!: Role;

  @Prop({
    type: {
      planId: { type: String, required: true },
      status: { type: String, enum: ['active', 'inactive', 'past_due'], default: 'active' },
      expiresAt: { type: Date, required: true },
    },
    default: null,
  })
  subscription: SubscriptionSubdoc | null;

  @Prop({ type: [String], default: [] })
  library!: string[];
}

export type UserDocument = HydratedDocument<UserEntity> & {
  createdAt: Date;
  updatedAt: Date;
};
export const UserSchema = SchemaFactory.createForClass(UserEntity);

