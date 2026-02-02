import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentGateway } from '../interfaces/payment-gateway.interface';
import { InitializePaymentDto } from '../dto/initiate-payment.dto';

@Injectable()
export class StripeGateway implements PaymentGateway {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-01-28.clover',
    });
  }

  async initialize(dto: InitializePaymentDto) {
    const intent = await this.stripe.paymentIntents.create({
      amount: Math.round(dto.amount * 100),
      currency: 'usd',
      receipt_email: dto.email,
      metadata: dto.metadata,
    });

    return {
      paymentUrl: intent.client_secret!,
      reference: intent.id,
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
