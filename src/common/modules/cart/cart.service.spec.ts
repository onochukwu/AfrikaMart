import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getModelToken } from '@nestjs/mongoose';
import { Cart } from './schemas/cart.schema';
import { CartItem } from './schemas/cart-item.schema';
import { Product } from '../products/schemas/products.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const cartId = new Types.ObjectId();
const mockCart = { _id: cartId, userId: 'u1', totalAmount: 0, save: jest.fn() };
const mockProduct = { _id: new Types.ObjectId(), name: 'Widget', price: 25, stock: 10, isDeleted: false };

const mockCartModel = {
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};
const mockCartItemModel = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  findOneAndDelete: jest.fn(),
};
const mockProductModel = {
  findById: jest.fn(),
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getModelToken(Cart.name), useValue: mockCartModel },
        { provide: getModelToken(CartItem.name), useValue: mockCartItemModel },
        { provide: getModelToken(Product.name), useValue: mockProductModel },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('getCart', () => {
    it('returns existing cart', async () => {
      mockCartModel.findOne.mockResolvedValue(mockCart);
      const result = await service.getCart('u1');
      expect(result).toEqual(mockCart);
    });

    it('creates cart if not found', async () => {
      mockCartModel.findOne.mockResolvedValue(null);
      mockCartModel.create.mockResolvedValue(mockCart);
      const result = await service.getCart('u1');
      expect(mockCartModel.create).toHaveBeenCalled();
      expect(result).toEqual(mockCart);
    });
  });

  describe('addItem', () => {
    it('throws NotFoundException for missing product', async () => {
      mockProductModel.findById.mockResolvedValue(null);
      await expect(service.addItem('u1', 'p1', 1)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException on insufficient stock', async () => {
      mockProductModel.findById.mockResolvedValue({ ...mockProduct, stock: 0 });
      await expect(service.addItem('u1', 'p1', 1)).rejects.toThrow(BadRequestException);
    });

    it('adds new item to cart', async () => {
      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockCartModel.findOne.mockResolvedValue(mockCart);
      mockCartItemModel.findOne.mockResolvedValue(null);
      mockCartItemModel.create.mockResolvedValue({});
      mockCartItemModel.find.mockResolvedValue([]);
      mockCartModel.findByIdAndUpdate.mockResolvedValue({});

      const result = await service.addItem('u1', String(mockProduct._id), 2);
      expect(result).toEqual({ message: 'Item added to cart' });
      expect(mockCartItemModel.create).toHaveBeenCalled();
    });

    it('increments quantity on existing item', async () => {
      const existingItem = { quantity: 1, price: 25, save: jest.fn() };
      mockProductModel.findById.mockResolvedValue(mockProduct);
      mockCartModel.findOne.mockResolvedValue(mockCart);
      mockCartItemModel.findOne.mockResolvedValue(existingItem);
      mockCartItemModel.find.mockResolvedValue([existingItem]);
      mockCartModel.findByIdAndUpdate.mockResolvedValue({});

      await service.addItem('u1', String(mockProduct._id), 3);
      expect(existingItem.quantity).toBe(4);
      expect(existingItem.save).toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('removes item and recalculates', async () => {
      mockCartModel.findOne.mockResolvedValue(mockCart);
      mockCartItemModel.findOneAndDelete.mockResolvedValue({});
      mockCartItemModel.find.mockResolvedValue([]);
      mockCartModel.findByIdAndUpdate.mockResolvedValue({});

      const result = await service.removeItem('u1', 'item1');
      expect(result).toEqual({ message: 'Item removed' });
    });
  });
});
