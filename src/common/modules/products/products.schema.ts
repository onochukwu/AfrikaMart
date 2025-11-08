import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, type: String, index: true })
  name: string;

  @Prop({ type: String, default: '' })
  description?: string;

  @Prop({ required: true, type: Number, min: 0 })
  price: number;

  @Prop({ type: Number, default: 0, min: 0 })
  stock: number;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  category?: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'Brand', default: null })
  brand?: Types.ObjectId | null;

  @Prop({ default: false, type: Boolean })
  isDeleted?: boolean;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  supplierId?: Types.ObjectId | null;

  @Prop({ type: String, default: 'active' })
  status?: 'active' | 'draft' | 'archived';
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
