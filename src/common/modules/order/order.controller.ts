import { Body,Controller,Get,Param,Post,Req,UseGuards, } from '@nestjs/common';
import { OrdersService } from './order.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';


@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@Req() req, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.sub, dto);
  }

  @Post(':id/cancel')
  cancel(@Req() req, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user.sub, id);
  }

  @Get()
  getMyOrders(@Req() req) {
    return this.ordersService.getUserOrders(req.user.sub);
  }
}
