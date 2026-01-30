import { Injectable, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

import { Order, OrderDocument } from '../order/schemas/order.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Supplier, SupplierDocument } from '../supplier/schemas/suppliers.schema';
import { AuditLog, AuditLogDocument } from './schemas/audit-log.schema';

import { OrderOverviewQueryDto } from './dto/order-overview.dto';
import { RevenueReportDto } from './dto/revenue-report.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Supplier.name)
    private readonly supplierModel: Model<SupplierDocument>,

    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async getSummaryStats() {
    const cacheKey = 'admin:summary:stats';

    const cached = (await this.cacheManager.get(cacheKey)) as any;
    if (cached) return cached;

    const [orders, revenueAgg, users, suppliers] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.aggregate([
        { $match: { status: 'PAID' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.userModel.countDocuments(),
      this.supplierModel.countDocuments(),
    ]);

    const data = {
      totalOrders: orders,
      totalRevenue: revenueAgg[0]?.total ?? 0,
      totalUsers: users,
      totalSuppliers: suppliers,
    };

    await this.cacheManager.set(cacheKey, data, 60);
    return data;
  }

  async getOrderOverview(query: OrderOverviewQueryDto) {
    const { page, limit, status } = query;

    const filter: any = {};
    if (status) filter.status = status;

    const orders = await this.orderModel
      .find(filter)
      .populate('user', 'email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await this.orderModel.countDocuments(filter);

    return { total, page, limit, orders };
  }

  async getRevenueReport(dto: RevenueReportDto) {
    const { startDate, endDate, interval } = dto;

    const format = interval === 'daily' ? '%Y-%m-%d' : '%Y-%m';

    return this.orderModel.aggregate([
      {
        $match: {
          status: 'PAID',
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async logAdminAction(
    adminId: string,
    action: string,
    resource?: string,
    metadata?: any,
  ) {
    await this.auditLogModel.create({
      adminId,
      action,
      resource,
      metadata,
    });
  }
}
