import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { LoginInput, RegisterInput } from '@time-flow/shared-backend';
import { FastifyRequest } from 'fastify/types/request';
import { UnauthorizedException } from '@nestjs/common';

type MockAuthService = {
  register: jest.Mock;
  login: jest.Mock;
};

interface MockReply {
  setCookie: jest.Mock;
  clearCookie: jest.Mock;
}

type MockContext = {
  reply: Partial<MockReply>;
  req?: Partial<FastifyRequest> & { user?: any };
};

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let service: MockAuthService;

  const mockAuthServiceProvider = {
    provide: AuthService,
    useValue: {
      register: jest.fn(),
      login: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthResolver, mockAuthServiceProvider],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
    service = module.get<AuthService, MockAuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register, set cookies, and return success message', async () => {
      const registerInput: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
        profile: { firstName: 'Test', lastName: 'User' },
      };

      const mockTokens = {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
      };

      const mockContext: MockContext = {
        reply: {
          setCookie: jest.fn(),
        },
      };

      service.register.mockResolvedValue(mockTokens);

      const result = await resolver.register(registerInput, mockContext as any);

      expect(service.register).toHaveBeenCalledWith(registerInput);

      expect(mockContext.reply.setCookie).toHaveBeenCalledTimes(2);
      expect(mockContext.reply.setCookie).toHaveBeenCalledWith(
        'accessToken',
        mockTokens.accessToken,
        expect.any(Object)
      );
      expect(mockContext.reply.setCookie).toHaveBeenCalledWith(
        'refreshToken',
        mockTokens.refreshToken,
        expect.any(Object)
      );
      expect(result).toEqual({ message: 'Registration successful!' });
    });
  });

  describe('login', () => {
    it('should call authService.login, set cookies, and return success message', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockTokens = {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
      };
      const mockContext: MockContext = {
        reply: {
          setCookie: jest.fn(),
        },
      };

      service.login.mockResolvedValue(mockTokens);

      const result = await resolver.login(loginInput, mockContext as any);

      expect(service.login).toHaveBeenCalledWith(loginInput);
      expect(mockContext.reply.setCookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ message: 'Login successful!' });
    });
  });

  describe('refreshToken', () => {
    it('should return user from context if guard passes', () => {
      const mockUserPayload = {
        id: 'user-123',
        accessToken: 'new-access-token',
      };
      const mockContext: MockContext = {
        reply: {},
        req: {
          user: mockUserPayload,
        },
      };

      const result = resolver.refreshToken(mockContext as any);

      expect(result).toEqual(mockUserPayload);
    });

    it('should throw UnauthorizedException if user is not found in context', () => {
      const mockContext: MockContext = {
        reply: {},
        req: {},
      };

      expect(() => resolver.refreshToken(mockContext as any)).toThrow(
        UnauthorizedException
      );
    });
  });

  describe('logout', () => {
    it('should clear cookies and return success message', () => {
      const mockContext: MockContext = {
        reply: {
          clearCookie: jest.fn(),
        },
      };

      const result = resolver.logout(mockContext as any);

      expect(mockContext.reply.clearCookie).toHaveBeenCalledTimes(2);
      expect(mockContext.reply.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.any(Object)
      );
      expect(mockContext.reply.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.any(Object)
      );
      expect(result).toBe('Logout done');
    });
  });
});
