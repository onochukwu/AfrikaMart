import { Controller, Post, Req } from '@nestjs/common';
import { OrdersService } from '../../modules/order/order.service';

@Controller('webhooks/payments')
export class PaymentsWebhookController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('paystack')
  async handlePaystack(@Req() req) {
    const event = req.body;

    if (event.event === 'charge.success') {
      const orderId = event.data.metadata.orderId;
      await this.ordersService.markPaid(orderId);
    }

    return { received: true };
  }
}
