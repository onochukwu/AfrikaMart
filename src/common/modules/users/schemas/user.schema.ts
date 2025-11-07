import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


export type UserDocument = User & Document;


@Schema({ timestamps: true })
export class User {
@Prop({ required: true })
name: string;


@Prop({ required: true, unique: true })
email: string;


@Prop({ required: true })
password: string; 


@Prop({ default: 'buyer' })
role: 'buyer' | 'seller' | 'admin';


@Prop({ default: false })
isVerified: boolean;

 @Prop({ type: String, default: null })
  verificationToken?: string | null;

  @Prop({ type: String, default: null })
  resetPasswordToken?: string | null;


  @Prop({ type: Date, default: null })
  resetPasswordExpires?: Date | null;

  @Prop({ type: String, default: null })
  currentHashedRefreshToken?: string | null;
}


export const UserSchema = SchemaFactory.createForClass(User);