import { Controller, Post, Body, Get } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private svc: CategoriesService) {}
  @Post() create(@Body() body: Partial<any>) { return this.svc.create(body); }
  @Get() list() { return this.svc.findAll(); }
}
