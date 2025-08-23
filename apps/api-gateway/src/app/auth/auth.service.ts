import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { LoginInput, RegisterInput } from '@time-flow/shared-backend';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authMicroservices: ClientProxy
  ) {}

  async register(input: RegisterInput) {
    const { accessToken, refreshToken } = await firstValueFrom(
      this.authMicroservices.send('register-user', input)
    );

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException(
        'No data received from auth microservice!'
      );
    }

    return { accessToken, refreshToken };
  }

  async login(input: LoginInput) {
    const { accessToken, refreshToken } = await firstValueFrom(
      this.authMicroservices.send('login-user', input)
    );

    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException(
        'No data received from auth microservice!'
      );
    }

    return { accessToken, refreshToken };
  }

  async validateJwtUser(userId: string) {
    const currentUser = await firstValueFrom(
      this.authMicroservices.send('validate-jwt-user', userId)
    );

    if (!currentUser) {
      throw new UnauthorizedException(
        'No data received from auth microservice!'
      );
    }

    return currentUser;
  }

  async validateRefreshToken(userId: string) {
    const accessToken = await firstValueFrom(
      this.authMicroservices.send('validate-refresh-token', userId)
    );

    if (!accessToken) {
      throw new UnauthorizedException(
        'No data received from auth microservice!'
      );
    }

    return { accessToken };
  }
}
