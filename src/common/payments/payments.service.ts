import { BadRequestException, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

import { PaymentProvider } from './enums/payment-provider.enum';
import { InitializePaymentDto } from './dto/initiate-payment.dto';

import { StripeGateway } from './gateways/stripe.gateway';
import { PaystackGateway } from './gateways/paystack.gateway';
import { PaypalGateway } from './gateways/paypal.gateway';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly stripeGateway: StripeGateway,
    private readonly paystackGateway: PaystackGateway,
    private readonly paypalGateway: PaypalGateway,
  ) {}

  async initializePayment(dto: InitializePaymentDto) {
    const reference = uuidv4();

    switch (dto.provider) {
      case PaymentProvider.STRIPE:
        return this.stripeGateway.initialize({
          ...dto,
          reference,
        });

      case PaymentProvider.PAYSTACK:
        return this.paystackGateway.initialize({
          ...dto,
          reference,
        });

      case PaymentProvider.PAYPAL:
        return this.paypalGateway.initialize({
          ...dto,
          reference,
        });

      default:
        throw new BadRequestException('Unsupported payment provider');
    }
  }
}
