import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InventoryLogDocument = HydratedDocument<InventoryLog>;

export enum InventoryChangeReason {
  ORDER = 'ORDER',
  REPLENISHMENT = 'REPLENISHMENT',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
}

@Schema({ timestamps: true })
export class InventoryLog {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  delta: number; 

  @Prop({ required: true })
  stockBefore: number;

  @Prop({ required: true })
  stockAfter: number;

  @Prop({ type: String, enum: InventoryChangeReason, required: true })
  reason: InventoryChangeReason;

  @Prop()
  performedBy?: string; 

  @Prop()
  note?: string;
}

export const InventoryLogSchema = SchemaFactory.createForClass(InventoryLog);
