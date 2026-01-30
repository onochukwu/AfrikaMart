import { IsEmail, IsEnum, IsNumber, IsObject, IsOptional } from 'class-validator';
import { PaymentProvider } from '../enums/payment-provider.enum';

export class InitializePaymentDto {
  @IsEnum(PaymentProvider)
  provider: PaymentProvider;

  @IsNumber()
  amount: number;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;


  reference?: string;
}
