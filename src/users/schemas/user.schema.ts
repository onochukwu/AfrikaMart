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
password: string; // hashed


@Prop({ default: 'buyer' })
role: 'buyer' | 'seller' | 'admin';


@Prop({ default: false })
isVerified: boolean;


@Prop()
verificationToken?: string; // hashed token or plain short token


@Prop()
resetPasswordToken?: string; // hashed token


@Prop()
resetPasswordExpires?: Date;


@Prop()
currentHashedRefreshToken?: string | null; // store hashed refresh token
}


export const UserSchema = SchemaFactory.createForClass(User);