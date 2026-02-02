import { IsEmail, IsEnum, IsNumber, IsString, IsOptional, IsUrl } from 'class-validator';
import { PaymentProvider } from '../enums/payment-provider.enum';

export class InitializePaymentDto {
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsString()
  reference: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  callbackUrl?: string;

  @IsOptional()
  metadata?: Record<string, any>;

}
