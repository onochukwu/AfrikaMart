import { IsArray, IsEmail, IsEnum } from 'class-validator';
import { PaymentProvider } from '../../../payments/enums/payment-provider.enum';

export class CheckoutItemDto {
  productId: string;
  quantity: number;
}

export class CheckoutDto {
  @IsArray()
  items: CheckoutItemDto[];

  @IsEnum(PaymentProvider)
  paymentProvider: PaymentProvider;

  @IsEmail()
  email: string;
}
