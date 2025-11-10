import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './products.schema';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { S3Service } from '../../s3/s3.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  controllers: [ProductsController],
  providers: [ProductsService, S3Service],
  exports: [ProductsService],
})
export class ProductsModule {}
