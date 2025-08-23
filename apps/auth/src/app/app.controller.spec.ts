import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService, CurrentUser } from './app.service';
import { LoginInput, RegisterInput, Role } from '@time-flow/shared-backend';

type MockAppService = {
  register: jest.Mock;
  login: jest.Mock;
  validateJwtUser: jest.Mock;
  validateRefreshToken: jest.Mock;
};

describe('AppController', () => {
  let appController: AppController;
  let appService: MockAppService;

  const mockAppServiceProvider = {
    provide: AppService,
    useValue: {
      register: jest.fn(),
      login: jest.fn(),
      validateJwtUser: jest.fn(),
      validateRefreshToken: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [mockAppServiceProvider],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService, MockAppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('register', () => {
    it('should call AppService.register with the correct payload and return the result', async () => {
      const registerInput: RegisterInput = {
        email: 'test@example.com',
        password: 'password123',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      const expectedTokens = {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
      };

      appService.register.mockResolvedValue(expectedTokens);

      const result = await appController.register(registerInput);

      expect(appService.register).toHaveBeenCalledTimes(1);

      expect(appService.register).toHaveBeenCalledWith(registerInput);

      expect(result).toEqual(expectedTokens);
    });
  });

  describe('login', () => {
    it('should call AppService.login with the correct payload and return the result', async () => {
      const loginInput: LoginInput = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedTokens = {
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
      };

      appService.login.mockResolvedValue(expectedTokens);

      const result = await appController.login(loginInput);

      expect(appService.login).toHaveBeenCalledTimes(1);

      expect(appService.login).toHaveBeenCalledWith(loginInput);

      expect(result).toEqual(expectedTokens);
    });
  });

  describe('validateJwtUser', () => {
    it('should call AppService.validateJwtUser with the correct payload and return the result', async () => {
      const userId = 'user-uuid-123';

      const expectedData: CurrentUser = {
        id: 'user-uuid-123',
        role: Role.USER,
      };

      appService.validateJwtUser.mockResolvedValue(expectedData);

      const result = await appController.validateJwtUser(userId);

      expect(appService.validateJwtUser).toHaveBeenCalledTimes(1);

      expect(appService.validateJwtUser).toHaveBeenCalledWith(userId);

      expect(result).toEqual(expectedData);
    });
  });

  describe('validateRefreshToken', () => {
    it('should call AppService.validateRefreshToken with the correct payload and return the result', async () => {
      const userId = 'user-uuid-123';

      const expectedAccessToken = {
        accessToken: 'fake-access-token',
      };

      appService.validateRefreshToken.mockResolvedValue(expectedAccessToken);

      const result = await appController.validateRefreshToken(userId);

      expect(appService.validateRefreshToken).toHaveBeenCalledTimes(1);

      expect(appService.validateRefreshToken).toHaveBeenCalledWith(userId);

      expect(result).toEqual(expectedAccessToken);
    });
  });
});
