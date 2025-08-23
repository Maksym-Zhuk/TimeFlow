import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  DRIZZLE,
  profileInfo,
  users,
  type DrizzleDB,
} from '@time-flow/drizzle-db';
import {
  CreateProfileInput,
  LoginInput,
  refreshJwtConfig,
  RegisterInput,
  Role,
} from '@time-flow/shared-backend';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export interface CurrentUser {
  id: string;
  role: Role;
}

export interface AuthJwtPayload {
  sub: string;
}

@Injectable()
export class AppService {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>
  ) {}

  private async generateTokens(userId: string) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.refreshTokenConfig.secret,
        ...this.refreshTokenConfig.signOptions,
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async register(input: RegisterInput) {
    const hashedPassword: string = await bcrypt.hash(input.password, 10);
    const user = await this.db
      .insert(users)
      .values({
        email: input.email,
        password: hashedPassword,
      })
      .returning();
    if (!user[0]) throw new UnauthorizedException('User not created');

    const userId = user[0]?.id;
    if (!userId) throw new Error('User ID is undefined');

    if (!input.profile) {
      throw new UnauthorizedException('Profile data missing!');
    }

    const profile = await this.createProfile(userId, input.profile);
    if (!profile) throw new UnauthorizedException('Profile not created');

    const { accessToken, refreshToken } = await this.generateTokens(user[0].id);
    if (!accessToken && !refreshToken)
      throw new UnauthorizedException('Tokens not created');

    return { accessToken, refreshToken };
  }

  async createProfile(userId: string, input: CreateProfileInput) {
    const { firstName, lastName } = input;
    const profile = await this.db
      .insert(profileInfo)
      .values({
        userId,
        firstName,
        lastName,
      })
      .returning();

    if (!profile[0])
      throw new UnauthorizedException('Unable to create profile!');

    return profile[0];
  }

  async login(input: LoginInput) {
    const user = await this.db.query.users.findFirst({
      where: (users) => eq(users.email, input.email),
    });
    if (!user) throw new UnauthorizedException('User not found!');
    const checkPassword = await bcrypt.compare(input.password, user?.password);
    if (!checkPassword) throw new UnauthorizedException('Incorrect password!');
    const { accessToken, refreshToken } = await this.generateTokens(user.id);
    if (!accessToken && !refreshToken)
      throw new UnauthorizedException('Tokens not created');
    return { accessToken, refreshToken };
  }

  async validateRefreshToken(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: (users) => eq(users.id, userId),
    });
    if (!user) throw new UnauthorizedException('User not found!');
    const accessToken = await this.jwtService.signAsync({ sub: userId });
    return { accessToken };
  }
  async validateJwtUser(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: (users) => eq(users.id, userId),
    });
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = { id: user.id, role: user.role };
    return currentUser;
  }
}
