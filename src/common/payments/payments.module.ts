import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaystackGateway } from './gateways/paystack.gateway';
import { StripeGateway } from './gateways/stripe.gateway';
import { PaypalGateway } from './gateways/paypal.gateway';

@Module({
  providers: [
    PaymentsService,
    PaystackGateway,
    StripeGateway,
    PaypalGateway,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
