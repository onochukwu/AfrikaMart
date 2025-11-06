import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { ProfileController } from './profile.controller';
import { MailService } from '../../mail/mail.service';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: config.get('JWT_ACCESS_TOKEN_EXPIRATION') },
      }),
    }),
    UsersModule,
  ],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, MailService],
  controllers: [AuthController, ProfileController],
  exports: [AuthService],
})
export class AuthModule {}
