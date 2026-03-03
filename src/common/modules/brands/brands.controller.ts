import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/role.decorator';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private svc: BrandsService) {}

  @Get() list() { return this.svc.findAll(); }
  @Get(':id') get(@Param('id') id: string) { return this.svc.findById(id); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @Post() create(@Body() body: any) { return this.svc.create(body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @Patch(':id') update(@Param('id') id: string, @Body() body: any) { return this.svc.update(id, body); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth('access-token')
  @Delete(':id') delete(@Param('id') id: string) { return this.svc.delete(id); }
}
