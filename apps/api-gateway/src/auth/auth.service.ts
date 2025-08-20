import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authMicroservices: ClientProxy
  ) {}

  async validateJwtUser(userId: number) {
    const currentUser = await firstValueFrom(
      this.authMicroservices.send('validate-jwt-user', userId)
    );

    if (!currentUser) {
      throw new Error('Internal server error');
    }

    return currentUser;
  }

  async validateRefreshToken(userId: number) {
    const accessToken = await firstValueFrom(
      this.authMicroservices.send('validate-refresh-token', userId)
    );

    if (!accessToken) {
      throw new Error('Internal server error');
    }

    return { accessToken };
  }
}
