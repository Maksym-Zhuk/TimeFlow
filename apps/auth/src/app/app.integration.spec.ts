import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { DRIZZLE, DrizzleDB, users, profileInfo } from '@time-flow/drizzle-db';
import { LoginInput, RegisterInput } from '@time-flow/shared-backend';
import * as jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

describe('AppService (Integration)', () => {
  let app: INestApplication;
  let appService: AppService;
  let db: DrizzleDB;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    appService = app.get<AppService>(AppService);
    db = app.get<DrizzleDB>(DRIZZLE);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await db.delete(profileInfo);
    await db.delete(users);
  });

  describe('register', () => {
    it('should create a user and a profile in the database and return tokens', async () => {
      const registerInput: RegisterInput = {
        email: 'integration@test.com',
        password: 'password123',
        profile: {
          firstName: 'Integration',
          lastName: 'Test',
        },
      };

      const result = await appService.register(registerInput);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');

      const createdUser: any = await db.query.users.findFirst({
        where: (users) => eq(users.email, registerInput.email),
      });

      expect(createdUser).toBeDefined();
      expect(createdUser.email).toBe(registerInput.email);

      const createdProfile: any = await db.query.profileInfo.findFirst({
        where: (profile) => eq(profile.userId, createdUser.id),
      });
      expect(createdProfile).toBeDefined();
      expect(createdProfile.firstName).toBe(registerInput.profile.firstName);
    });

    it('should throw an error if email is already taken', async () => {
      const registerInput: RegisterInput = {
        email: 'duplicate@test.com',
        password: 'password123',
        profile: { firstName: 'First', lastName: 'User' },
      };
      await appService.register(registerInput);

      await expect(appService.register(registerInput)).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should successfully login a user and return tokens', async () => {
      const userInput = {
        email: 'integration-login@test.com',
        password: 'password123',
        profile: { firstName: 'Login', lastName: 'Test' },
      };
      await appService.register(userInput);

      const loginInput: LoginInput = {
        email: 'integration-login@test.com',
        password: 'password123',
      };

      const result = await appService.login(loginInput);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');

      expect(result.accessToken).not.toBeNull();
      expect(result.refreshToken).not.toBeNull();
    });
  });

  describe('validateJwtUser', () => {
    it('should send "validate-jwt-user" message and return the user payload', async () => {
      const userInput = {
        email: 'integration-login@test.com',
        password: 'password123',
        profile: { firstName: 'Login', lastName: 'Test' },
      };
      await appService.register(userInput);

      const user = await db.query.users.findFirst({
        where: (users) => eq(users.email, userInput.email),
      });

      const result = await appService.validateJwtUser(user!.id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('role');

      expect(result.id).not.toBeNull();
      expect(result.role).not.toBeNull();
    });
  });

  describe('validateRefreshToken', () => {
    it('should send "validate-refresh-token" message and return accessToken', async () => {
      const userInput = {
        email: 'integration-login@test.com',
        password: 'password123',
        profile: { firstName: 'Login', lastName: 'Test' },
      };
      await appService.register(userInput);

      const user = await db.query.users.findFirst({
        where: (users) => eq(users.email, userInput.email),
      });

      const result = await appService.validateRefreshToken(user!.id);

      expect(result).toHaveProperty('accessToken');

      expect(result.accessToken).not.toBeNull();
    });
  });
});
