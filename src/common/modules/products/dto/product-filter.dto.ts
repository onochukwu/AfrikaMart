import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class ProductFilterDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsNumberString() minPrice?: string;
  @IsOptional() @IsNumberString() maxPrice?: string;
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() limit?: string;
  @IsOptional() @IsString() sort?: string; // e.g. "price:asc,createdAt:desc"
}
