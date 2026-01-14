import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DataService } from './data.service';
import { UserEntity, UserSchema } from './schemas/user.schema';
import { ContentEntity, ContentSchema } from './schemas/content.schema';
import { TokenEntity, TokenSchema } from './schemas/token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserEntity.name, schema: UserSchema },
      { name: ContentEntity.name, schema: ContentSchema },
      { name: TokenEntity.name, schema: TokenSchema },
    ]),
  ],
  providers: [DataService],
  exports: [DataService],
})
export class DataModule {}



