import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cart } from './schemas/cart.schema';
import { CartItem } from './schemas/cart-item.schema';
import { Product } from '../products/products.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItem>,
    @InjectModel(Product.name) private productModel: Model<Product>,
  ) {}

  // Get or create cart
  async getCart(userId: string) {
    let cart = await this.cartModel.findOne({ userId });
    if (!cart) {
      cart = await this.cartModel.create({ userId });
    }
    return cart;
  }

  // Add item
  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.productModel.findById(productId);
    if (!product || product.isDeleted)
      throw new NotFoundException('Product not found');

    if (product.stock < quantity)
      throw new BadRequestException('Insufficient stock');

    const cart = await this.getCart(userId);

    const existing = await this.cartItemModel.findOne({
      cartId: cart._id,
      productId,
    });

    if (existing) {
      existing.quantity += quantity;
      existing.price = product.price;
      await existing.save();
    } else {
      await this.cartItemModel.create({
        cartId: cart._id,
        productId,
        quantity,
        price: product.price,
      });
    }

    await this.recalculateCart(cart._id);
    return { message: 'Item added to cart' };
  }

  async viewCart(userId: string) {
    const cart = await this.getCart(userId);

    const items = await this.cartItemModel
      .find({ cartId: cart._id })
      .populate('productId');

    return {
      cartId: cart._id,
      totalAmount: cart.totalAmount,
      items,
    };
  }

  async updateItem(
    userId: string,
    itemId: string,
    quantity: number,
  ) {
    const cart = await this.getCart(userId);

    const item = await this.cartItemModel.findOne({
      _id: itemId,
      cartId: cart._id,
    });

    if (!item) throw new NotFoundException('Cart item not found');

    if (quantity <= 0) {
      await item.deleteOne();
    } else {
      item.quantity = quantity;
      await item.save();
    }

    await this.recalculateCart(cart._id);
    return { message: 'Cart updated' };
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getCart(userId);

    await this.cartItemModel.findOneAndDelete({
      _id: itemId,
      cartId: cart._id,
    });

    await this.recalculateCart(cart._id);
    return { message: 'Item removed' };
  }

  // Keep prices in sync
  async recalculateCart(cartId: Types.ObjectId) {
    const items = await this.cartItemModel.find({ cartId });

    const total = items.reduce(
      (sum, item) =>
        sum + (item.price - item.discount) * item.quantity,
      0,
    );

    await this.cartModel.findByIdAndUpdate(cartId, {
      totalAmount: total,
    });
  }
}
