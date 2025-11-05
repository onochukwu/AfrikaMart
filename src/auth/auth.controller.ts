import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    await this.authService.register(dto.name, dto.email, dto.password);
    return { message: 'Registration successful. Check email to verify account.' };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) return { message: 'Invalid credentials' };
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    await this.authService.logout(req.user.userId);
    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.userId, dto.refreshToken);
  }

  @Get('verify-email')
  async verifyEmail(@Body() body: any) {
    
    const { id, token } = body || {};
    return this.authService.verifyEmail(id, token);
  }

  @Post('request-password-reset')
  async requestPasswordReset(@Body('email') email: string) {
    await this.authService.requestPasswordReset(email);
    return { message: 'If an account exists, a reset email has been sent' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { userId: string; token: string; newPassword: string }) {
    await this.authService.resetPassword(body.userId, body.token, body.newPassword);
    return { message: 'Password updated' };
  }
}
