import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../../mail/mail.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

const mockUsersService = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  setCurrentRefreshToken: jest.fn(),
  removeRefreshToken: jest.fn(),
  verifyUser: jest.fn(),
  setPasswordResetToken: jest.fn(),
  updatePassword: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const map: Record<string, string> = {
      JWT_ACCESS_TOKEN_SECRET: 'access_secret',
      JWT_REFRESH_TOKEN_SECRET: 'refresh_secret',
      JWT_REFRESH_TOKEN_EXPIRATION: '7d',
      APP_URL: 'http://localhost:3000',
    };
    return map[key];
  }),
};

const mockMailService = {
  sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  sendResetPasswordEmail: jest.fn().mockResolvedValue(undefined),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('throws if email already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ email: 'test@test.com' });
      await expect(service.register('Test', 'test@test.com', 'pass')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('creates user and sends verification email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({
        _id: 'user123',
        email: 'new@test.com',
      });

      const result = await service.register('New User', 'new@test.com', 'password123');

      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: 'user123', email: 'new@test.com' });
    });
  });

  describe('validateUser', () => {
    it('returns null if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      const result = await service.validateUser('x@x.com', 'pass');
      expect(result).toBeNull();
    });

    it('returns null if password does not match', async () => {
      const hashed = await bcrypt.hash('correct', 10);
      mockUsersService.findByEmail.mockResolvedValue({ password: hashed });
      const result = await service.validateUser('x@x.com', 'wrong');
      expect(result).toBeNull();
    });

    it('returns user on valid credentials', async () => {
      const hashed = await bcrypt.hash('secret', 10);
      const user = { _id: 'u1', email: 'x@x.com', password: hashed };
      mockUsersService.findByEmail.mockResolvedValue(user);
      const result = await service.validateUser('x@x.com', 'secret');
      expect(result).toEqual(user);
    });
  });

  describe('login', () => {
    it('returns access and refresh tokens', async () => {
      const user = { _id: { toString: () => 'u1' }, email: 'x@x.com', role: 'buyer' };
      mockUsersService.setCurrentRefreshToken.mockResolvedValue(undefined);
      const result = await service.login(user);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('logout', () => {
    it('removes refresh token', async () => {
      mockUsersService.removeRefreshToken.mockResolvedValue(undefined);
      const result = await service.logout('user123');
      expect(mockUsersService.removeRefreshToken).toHaveBeenCalledWith('user123');
      expect(result).toEqual({ success: true });
    });
  });

  describe('refreshTokens', () => {
    it('throws if user has no stored refresh token', async () => {
      mockUsersService.findById.mockResolvedValue({ currentHashedRefreshToken: null });
      await expect(service.refreshTokens('u1', 'tok')).rejects.toThrow(UnauthorizedException);
    });

    it('throws if refresh token does not match', async () => {
      const stored = await bcrypt.hash('correct-token', 10);
      mockUsersService.findById.mockResolvedValue({ currentHashedRefreshToken: stored });
      await expect(service.refreshTokens('u1', 'wrong-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
