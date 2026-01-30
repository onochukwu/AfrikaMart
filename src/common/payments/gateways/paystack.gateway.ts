import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentGateway } from '../interfaces/payment-gateway.interface';
import { InitializePaymentDto } from '../dto/initiate-payment.dto';

@Injectable()
export class PaystackGateway implements PaymentGateway {
  private readonly baseUrl = 'https://api.paystack.co';

  async initiatePayment(dto: InitializePaymentDto) {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email: dto.email,
        amount: dto.amount * 100, // kobo
        metadata: dto.metadata,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      },
    );

    return {
      paymentUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    };
  }

  async verifyPayment(reference: string) {
    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      },
    );

    return {
      success: response.data.data.status === 'success',
      metadata: response.data.data,
    };
  }

  async refund(reference: string) {
    await axios.post(
      `${this.baseUrl}/refund`,
      { reference },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      },
    );

    return true;
  }
}
