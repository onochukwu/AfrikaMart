import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './products.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';


@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>
  ) {}

  async create(dto: CreateProductDto) {
    const doc: any = {
      name: dto.name,
      description: dto.description ?? '',
      price: dto.price,
      stock: dto.stock ?? 0,
      images: dto.images ?? [],
      status: 'active',
    };
    if (dto.category) doc.category = new Types.ObjectId(dto.category);
    if (dto.brand) doc.brand = new Types.ObjectId(dto.brand);
    if (dto.supplierId) doc.supplierId = new Types.ObjectId(dto.supplierId);
    const p = new this.productModel(doc);
    return p.save();
  }

  async findById(id: string) {
    const p = await this.productModel.findById(id).where({ isDeleted: false }).populate('category brand').exec();
    if (!p) throw new NotFoundException('Product not found');
    return p;
  }

  async update(id: string, dto: UpdateProductDto) {
    const update: any = { ...dto };
    if (dto.category) update.category = new Types.ObjectId(dto.category);
    if (dto.brand) update.brand = new Types.ObjectId(dto.brand);
    const res = await this.productModel.findByIdAndUpdate(id, update, { new: true }).exec();
    if (!res) throw new NotFoundException('Product not found');
    return res;
  }

  async softDelete(id: string) {
    const res = await this.productModel.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true }).exec();
    if (!res) throw new NotFoundException('Product not found');
    return res;
  }

  async restore(id: string) {
    const res = await this.productModel.findByIdAndUpdate(id, { isDeleted: false, deletedAt: null }, { new: true }).exec();
    if (!res) throw new NotFoundException('Product not found');
    return res;
  }

  async searchAndFilter(filter: any) {
    const page = Number(filter.page) || 1;
    const limit = Math.min(Number(filter.limit) || 20, 100);
    const skip = (page - 1) * limit;
    const query: any = { isDeleted: false };

    if (filter.q) query.$text = { $search: filter.q };
    if (filter.category) query.category = new Types.ObjectId(filter.category);
    if (filter.brand) query.brand = new Types.ObjectId(filter.brand);
    if (filter.minPrice) query.price = { ...(query.price || {}), $gte: Number(filter.minPrice) };
    if (filter.maxPrice) query.price = { ...(query.price || {}), $lte: Number(filter.maxPrice) };

    let sort: any = {};
    if (filter.sort) {
      filter.sort.split(',').forEach((pair: string) => {
        const [field, dir] = pair.split(':');
        sort[field] = dir === 'desc' ? -1 : 1;
      });
    } else sort = { createdAt: -1 };

    const [items, total] = await Promise.all([
      this.productModel.find(query).sort(sort).skip(skip).limit(limit).exec(),
      this.productModel.countDocuments(query).exec(),
    ]);

    return { items, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async adjustStockBulk(changes: { productId: string; delta: number }[]) {
    const session = await this.productModel.db.startSession();
    session.startTransaction();
    try {
      for (const c of changes) {
        const p = await this.productModel.findById(c.productId).session(session).exec();
        if (!p) throw new NotFoundException(`Product ${c.productId} not found`);
        const newStock = p.stock + c.delta;
        if (newStock < 0) throw new BadRequestException('Insufficient stock');
        p.stock = newStock;
        await p.save({ session });
      }
      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
}
