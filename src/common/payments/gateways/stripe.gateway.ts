import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeGateway {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
   apiVersion: '2026-01-28.clover',,
  });

  async createPayment(data: {
    amount: number;
    currency: string;
    reference: string;
    email?: string;
  }) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(data.amount * 100),
      currency: data.currency,
      receipt_email: data.email,
      metadata: { reference: data.reference },
    });
  }
}
