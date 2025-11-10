import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from './categories.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private model: Model<Category>) {}

  create(data: Partial<Category>) {
    return new this.model(data).save();
  }
  findAll() {
    return this.model.find().exec();
  }
  async findById(id: string) {
    const c = await this.model.findById(id).exec();
    if (!c) throw new NotFoundException('Category not found');
    return c;
  }
}
