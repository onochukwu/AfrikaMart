import { Controller,Get,Query,UseGuards } from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AdminService } from './admin.service';

import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/role.decorator';

import { OrderOverviewQueryDto } from './dto/order-overview.dto';
import { RevenueReportDto } from './dto/revenue-report.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('api/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('summary')
  getSummaryStats() {
    return this.adminService.getSummaryStats();
  }

  @Get('orders')
  getOrders(@Query() query: OrderOverviewQueryDto) {
    return this.adminService.getOrderOverview(query);
  }

  @Get('revenue')
  getRevenue(@Query() dto: RevenueReportDto) {
    return this.adminService.getRevenueReport(dto);
  }
}
