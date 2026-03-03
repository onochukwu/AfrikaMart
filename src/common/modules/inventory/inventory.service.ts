import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/products.schema';
import { InventoryLog, InventoryLogDocument, InventoryChangeReason } from './inventory-log.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(InventoryLog.name) private inventoryLogModel: Model<InventoryLogDocument>,
  ) {}

  async adjustStock(
    productId: string,
    delta: number,
    reason: InventoryChangeReason,
    performedBy?: string,
    note?: string,
  ) {
    const session = await this.productModel.db.startSession();
    session.startTransaction();
    try {
      const product = await this.productModel.findById(productId).session(session).exec();
      if (!product) throw new NotFoundException(`Product ${productId} not found`);

      const stockBefore = product.stock;
      const stockAfter = stockBefore + delta;

      if (stockAfter < 0) throw new BadRequestException(`Insufficient stock for product ${productId}`);

      product.stock = stockAfter;
      await product.save({ session });

      await this.inventoryLogModel.create(
        [{ productId: new Types.ObjectId(productId), delta, stockBefore, stockAfter, reason, performedBy, note }],
        { session },
      );

      await session.commitTransaction();
      session.endSession();

      return { productId, stockBefore, stockAfter, delta };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  async replenish(productId: string, quantity: number, performedBy?: string, note?: string) {
    return this.adjustStock(productId, quantity, InventoryChangeReason.REPLENISHMENT, performedBy, note);
  }

  async getLogs(productId?: string, limit = 50) {
    const filter: any = {};
    if (productId) filter.productId = new Types.ObjectId(productId);
    return this.inventoryLogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('productId', 'name')
      .exec();
  }

  async getLowStockProducts(threshold = 10) {
    return this.productModel
      .find({ stock: { $lte: threshold }, isDeleted: false })
      .select('name stock supplierId')
      .exec();
  }
}
