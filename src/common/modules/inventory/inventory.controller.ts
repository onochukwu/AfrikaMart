import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { InventoryChangeReason } from './inventory-log.schema';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/role.decorator';

@ApiTags('Inventory')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'seller')
@Controller('api/inventory')
export class InventoryController {
  constructor(private svc: InventoryService) {}

  @Post(':productId/replenish')
  replenish(
    @Param('productId') productId: string,
    @Body() body: { quantity: number; note?: string },
    @Req() req: any,
  ) {
    return this.svc.replenish(productId, body.quantity, req.user.userId, body.note);
  }

  @Post(':productId/adjust')
  adjust(
    @Param('productId') productId: string,
    @Body() body: { delta: number; reason: InventoryChangeReason; note?: string },
    @Req() req: any,
  ) {
    return this.svc.adjustStock(productId, body.delta, body.reason, req.user.userId, body.note);
  }

  @Get('logs')
  getLogs(@Query('productId') productId?: string, @Query('limit') limit?: number) {
    return this.svc.getLogs(productId, limit ? +limit : 50);
  }

  @Get('low-stock')
  getLowStock(@Query('threshold') threshold?: number) {
    return this.svc.getLowStockProducts(threshold ? +threshold : 10);
  }
}
