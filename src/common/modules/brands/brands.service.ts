import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand } from './brand.schema';

@Injectable()
export class BrandsService {
  constructor(@InjectModel(Brand.name) private model: Model<Brand>) {}

  create(data: Partial<Brand>) { return new this.model(data).save(); }
  findAll() { return this.model.find().exec(); }

  async findById(id: string) {
    const b = await this.model.findById(id).exec();
    if (!b) throw new NotFoundException('Brand not found');
    return b;
  }

  async update(id: string, data: Partial<Brand>) {
    const b = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!b) throw new NotFoundException('Brand not found');
    return b;
  }

  async delete(id: string) {
    const b = await this.model.findByIdAndDelete(id).exec();
    if (!b) throw new NotFoundException('Brand not found');
    return { success: true };
  }
}
