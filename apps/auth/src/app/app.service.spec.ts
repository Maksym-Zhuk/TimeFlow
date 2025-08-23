import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DRIZZLE } from '@time-flow/drizzle-db';
import { refreshJwtConfig } from '@time-flow/shared-backend';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AppService', () => {
  let service: AppService;
  let jwtService: JwtService;
  let dbMock: any;

  const mockUserInput = {
    email: 'test@example.com',
    password: 'password123',
    profile: {
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const loginInput = {
    email: 'test@example.com',
    password: 'password123',
  };

  const mockCreatedUser = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  const mockUserFromDB = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  const mockCreatedProfile = {
    id: 'profile-uuid-456',
    userId: 'user-uuid-123',
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockTokens = {
    accessToken: 'fake-access-token',
    refreshToken: 'fake-refresh-token',
  };

  beforeEach(async () => {
    dbMock = {
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn(),

      query: {
        users: {
          findFirst: jest.fn(),
        },
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: DRIZZLE,
          useValue: dbMock,
        },
        {
          provide: refreshJwtConfig.KEY,
          useValue: {
            secret: 'test-secret',
            signOptions: { expiresIn: '7d' },
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should successfully register a user and return tokens', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      dbMock.returning.mockResolvedValueOnce([mockCreatedUser]);
      dbMock.returning.mockResolvedValueOnce([mockCreatedProfile]);

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await service.register(mockUserInput);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockUserInput.password, 10);
      expect(dbMock.insert).toHaveBeenCalledTimes(2);
      expect(dbMock.values).toHaveBeenCalledWith({
        email: mockUserInput.email,
        password: 'hashedPassword',
      });
      expect(dbMock.values).toHaveBeenCalledWith({
        userId: mockCreatedUser.id,
        firstName: mockUserInput.profile.firstName,
        lastName: mockUserInput.profile.lastName,
      });
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockTokens);
    });
    it('should throw UnauthorizedException if user is not created', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      dbMock.returning.mockResolvedValueOnce([mockCreatedUser]);
      dbMock.returning.mockResolvedValueOnce([]);

      await expect(service.register(mockUserInput)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException if profile data is missing', async () => {
      const inputWithoutProfile = { ...mockUserInput, profile: undefined };

      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      dbMock.returning.mockResolvedValueOnce([mockCreatedUser]);

      await expect(service.register(inputWithoutProfile)).rejects.toThrow(
        new UnauthorizedException('Profile data missing!')
      );
    });

    it('should throw UnauthorizedException if profile is not created', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      dbMock.returning.mockResolvedValueOnce([mockCreatedUser]);
      dbMock.returning.mockResolvedValueOnce([]);

      await expect(service.register(mockUserInput)).rejects.toThrow(
        new UnauthorizedException('Unable to create profile!')
      );
    });
  });

  describe('login', () => {
    it('should successfully login a user and return tokens', async () => {
      dbMock.query.users.findFirst.mockResolvedValueOnce(mockCreatedUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce(mockTokens.accessToken)
        .mockResolvedValueOnce(mockTokens.refreshToken);

      const result = await service.login(mockUserInput);

      expect(dbMock.query.users.findFirst).toHaveBeenCalledWith({
        where: expect.any(Function),
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginInput.password,
        mockUserFromDB.password
      );
      expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      dbMock.query.users.findFirst.mockResolvedValueOnce(undefined);

      await expect(service.login(mockUserInput)).rejects.toThrow(
        UnauthorizedException
      );
    });

    it('should throw UnauthorizedException if incorrect password', async () => {
      dbMock.query.users.findFirst.mockResolvedValueOnce(mockCreatedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginInput)).rejects.toThrow(
        new UnauthorizedException('Incorrect password!')
      );
    });

    it('should throw UnauthorizedException if tokens not created', async () => {
      dbMock.query.users.findFirst.mockResolvedValueOnce(mockCreatedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      (jwtService.signAsync as jest.Mock)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      await expect(service.login(mockUserInput)).rejects.toThrow(
        new UnauthorizedException('Tokens not created!')
      );
    });
  });
});
