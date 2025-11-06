import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(data: Partial<User>): Promise<UserDocument> {
    const u = new this.userModel(data);
    return u.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async setCurrentRefreshToken(hashed: string, userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { currentHashedRefreshToken: hashed }).exec();
  }

  async removeRefreshToken(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { currentHashedRefreshToken: null }).exec();
  }

  async verifyUser(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, { isVerified: true, verificationToken: null }, { new: true }).exec();
  }

  async setPasswordResetToken(userId: string, hashedToken: string, expires: Date) {
    return this.userModel.findByIdAndUpdate(userId, { resetPasswordToken: hashedToken, resetPasswordExpires: expires }).exec();
  }

  async updatePassword(userId: string, newHashedPassword: string) {
    return this.userModel.findByIdAndUpdate(userId, { password: newHashedPassword, resetPasswordToken: null, resetPasswordExpires: null }).exec();
  }

  async updateProfile(userId: string, update: Partial<User>) {
   
    delete (update as any).password;
    delete (update as any).currentHashedRefreshToken;
    return this.userModel.findByIdAndUpdate(userId, update, { new: true }).select('-password -currentHashedRefreshToken').exec();
  }
}
