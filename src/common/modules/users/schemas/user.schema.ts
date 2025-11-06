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


@Prop()
verificationToken?: string; 


@Prop()
resetPasswordToken?: string; 


@Prop()
resetPasswordExpires?: Date;


@Prop()
currentHashedRefreshToken?: string | null; 
}


export const UserSchema = SchemaFactory.createForClass(User);