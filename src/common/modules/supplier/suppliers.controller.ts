import { Body, Controller, Get, Patch, Post, Req, Param,} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { Roles } from '../../decorators/role.decorator';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { UseGuards } from '@nestjs/common';

@Controller('api/suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

 

  @Post('register')
  register(@Body() body) {
    return this.suppliersService.register(body);
  }

  @Post('login')
  login(@Body() body) {
    return this.suppliersService.login(body.email, body.password);
  }

  

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPPLIER')
  @Get('profile')
  profile(@Req() req) {
    return this.suppliersService.findById(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPPLIER')
  @Patch('profile')
  updateProfile(@Req() req, @Body() body) {
    return this.suppliersService.updateProfile(req.user.sub, body);
  }


  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.suppliersService.approve(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.suppliersService.reject(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/suspend')
  suspend(@Param('id') id: string) {
    return this.suppliersService.suspend(id);
  }
}
