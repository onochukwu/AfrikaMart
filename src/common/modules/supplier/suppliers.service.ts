import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Supplier, SupplierStatus, } from './schemas/suppliers.schema';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectModel(Supplier.name)
    private supplierModel: Model<Supplier>,
    private jwtService: JwtService,
  ) {}

  async register(data: {
    businessName: string;
    email: string;
    password: string;
    phone?: string;
  }) {
    const exists = await this.supplierModel.findOne({ email: data.email });
    if (exists) throw new BadRequestException('Email already in use');

    const hashed = await bcrypt.hash(data.password, 10);

    const supplier = await this.supplierModel.create({
      ...data,
      password: hashed,
      status: SupplierStatus.PENDING,
      isActive: true,
    });

    return {
      message: 'Supplier registered. Awaiting admin approval.',
      id: supplier._id,
    };
  }

  async login(email: string, password: string) {
    const supplier = await this.supplierModel
      .findOne({ email })
      .select('+password');

    if (!supplier) throw new NotFoundException('Invalid credentials');

    const valid = await bcrypt.compare(password, supplier.password);
    if (!valid) throw new NotFoundException('Invalid credentials');

    if (supplier.status !== SupplierStatus.APPROVED) {
      throw new ForbiddenException('Supplier not approved');
    }

    if (!supplier.isActive) {
      throw new ForbiddenException('Supplier account suspended');
    }

    const payload = {
      sub: supplier._id.toString(),
      role: 'SUPPLIER',
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async findById(id: string) {
    const supplier = await this.supplierModel
      .findById(id)
      .select('-password');

    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async updateProfile(id: string, data: Partial<Supplier>) {
    delete data.password;
    delete data.status;
    delete data.email;

    return this.supplierModel.findByIdAndUpdate(id, data, {
      new: true,
    });
  }

  async findAll() {
    return this.supplierModel.find().select('-password');
  }

  async approve(id: string) {
    const supplier = await this.supplierModel.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    supplier.status = SupplierStatus.APPROVED;
    supplier.approvedAt = new Date();
    await supplier.save();

    return { message: 'Supplier approved' };
  }

  async reject(id: string) {
    const supplier = await this.supplierModel.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    supplier.status = SupplierStatus.REJECTED;
    await supplier.save();

    return { message: 'Supplier rejected' };
  }

  async suspend(id: string) {
    const supplier = await this.supplierModel.findById(id);
    if (!supplier) throw new NotFoundException('Supplier not found');

    supplier.isActive = false;
    await supplier.save();

    return { message: 'Supplier suspended' };
  }
}
