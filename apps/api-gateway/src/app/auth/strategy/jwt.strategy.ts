import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { jwtConfig } from '@time-flow/shared-backend';
import type { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { cookieExtractor } from '../extractors/cookieExtractor';

export interface AuthJwtPayload {
  sub: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
    private authService: AuthService
  ) {
    if (!jwtConfiguration.secret) {
      throw new Error('JWT secret not found');
    }

    super({
      jwtFromRequest: cookieExtractor('accessToken'),
      secretOrKey: jwtConfiguration.secret as string | Buffer,
      ignoreExpiration: false,
    });
  }

  override validate(payload: AuthJwtPayload) {
    const userId = payload.sub;
    return this.authService.validateJwtUser(userId);
  }
}
