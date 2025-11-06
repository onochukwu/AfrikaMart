import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './common/modules/auth/auth.module';
import { UsersModule } from './common/modules/users/user.module';
import { MailModule } from './common/mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI || 'mongodb://localhost:27017/afrikamart'),
    UsersModule,
    AuthModule,
    MailModule,
  ],
})
export class AppModule {}
