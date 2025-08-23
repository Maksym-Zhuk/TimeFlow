import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service.js';
import { FastifyRequest } from 'fastify';
import { JwtService } from '@nestjs/jwt';
import { refreshJwtConfig } from '@time-flow/shared-backend';
import { cookieExtractor } from '../extractors/cookieExtractor.js';

export interface AuthJwtPayload {
  sub: string;
}

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt'
) {
  constructor(
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService
  ) {
    super({
      jwtFromRequest: cookieExtractor('refreshToken'),
      secretOrKey: refreshJwtConfiguration.secret,
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  override validate(req: FastifyRequest, payload: AuthJwtPayload) {
    return this.authService.validateRefreshToken(payload.sub);
  }
}
