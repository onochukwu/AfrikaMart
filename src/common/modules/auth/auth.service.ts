import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private mailService: MailService,
  ) {}

  private async hashData(data: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  async register(name: string, email: string, password: string) {
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException('Email already in use');

    const hashed = await this.hashData(password);
    const verificationTokenPlain = randomBytes(24).toString('hex');
    const verificationTokenHashed = await this.hashData(verificationTokenPlain);

    const user = await this.usersService.create({
      name,
      email,
      password: hashed,
      verificationToken: verificationTokenHashed,
      isVerified: false,
    });

    const userId = (user as any)._id?.toString?.() ?? (user as any).id ?? undefined;
    const url = `${this.config.get('APP_URL')}/auth/verify-email?token=${verificationTokenPlain}&id=${user._id}`;
    await this.mailService.sendVerificationEmail(email, url);

    return { id: user._id, email: user.email };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const pwMatches = await bcrypt.compare(password, user.password);
    if (!pwMatches) return null;
    return user;
  }

  async login(user: any) {
    const payload = { sub: user._id.toString(), email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { secret: this.config.get('JWT_ACCESS_TOKEN_SECRET') });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION'),
    });

    const hashedRefresh = await this.hashData(refreshToken);
    await this.usersService.setCurrentRefreshToken(hashedRefresh, user._id.toString());

    return { accessToken, refreshToken };
  }

  async logout(userId: string) {
    await this.usersService.removeRefreshToken(userId);
    return { success: true };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.currentHashedRefreshToken) throw new UnauthorizedException('Access denied');

    const refreshMatches = await bcrypt.compare(refreshToken, user.currentHashedRefreshToken);
    if (!refreshMatches) throw new UnauthorizedException('Invalid refresh token');

    const payload = { sub: user._id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { secret: this.config.get('JWT_ACCESS_TOKEN_SECRET') });
    const newRefreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRATION'),
    });

    const hashed = await this.hashData(newRefreshToken);
    await this.usersService.setCurrentRefreshToken(hashed, userId);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async verifyEmail(userId: string, tokenPlain: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.verificationToken) throw new BadRequestException('Invalid token');

    const matches = await bcrypt.compare(tokenPlain, user.verificationToken);
    if (!matches) throw new BadRequestException('Invalid token');

    await this.usersService.verifyUser(userId);
    return { success: true };
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    const userId = (user as any)?._id?.toString?.() ?? (user as any)?.id ?? undefined;
  if (!user) throw new Error('User not found');

    const resetTokenPlain = randomBytes(24).toString('hex');
    const resetTokenHashed = await this.hashData(resetTokenPlain);
    const expires = new Date(Date.now() + 1000 * 60 * 60); 

    await this.usersService.setPasswordResetToken(userId, resetTokenHashed, expires);

    const url = `${this.config.get('APP_URL')}/auth/reset-password?token=${resetTokenPlain}&id=${userId}`;
    await this.mailService.sendResetPasswordEmail(user.email, url);
    return;
  }

  async resetPassword(userId: string, tokenPlain: string, newPassword: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) throw new BadRequestException('Invalid request');
    if (user.resetPasswordExpires < new Date()) throw new BadRequestException('Token expired');

    const matches = await bcrypt.compare(tokenPlain, user.resetPasswordToken);
    if (!matches) throw new BadRequestException('Invalid token');

    const hashed = await this.hashData(newPassword);
    await this.usersService.updatePassword(userId, hashed);
    return { success: true };
  }
}
