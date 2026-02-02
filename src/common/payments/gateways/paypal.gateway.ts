import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';
import { PaymentGateway } from '../interfaces/payment-gateway.interface';
import { InitializePaymentDto } from '../dto/initiate-payment.dto';

@Injectable()
export class PaypalGateway implements PaymentGateway {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const env = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_SECRET!,
    );

    this.client = new paypal.core.PayPalHttpClient(env);
  }

  async initialize(dto: InitializePaymentDto) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: dto.amount.toFixed(2),
          },
        },
      ],
    });

    const response = await this.client.execute(request);

    const approveLink = response.result.links?.find(
      (l) => l.rel === 'approve',
    )?.href;

    return {
      paymentUrl: approveLink!,
      reference: response.result.id,
    };
  }

  async verifyPayment(reference: string) {
    return {
      status: 'pending' as const,
      reference,
    };
  }

  async refund(reference: string, amount?: number) {
    return {
      refunded: false,
      reference,
    };
  }
}
