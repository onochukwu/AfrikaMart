import { InitializePaymentDto } from '../dto/initiate-payment.dto';

export interface PaymentGateway {
  initiatePayment(
    dto: InitializePaymentDto,
  ): Promise<{
    paymentUrl: string;
    reference: string;
  }>;

  verifyPayment(reference: string): Promise<{
    success: boolean;
    metadata?: any;
  }>;

  refund(reference: string): Promise<boolean>;
}
