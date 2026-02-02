import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentGateway } from '../interfaces/payment-gateway.interface';
import { InitializePaymentDto } from '../dto/initiate-payment.dto';

@Injectable()
export class PaystackGateway implements PaymentGateway {
  async initialize(dto: InitializePaymentDto) {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: dto.email,
        amount: Math.round(dto.amount * 100),
        metadata: dto.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    return {
      paymentUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
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
