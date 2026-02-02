import { InitializePaymentDto } from '../dto/initiate-payment.dto';

export interface PaymentGateway {
  initialize(dto: InitializePaymentDto): Promise<{
    paymentUrl: string;
    reference: string;
  }>;

  verifyPayment(reference: string): Promise<{
    status: 'success' | 'failed' | 'pending';
    reference: string;
    providerResponse?: any;
  }>;

  refund(
    reference: string,
    amount?: number,
  ): Promise<{
    refunded: boolean;
    reference: string;
  }>;
}
