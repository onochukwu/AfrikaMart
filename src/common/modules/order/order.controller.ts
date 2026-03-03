import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrdersService } from './order.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/role.decorator';
import { CheckoutDto } from './dto/checkout.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth('access-token')
@Controller('api/orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@Req() req, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.userId ?? req.user.sub, dto);
  }

  @Post(':id/cancel')
  cancel(@Req() req, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user.userId ?? req.user.sub, id);
  }

  @Get()
  getMyOrders(@Req() req) {
    return this.ordersService.getUserOrders(req.user.userId ?? req.user.sub);
  }

  @Get(':id')
  getOrder(@Req() req, @Param('id') id: string) {
    return this.ordersService.getOrderById(req.user.userId ?? req.user.sub, id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.ordersService.refund(id);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }
}
