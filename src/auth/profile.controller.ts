import { Controller, Get, Patch, Req, UseGuards, Body } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UsersService } from '../users/user.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getProfile(@Req() req: any) {
    const user = await this.usersService.findById(req.user.userId);
    if (!user) return null;
    return { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified };
  }

  @Patch()
  async updateProfile(@Req() req: any, @Body() body: Partial<any>) {
    const updated = await this.usersService.updateProfile(req.user.userId, body);
    return updated;
  }
}
