import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument,Types } from 'mongoose';

export type SupplierDocument = HydratedDocument<Supplier>;

export enum SupplierStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class Supplier {
  _id: Types.ObjectId;

  @Prop({ required: true })
  businessName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone?: string;

  @Prop({
    type: String,
    enum: SupplierStatus,
    default: SupplierStatus.PENDING,
  })
  status: SupplierStatus;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: null })
  approvedAt?: Date | null;
}

export const SupplierSchema = SchemaFactory.createForClass(Supplier);
