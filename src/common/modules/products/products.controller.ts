import { Controller, Post, Body, Get, Query, Param, Patch, Delete, UseGuards, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/role.decorator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import * as multer from 'multer';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private svc: ProductsService) {}

  @Get()
  async list(@Query() q: ProductFilterDto) {
    return this.svc.searchAndFilter(q);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.findById(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller','admin')
  @Post()
  @ApiBearerAuth('access-token')
  async create(@Body() dto: CreateProductDto, @Req() req: any) {
    if (!dto.supplierId) dto.supplierId = req.user.userId;
    return this.svc.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller','admin')
  @Patch(':id')
  @ApiBearerAuth('access-token')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req: any) {
    // optional: enforce supplier ownership here
    return this.svc.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller','admin')
  @Delete(':id')
  @ApiBearerAuth('access-token')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.svc.softDelete(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller','admin')
  @Post(':id/upload-image')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiBearerAuth('access-token')
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File required');;
    const p = await this.svc.findById(id);
    p.images = p.images || [];
    await p.save();
    return { };
  }
}
