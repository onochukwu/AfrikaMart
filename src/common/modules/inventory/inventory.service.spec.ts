import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from '../products/schemas/products.schema';
import { InventoryLog } from './inventory-log.schema';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryChangeReason } from './inventory-log.schema';
import { Types } from 'mongoose';

const productId = new Types.ObjectId().toString();
const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
};
const mockProduct = {
  _id: productId,
  stock: 50,
  save: jest.fn(),
};

const mockProductModel = {
  findById: jest.fn(),
  find: jest.fn(),
  db: { startSession: jest.fn().mockResolvedValue(mockSession) },
};
const mockInventoryLogModel = {
  create: jest.fn(),
  find: jest.fn(),
};

describe('InventoryService', () => {
  let service: InventoryService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: getModelToken(Product.name), useValue: mockProductModel },
        { provide: getModelToken(InventoryLog.name), useValue: mockInventoryLogModel },
      ],
    }).compile();
    service = module.get<InventoryService>(InventoryService);
  });

  it('throws NotFoundException for unknown product', async () => {
    mockProductModel.findById.mockReturnValue({ session: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) });
    await expect(
      service.adjustStock(productId, 5, InventoryChangeReason.ADJUSTMENT),
    ).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException if stock goes negative', async () => {
    const p = { ...mockProduct, stock: 5, save: jest.fn() };
    mockProductModel.findById.mockReturnValue({ session: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(p) }) });
    await expect(
      service.adjustStock(productId, -10, InventoryChangeReason.ORDER),
    ).rejects.toThrow(BadRequestException);
  });

  it('adjusts stock correctly and creates log', async () => {
    const p = { ...mockProduct, stock: 50, save: jest.fn() };
    mockProductModel.findById.mockReturnValue({ session: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(p) }) });
    mockInventoryLogModel.create.mockResolvedValue({});

    const result = await service.adjustStock(productId, 10, InventoryChangeReason.REPLENISHMENT);
    expect(result.stockBefore).toBe(50);
    expect(result.stockAfter).toBe(60);
    expect(p.save).toHaveBeenCalled();
    expect(mockInventoryLogModel.create).toHaveBeenCalled();
  });
});
