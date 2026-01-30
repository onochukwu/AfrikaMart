import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';


@Injectable()
export class PaypalGateway {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    const env = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_SECRET!,
    );
    this.client = new paypal.core.PayPalHttpClient(env);
  }

  async createPayment(data: {
    amount: number;
    currency: string;
    reference: string;
  }) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: data.currency,
            value: data.amount.toFixed(2),
          },
        },
      ],
    });

    const response = await this.client.execute(request);
    return response.result;
  }
}
