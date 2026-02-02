import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Order, OrderDocument, OrderItem, OrderStatus } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/products.schema';
import { MailService } from '../../mail/mail.service';
import { PaymentsService } from '../../payments/payments.service';
import { CheckoutDto } from './dto/checkout.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,

    private readonly mailService: MailService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    if (!dto.items || dto.items.length === 0)
      throw new BadRequestException('Cart is empty');

    let total = 0;
    const orderItems: OrderItem[] = [];

    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId);
      if (!product) throw new NotFoundException('Product not found');

      if (product.stock < item.quantity)
        throw new BadRequestException(
          `Insufficient stock for ${product.name}`,
        );

      const itemTotal = product.price * item.quantity;

      orderItems.push({
        productId: product._id as Types.ObjectId,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal,
      });

      total += itemTotal;
    }

    
    const order = await this.orderModel.create({
      userId: new Types.ObjectId(userId),
      items: orderItems,
      totalAmount: total,
      status: OrderStatus.PENDING,
      paymentProvider: dto.paymentProvider,
    });

    
    const payment = await this.paymentsService.initializePayment({
      provider: dto.paymentProvider,
      amount: total,
      currency: 'USD',
      reference: `ORDER_${order._id}`,
      email: dto.email,
      metadata: { orderId: order._id },
    });

   
    order.paymentReference = payment.reference;
    await order.save();

    
    return {
      orderId: order._id,
      amount: total,
      payment,
    };
  }

  async markPaid(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    order.status = OrderStatus.PAID;
    await order.save();

   
    for (const item of order.items) {
      await this.productModel.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    await this.mailService.sendMail(
      'user@email.com',
      'Order Confirmed',
      `<p>Your order ${order._id} has been confirmed.</p>`,
    );

    return order;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (order.userId.toString() !== userId)
      throw new ForbiddenException();

    if (order.status !== OrderStatus.PENDING)
      throw new BadRequestException('Order cannot be cancelled');

    order.status = OrderStatus.CANCELLED;
    await order.save();

    return { message: 'Order cancelled' };
  }

  async refund(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== OrderStatus.PAID)
      throw new BadRequestException('Refund not allowed');

    order.status = OrderStatus.REFUNDED;
    order.isRefunded = true;
    await order.save();

    return { message: 'Order refunded' };
  }

  async getUserOrders(userId: string) {
    return this.orderModel
      .find({ userId })
      .sort({ createdAt: -1 });
  }
}
