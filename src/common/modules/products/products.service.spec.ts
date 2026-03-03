import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './schemas/products.schema';
import { S3Service } from '../../s3/s3.service';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

const mockProduct = {
  _id: new Types.ObjectId(),
  name: 'Shea Butter',
  price: 10,
  stock: 100,
  isDeleted: false,
  images: [],
  save: jest.fn(),
};

const mockProductModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  db: { startSession: jest.fn() },
  prototype: { save: jest.fn() },
};


function MockProductModelConstructor(data: any) {
  return { ...data, save: jest.fn().mockResolvedValue({ ...data, _id: new Types.ObjectId() }) };
}
Object.assign(MockProductModelConstructor, mockProductModel);

const mockS3Service = { uploadFile: jest.fn().mockResolvedValue('https://s3.example.com/img.jpg') };

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getModelToken(Product.name), useValue: MockProductModelConstructor },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('findById', () => {
    it('throws NotFoundException if product not found', async () => {
      mockProductModel.findById.mockReturnValue({
        where: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }) }),
      });
      await expect(service.findById('invalid-id')).rejects.toThrow(NotFoundException);
    });

    it('returns product when found', async () => {
      mockProductModel.findById.mockReturnValue({
        where: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockProduct) }),
        }),
      });
      const result = await service.findById(String(mockProduct._id));
      expect(result).toEqual(mockProduct);
    });
  });

  describe('softDelete', () => {
    it('marks product as deleted', async () => {
      mockProductModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockProduct, isDeleted: true }),
      });
      const result = await service.softDelete(String(mockProduct._id));
      expect((result as any).isDeleted).toBe(true);
    });

    it('throws NotFoundException for missing product', async () => {
      mockProductModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.softDelete('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadImage', () => {
    it('uploads to S3 and returns url', async () => {
      const result = await service.uploadImage(Buffer.from('img'), 'test.jpg', 'image/jpeg');
      expect(result.url).toBe('https://s3.example.com/img.jpg');
      expect(mockS3Service.uploadFile).toHaveBeenCalledTimes(1);
    });
  });
});
