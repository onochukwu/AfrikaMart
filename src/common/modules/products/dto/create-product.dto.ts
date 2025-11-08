import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsMongoId, IsArray } from 'class-validator';

export class CreateProductDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;

  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;

  @ApiProperty() @IsNumber() @Min(0) price: number;

  @ApiProperty({ required: false }) @IsOptional() @IsNumber() @Min(0) stock?: number;

  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() images?: string[];

  @ApiProperty({ required: false }) @IsOptional() @IsMongoId() category?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsMongoId() brand?: string;

  @ApiProperty({ required: false }) @IsOptional() @IsMongoId() supplierId?: string;
}
