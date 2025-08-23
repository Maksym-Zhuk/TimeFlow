import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';
import { LoginInput, RegisterInput } from '@time-flow/shared-backend';
import { UnauthorizedException } from '@nestjs/common';

type MockClientProxy = {
  send: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let authMicroservicesMock: MockClientProxy;

  beforeEach(async () => {
    const mockClientProxyProvider = {
      provide: 'AUTH_SERVICE',
      useValue: {
        send: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, mockClientProxyProvider],
    }).compile();

    service = module.get<AuthService>(AuthService);
    authMicroservicesMock = module.get<ClientProxy, MockClientProxy>(
      'AUTH_SERVICE'
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should send "register-user" message and return tokens', async () => {
      const registerInput: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
        profile: { firstName: 'Test', lastName: 'User' },
      };
      const mockTokens = {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
      };
      authMicroservicesMock.send.mockReturnValue(of(mockTokens));

      const result = await service.register(registerInput);

      expect(authMicroservicesMock.send).toHaveBeenCalledWith(
        'register-user',
        registerInput
      );

      expect(result).toEqual(mockTokens);
    });

    it('should throw an error if no data is received from microservice', async () => {
      const registerInput: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
        profile: { firstName: 'Test', lastName: 'User' },
      };

      authMicroservicesMock.send.mockReturnValue(of({}));

      await expect(service.register(registerInput)).rejects.toThrow(
        new UnauthorizedException('No data received from auth microservice!')
      );
    });
  });

  describe('login', () => {
    it('should send "login-user" message and return tokens', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockTokens = {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
      };
      authMicroservicesMock.send.mockReturnValue(of(mockTokens));

      const result = await service.login(loginInput);

      expect(authMicroservicesMock.send).toHaveBeenCalledWith(
        'login-user',
        loginInput
      );
      expect(result).toEqual(mockTokens);
    });
  });

  describe('validateJwtUser', () => {
    it('should send "validate-jwt-user" message and return user data', async () => {
      const userId = 'user-123';
      const mockCurrentUser = { id: 'user-123', role: 'USER' };
      authMicroservicesMock.send.mockReturnValue(of(mockCurrentUser));

      const result = await service.validateJwtUser(userId);

      expect(authMicroservicesMock.send).toHaveBeenCalledWith(
        'validate-jwt-user',
        userId
      );
      expect(result).toEqual(mockCurrentUser);
    });
  });

  describe('validateRefreshToken', () => {
    it('should send "validate-refresh-token" message and return a new access token', async () => {
      const userId = 'user-123';
      const mockAccessToken = 'new-fake-access-token';
      authMicroservicesMock.send.mockReturnValue(of(mockAccessToken));

      const result = await service.validateRefreshToken(userId);

      expect(authMicroservicesMock.send).toHaveBeenCalledWith(
        'validate-refresh-token',
        userId
      );
      expect(result).toEqual({ accessToken: mockAccessToken });
    });
  });
});
